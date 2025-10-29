
'use client'

import { useState } from 'react'
import { Project } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Plus, 
  FolderOpen, 
  Trash2,
  Calendar,
  MessageSquare 
} from 'lucide-react'
import { motion } from 'framer-motion'

interface ProjectListProps {
  projects: Project[]
  activeProject: Project | null
  onProjectSelect: (project: Project) => void
  onProjectCreate: (name: string, description?: string) => void
  onProjectDelete: (projectId: string) => void
}

export function ProjectList({
  projects,
  activeProject,
  onProjectSelect,
  onProjectCreate,
  onProjectDelete,
}: ProjectListProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')

  const handleCreateProject = async () => {
    if (newProjectName.trim()) {
      await onProjectCreate(newProjectName.trim(), newProjectDescription.trim() || undefined)
      setNewProjectName('')
      setNewProjectDescription('')
      setIsCreating(false)
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-300">Your Projects</h3>
        
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <Plus className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="My Awesome Project"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="project-description">Description (Optional)</Label>
                <Textarea
                  id="project-description"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Describe your project..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateProject} disabled={!newProjectName.trim()}>
                  Create Project
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                activeProject?.id === project.id
                  ? 'bg-purple-600/20 border-purple-500'
                  : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
              }`}
              onClick={() => onProjectSelect(project)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <FolderOpen className="h-4 w-4 text-purple-400" />
                    <h4 className="font-medium text-white truncate">
                      {project.name}
                    </h4>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm('Are you sure you want to delete this project?')) {
                        onProjectDelete(project.id)
                      }
                    }}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {project.description && (
                  <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                    {project.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>{project.chatMessages?.length || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        
        {projects.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No projects yet</p>
            <p className="text-xs">Create your first project to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}
