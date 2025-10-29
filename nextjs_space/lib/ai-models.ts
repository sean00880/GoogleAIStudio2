
/**
 * AI Model Configuration - Latest Flagship Models (2025)
 * 
 * This file defines all available AI models and their providers.
 * Based on comprehensive research of the latest flagship models from
 * OpenAI, Anthropic, Google, Meta, and specialized providers.
 * 
 * Last Updated: January 2025
 * 
 * To add a new model:
 * 1. Add it to the appropriate category array
 * 2. Specify the provider (openai, anthropic, google, openrouter)
 * 3. Set the correct model identifier for the provider's API
 * 4. Define capabilities and use cases
 */

export interface AIModel {
  id: string                    // Internal identifier
  name: string                  // Display name
  provider: AIProvider          // Which provider hosts this model
  modelId: string              // Provider-specific model identifier
  description: string          // Short description
  contextWindow: number        // Max context tokens
  maxOutput: number           // Max output tokens
  capabilities: ModelCapability[]
  bestFor: string[]           // Best use cases
  pricing?: {
    input: number             // Cost per 1M input tokens
    output: number            // Cost per 1M output tokens
  }
}

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'openrouter' | 'x-ai'

export type ModelCapability = 
  | 'text' 
  | 'code' 
  | 'vision' 
  | 'reasoning'
  | 'function-calling' 
  | 'json-mode'
  | 'streaming'
  | 'agents'

/**
 * Flagship Models - Latest and Most Powerful (2025)
 * These are the absolute best models from each provider
 * Updated with latest models from OpenRouter and LMArena rankings
 */
