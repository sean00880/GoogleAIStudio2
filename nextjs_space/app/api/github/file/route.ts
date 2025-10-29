
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { getFileContent } from "@/lib/github"
import { z } from "zod"

const fileRequestSchema = z.object({
  url: z.string().url(),
  path: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { url, path } = fileRequestSchema.parse(body)

    const content = await getFileContent(url, path)
    
    if (!content) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Error fetching file content:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
