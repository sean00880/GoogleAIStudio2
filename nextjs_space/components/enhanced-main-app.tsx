
'use client'

import { useState, useEffect } from 'react'
import { Project } from '@/lib/types'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { WorkspaceSidebar } from '@/components/workspace/workspace-sidebar'
import { EnhancedChat } from '@/components/chat/enhanced-chat'
import { EnhancedCodePreview } from '@/components/editor/enhanced-code-preview'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  MessageSquare, 
  Code, 
  Settings,
  User,
  LogOut
} from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { useSession, signOut } from 'next-auth/react'

interface EnhancedMainAppProps {
  initialProjects: Project[]
}

export function EnhancedMainApp({ initialProjects }: EnhancedMainAppProps) {
  const { data: session } = useSession()
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [activeProject, setActiveProject] = useState<Project | null>(
    initialProjects.length > 0 ? initialProjects[0] : null
  )
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [showCodePanel, setShowCodePanel] = useState(true)

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
        toast.success('New conversation created')
        return newProject
      }
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error('Failed to create conversation')
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
        toast.success('Conversation deleted')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Failed to delete conversation')
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

  const handleProjectSelect = (project: Project) => {
    setActiveProject(project)
    setSelectedFile(null)
    setFileContent('')
  }

  // Create a default project if none exist
  useEffect(() => {
    if (projects.length === 0) {
      createProject('Welcome Chat', 'Your first AI conversation')
    }
  }, [projects.length])

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full">
        {/* Collapsible Workspace Sidebar */}
        <WorkspaceSidebar
          projects={projects}
          activeProject={activeProject}
          onProjectSelect={handleProjectSelect}
          onProjectCreate={createProject}
          onProjectDelete={deleteProject}
        />

        {/* Main Content Area */}
        <SidebarInset className="flex-1">
          <div className="flex flex-col h-full">
            {/* Top Navigation */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
            >
              <div className="flex h-14 items-center px-4">
                <SidebarTrigger className="mr-4" />
                
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 text-purple-400" />
                    <h1 className="font-semibold">AI Studio</h1>
                  </div>
                  
                  {activeProject && (
                    <Badge variant="outline" className="text-xs">
                      {activeProject.name}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCodePanel(!showCodePanel)}
                    className={showCodePanel ? "bg-muted" : ""}
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Code
                  </Button>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {session?.user?.image && (
                      <img 
                        src={session.user.image} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{session?.user?.name}</span>
                      <span className="text-xs text-muted-foreground">{session?.user?.email}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => signOut()}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Main Panel Group */}
            <div className="flex-1">
              <ResizablePanelGroup direction="horizontal">
                {/* Chat Panel */}
                <ResizablePanel 
                  defaultSize={showCodePanel ? 50 : 100} 
                  minSize={30}
                  maxSize={showCodePanel ? 70 : 100}
                >
                  <EnhancedChat activeProject={activeProject} />
                </ResizablePanel>

                {/* Code Preview Panel */}
                {showCodePanel && (
                  <>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={50} minSize={30}>
                      <EnhancedCodePreview
                        files={activeProject?.files || []}
                        selectedFile={selectedFile}
                        onFileSelect={selectFile}
                        onFileCreate={createFile}
                        onFileContentChange={updateFileContent}
                        activeProject={activeProject}
                      />
                    </ResizablePanel>
                  </>
                )}
              </ResizablePanelGroup>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
