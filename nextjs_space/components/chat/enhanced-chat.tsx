
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Project, ChatMessage } from '@/lib/types'
import { ALL_MODELS, MODEL_CATEGORIES, AIProvider } from '@/lib/ai-models'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { APIKeyModal } from '@/components/modals/api-key-modal'
import { 
  Send, 
  Bot, 
  User, 
  Copy, 
  ThumbsUp, 
  ThumbsDown,
  Zap, 
  MessageSquare, 
  Star, 
  Sparkles,
  StopCircle,
  RotateCcw
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'

interface EnhancedChatProps {
  activeProject: Project | null
}

interface StreamingMessage {
  id: string
  content: string
  isComplete: boolean
}

export function EnhancedChat({ activeProject }: EnhancedChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-pro')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState<StreamingMessage | null>(null)
  const [showAPIKeyModal, setShowAPIKeyModal] = useState(false)
  const [missingKeyProvider, setMissingKeyProvider] = useState<AIProvider | null>(null)
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load messages when project changes
  useEffect(() => {
    if (activeProject?.chatMessages) {
      setMessages([...activeProject.chatMessages].reverse()) // Reverse for proper chronological order
    } else {
      setMessages([])
    }
    setStreamingMessage(null)
  }, [activeProject?.id])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, streamingMessage])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [input])

  const stopGeneration = useCallback(() => {
    if (abortController) {
      abortController.abort()
      setAbortController(null)
      setIsLoading(false)
      setStreamingMessage(null)
      toast.info('Generation stopped')
    }
  }, [abortController])

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || input.trim()
    if (!content || !activeProject || isLoading) return

    const controller = new AbortController()
    setAbortController(controller)

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      projectId: activeProject.id,
      role: 'user',
      content,
      model: selectedModel,
      createdAt: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setStreamingMessage({
      id: (Date.now() + 1).toString(),
      content: '',
      isComplete: false
    })

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: activeProject.id,
          message: content,
          model: selectedModel,
        }),
        signal: controller.signal,
      })

      // Handle API key missing error
      if (response.status === 402) {
        const errorData = await response.json()
        if (errorData.error === 'API_KEY_MISSING') {
          const modelConfig = ALL_MODELS.find(m => m.id === selectedModel)
          if (modelConfig) {
            setMissingKeyProvider(modelConfig.provider)
            setShowAPIKeyModal(true)
          }
          toast.error('API key required for this model')
          return
        }
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Failed to send message')
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      while (true) {
        const { done, value } = await reader?.read() || {}
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        assistantContent += chunk
        
        setStreamingMessage(prev => prev ? {
          ...prev,
          content: assistantContent
        } : null)
      }

      // Add the complete message
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        projectId: activeProject.id,
        role: 'assistant',
        content: assistantContent,
        model: selectedModel,
        createdAt: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
      setStreamingMessage(prev => prev ? { ...prev, isComplete: true } : null)
      
      // Clear streaming message after a brief delay
      setTimeout(() => setStreamingMessage(null), 100)
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // User stopped the generation
        return
      }
      console.error('Error sending message:', error)
      toast.error(error.message || 'Failed to send message')
      setStreamingMessage(null)
    } finally {
      setIsLoading(false)
      setAbortController(null)
    }
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success('Copied to clipboard')
  }

  const regenerateResponse = async (messageIndex: number) => {
    if (messageIndex === 0) return // Can't regenerate if it's the first message
    
    const userMessage = messages[messageIndex - 1]
    if (userMessage?.role === 'user') {
      // Remove the last assistant message and regenerate
      setMessages(prev => prev.slice(0, messageIndex))
      await sendMessage(userMessage.content)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const MessageBubble = ({ message, index }: { message: ChatMessage; index: number }) => {
    const isUser = message.role === 'user'
    const isLast = index === messages.length - 1

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} space-x-3`}>
          <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isUser 
                ? 'bg-blue-500 text-white' 
                : 'bg-purple-500 text-white'
            }`}>
              {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
          </div>
          
          <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
            <div className={`px-4 py-2 rounded-2xl ${
              isUser 
                ? 'bg-blue-500 text-white rounded-br-sm' 
                : 'bg-muted rounded-bl-sm'
            }`}>
              {isUser ? (
                <p className="whitespace-pre-wrap">{message.content}</p>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      code({ className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '')
                        return match ? (
                          <pre className="bg-muted p-3 rounded-md overflow-auto">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        ) : (
                          <code className={`${className} bg-muted px-1 py-0.5 rounded text-sm`} {...props}>
                            {children}
                          </code>
                        )
                      }
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-xs text-muted-foreground">
                {new Date(message.createdAt).toLocaleTimeString()}
              </span>
              {message.model && (
                <Badge variant="outline" className="text-xs">
                  {message.model.replace(/^(gpt-|claude-|gemini-)/, '').toUpperCase()}
                </Badge>
              )}
              
              {/* Message actions */}
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyMessage(message.content)}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                
                {!isUser && isLast && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => regenerateResponse(index)}
                    className="h-6 w-6 p-0"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  if (!activeProject) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/10">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium mb-2">No Conversation Selected</h3>
          <p className="text-sm text-muted-foreground">Select or create a conversation to start chatting with AI</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bot className="h-5 w-5 text-purple-400" />
            <div>
              <h2 className="font-medium">{activeProject.name}</h2>
              <p className="text-xs text-muted-foreground">
                {messages.length} message{messages.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[400px]">
              {Object.entries(MODEL_CATEGORIES).map(([key, category]) => (
                <SelectGroup key={key}>
                  <SelectLabel className="flex items-center space-x-2 text-purple-400">
                    {key === 'flagship' && <Star className="h-3 w-3" />}
                    {key === 'fast' && <Zap className="h-3 w-3" />}
                    {key === 'specialized' && <Sparkles className="h-3 w-3" />}
                    <span>{category.label}</span>
                  </SelectLabel>
                  {category.models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center justify-between space-x-3 w-full">
                        <span className="font-medium">{model.name}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {model.provider}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            {messages.length === 0 && !streamingMessage && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Bot className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                  I can help you write code, debug issues, and answer questions about your project.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    "Create a React component",
                    "Fix this JavaScript error", 
                    "Explain this code",
                    "Add CSS styling"
                  ].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      onClick={() => setInput(suggestion)}
                      className="hover:bg-muted"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="space-y-0">
              {messages.map((message, index) => (
                <div key={message.id} className="group">
                  <MessageBubble message={message} index={index} />
                </div>
              ))}
              
              {/* Streaming message */}
              {streamingMessage && (
                <div className="group">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start mb-4"
                  >
                    <div className="flex max-w-[80%] space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-500 text-white">
                          <Bot className="h-4 w-4" />
                        </div>
                      </div>
                      
                      <div className="flex flex-col">
                        <div className="px-4 py-2 rounded-2xl bg-muted rounded-bl-sm">
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{streamingMessage.content}</ReactMarkdown>
                          </div>
                          {!streamingMessage.isComplete && (
                            <div className="flex items-center space-x-1 mt-2">
                              <div className="animate-pulse w-2 h-2 bg-purple-400 rounded-full" />
                              <span className="text-xs text-muted-foreground">AI is typing...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
            
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything... (⌘/Ctrl + Enter to send)"
              className="resize-none pr-12 min-h-[60px] max-h-[120px]"
              rows={1}
              disabled={isLoading}
            />
            <div className="absolute right-2 bottom-2 text-xs text-muted-foreground">
              {input.length > 0 && `${input.length}/4000`}
            </div>
          </div>
          
          {isLoading ? (
            <Button
              onClick={stopGeneration}
              variant="outline"
              className="px-3 text-red-500 hover:text-red-600"
            >
              <StopCircle className="h-4 w-4 mr-1" />
              Stop
            </Button>
          ) : (
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim()}
              className="px-4"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* API Key Modal */}
      {missingKeyProvider && (
        <APIKeyModal
          open={showAPIKeyModal}
          onOpenChange={setShowAPIKeyModal}
          provider={missingKeyProvider}
          onKeySaved={() => {
            toast.success('API key saved! You can now use this model.')
            if (input.trim()) {
              sendMessage()
            }
          }}
          onSwitchModel={() => {
            toast.info('Please select a different model')
          }}
        />
      )}
    </div>
  )
}
