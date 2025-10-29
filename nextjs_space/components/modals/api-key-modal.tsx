'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ExternalLink, Key, AlertCircle, CheckCircle2 } from 'lucide-react'
import { PROVIDER_INFO, AIProvider, getModelsByProvider } from '@/lib/ai-models'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface APIKeyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  provider: AIProvider
  onKeySaved?: () => void
  onSwitchModel?: () => void
}

export function APIKeyModal({
  open,
  onOpenChange,
  provider,
  onKeySaved,
  onSwitchModel,
}: APIKeyModalProps) {
  const [apiKey, setApiKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const providerInfo = PROVIDER_INFO[provider]
  const providerModels = getModelsByProvider(provider)

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError('Please enter an API key')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Save API key to server (will be stored in environment variables or database)
      const response = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey: apiKey.trim(),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save API key')
      }

      setSuccess(true)
      toast.success(`${providerInfo.name} API key saved successfully!`)
      
      // Wait a moment to show success state
      setTimeout(() => {
        onOpenChange(false)
        onKeySaved?.()
        // Reset state
        setApiKey('')
        setSuccess(false)
      }, 1500)
    } catch (error: any) {
      console.error('Error saving API key:', error)
      setError(error.message || 'Failed to save API key')
      toast.error('Failed to save API key')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwitchModel = () => {
    onOpenChange(false)
    onSwitchModel?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <Key className="h-5 w-5 text-purple-400" />
            <span>{providerInfo.name} API Key Required</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            To use {providerInfo.name} models, you need to provide an API key
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Provider Info */}
          <Alert className="bg-slate-700/50 border-slate-600">
            <AlertCircle className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-gray-300">
              <div className="space-y-2">
                <p className="font-medium">{providerInfo.description}</p>
                <div className="flex items-center space-x-2 text-sm">
                  <span>Get your API key from:</span>
                  <a
                    href={providerInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 flex items-center space-x-1"
                  >
                    <span>{providerInfo.website.replace('https://', '')}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Available Models */}
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">
              Available Models ({providerModels.length})
            </h4>
            <div className="space-y-1 text-sm text-gray-400">
              {providerModels.slice(0, 5).map((model) => (
                <div key={model.id} className="flex items-center space-x-2">
                  <span className="text-purple-400">•</span>
                  <span>{model.name}</span>
                </div>
              ))}
              {providerModels.length > 5 && (
                <div className="text-xs text-gray-500 mt-1">
                  +{providerModels.length - 5} more models
                </div>
              )}
            </div>
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <Label htmlFor="api-key" className="text-gray-300">
              API Key
            </Label>
            <div className="relative">
              <Input
                id="api-key"
                type="password"
                placeholder={`Enter your ${providerInfo.name} API key...`}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value)
                  setError('')
                }}
                className="bg-slate-700 border-slate-600 text-white pr-10"
                disabled={isLoading || success}
              />
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {error && (
              <p className="text-sm text-red-400 flex items-center space-x-1">
                <AlertCircle className="h-3 w-3" />
                <span>{error}</span>
              </p>
            )}
            <p className="text-xs text-gray-500">
              Your API key is encrypted and stored securely. It will only be used for your requests.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0">
          <Button
            variant="outline"
            onClick={handleSwitchModel}
            className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 w-full sm:w-auto"
            disabled={isLoading}
          >
            Switch to Another Model
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !apiKey.trim() || success}
            className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Saving...
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Saved!
              </>
            ) : (
              'Save API Key'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
