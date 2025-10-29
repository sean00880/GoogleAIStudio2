
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { db } from "@/lib/db"
import { z } from "zod"

export const dynamic = "force-dynamic"

const updateFileSchema = z.object({
  content: z.string().optional(),
  language: z.string().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateFileSchema.parse(body)

    // Verify file ownership through project
    const file = await db.file.findUnique({
      where: { id: params.id },
      include: { project: true },
    })

    if (!file || file.project.userId !== (session.user as any)?.id) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      )
    }

    const updatedFile = await db.file.update({
      where: { id: params.id },
      data: validatedData,
    })

    return NextResponse.json(updatedFile)
  } catch (error) {
    console.error('Error updating file:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify file ownership through project
    const file = await db.file.findUnique({
      where: { id: params.id },
      include: { project: true },
    })

    if (!file || file.project.userId !== (session.user as any)?.id) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      )
    }

    await db.file.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
