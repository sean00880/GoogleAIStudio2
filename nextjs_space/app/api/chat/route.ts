
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { db } from "@/lib/db"
import { z } from "zod"

export const dynamic = "force-dynamic"

const chatRequestSchema = z.object({
  projectId: z.string(),
  message: z.string(),
  model: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (false) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, message, model } = chatRequestSchema.parse(body)

    // Verify project ownership
    const project = await db.project.findUnique({
      where: {
        id: projectId,
        userId: (session.user as any)?.id,
      },
      include: {
        chatMessages: {
          orderBy: { createdAt: 'asc' },
          take: 50, // Limit context
        },
        files: true,
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Save user message
    await db.chatMessage.create({
      data: {
        projectId,
        role: 'user',
        content: message,
        model,
      },
    })

    // Prepare context
    const context = project?.files?.map((file: any) => 
      `File: ${file.path}\n${file.content || ''}`
    )?.join('\n\n') || ''

    const messages = [
      {
        role: 'system' as const,
        content: `You are an AI assistant helping with code development. Here's the current project context:

${context}

Please provide helpful, accurate responses for coding questions and generate clean, well-commented code when requested.`
      },
      ...project.chatMessages?.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })) || [],
      {
        role: 'user' as const,
        content: message,
      },
    ]

    // Call AI API with streaming
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages,
        stream: true,
        max_tokens: 3000,
      }),
    })

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`)
    }

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        const encoder = new TextEncoder()
        let fullResponse = ''

        try {
          while (true) {
            const { done, value } = await reader?.read() || {}
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') {
                  // Save assistant response
                  await db.chatMessage.create({
                    data: {
                      projectId,
                      role: 'assistant',
                      content: fullResponse,
                      model,
                    },
                  })
                  controller.close()
                  return
                }

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content || ''
                  if (content) {
                    fullResponse += content
                    controller.enqueue(encoder.encode(content))
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error)
          controller.error(error)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Error in chat:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
