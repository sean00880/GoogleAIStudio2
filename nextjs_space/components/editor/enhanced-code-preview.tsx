
'use client'

import { useState, useEffect } from 'react'
import { ProjectFile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { 
  Code, 
  Eye, 
  File, 
  FolderOpen, 
  Plus,
  Download,
  ExternalLink,
  FileText,
  Image,
  Globe
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center">Loading editor...</div>
})

interface EnhancedCodePreviewProps {
  files: ProjectFile[]
  selectedFile: string | null
  onFileSelect: (filePath: string) => void
  onFileCreate: (path: string, content?: string, language?: string) => void
  onFileContentChange: (content: string) => void
  activeProject: any
}

export function EnhancedCodePreview({
  files,
  selectedFile,
  onFileSelect,
  onFileCreate,
  onFileContentChange,
  activeProject,
}: EnhancedCodePreviewProps) {
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code')
  const [previewMode, setPreviewMode] = useState<'web' | 'mobile'>('web')
  const [currentFileContent, setCurrentFileContent] = useState('')
  const [isCollapsed, setIsCollapsed] = useState(false)

  const currentFile = files.find(f => f.path === selectedFile)

  useEffect(() => {
    if (currentFile) {
      setCurrentFileContent(currentFile.content || '')
    }
  }, [currentFile])

  const handleContentChange = (content: string | undefined) => {
    const newContent = content || ''
    setCurrentFileContent(newContent)
    onFileContentChange(newContent)
  }

  const getFileIcon = (filePath: string) => {
    const ext = filePath.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'html':
      case 'htm':
        return <Globe className="h-4 w-4" />
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return <Code className="h-4 w-4" />
      case 'css':
      case 'scss':
      case 'sass':
        return <FileText className="h-4 w-4" />
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return <Image className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  const getLanguageFromPath = (filePath: string): string => {
    const ext = filePath.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'js': return 'javascript'
      case 'jsx': return 'javascript'
      case 'ts': return 'typescript'
      case 'tsx': return 'typescript'
      case 'html': return 'html'
      case 'htm': return 'html'
      case 'css': return 'css'
      case 'scss': return 'scss'
      case 'sass': return 'sass'
      case 'py': return 'python'
      case 'json': return 'json'
      case 'md': return 'markdown'
      case 'yml':
      case 'yaml': return 'yaml'
      case 'xml': return 'xml'
      default: return 'plaintext'
    }
  }

  const createNewFile = () => {
    const fileName = prompt('Enter file name (e.g., component.jsx, styles.css):')
    if (fileName) {
      const language = getLanguageFromPath(fileName)
      onFileCreate(fileName, '', language)
    }
  }

  const downloadProject = () => {
    // Create a simple download of all files
    const projectData = {
      name: activeProject?.name || 'project',
      files: files.map(file => ({
        path: file.path,
        content: file.content,
        language: file.language
      }))
    }
    
    const dataStr = JSON.stringify(projectData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `${activeProject?.name || 'project'}.json`
    link.click()
    
    URL.revokeObjectURL(url)
  }

  const PreviewPanel = () => {
    if (!selectedFile) {
      return (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select a file to see preview</p>
          </div>
        </div>
      )
    }

    const ext = selectedFile.split('.').pop()?.toLowerCase()
    const isViewable = ['html', 'htm', 'svg', 'md'].includes(ext || '')

    if (!isViewable) {
      return (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Preview not available for this file type</p>
            <p className="text-sm mt-2">Supported: HTML, SVG, Markdown</p>
          </div>
        </div>
      )
    }

    return (
      <div className="h-full">
        <div className="border-b p-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{ext?.toUpperCase()}</Badge>
            <span className="text-sm text-muted-foreground">Preview</span>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant={previewMode === 'web' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('web')}
            >
              Desktop
            </Button>
            <Button
              variant={previewMode === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('mobile')}
            >
              Mobile
            </Button>
          </div>
        </div>
        
        <div className={`h-[calc(100%-60px)] ${previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
          {ext === 'html' || ext === 'htm' ? (
            <iframe
              srcDoc={currentFileContent}
              className="w-full h-full border-0"
              title="HTML Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          ) : ext === 'svg' ? (
            <div className="w-full h-full flex items-center justify-center p-4">
              <div dangerouslySetInnerHTML={{ __html: currentFileContent }} />
            </div>
          ) : ext === 'md' ? (
            <ScrollArea className="h-full p-4">
              <div className="prose dark:prose-invert max-w-none">
                {/* Simple markdown rendering - could be enhanced with ReactMarkdown */}
                <pre className="whitespace-pre-wrap">{currentFileContent}</pre>
              </div>
            </ScrollArea>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Code className="h-5 w-5 text-blue-400" />
            <h3 className="font-medium">Code & Preview</h3>
            <Badge variant="outline" className="text-xs">
              {files.length} file{files.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={createNewFile}>
              <Plus className="h-4 w-4 mr-1" />
              New File
            </Button>
            <Button variant="ghost" size="sm" onClick={downloadProject}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <ResizablePanelGroup direction="horizontal">
          {/* File Explorer */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <div className="h-full border-r">
              <div className="p-3 border-b">
                <h4 className="text-sm font-medium flex items-center">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Project Files
                </h4>
              </div>
              
              <ScrollArea className="h-[calc(100%-60px)]">
                <div className="p-2">
                  <AnimatePresence>
                    {files.map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Button
                          variant={selectedFile === file.path ? "secondary" : "ghost"}
                          className="w-full justify-start mb-1 h-8"
                          onClick={() => onFileSelect(file.path)}
                        >
                          {getFileIcon(file.path)}
                          <span className="ml-2 truncate text-sm">{file.path}</span>
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {files.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <File className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No files yet</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={createNewFile}
                        className="mt-2"
                      >
                        Create your first file
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>
          
          <ResizableHandle />
          
          {/* Code/Preview Panel */}
          <ResizablePanel defaultSize={75}>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'code' | 'preview')} className="h-full">
              <div className="border-b">
                <TabsList className="h-10">
                  <TabsTrigger value="code" className="flex items-center space-x-2">
                    <Code className="h-4 w-4" />
                    <span>Code</span>
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex items-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span>Preview</span>
                  </TabsTrigger>
                </TabsList>
                
                {selectedFile && (
                  <div className="px-4 py-2 bg-muted/20">
                    <div className="flex items-center space-x-2">
                      {getFileIcon(selectedFile)}
                      <span className="text-sm font-medium">{selectedFile}</span>
                      <Badge variant="outline" className="text-xs">
                        {getLanguageFromPath(selectedFile)}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
              
              <TabsContent value="code" className="h-[calc(100%-100px)] m-0">
                {selectedFile ? (
                  <MonacoEditor
                    value={currentFileContent}
                    onChange={handleContentChange}
                    language={getLanguageFromPath(selectedFile)}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on' as const,
                      wordWrap: 'on' as const,
                      automaticLayout: true,
                      scrollBeyondLastLine: false,
                      renderWhitespace: 'selection' as const,
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select a file to start coding</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={createNewFile}
                        className="mt-4"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create New File
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="preview" className="h-[calc(100%-100px)] m-0">
                <PreviewPanel />
              </TabsContent>
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