export const FLAGSHIP_MODELS: AIModel[] = [
  // Google - #1 on LMArena Overall Leaderboard
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    modelId: 'gemini-2.5-pro-exp-03',
    description: '#1 on LMArena. Google\'s most advanced model with exceptional reasoning and coding capabilities.',
    contextWindow: 2000000,
    maxOutput: 16384,
    capabilities: ['text', 'code', 'vision', 'reasoning', 'function-calling', 'streaming', 'agents'],
    bestFor: ['complex reasoning', 'coding', 'long context', 'multimodal', 'agents'],
    pricing: {
      input: 1.25,
      output: 5.0
    }
  },
  
  // Anthropic - #1 on Vercel AI Gateway (50.9% market share)
  {
    id: 'claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    provider: 'anthropic',
    modelId: 'claude-sonnet-4.5-20250514',
    description: 'Anthropic\'s latest flagship. Top choice on Vercel AI Gateway with thinking-32k variant.',
    contextWindow: 200000,
    maxOutput: 16384,
    capabilities: ['text', 'code', 'vision', 'reasoning', 'function-calling', 'streaming', 'agents'],
    bestFor: ['instruction-following', 'creative writing', 'coding', 'complex analysis', 'agents'],
    pricing: {
      input: 3.0,
      output: 15.0
    }
  },
  {
    id: 'claude-sonnet-4.5-thinking',
    name: 'Claude Sonnet 4.5 Thinking',
    provider: 'anthropic',
    modelId: 'claude-sonnet-4.5-thinking-32k-20250514',
    description: 'Extended thinking variant with 32k context for complex reasoning tasks.',
    contextWindow: 32000,
    maxOutput: 16384,
    capabilities: ['text', 'code', 'reasoning', 'function-calling', 'streaming'],
    bestFor: ['complex reasoning', 'math', 'science', 'coding', 'deep analysis'],
    pricing: {
      input: 4.0,
      output: 20.0
    }
  },
  
  // OpenAI - GPT-5 Series
  {
    id: 'gpt-5',
    name: 'GPT-5',
    provider: 'openai',
    modelId: 'gpt-5',
    description: 'OpenAI\'s latest flagship model. Major advancement in reasoning and coding.',
    contextWindow: 200000,
    maxOutput: 32768,
    capabilities: ['text', 'code', 'vision', 'reasoning', 'function-calling', 'json-mode', 'streaming', 'agents'],
    bestFor: ['coding', 'reasoning', 'multimodal', 'complex tasks', 'agents'],
    pricing: {
      input: 5.0,
      output: 20.0
    }
  },
  {
    id: 'chatgpt-5-high',
    name: 'ChatGPT 5 High',
    provider: 'openai',
    modelId: 'chatgpt-5-high',
    description: 'ChatGPT 5 optimized for high-quality responses.',
    contextWindow: 200000,
    maxOutput: 32768,
    capabilities: ['text', 'code', 'vision', 'reasoning', 'function-calling', 'streaming', 'agents'],
    bestFor: ['conversational AI', 'complex tasks', 'coding', 'reasoning'],
    pricing: {
      input: 4.0,
      output: 16.0
    }
  },
  {
    id: 'chatgpt-5-chat',
    name: 'ChatGPT 5 Chat',
    provider: 'openai',
    modelId: 'chatgpt-5-chat',
    description: 'ChatGPT 5 variant optimized for conversational interactions.',
    contextWindow: 128000,
    maxOutput: 16384,
    capabilities: ['text', 'code', 'function-calling', 'streaming', 'agents'],
    bestFor: ['conversations', 'general tasks', 'coding', 'agents'],
    pricing: {
      input: 3.0,
      output: 12.0
    }
  },
  
  // X.AI - Grok (30.2% market share on OpenRouter)
  {
    id: 'grok-2-1212',
    name: 'Grok 2',
    provider: 'x-ai',
    modelId: 'x-ai/grok-2-1212',
    description: '#1 on OpenRouter with 30.2% market share. X.AI\'s flagship model with exceptional performance.',
    contextWindow: 131072,
    maxOutput: 16384,
    capabilities: ['text', 'code', 'vision', 'reasoning', 'function-calling', 'streaming', 'agents'],
    bestFor: ['real-time data', 'reasoning', 'coding', 'multimodal'],
    pricing: {
      input: 2.0,
      output: 10.0
    }
  },
  {
    id: 'grok-2-vision-1212',
    name: 'Grok 2 Vision',
    provider: 'x-ai',
    modelId: 'x-ai/grok-2-vision-1212',
    description: 'Grok 2 with enhanced vision capabilities.',
    contextWindow: 32768,
    maxOutput: 16384,
    capabilities: ['text', 'code', 'vision', 'function-calling', 'streaming'],
    bestFor: ['multimodal', 'image analysis', 'visual reasoning'],
    pricing: {
      input: 2.0,
      output: 10.0
    }
  },
  
  // OpenAI - GPT-4o (Still excellent)
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    modelId: 'gpt-4o',
    description: 'OpenAI\'s proven multimodal model. Exceptional for complex reasoning, coding, and creative tasks.',
    contextWindow: 128000,
    maxOutput: 16384,
    capabilities: ['text', 'code', 'vision', 'function-calling', 'json-mode', 'streaming', 'agents'],
    bestFor: ['coding', 'reasoning', 'multimodal', 'agents'],
    pricing: {
      input: 2.5,
      output: 10.0
    }
  },
  {
    id: 'o1',
    name: 'O1',
    provider: 'openai',
    modelId: 'o1',
    description: 'OpenAI\'s advanced reasoning model. Uses extended "thinking" for complex problems.',
    contextWindow: 200000,
    maxOutput: 100000,
    capabilities: ['text', 'code', 'reasoning', 'streaming'],
    bestFor: ['complex reasoning', 'math', 'science', 'coding'],
    pricing: {
      input: 15.0,
      output: 60.0
    }
  },
  {
    id: 'o1-mini',
    name: 'O1 Mini',
    provider: 'openai',
    modelId: 'o1-mini',
    description: 'Faster, more affordable version of O1. 80% cost reduction.',
    contextWindow: 128000,
    maxOutput: 65536,
    capabilities: ['text', 'code', 'reasoning', 'streaming'],
    bestFor: ['coding', 'math', 'STEM reasoning'],
    pricing: {
      input: 3.0,
      output: 12.0
    }
  },
  
  // Anthropic - Best for instruction-following and creative tasks
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    modelId: 'claude-3-5-sonnet-20241022',
    description: 'Anthropic\'s flagship model. Exceptional at instruction-following, creative writing, and coding.',
    contextWindow: 200000,
    maxOutput: 8192,
    capabilities: ['text', 'code', 'vision', 'function-calling', 'streaming', 'agents'],
    bestFor: ['instruction-following', 'creative writing', 'coding', 'analysis'],
    pricing: {
      input: 3.0,
      output: 15.0
    }
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    modelId: 'claude-3-opus-20240229',
    description: 'Anthropic\'s most powerful model. Best for complex analysis and difficult tasks.',
    contextWindow: 200000,
    maxOutput: 4096,
    capabilities: ['text', 'code', 'vision', 'streaming'],
    bestFor: ['complex analysis', 'research', 'deep reasoning'],
    pricing: {
      input: 15.0,
      output: 75.0
    }
  },
  
  // Google - Best for massive context and multimodal
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    modelId: 'gemini-2.0-flash-exp',
    description: 'Google\'s latest multimodal model. Extremely fast with native tool use.',
    contextWindow: 1000000,
    maxOutput: 8192,
    capabilities: ['text', 'code', 'vision', 'function-calling', 'streaming', 'agents'],
    bestFor: ['multimodal', 'speed', 'tool use', 'agents'],
    pricing: {
      input: 0.0,  // Free in preview
      output: 0.0
    }
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    modelId: 'gemini-1.5-pro-002',
    description: 'Google\'s pro model with massive 2M context. Excellent for long documents.',
    contextWindow: 2000000,
    maxOutput: 8192,
    capabilities: ['text', 'code', 'vision', 'function-calling', 'streaming'],
    bestFor: ['long context', 'document analysis', 'multimodal'],
    pricing: {
      input: 1.25,
      output: 5.0
    }
  },
]

