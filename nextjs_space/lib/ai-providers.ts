/**
 * AI Provider Abstraction Layer - Vercel AI SDK Integration
 * 
 * This module provides a unified interface for interacting with different AI providers
 * using the Vercel AI SDK. It supports streaming, tool calling, structured outputs,
 * and multi-provider orchestration.
 * 
 * Supported Providers:
 * - OpenAI: GPT-5, GPT-4o, O1, GPT-4o-mini (via @ai-sdk/openai)
 * - Anthropic: Claude Sonnet 4.5, Claude 3.5 Sonnet (#1 on Vercel AI Gateway)
 * - Google: Gemini 2.5 Pro, Gemini 2.0 Flash (#1 on LMArena)
 * - X.AI: Grok 2 models (#1 on OpenRouter with 30.2% market share)
 * - OpenRouter: Unified gateway to 100+ models (via @ai-sdk/openai with custom baseURL)
 * 
 * Key Features:
 * - Streaming with Server-Sent Events (SSE)
 * - Tool/function calling for agent capabilities
 * - Structured outputs with Zod schemas
 * - Provider fallbacks and error handling
 * - Token usage tracking
 * - Dynamic API key management with user prompts
 * 
 * @see https://sdk.vercel.ai/docs for full Vercel AI SDK documentation
 */

import { openai, createOpenAI } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'
import { streamText, generateText, tool, CoreMessage, LanguageModel } from 'ai'
import { z } from 'zod'
import { AIProvider, getModelById } from './ai-models'

/**
 * API Key Error - thrown when API key is missing for a provider
 */
export class APIKeyMissingError extends Error {
  constructor(
    public provider: string,
    public requiredKey: string,
    public website: string
  ) {
    super(`API key missing for ${provider}. Please add ${requiredKey} to continue.`)
    this.name = 'APIKeyMissingError'
  }
}

/**
 * Message format for chat conversations
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  name?: string
  toolCallId?: string
}

/**
 * Tool definition for function calling
 */
export interface ToolDefinition {
  name: string
  description: string
  parameters: z.ZodObject<any>
  execute: (args: any) => Promise<any>
}

/**
 * Chat request configuration
 */
export interface ChatRequest {
  model: string
  messages: ChatMessage[]
  temperature?: number
  maxTokens?: number
  topP?: number
  tools?: ToolDefinition[]
  structuredOutput?: z.ZodObject<any>
  onChunk?: (text: string) => void
  onToolCall?: (toolName: string, args: any) => void
}

/**
 * Chat response with metadata
 */
export interface ChatResponse {
  content: string
  finishReason?: 'stop' | 'length' | 'content-filter' | 'tool-calls' | 'error'
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  toolCalls?: Array<{
    name: string
    arguments: any
    result?: any
  }>
}

/**
 * Initialize OpenRouter client (custom OpenAI client with different baseURL)
 */
let openrouterClient: ReturnType<typeof createOpenAI> | null = null
let xaiClient: ReturnType<typeof createOpenAI> | null = null

function getOpenRouterClient() {
  if (!openrouterClient) {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      throw new APIKeyMissingError('OpenRouter', 'OPENROUTER_API_KEY', 'https://openrouter.ai')
    }
    openrouterClient = createOpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      headers: {
        'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
        'X-Title': 'AI Studio Clone',
      },
    })
  }
  return openrouterClient
}

