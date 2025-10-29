
'use client'

import { useState, useEffect } from 'react'
import { Project } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MonacoEditor } from './monaco-editor'
import { 
  Code, 
  FileText, 
  Save, 
  RotateCcw,
  Settings 
} from 'lucide-react'
import { motion } from 'framer-motion'

interface CodeEditorProps {
  selectedFile: string | null
  content: string
  onContentChange: (content: string) => void
  activeProject: Project | null
}

export function CodeEditor({ 
  selectedFile, 
  content, 
  onContentChange, 
  activeProject 
}: CodeEditorProps) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [originalContent, setOriginalContent] = useState(content)

  useEffect(() => {
    setOriginalContent(content)
    setHasUnsavedChanges(false)
  }, [selectedFile])

  useEffect(() => {
    setHasUnsavedChanges(content !== originalContent)
  }, [content, originalContent])

  const handleContentChange = (newContent: string) => {
    onContentChange(newContent)
  }

  const resetContent = () => {
    onContentChange(originalContent)
    setHasUnsavedChanges(false)
  }

  const getLanguage = (filePath: string): string => {
    const extension = filePath?.split('.').pop()?.toLowerCase()
    
    const languageMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      html: 'html',
      htm: 'html',
      css: 'css',
      json: 'json',
      md: 'markdown',
      py: 'python',
      txt: 'plaintext',
    }
    
    return languageMap[extension || ''] || 'plaintext'
  }

  if (!activeProject) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-800/30">
        <div className="text-center text-gray-400">
          <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Project Selected</h3>
          <p className="text-sm">Select a project to start editing files</p>
        </div>
      </div>
    )
  }

  if (!selectedFile) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-800/30">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-gray-400"
        >
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No File Selected</h3>
          <p className="text-sm mb-6">Select a file from the sidebar or create a new one</p>
          
          <div className="space-y-2 max-w-sm mx-auto">
            <p className="text-xs font-medium text-gray-300">Quick Start:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-700 rounded p-2">
                <strong>HTML:</strong> index.html
              </div>
              <div className="bg-slate-700 rounded p-2">
                <strong>CSS:</strong> styles.css
              </div>
              <div className="bg-slate-700 rounded p-2">
                <strong>JS:</strong> script.js
              </div>
              <div className="bg-slate-700 rounded p-2">
                <strong>React:</strong> App.jsx
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col bg-slate-800/30"
    >
      {/* Header */}
      <div className="border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Code className="h-5 w-5 text-purple-400" />
            <div>
              <h2 className="font-medium text-white">{selectedFile}</h2>
              <p className="text-xs text-gray-400 capitalize">
                {getLanguage(selectedFile)} • {content.length} characters
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {hasUnsavedChanges && (
              <Button
                size="sm"
                variant="ghost"
                onClick={resetContent}
                className="text-orange-400 hover:text-orange-300"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            )}
            
            <div className={`flex items-center space-x-1 text-xs ${
              hasUnsavedChanges ? 'text-orange-400' : 'text-green-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                hasUnsavedChanges ? 'bg-orange-400' : 'bg-green-400'
              }`} />
              <span>
                {hasUnsavedChanges ? 'Unsaved changes' : 'Saved'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <MonacoEditor
          value={content}
          language={getLanguage(selectedFile)}
          onChange={handleContentChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineHeight: 1.5,
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            bracketPairColorization: { enabled: true },
            renderLineHighlight: 'line',
            cursorBlinking: 'smooth',
            smoothScrolling: true,
          }}
        />
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-4">
            <span>UTF-8</span>
            <span>LF</span>
            <span className="capitalize">{getLanguage(selectedFile)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Auto-save enabled</span>
            <Settings className="h-3 w-3" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