/**
 * Fast & Efficient Models - Optimized for speed and cost
 */
export const FAST_MODELS: AIModel[] = [
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    modelId: 'gpt-4o-mini',
    description: 'Fast and affordable version of GPT-4o. Great for most tasks.',
    contextWindow: 128000,
    maxOutput: 16384,
    capabilities: ['text', 'code', 'vision', 'function-calling', 'json-mode', 'streaming', 'agents'],
    bestFor: ['general tasks', 'high volume', 'cost-effective'],
    pricing: {
      input: 0.15,
      output: 0.6
    }
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    modelId: 'claude-3-haiku-20240307',
    description: 'Anthropic\'s fastest model. Excellent for quick responses.',
    contextWindow: 200000,
    maxOutput: 4096,
    capabilities: ['text', 'code', 'streaming'],
    bestFor: ['speed', 'quick responses', 'simple tasks'],
    pricing: {
      input: 0.25,
      output: 1.25
    }
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    modelId: 'gemini-1.5-flash-002',
    description: 'Google\'s fast multimodal model. Best balance of speed and capability.',
    contextWindow: 1000000,
    maxOutput: 8192,
    capabilities: ['text', 'code', 'vision', 'streaming'],
    bestFor: ['speed', 'multimodal', 'cost-effective'],
    pricing: {
      input: 0.075,
      output: 0.3
    }
  },
]

/**
 * Specialized Models - Optimized for specific tasks
 * Available through OpenRouter
 */
