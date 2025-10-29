
'use client'

import { useState, useEffect, useRef } from 'react'
import { ProjectFile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Eye, 
  RefreshCw, 
  ExternalLink, 
  AlertCircle,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react'
import { motion } from 'framer-motion'

interface LivePreviewProps {
  files: ProjectFile[]
  selectedFile: string | null
}

export function LivePreview({ files, selectedFile }: LivePreviewProps) {
  const [previewContent, setPreviewContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Generate preview content
  useEffect(() => {
    generatePreview()
  }, [files, selectedFile])

  const generatePreview = () => {
    setIsLoading(true)
    setError(null)

    try {
      const htmlFile = files.find(f => f.path.endsWith('.html')) || 
                      files.find(f => f.language === 'html')
      
      const cssFile = files.find(f => f.path.endsWith('.css')) || 
                     files.find(f => f.language === 'css')
      
      const jsFile = files.find(f => f.path.endsWith('.js')) || 
                    files.find(f => f.language === 'javascript')

      let html = ''

      if (htmlFile?.content) {
        html = htmlFile.content
      } else if (selectedFile?.endsWith('.html') && files.find(f => f.path === selectedFile)?.content) {
        html = files.find(f => f.path === selectedFile)?.content || ''
      } else {
        // Generate basic HTML structure
        html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Preview</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            background: #f8fafc;
            color: #334155;
        }
        
        .preview-container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .code-block {
            background: #1e293b;
            color: #e2e8f0;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .no-content {
            text-align: center;
            padding: 60px 20px;
            color: #64748b;
        }
        
        .file-preview {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .file-header {
            font-weight: 600;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="preview-container">
        ${getPreviewContent()}
    </div>
</body>
</html>`
      }

      // Inject CSS if available
      if (cssFile?.content && !html.includes('<style>') && !html.includes('<link')) {
        html = html.replace('</head>', `<style>\n${cssFile.content}\n</style>\n</head>`)
      }

      // Inject JavaScript if available
      if (jsFile?.content && !html.includes('<script>')) {
        html = html.replace('</body>', `<script>\n${jsFile.content}\n</script>\n</body>`)
      }

      setPreviewContent(html)
    } catch (err) {
      setError('Error generating preview: ' + (err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const getPreviewContent = (): string => {
    if (files.length === 0) {
      return `
        <div class="no-content">
          <h2>No files to preview</h2>
          <p>Create some files to see a live preview here.</p>
        </div>
      `
    }

    const currentFile = files.find(f => f.path === selectedFile)
    
    if (currentFile) {
      const language = currentFile.language || 'plaintext'
      const content = currentFile.content || ''
      
      if (language === 'html') {
        return content
      } else if (language === 'css') {
        return `
          <div class="file-preview">
            <div class="file-header">CSS Preview: ${currentFile.path}</div>
            <div class="code-block">${escapeHtml(content)}</div>
          </div>
          <div class="file-preview">
            <div class="file-header">CSS Applied</div>
            <style>${content}</style>
            <div style="padding: 20px; background: #f1f5f9; border-radius: 4px;">
              <h3>Sample Content</h3>
              <p>This paragraph demonstrates your CSS styles.</p>
              <button>Sample Button</button>
              <div class="sample-div">Sample div with custom styling</div>
            </div>
          </div>
        `
      } else {
        return `
          <div class="file-preview">
            <div class="file-header">${language.toUpperCase()} Preview: ${currentFile.path}</div>
            <div class="code-block">${escapeHtml(content)}</div>
          </div>
        `
      }
    }

    return `
      <div class="file-preview">
        <div class="file-header">Project Files</div>
        ${files.map(file => `
          <div style="margin-bottom: 12px;">
            <strong>${file.path}</strong> 
            <span style="color: #64748b; font-size: 12px;">(${file.language || 'text'})</span>
          </div>
        `).join('')}
      </div>
    `
  }

  const escapeHtml = (text: string): string => {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  const refresh = () => {
    generatePreview()
  }

  const openInNewTab = () => {
    const blob = new Blob([previewContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  }

  const getViewportClass = () => {
    switch (viewMode) {
      case 'mobile': return 'max-w-sm'
      case 'tablet': return 'max-w-2xl'
      default: return 'w-full'
    }
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
            <Eye className="h-5 w-5 text-purple-400" />
            <div>
              <h2 className="font-medium text-white">Live Preview</h2>
              <p className="text-xs text-gray-400">
                {selectedFile || 'All project files'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Viewport Size Toggle */}
            <div className="flex items-center space-x-1 bg-slate-700 rounded p-1">
              {[
                { mode: 'desktop', icon: Monitor, size: 'Desktop' },
                { mode: 'tablet', icon: Tablet, size: 'Tablet' },
                { mode: 'mobile', icon: Smartphone, size: 'Mobile' }
              ].map(({ mode, icon: Icon, size }) => (
                <Button
                  key={mode}
                  size="sm"
                  variant={viewMode === mode ? 'secondary' : 'ghost'}
                  onClick={() => setViewMode(mode as any)}
                  className="h-7 w-7 p-0"
                  title={size}
                >
                  <Icon className="h-3 w-3" />
                </Button>
              ))}
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={refresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={openInNewTab}
              disabled={!previewContent}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto p-4">
        {error ? (
          <div className="h-full flex items-center justify-center">
            <Card className="bg-red-900/20 border-red-500/30 max-w-md">
              <CardContent className="flex items-center space-x-3 p-4">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div>
                  <h3 className="font-medium text-red-300">Preview Error</h3>
                  <p className="text-sm text-red-400 mt-1">{error}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className={`mx-auto transition-all duration-300 ${getViewportClass()}`}>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {isLoading ? (
                <div className="h-96 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                </div>
              ) : (
                <iframe
                  ref={iframeRef}
                  srcDoc={previewContent}
                  className="w-full h-96 border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                  title="Live Preview"
                />
              )}
            </div>
            
            {viewMode !== 'desktop' && (
              <div className="text-center mt-2 text-xs text-gray-400">
                {viewMode === 'mobile' ? 'Mobile' : 'Tablet'} viewport simulation
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
