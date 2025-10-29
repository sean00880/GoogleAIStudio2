
'use client'

import { useState, useEffect } from 'react'
import { Project } from '@/lib/types'
import { Sidebar } from '@/components/sidebar/sidebar'
import { ChatInterface } from '@/components/chat/chat-interface'
import { CodeEditor } from '@/components/editor/code-editor'
import { LivePreview } from '@/components/preview/live-preview'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { toast } from 'sonner'

interface MainAppProps {
  initialProjects: Project[]
}

export function MainApp({ initialProjects }: MainAppProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [activeProject, setActiveProject] = useState<Project | null>(
    initialProjects.length > 0 ? initialProjects[0] : null
  )
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string>('')

  // Auto-save file content
  useEffect(() => {
    const saveFile = async () => {
      if (selectedFile && activeProject && fileContent !== undefined) {
        try {
          const file = activeProject.files?.find(f => f.path === selectedFile)
          if (file) {
            await fetch(`/api/files/${file.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content: fileContent }),
            })
          }
        } catch (error) {
          console.error('Error saving file:', error)
        }
      }
    }

    const timeoutId = setTimeout(saveFile, 1000) // Auto-save after 1 second of inactivity
    return () => clearTimeout(timeoutId)
  }, [fileContent, selectedFile, activeProject])

  const createProject = async (name: string, description?: string) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })

      if (response.ok) {
        const newProject = await response.json()
        setProjects(prev => [newProject, ...prev])
        setActiveProject(newProject)
        toast.success('Project created successfully')
        return newProject
      }
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error('Failed to create project')
    }
  }

  const deleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setProjects(prev => prev.filter(p => p.id !== projectId))
        if (activeProject?.id === projectId) {
          const remainingProjects = projects.filter(p => p.id !== projectId)
          setActiveProject(remainingProjects.length > 0 ? remainingProjects[0] : null)
        }
        toast.success('Project deleted')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Failed to delete project')
    }
  }

  const createFile = async (path: string, content = '', language = 'javascript') => {
    if (!activeProject) return

    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: activeProject.id,
          path,
          content,
          language,
        }),
      })

      if (response.ok) {
        const newFile = await response.json()
        setProjects(prev =>
          prev.map(p =>
            p.id === activeProject.id
              ? { ...p, files: [...(p.files || []), newFile] }
              : p
          )
        )
        setActiveProject(prev =>
          prev ? { ...prev, files: [...(prev.files || []), newFile] } : null
        )
        setSelectedFile(path)
        setFileContent(content)
        toast.success('File created')
      }
    } catch (error) {
      console.error('Error creating file:', error)
      toast.error('Failed to create file')
    }
  }

  const selectFile = (filePath: string) => {
    const file = activeProject?.files?.find(f => f.path === filePath)
    if (file) {
      setSelectedFile(filePath)
      setFileContent(file.content || '')
    }
  }

  const updateFileContent = (content: string) => {
    setFileContent(content)
  }

  // Create a default project if none exist
  useEffect(() => {
    if (projects.length === 0) {
      createProject('My First Project', 'Welcome to AI Studio Clone!')
    }
  }, [projects.length])

  return (
    <div className="h-screen flex">
      <Sidebar
        projects={projects}
        activeProject={activeProject}
        onProjectSelect={setActiveProject}
        onProjectCreate={createProject}
        onProjectDelete={deleteProject}
        onFileSelect={selectFile}
        onFileCreate={createFile}
        selectedFile={selectedFile}
      />
      
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={50} minSize={30}>
          <ChatInterface activeProject={activeProject} />
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={50} minSize={30}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={60} minSize={30}>
              <CodeEditor
                selectedFile={selectedFile}
                content={fileContent}
                onContentChange={updateFileContent}
                activeProject={activeProject}
              />
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={40} minSize={20}>
              <LivePreview
                files={activeProject?.files || []}
                selectedFile={selectedFile}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