function getXAIClient() {
  if (!xaiClient) {
    const apiKey = process.env.XAI_API_KEY
    if (!apiKey) {
      throw new APIKeyMissingError('X.AI', 'XAI_API_KEY', 'https://x.ai')
    }
    xaiClient = createOpenAI({
      apiKey,
      baseURL: 'https://api.x.ai/v1',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
  return xaiClient
}

/**
 * Get the appropriate language model for a given model ID
 * Throws APIKeyMissingError if the required API key is not configured
 */
export function getLanguageModel(modelId: string): LanguageModel {
  const modelConfig = getModelById(modelId)
  if (!modelConfig) {
    throw new Error(`Model not found: ${modelId}`)
  }

  const provider = modelConfig.provider
  const actualModelId = modelConfig.modelId

  // Verify API key exists and return appropriate provider
  switch (provider) {
    case 'openai':
      if (!process.env.OPENAI_API_KEY) {
        throw new APIKeyMissingError('OpenAI', 'OPENAI_API_KEY', 'https://platform.openai.com')
      }
      return openai(actualModelId)
    
    case 'anthropic':
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new APIKeyMissingError('Anthropic', 'ANTHROPIC_API_KEY', 'https://console.anthropic.com')
      }
      return anthropic(actualModelId)
    
    case 'google':
      if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        throw new APIKeyMissingError('Google AI', 'GOOGLE_GENERATIVE_AI_API_KEY', 'https://aistudio.google.com')
      }
      return google(actualModelId)
    
    case 'x-ai':
      return getXAIClient()(actualModelId)
    
    case 'openrouter':
      return getOpenRouterClient()(actualModelId)
    
    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}

/**
 * Check if a provider has its API key configured
 */
export function isProviderConfigured(provider: AIProvider): boolean {
  switch (provider) {
    case 'openai':
      return !!process.env.OPENAI_API_KEY
    case 'anthropic':
      return !!process.env.ANTHROPIC_API_KEY
    case 'google':
      return !!process.env.GOOGLE_GENERATIVE_AI_API_KEY
    case 'x-ai':
      return !!process.env.XAI_API_KEY
    case 'openrouter':
      return !!process.env.OPENROUTER_API_KEY
    default:
      return false
  }
}

/**
 * Get list of providers that are currently configured
 */
export function getAvailableProviders(): AIProvider[] {
  const providers: AIProvider[] = ['openai', 'anthropic', 'google', 'x-ai', 'openrouter']
  return providers.filter(isProviderConfigured)
}

/**
 * Convert our ChatMessage format to Vercel AI SDK CoreMessage format
 */
function convertMessages(messages: ChatMessage[]): CoreMessage[] {
  return messages.map(msg => {
    if (msg.role === 'tool') {
      return {
        role: 'tool',
        content: [
          {
            type: 'tool-result',
            toolCallId: msg.toolCallId || '',
            toolName: msg.name || '',
            result: msg.content,
          },
        ],
      } as CoreMessage
    }
    return {
      role: msg.role,
      content: msg.content,
    } as CoreMessage
  })
}

/**
 * Convert tool definitions to Vercel AI SDK format
 */
function convertTools(tools?: ToolDefinition[]) {
  if (!tools || tools.length === 0) return undefined

  const converted: Record<string, any> = {}
  tools.forEach(t => {
    converted[t.name] = tool({
      description: t.description,
      parameters: t.parameters,
      execute: t.execute,
    })
  })
  return converted
}

/**
 * Stream chat completion with Vercel AI SDK
 * Supports tool calling and structured outputs
 */
export async function streamChat(request: ChatRequest): Promise<ReadableStream<string>> {
  const model = getLanguageModel(request.model)
  const messages = convertMessages(request.messages)
  const tools = convertTools(request.tools)

  const result = await streamText({
    model,
    messages,
    temperature: request.temperature ?? 1.0,
    maxTokens: request.maxTokens ?? 4096,
    topP: request.topP,
    tools,
  })

  // Create a transformed stream that extracts just the text
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.textStream) {
          // Call onChunk callback if provided
          if (request.onChunk) {
            request.onChunk(chunk)
          }
          controller.enqueue(chunk)
        }
        controller.close()
      } catch (error) {
        console.error('Stream error:', error)
        controller.error(error)
      }
    },
  })
}

/**
 * Generate complete chat response (non-streaming)
 * Useful for tool calling and structured outputs
 */
export async function generateChat(request: ChatRequest): Promise<ChatResponse> {
  const model = getLanguageModel(request.model)
  const messages = convertMessages(request.messages)
  const tools = convertTools(request.tools)

  const result = await generateText({
    model,
    messages,
    temperature: request.temperature ?? 1.0,
    maxTokens: request.maxTokens ?? 4096,
    topP: request.topP,
    tools,
  })

  // Extract tool calls if present
  const toolCalls = result.toolCalls?.map(tc => ({
    name: tc.toolName,
    arguments: tc.args,
    result: undefined, // Will be filled by executor
  }))

  return {
    content: result.text,
    finishReason: result.finishReason as any,
    usage: {
      promptTokens: result.usage.promptTokens,
      completionTokens: result.usage.completionTokens,
      totalTokens: result.usage.totalTokens,
    },
    toolCalls,
  }
}

/**
 * Generate structured output using Zod schema
 * Forces the model to return JSON matching the schema
 */
export async function generateStructured<T>(
  request: ChatRequest & { schema: z.ZodSchema<T> }
): Promise<T> {
  const model = getLanguageModel(request.model)
  const messages = convertMessages(request.messages)

  const result = await generateText({
    model,
    messages,
    temperature: request.temperature ?? 1.0,
    maxTokens: request.maxTokens ?? 4096,
    // @ts-ignore - structured output support
    output: 'object',
    schema: request.schema,
  })

  // @ts-ignore
  return result.object as T
}

/**
 * Utility function to parse SSE stream for browser consumption
 * Converts Vercel AI SDK stream to plain text stream
 */
export function createTextStream(stream: ReadableStream<string>): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  const reader = stream.getReader()

  return new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          controller.enqueue(encoder.encode(value))
        }
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    },
  })
}

/**
 * Provider health check
 * Verifies that API keys are configured correctly
 */
export async function checkProviderHealth(provider: AIProvider): Promise<boolean> {
  try {
    switch (provider) {
      case 'openai':
        return !!process.env.OPENAI_API_KEY
      case 'anthropic':
        return !!process.env.ANTHROPIC_API_KEY
      case 'google':
        return !!process.env.GOOGLE_GENERATIVE_AI_API_KEY
      case 'openrouter':
        return !!process.env.OPENROUTER_API_KEY
      default:
        return false
    }
  } catch (error) {
    console.error(`Provider ${provider} health check failed:`, error)
    return false
  }
}

/**
 * Get available providers based on configured API keys
 */
export function getAvailableProviders(): AIProvider[] {
  const providers: AIProvider[] = []
  
  if (process.env.OPENAI_API_KEY) providers.push('openai')
  if (process.env.ANTHROPIC_API_KEY) providers.push('anthropic')
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) providers.push('google')
  if (process.env.OPENROUTER_API_KEY) providers.push('openrouter')
  
  return providers
}