export const SPECIALIZED_MODELS: AIModel[] = [
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'openrouter',
    modelId: 'deepseek/deepseek-chat',
    description: 'Latest DeepSeek model with 671B parameters. Excellent for coding and reasoning.',
    contextWindow: 64000,
    maxOutput: 8192,
    capabilities: ['code', 'text', 'reasoning', 'streaming'],
    bestFor: ['coding', 'math', 'reasoning'],
    pricing: {
      input: 0.27,
      output: 1.10
    }
  },
  {
    id: 'llama-3.3-70b',
    name: 'Llama 3.3 70B',
    provider: 'openrouter',
    modelId: 'meta-llama/llama-3.3-70b-instruct',
    description: 'Meta\'s latest open model. Strong performance across all tasks.',
    contextWindow: 128000,
    maxOutput: 8192,
    capabilities: ['text', 'code', 'function-calling', 'streaming'],
    bestFor: ['open-source', 'general tasks', 'cost-effective'],
    pricing: {
      input: 0.35,
      output: 0.4
    }
  },
  {
    id: 'qwen-2.5-coder',
    name: 'Qwen 2.5 Coder 32B',
    provider: 'openrouter',
    modelId: 'qwen/qwen-2.5-coder-32b-instruct',
    description: 'Alibaba\'s specialized coding model. Excellent code generation.',
    contextWindow: 32768,
    maxOutput: 8192,
    capabilities: ['code', 'text', 'streaming'],
    bestFor: ['coding', 'code completion', 'refactoring'],
    pricing: {
      input: 0.14,
      output: 0.14
    }
  },
]

/**
 * All available models combined
 */
export const ALL_MODELS: AIModel[] = [
  ...FLAGSHIP_MODELS,
  ...FAST_MODELS,
  ...SPECIALIZED_MODELS,
]

/**
 * Default model selection - Gemini 2.5 Pro (#1 on LMArena)
 */
export const DEFAULT_MODEL = FLAGSHIP_MODELS[0].id // gemini-2.5-pro

/**
 * Model categories for UI organization
 */
export const MODEL_CATEGORIES = {
  flagship: {
    label: 'Flagship Models',
    description: 'Latest and most powerful models from each provider',
    models: FLAGSHIP_MODELS,
  },
  fast: {
    label: 'Fast & Efficient',
    description: 'Optimized for speed and cost-effectiveness',
    models: FAST_MODELS,
  },
  specialized: {
    label: 'Specialized',
    description: 'Models optimized for specific domains (coding, reasoning, etc.)',
    models: SPECIALIZED_MODELS,
  },
}

/**
 * Provider categories for filtering
 */
export const PROVIDER_INFO = {
  openai: {
    name: 'OpenAI',
    description: 'Industry leader in AI models. Latest GPT-5 series.',
    requiresKey: 'OPENAI_API_KEY',
    website: 'https://platform.openai.com',
  },
  anthropic: {
    name: 'Anthropic',
    description: '#1 on Vercel AI Gateway. Latest Claude Sonnet 4.5.',
    requiresKey: 'ANTHROPIC_API_KEY',
    website: 'https://console.anthropic.com',
  },
  google: {
    name: 'Google AI',
    description: '#1 on LMArena. Latest Gemini 2.5 Pro with 2M context.',
    requiresKey: 'GOOGLE_GENERATIVE_AI_API_KEY',
    website: 'https://aistudio.google.com',
  },
  'x-ai': {
    name: 'X.AI',
    description: '#1 on OpenRouter with 30.2% market share. Latest Grok models.',
    requiresKey: 'XAI_API_KEY',
    website: 'https://x.ai',
  },
  openrouter: {
    name: 'OpenRouter',
    description: 'Unified gateway to 100+ models. Single API key for all providers.',
    requiresKey: 'OPENROUTER_API_KEY',
    website: 'https://openrouter.ai',
  },
}

/**
 * Helper function to get model by ID
 */
export function getModelById(id: string): AIModel | undefined {
  return ALL_MODELS.find(model => model.id === id)
}

/**
 * Helper function to get models by provider
 */
export function getModelsByProvider(provider: AIProvider): AIModel[] {
  return ALL_MODELS.filter(model => model.provider === provider)
}

/**
 * Helper function to get models by capability
 */
export function getModelsByCapability(capability: ModelCapability): AIModel[] {
  return ALL_MODELS.filter(model => model.capabilities.includes(capability))
}
