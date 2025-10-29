
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Project, GitHubRepo, GitHubFile } from '@/lib/types'
import { Github, Download, File, Folder, Star, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface GitHubImportProps {
  activeProject: Project | null
  onFileCreate: (path: string, content?: string, language?: string) => void
  onClose: () => void
}

export function GitHubImport({ activeProject, onFileCreate, onClose }: GitHubImportProps) {
  const [repoUrl, setRepoUrl] = useState('')
  const [repo, setRepo] = useState<GitHubRepo | null>(null)
  const [files, setFiles] = useState<GitHubFile[]>([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)

  const fetchRepo = async () => {
    if (!repoUrl.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/github/repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: repoUrl }),
      })
      
      if (response.ok) {
        const repoData = await response.json()
        setRepo(repoData)
        fetchFiles(repoUrl)
      } else {
        toast.error('Repository not found')
      }
    } catch (error) {
      toast.error('Error fetching repository')
    } finally {
      setLoading(false)
    }
  }

  const fetchFiles = async (url: string, path = '') => {
    try {
      const response = await fetch('/api/github/contents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, path }),
      })
      
      if (response.ok) {
        const filesData = await response.json()
        setFiles(filesData.filter((f: GitHubFile) => f.type === 'file' && isTextFile(f.name)))
      }
    } catch (error) {
      console.error('Error fetching files:', error)
    }
  }

  const importFile = async (file: GitHubFile) => {
    if (!activeProject) {
      toast.error('No active project')
      return
    }

    setImporting(true)
    try {
      const response = await fetch('/api/github/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: repoUrl, path: file.path }),
      })
      
      if (response.ok) {
        const { content } = await response.json()
        const extension = file.name.split('.').pop()?.toLowerCase()
        const language = getLanguageFromExtension(extension)
        
        await onFileCreate(file.name, content, language)
        toast.success(`Imported ${file.name}`)
      } else {
        toast.error(`Failed to import ${file.name}`)
      }
    } catch (error) {
      toast.error(`Error importing ${file.name}`)
    } finally {
      setImporting(false)
    }
  }

  const importAllFiles = async () => {
    if (!activeProject) {
      toast.error('No active project')
      return
    }

    setImporting(true)
    const importPromises = files.slice(0, 10).map(file => importFile(file)) // Limit to 10 files
    
    try {
      await Promise.all(importPromises)
      toast.success('Files imported successfully')
      onClose()
    } catch (error) {
      toast.error('Some files failed to import')
    } finally {
      setImporting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card className="bg-slate-700 border-slate-600">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm flex items-center text-white">
            <Github className="h-4 w-4 mr-2" />
            Import from GitHub
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="https://github.com/user/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white placeholder-gray-400"
            />
            <Button 
              onClick={fetchRepo}
              disabled={loading || !repoUrl.trim()}
              size="sm"
            >
              {loading ? 'Loading...' : 'Fetch'}
            </Button>
          </div>

          {repo && (
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-white">{repo.name}</h4>
                  {repo.description && (
                    <p className="text-xs text-gray-400 mt-1">{repo.description}</p>
                  )}
                </div>
                <div className="flex items-center text-xs text-yellow-400">
                  <Star className="h-3 w-3 mr-1" />
                  {repo.stars}
                </div>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      {files.length} file{files.length !== 1 ? 's' : ''} found
                    </p>
                    <Button
                      onClick={importAllFiles}
                      disabled={importing}
                      size="sm"
                      variant="outline"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Import All
                    </Button>
                  </div>

                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {files.slice(0, 10).map((file) => (
                      <div
                        key={file.path}
                        className="flex items-center justify-between p-2 bg-slate-800 rounded text-xs"
                      >
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <File className="h-3 w-3 text-gray-400 flex-shrink-0" />
                          <span className="truncate text-white">{file.name}</span>
                        </div>
                        <Button
                          onClick={() => importFile(file)}
                          disabled={importing}
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 flex-shrink-0"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    
                    {files.length > 10 && (
                      <p className="text-xs text-gray-400 px-2">
                        And {files.length - 10} more files...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Close
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function isTextFile(filename: string): boolean {
  const textExtensions = [
    'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'md', 'txt', 
    'py', 'java', 'cpp', 'c', 'h', 'php', 'rb', 'go', 'rs', 'swift',
    'kt', 'scala', 'sh', 'yml', 'yaml', 'xml', 'sql', 'dockerfile'
  ]
  
  const extension = filename.split('.').pop()?.toLowerCase()
  return textExtensions.includes(extension || '')
}

function getLanguageFromExtension(extension?: string): string {
  const languageMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'jsx',
    ts: 'typescript',
    tsx: 'tsx',
    html: 'html',
    css: 'css',
    py: 'python',
    json: 'json',
    md: 'markdown',
  }
  
  return languageMap[extension || ''] || 'plaintext'
}
