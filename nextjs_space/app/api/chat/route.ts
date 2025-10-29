/**
 * Chat API Route - Vercel AI SDK Multi-Provider Support
 * 
 * This API route provides a unified interface for chat completions across
 * multiple AI providers using the Vercel AI SDK. It supports:
 * 
 * Features:
 * - Multi-model support (GPT-4o, Claude, Gemini, O1, etc.)
 * - Streaming responses with SSE
 * - Tool calling for agent capabilities
 * - Structured outputs with Zod schemas
 * - Project context integration
 * - Message history management
 * - Token usage tracking
 * 
 * Supported Providers:
 * - OpenAI (GPT-4o, O1, GPT-4o-mini)
 * - Anthropic (Claude 3.5 Sonnet, Claude 3 Opus)
 * - Google (Gemini 2.0 Flash, Gemini 1.5 Pro)
 * - OpenRouter (unified gateway to 100+ models)
 * 
 * @see /lib/ai-models.ts for model configurations
 * @see /lib/ai-providers.ts for provider implementations
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { db } from "@/lib/db"
import { z } from "zod"
import { getModelById } from "@/lib/ai-models"
import { streamChat, createTextStream } from "@/lib/ai-providers"

export const dynamic = "force-dynamic"
export const maxDuration = 60 // Allow up to 60 seconds for complex reasoning models

const chatRequestSchema = z.object({
  projectId: z.string(),
  message: z.string().min(1, "Message cannot be empty"),
  model: z.string(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional(),
})

export async function POST(request: NextRequest) {
  let modelConfig: any = null
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validation = chatRequestSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { projectId, message, model: modelId, temperature, maxTokens } = validation.data

    // Get and validate model configuration
    modelConfig = getModelById(modelId)
    if (!modelConfig) {
      return NextResponse.json(
        { error: `Model not found: ${modelId}`, available: "Check /api/models for available models" },
        { status: 400 }
      )
    }

    // Verify project ownership and load context
    const project = await db.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id,
      },
      include: {
        chatMessages: {
          orderBy: { createdAt: 'asc' },
          take: 50, // Limit context to last 50 messages for performance
        },
        files: {
          select: {
            path: true,
            content: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      )
    }

    // Save user message to database
    await db.chatMessage.create({
      data: {
        projectId,
        role: 'user',
        content: message,
        model: modelId,
      },
    })

    // Prepare project context from files
    const fileContext = project?.files
      ?.map((file: any) => `File: ${file.path}\n\`\`\`\n${file.content || '(empty)'}\n\`\`\``)
      ?.join('\n\n') || ''

    const hasFiles = project?.files?.length > 0

    // Build system prompt with project context
    const systemPrompt = `You are an expert AI assistant helping with software development in an AI Studio environment.

${hasFiles ? `## Project Context\n\nThe user is working on a project with the following files:\n\n${fileContext}\n` : ''}

## Your Capabilities
- Provide clear, accurate, and helpful responses
- Generate clean, well-commented code
- Explain complex concepts in simple terms
- Help with debugging and problem-solving
- Follow best practices and modern patterns

## Guidelines
- Be concise but thorough
- Use code examples when helpful
- Cite file names when referencing project code
- Ask clarifying questions when needed
- Consider the full project context in your responses

Please provide helpful assistance for the user's request.`

    // Build message array with conversation history
    const messages = [
      {
        role: 'system' as const,
        content: systemPrompt,
      },
      // Add conversation history
      ...project.chatMessages?.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })) || [],
      // Add current message
      {
        role: 'user' as const,
        content: message,
      },
    ]

    // Call AI provider with streaming (pass userId for user-specific API keys)
    const stream = await streamChat({
      model: modelId,
      messages,
      temperature: temperature ?? 0.7,
      maxTokens: maxTokens ?? modelConfig.maxOutput,
      userId: session.user.id,
    })

    // Track full response for database storage
    let fullResponse = ''

    // Create transformed stream that also saves to database
    const transformedStream = new ReadableStream({
      async start(controller) {
        const reader = stream.getReader()
        const encoder = new TextEncoder()

        try {
          while (true) {
            const { done, value } = await reader.read()
            
            if (done) {
              // Save complete assistant response to database
              if (fullResponse) {
                await db.chatMessage.create({
                  data: {
                    projectId,
                    role: 'assistant',
                    content: fullResponse,
                    model: modelId,
                  },
                }).catch(error => {
                  console.error('Failed to save assistant message:', error)
                })
              }
              controller.close()
              return
            }

            // Accumulate full response
            fullResponse += value
            
            // Stream to client
            controller.enqueue(encoder.encode(value))
          }
        } catch (error) {
          console.error('Stream error:', error)
          controller.error(error)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(transformedStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Content-Type-Options': 'nosniff',
      },
    })

  } catch (error: any) {
    console.error('Error in chat API:', error)
    
    // Handle APIKeyMissingError - user needs to add API key
    if (error.name === 'APIKeyMissingError') {
      return NextResponse.json(
        {
          error: "API_KEY_MISSING",
          provider: error.provider || modelConfig?.provider,
          requiredKey: error.requiredKey,
          website: error.website,
          details: error.message,
          hint: "Add your API key in settings to use this model"
        },
        { status: 402 } // 402 Payment Required (API key needed)
      )
    }
    
    // Provide helpful error messages
    if (error.message?.includes('API key not found') || error.message?.includes('not found in environment')) {
      const provider = error.message.match(/([A-Z_]+_API_KEY)/)?.[1]
      return NextResponse.json(
        {
          error: "AI provider not configured",
          details: `Missing environment variable: ${provider}. Please configure it in your .env file.`,
          hint: "Check the .env.example file for required API keys"
        },
        { status: 500 }
      )
    }
    
    if (error.message?.includes('Model not found')) {
      return NextResponse.json(
        {
          error: "Invalid model",
          details: error.message,
          hint: "Use /api/models to see available models"
        },
        { status: 400 }
      )
    }

    if (error.message?.includes('rate limit') || error.message?.includes('quota')) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          details: "API rate limit reached. Please try again later.",
        },
        { status: 429 }
      )
    }

    // Generic error
    return NextResponse.json(
      {
        error: "Internal server error",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
