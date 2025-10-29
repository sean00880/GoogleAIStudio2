
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { db } from "@/lib/db"
import { z } from "zod"

export const dynamic = "force-dynamic"

const createFileSchema = z.object({
  projectId: z.string(),
  path: z.string(),
  content: z.string().optional(),
  language: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createFileSchema.parse(body)

    // Verify project ownership
    const project = await db.project.findUnique({
      where: {
        id: validatedData.projectId,
        userId: (session.user as any)?.id,
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    const file = await db.file.create({
      data: {
        projectId: validatedData.projectId,
        path: validatedData.path,
        content: validatedData.content || '',
        language: validatedData.language || 'text'
      },
    })

    return NextResponse.json(file, { status: 201 })
  } catch (error) {
    console.error('Error creating file:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
