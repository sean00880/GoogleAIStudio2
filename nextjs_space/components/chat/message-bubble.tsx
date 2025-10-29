
'use client'

import { ChatMessage } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { User, Bot, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
// Simplified without syntax highlighter for now
import { motion } from 'framer-motion'

interface MessageBubbleProps {
  message: ChatMessage
  isStreaming?: boolean
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  
  const isUser = message.role === 'user'
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser 
          ? 'bg-blue-600' 
          : 'bg-purple-600'
      }`}>
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Bot className="h-4 w-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`max-w-[70%] ${isUser ? 'text-right' : ''}`}>
        <Card className={`${
          isUser 
            ? 'bg-blue-600/20 border-blue-500/30' 
            : 'bg-slate-700/50 border-slate-600/30'
        } ${isStreaming ? 'animate-pulse' : ''}`}>
          <CardContent className="p-3">
            {isUser ? (
              <p className="text-white text-sm whitespace-pre-wrap">
                {message.content}
              </p>
            ) : (
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    code({ className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '')
                      const codeContent = String(children).replace(/\n$/, '')
                      const isInline = !match
                      
                      if (!isInline && match) {
                        return (
                          <div className="relative group">
                            <pre className="bg-slate-800 rounded-md p-4 overflow-x-auto mt-2 mb-2">
                              <code className={`language-${match[1]} text-sm`}>
                                {codeContent}
                              </code>
                            </pre>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(codeContent)}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                            >
                              {copied ? (
                                <Check className="h-3 w-3 text-green-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        )
                      }
                      
                      return (
                        <code 
                          className="bg-slate-800 px-1 py-0.5 rounded text-purple-300 text-xs"
                          {...props}
                        >
                          {children}
                        </code>
                      )
                    },
                    pre({ children }: any) {
                      return <>{children}</>
                    }
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timestamp and Model */}
        <div className={`mt-1 text-xs text-gray-400 ${isUser ? 'text-right' : ''}`}>
          {new Date(message.createdAt).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
          {message.model && !isUser && (
            <span className="ml-2">• {message.model}</span>
          )}
          {isStreaming && (
            <span className="ml-2">• Generating...</span>
          )}
        </div>
      </div>
    </div>
  )
}
