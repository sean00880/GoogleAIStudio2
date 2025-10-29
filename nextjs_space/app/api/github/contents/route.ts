
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { getRepositoryContents } from "@/lib/github"
import { z } from "zod"

const contentsRequestSchema = z.object({
  url: z.string().url(),
  path: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { url, path = "" } = contentsRequestSchema.parse(body)

    const contents = await getRepositoryContents(url, path)
    
    return NextResponse.json(contents)
  } catch (error) {
    console.error('Error fetching repository contents:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
