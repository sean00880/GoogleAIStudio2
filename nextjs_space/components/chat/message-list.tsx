
'use client'

import { ChatMessage } from '@/lib/types'
import { MessageBubble } from './message-bubble'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot } from 'lucide-react'

interface MessageListProps {
  messages: ChatMessage[]
  streamingMessage?: string
  isLoading?: boolean
}

export function MessageList({ messages, streamingMessage, isLoading }: MessageListProps) {
  return (
    <div className="space-y-4">
      <AnimatePresence>
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: index * 0.05 }}
          >
            <MessageBubble message={message} />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Streaming message */}
      {streamingMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <MessageBubble
            message={{
              id: 'streaming',
              projectId: '',
              role: 'assistant',
              content: streamingMessage,
              createdAt: new Date(),
            }}
            isStreaming
          />
        </motion.div>
      )}

      {/* Loading indicator */}
      {isLoading && !streamingMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start space-x-3"
        >
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div className="flex space-x-1 items-center bg-slate-700 rounded-lg px-3 py-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </motion.div>
      )}
    </div>
  )
}
