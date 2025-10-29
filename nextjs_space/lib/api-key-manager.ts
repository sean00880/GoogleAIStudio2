/**
 * API Key Manager
 * 
 * Handles retrieval of API keys from multiple sources:
 * 1. User-specific encrypted keys from database
 * 2. System-wide environment variables
 * 
 * Priority: User keys > Environment variables
 */

import { db } from './db'
import crypto from 'crypto'
import { AIProvider } from './ai-models'

// Encryption key (should be in environment variables)
const ENCRYPTION_KEY = process.env.API_KEY_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET!

function decrypt(text: string): string {
  try {
    const parts = text.split(':')
    const iv = Buffer.from(parts[0], 'hex')
    const encrypted = parts[1]
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt API key')
  }
}

/**
 * Get API key for a provider
 * Checks user-specific keys first, then falls back to environment variables
 */
export async function getAPIKey(
  provider: AIProvider,
  userId?: string
): Promise<string | null> {
  // If user ID provided, check for user-specific key first
  if (userId) {
    try {
      const userKey = await db.userApiKey.findFirst({
        where: {
          userId,
          provider,
        },
      })

      if (userKey) {
        return decrypt(userKey.encryptedKey)
      }
    } catch (error) {
      console.error(`Error retrieving user API key for ${provider}:`, error)
      // Continue to check environment variables
    }
  }

  // Fall back to environment variables
  switch (provider) {
    case 'openai':
      return process.env.OPENAI_API_KEY || null
    case 'anthropic':
      return process.env.ANTHROPIC_API_KEY || null
    case 'google':
      return process.env.GOOGLE_GENERATIVE_AI_API_KEY || null
    case 'x-ai':
      return process.env.XAI_API_KEY || null
    case 'openrouter':
      return process.env.OPENROUTER_API_KEY || null
    default:
      return null
  }
}

/**
 * Check if a provider has an API key configured (either user or system)
 */
export async function hasAPIKey(
  provider: AIProvider,
  userId?: string
): Promise<boolean> {
  const key = await getAPIKey(provider, userId)
  return !!key
}

/**
 * Get all configured providers for a user
 */
export async function getConfiguredProviders(userId?: string): Promise<AIProvider[]> {
  const providers: AIProvider[] = ['openai', 'anthropic', 'google', 'x-ai', 'openrouter']
  const configured: AIProvider[] = []

  for (const provider of providers) {
    if (await hasAPIKey(provider, userId)) {
      configured.push(provider)
    }
  }

  return configured
}

/**
 * Get environment variable name for a provider
 */
export function getEnvVarName(provider: AIProvider): string {
  switch (provider) {
    case 'openai':
      return 'OPENAI_API_KEY'
    case 'anthropic':
      return 'ANTHROPIC_API_KEY'
    case 'google':
      return 'GOOGLE_GENERATIVE_AI_API_KEY'
    case 'x-ai':
      return 'XAI_API_KEY'
    case 'openrouter':
      return 'OPENROUTER_API_KEY'
    default:
      return 'UNKNOWN_API_KEY'
  }
}
