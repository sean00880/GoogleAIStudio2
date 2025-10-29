
/**
 * Models API Route
 * 
 * Provides information about available AI models and providers.
 * Useful for UI model selection and capability discovery.
 */

import { NextResponse } from 'next/server'
import { 
  ALL_MODELS, 
  MODEL_CATEGORIES, 
  PROVIDER_INFO,
  getModelsByProvider,
  getModelsByCapability
} from '@/lib/ai-models'
import { getAvailableProviders } from '@/lib/ai-providers'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const provider = searchParams.get('provider')
  const capability = searchParams.get('capability')
  const category = searchParams.get('category')

  try {
    // Filter by provider
    if (provider) {
      const models = getModelsByProvider(provider as any)
      return NextResponse.json({
        provider,
        models,
        count: models.length
      })
    }

    // Filter by capability
    if (capability) {
      const models = getModelsByCapability(capability as any)
      return NextResponse.json({
        capability,
        models,
        count: models.length
      })
    }

    // Filter by category
    if (category && category in MODEL_CATEGORIES) {
      const cat = MODEL_CATEGORIES[category as keyof typeof MODEL_CATEGORIES]
      return NextResponse.json({
        category,
        label: cat.label,
        description: cat.description,
        models: cat.models,
        count: cat.models.length
      })
    }

    // Return all information
    const availableProviders = getAvailableProviders()
    
    return NextResponse.json({
      models: ALL_MODELS,
      categories: MODEL_CATEGORIES,
      providers: PROVIDER_INFO,
      availableProviders,
      statistics: {
        totalModels: ALL_MODELS.length,
        flagshipModels: MODEL_CATEGORIES.flagship.models.length,
        fastModels: MODEL_CATEGORIES.fast.models.length,
        specializedModels: MODEL_CATEGORIES.specialized.models.length,
      }
    })
  } catch (error) {
    console.error('Error in models API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    )
  }
}
