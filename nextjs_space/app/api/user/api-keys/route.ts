/**
 * User API Keys Management Endpoint
 * 
 * Allows users to securely store their AI provider API keys.
 * Keys are encrypted before storage and decrypted when needed for inference.
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { db } from "@/lib/db"
import crypto from "crypto"

export const dynamic = "force-dynamic"

// Encryption configuration
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || "default-encryption-key-change-me"
const ALGORITHM = "aes-256-cbc"

/**
 * Encrypt an API key
 */
function encrypt(text: string): string {
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

/**
 * Decrypt an API key
 */
function decrypt(text: string): string {
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
  const parts = text.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const encryptedText = parts[1]
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

/**
 * GET - Retrieve user's API keys (encrypted values not returned)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user's API key configuration
    const userApiKeys = await db.userApiKey.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        provider: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return NextResponse.json({
      providers: userApiKeys.map(key => key.provider),
      details: userApiKeys
    })
  } catch (error) {
    console.error("Error fetching user API keys:", error)
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
      { status: 500 }
    )
  }
}

/**
 * POST - Save or update a user's API key
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { provider, apiKey } = body

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: "Provider and API key are required" },
        { status: 400 }
      )
    }

    // Validate provider
    const validProviders = ['openai', 'anthropic', 'google', 'x-ai', 'openrouter']
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { error: `Invalid provider. Must be one of: ${validProviders.join(', ')}` },
        { status: 400 }
      )
    }

    // Encrypt the API key
    const encryptedKey = encrypt(apiKey)

    // Upsert the API key
    await db.userApiKey.upsert({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider: provider
        }
      },
      update: {
        encryptedKey: encryptedKey,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        provider: provider,
        encryptedKey: encryptedKey
      }
    })

    return NextResponse.json({
      success: true,
      message: `API key for ${provider} saved successfully`
    })
  } catch (error) {
    console.error("Error saving user API key:", error)
    return NextResponse.json(
      { error: "Failed to save API key" },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Remove a user's API key
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider')

    if (!provider) {
      return NextResponse.json(
        { error: "Provider parameter is required" },
        { status: 400 }
      )
    }

    await db.userApiKey.delete({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider: provider
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `API key for ${provider} deleted successfully`
    })
  } catch (error) {
    console.error("Error deleting user API key:", error)
    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 }
    )
  }
}

/**
 * Helper function to get a user's decrypted API key for a provider
 * This is used internally by the chat API
 */
export async function getUserApiKey(userId: string, provider: string): Promise<string | null> {
  try {
    const userApiKey = await db.userApiKey.findUnique({
      where: {
        userId_provider: {
          userId,
          provider
        }
      }
    })

    if (!userApiKey) {
      return null
    }

    return decrypt(userApiKey.encryptedKey)
  } catch (error) {
    console.error(`Error retrieving API key for ${provider}:`, error)
    return null
  }
}
