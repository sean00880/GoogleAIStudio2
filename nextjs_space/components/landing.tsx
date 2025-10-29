
'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Brain, Code, Zap, Github, MessageSquare, Eye } from 'lucide-react'
import { motion } from 'framer-motion'

export function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center mb-6">
              <Brain className="w-16 h-16 text-purple-400 mr-4" />
              <h1 className="text-5xl font-bold text-white">
                AI Studio Clone
              </h1>
            </div>
            <p className="text-xl text-gray-300 mb-8">
              Build, chat, and preview code with multiple AI models in one powerful platform
            </p>
            <Button 
              onClick={() => signIn('google', { callbackUrl: '/app' })}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 text-lg"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </Button>
          </motion.div>
        </div>

        {/* Feature Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Multi-Model Chat</h3>
              <p className="text-gray-300">
                Chat with GPT-4, Claude, and other AI models. Switch between models seamlessly during your conversation.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Live Preview</h3>
              <p className="text-gray-300">
                See your code come to life instantly with our real-time preview system. No setup required.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Monaco Editor</h3>
              <p className="text-gray-300">
                Full VS Code experience in the browser with syntax highlighting, autocomplete, and more.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Features */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-16"
        >
          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Github className="w-8 h-8 text-white mr-3" />
                <h3 className="text-lg font-semibold text-white">GitHub Integration</h3>
              </div>
              <p className="text-gray-300">
                Paste any GitHub repository URL to instantly load files as context for your AI conversations.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Zap className="w-8 h-8 text-white mr-3" />
                <h3 className="text-lg font-semibold text-white">Project Management</h3>
              </div>
              <p className="text-gray-300">
                Organize your work into projects with automatic saving and easy switching between different contexts.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
