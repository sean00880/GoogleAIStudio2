"use client"

/**
 * API Key Management Modal
 * 
 * This modal is displayed when a user tries to use a model that requires
 * an API key that hasn't been configured. It allows users to:
 * 1. Enter their API key for the required provider
 * 2. Switch to a default model that's already configured
 * 3. Get links to obtain API keys from providers
 */

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ExternalLink, Key, AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface APIKeyModalProps {
  isOpen: boolean
  onClose: () => void
  provider: string
  requiredKey: string
  website: string
  modelName: string
  onSubmitKey: (apiKey: string) => Promise<void>
  onSwitchToDefault: () => void
  defaultModelName?: string
}

export function APIKeyModal({
  isOpen,
  onClose,
  provider,
  requiredKey,
  website,
  modelName,
  onSubmitKey,
  onSwitchToDefault,
  defaultModelName = "Gemini 2.5 Pro"
}: APIKeyModalProps) {
  const [apiKey, setApiKey] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!apiKey.trim()) {
      setError("Please enter an API key")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onSubmitKey(apiKey)
      setSuccess(true)
      setTimeout(() => {
        onClose()
        setApiKey("")
        setSuccess(false)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save API key")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSwitchToDefault = () => {
    onSwitchToDefault()
    onClose()
    setApiKey("")
    setError(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <DialogTitle>API Key Required</DialogTitle>
          </div>
          <DialogDescription>
            To use <span className="font-semibold">{modelName}</span>, you need to provide an API key for {provider}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Information Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your API key is stored securely and only used to make requests to {provider} on your behalf.
              It will be encrypted and never shared.
            </AlertDescription>
          </Alert>

          {/* Get API Key Button */}
          <div className="space-y-2">
            <Label>Get Your API Key</Label>
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => window.open(website, '_blank')}
            >
              <span>Get {provider} API Key</span>
              <ExternalLink className="h-4 w-4" />
            </Button>
            <p className="text-xs text-muted-foreground">
              Don't have an API key? Click above to get one from {provider}.
            </p>
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <Label htmlFor="api-key">{requiredKey}</Label>
            <Input
              id="api-key"
              type="password"
              placeholder={`Enter your ${provider} API key`}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isSubmitting) {
                  handleSubmit()
                }
              }}
            />
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert className="border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>API key saved successfully!</AlertDescription>
            </Alert>
          )}

          {/* Default Model Option */}
          {defaultModelName && (
            <div className="pt-4 border-t">
              <Label className="text-sm text-muted-foreground">
                Or switch to a default model
              </Label>
              <Button
                variant="ghost"
                className="w-full mt-2 justify-start"
                onClick={handleSwitchToDefault}
              >
                Use {defaultModelName} instead
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !apiKey.trim()}>
            {isSubmitting ? "Saving..." : "Save API Key"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
