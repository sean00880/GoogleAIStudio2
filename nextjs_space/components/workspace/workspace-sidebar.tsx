
'use client'

import { useState, useEffect } from 'react'
import { Project, ChatMessage } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { 
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  useSidebar
} from '@/components/ui/sidebar'
import { 
  Plus, 
  MessageSquare, 
  Search, 
  Trash2,
  Calendar,
  Bot,
  User,
  MoreHorizontal
} from 'lucide-react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface WorkspaceSidebarProps {
  projects: Project[]
  activeProject: Project | null
  onProjectSelect: (project: Project) => void
  onProjectCreate: (name: string, description?: string) => void
  onProjectDelete: (projectId: string) => void
  className?: string
}

export function WorkspaceSidebar({
  projects,
  activeProject,
  onProjectSelect,
  onProjectCreate,
  onProjectDelete,
  className,
}: WorkspaceSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const { open } = useSidebar()

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return
    
    setIsCreating(true)
    try {
      await onProjectCreate(newProjectName.trim(), 'New AI conversation')
      setNewProjectName('')
      toast.success('New conversation created')
    } catch (error) {
      toast.error('Failed to create conversation')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteProject = async (projectId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    if (confirm('Are you sure you want to delete this conversation?')) {
      try {
        await onProjectDelete(projectId)
        toast.success('Conversation deleted')
      } catch (error) {
        toast.error('Failed to delete conversation')
      }
    }
  }

  const getProjectSummary = (project: Project) => {
    const messageCount = project.chatMessages?.length || 0
    const lastMessage = project.chatMessages?.[0] // Most recent message
    const lastModel = lastMessage?.model || 'No messages'
    
    return {
      messageCount,
      lastModel: lastModel.replace(/^(gpt-|claude-|gemini-)/, '').toUpperCase(),
      lastActivity: project.updatedAt
    }
  }

  return (
    <Sidebar className={className}>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-purple-400" />
            {open && <span>Conversations</span>}
          </h2>
        </div>
        
        {open && (
          <div className="space-y-2 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex space-x-1">
              <Input
                placeholder="New conversation..."
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                disabled={isCreating}
                className="flex-1"
              />
              <Button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim() || isCreating}
                size="icon"
                className="shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {open ? 'Recent Conversations' : ''}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <AnimatePresence>
                {filteredProjects.map((project, index) => {
                  const summary = getProjectSummary(project)
                  const isActive = activeProject?.id === project.id
                  
                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => onProjectSelect(project)}
                          tooltip={!open ? project.name : undefined}
                          className="w-full justify-start"
                        >
                          <MessageSquare className="h-4 w-4 shrink-0" />
                          {open && (
                            <div className="flex-1 min-w-0">
                              <div className="truncate font-medium">
                                {project.name}
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <span>{summary.messageCount} msgs</span>
                                <span>•</span>
                                <span>{summary.lastModel}</span>
                              </div>
                            </div>
                          )}
                          {open && (
                            <div className="flex flex-col items-end space-y-1 shrink-0">
                              <Badge variant="outline" className="text-xs">
                                {format(new Date(summary.lastActivity), 'MMM d')}
                              </Badge>
                            </div>
                          )}
                        </SidebarMenuButton>
                        
                        {open && (
                          <SidebarMenuAction
                            onClick={(e) => handleDeleteProject(project.id, e)}
                            showOnHover
                          >
                            <Trash2 className="h-3 w-3" />
                          </SidebarMenuAction>
                        )}
                      </SidebarMenuItem>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
              
              {filteredProjects.length === 0 && (
                <SidebarMenuItem>
                  <div className="p-4 text-center text-muted-foreground">
                    {searchTerm ? 'No conversations found' : 'No conversations yet'}
                    {!searchTerm && (
                      <p className="text-xs mt-1">Create your first conversation above</p>
                    )}
                  </div>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
