/**
 * API Keys Management Endpoint
 * 
 * Handles saving and retrieving API keys for different AI providers.
 * Keys are stored in the database encrypted for security.
 * 
 * POST /api/settings/api-keys - Save a new API key
 * GET /api/settings/api-keys - Get all configured providers (not the keys themselves)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { db } from '@/lib/db'
import { z } from 'zod'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// Encryption key (should be in environment variables)
const ENCRYPTION_KEY = process.env.API_KEY_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET!

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

function decrypt(text: string): string {
  const parts = text.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const encrypted = parts[1]
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

const saveKeySchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'google', 'x-ai', 'openrouter']),
  apiKey: z.string().min(1, 'API key cannot be empty'),
})

/**
 * POST - Save an API key
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validation = saveKeySchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { provider, apiKey } = validation.data

    // Encrypt the API key before storing
    const encryptedKey = encrypt(apiKey)

    // Check if key already exists for this user and provider
    const existing = await db.userApiKey.findFirst({
      where: {
        userId: session.user.id,
        provider,
      },
    })

    if (existing) {
      // Update existing key
      await db.userApiKey.update({
        where: { id: existing.id },
        data: { encryptedKey },
      })
    } else {
      // Create new key
      await db.userApiKey.create({
        data: {
          userId: session.user.id,
          provider,
          encryptedKey,
        },
      })
    }

    return NextResponse.json(
      { success: true, message: `${provider} API key saved successfully` },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error saving API key:', error)
    return NextResponse.json(
      { error: 'Failed to save API key', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET - Get configured providers (not the actual keys)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all providers that have keys configured for this user
    const userKeys = await db.userApiKey.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        provider: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Also check environment variables for system-wide keys
    const envProviders = []
    if (process.env.OPENAI_API_KEY) envProviders.push('openai')
    if (process.env.ANTHROPIC_API_KEY) envProviders.push('anthropic')
    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) envProviders.push('google')
    if (process.env.XAI_API_KEY) envProviders.push('x-ai')
    if (process.env.OPENROUTER_API_KEY) envProviders.push('openrouter')

    return NextResponse.json({
      userProviders: userKeys.map(k => k.provider),
      systemProviders: envProviders,
      allConfigured: [...new Set([...userKeys.map(k => k.provider), ...envProviders])],
    })
  } catch (error: any) {
    console.error('Error getting API keys:', error)
    return NextResponse.json(
      { error: 'Failed to get API keys', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Remove an API key
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider')

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider parameter required' },
        { status: 400 }
      )
    }

    await db.userApiKey.deleteMany({
      where: {
        userId: session.user.id,
        provider,
      },
    })

    return NextResponse.json(
      { success: true, message: `${provider} API key removed` },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error deleting API key:', error)
    return NextResponse.json(
      { error: 'Failed to delete API key', details: error.message },
      { status: 500 }
    )
  }
}
