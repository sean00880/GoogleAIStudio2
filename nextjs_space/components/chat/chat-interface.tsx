
'use client'

import { useState, useRef, useEffect } from 'react'
import { Project, ChatMessage, AI_MODELS } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageList } from './message-list'
import { Send, Bot, Zap, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface ChatInterfaceProps {
  activeProject: Project | null
}

export function ChatInterface({ activeProject }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [selectedModel, setSelectedModel] = useState('gpt-4')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Load messages when project changes
  useEffect(() => {
    if (activeProject?.chatMessages) {
      setMessages(activeProject.chatMessages)
    } else {
      setMessages([])
    }
  }, [activeProject?.id])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, streamingMessage])

  const sendMessage = async () => {
    if (!input.trim() || !activeProject || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      projectId: activeProject.id,
      role: 'user',
      content: input.trim(),
      model: selectedModel,
      createdAt: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setStreamingMessage('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: activeProject.id,
          message: input.trim(),
          model: selectedModel,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
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
        setStreamingMessage(assistantContent)
      }

      // Add the complete message
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        projectId: activeProject.id,
        role: 'assistant',
        content: assistantContent,
        model: selectedModel,
        createdAt: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
      setStreamingMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!activeProject) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-800/50">
        <div className="text-center text-gray-400">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Project Selected</h3>
          <p className="text-sm">Select or create a project to start chatting with AI</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-slate-800/30">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-slate-700 p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bot className="h-5 w-5 text-purple-400" />
            <div>
              <h2 className="font-medium text-white">{activeProject.name}</h2>
              <p className="text-xs text-gray-400">
                {messages.length} message{messages.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AI_MODELS.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center space-x-2">
                    <Zap className="h-3 w-3" />
                    <span>{model.name}</span>
                    <span className="text-xs text-gray-400">
                      ({model.provider})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {messages.length === 0 && !streamingMessage && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Bot className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Start a conversation
                </h3>
                <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
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
                      className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}

            <MessageList
              messages={messages}
              streamingMessage={streamingMessage}
              isLoading={isLoading}
            />
            
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-t border-slate-700 p-4"
      >
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything about your project... (⌘/Ctrl + Enter to send)"
              className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 resize-none pr-12"
              rows={1}
              disabled={isLoading}
            />
            <div className="absolute right-2 top-2 text-xs text-gray-500">
              {input.length > 0 && `${input.length}/4000`}
            </div>
          </div>
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
