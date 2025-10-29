
'use client'

import { useState } from 'react'
import { Project, ProjectFile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  Plus, 
  FolderOpen, 
  File, 
  Search, 
  Trash2,
  Settings,
  Github
} from 'lucide-react'
import { ProjectList } from './project-list'
import { FileTree } from './file-tree'
import { GitHubImport } from './github-import'
import { motion } from 'framer-motion'

interface SidebarProps {
  projects: Project[]
  activeProject: Project | null
  onProjectSelect: (project: Project) => void
  onProjectCreate: (name: string, description?: string) => void
  onProjectDelete: (projectId: string) => void
  onFileSelect: (filePath: string) => void
  onFileCreate: (path: string, content?: string, language?: string) => void
  selectedFile: string | null
}

export function Sidebar({
  projects,
  activeProject,
  onProjectSelect,
  onProjectCreate,
  onProjectDelete,
  onFileSelect,
  onFileCreate,
  selectedFile,
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showGitHubImport, setShowGitHubImport] = useState(false)

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col h-full"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Projects</h2>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowGitHubImport(!showGitHubImport)}
            className="h-8 w-8 p-0"
          >
            <Github className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-gray-400"
          />
        </div>

        {showGitHubImport && (
          <GitHubImport
            activeProject={activeProject}
            onFileCreate={onFileCreate}
            onClose={() => setShowGitHubImport(false)}
          />
        )}
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto">
        <ProjectList
          projects={filteredProjects}
          activeProject={activeProject}
          onProjectSelect={onProjectSelect}
          onProjectCreate={onProjectCreate}
          onProjectDelete={onProjectDelete}
        />
        
        <Separator className="my-4 bg-slate-700" />
        
        {/* File Explorer */}
        {activeProject && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-300">Files</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const fileName = prompt('Enter file name (e.g., index.html, script.js):')
                  if (fileName) {
                    const extension = fileName.split('.').pop()?.toLowerCase()
                    const language = getLanguageFromExtension(extension)
                    onFileCreate(fileName, '', language)
                  }
                }}
                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            <FileTree
              files={activeProject.files || []}
              selectedFile={selectedFile}
              onFileSelect={onFileSelect}
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}

function getLanguageFromExtension(extension?: string): string {
  const languageMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'jsx',
    ts: 'typescript',
    tsx: 'tsx',
    html: 'html',
    htm: 'html',
    css: 'css',
    py: 'python',
    json: 'json',
    md: 'markdown',
  }
  
  return languageMap[extension || ''] || 'plaintext'
}
