
'use client'

import { ProjectFile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { 
  File, 
  FileText,
  Code,
  Braces,
  Globe,
  Image,
  FileCode,
  Hash
} from 'lucide-react'
import { motion } from 'framer-motion'

interface FileTreeProps {
  files: ProjectFile[]
  selectedFile: string | null
  onFileSelect: (filePath: string) => void
}

export function FileTree({ files, selectedFile, onFileSelect }: FileTreeProps) {
  if (files.length === 0) {
    return (
      <div className="text-center py-4 text-gray-400">
        <File className="h-6 w-6 mx-auto mb-2 opacity-50" />
        <p className="text-xs">No files yet</p>
        <p className="text-xs opacity-70">Add files to your project</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {files.map((file, index) => (
        <motion.div
          key={file.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFileSelect(file.path)}
            className={`w-full justify-start text-left h-8 px-2 ${
              selectedFile === file.path
                ? 'bg-purple-600/30 text-purple-300 border-purple-500/30'
                : 'text-gray-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              {getFileIcon(file.path)}
              <span className="truncate text-xs">
                {file.path}
              </span>
            </div>
          </Button>
        </motion.div>
      ))}
    </div>
  )
}

function getFileIcon(filePath: string) {
  const extension = filePath.split('.').pop()?.toLowerCase()
  
  const iconMap: Record<string, JSX.Element> = {
    js: <Code className="h-3 w-3 text-yellow-400" />,
    jsx: <Code className="h-3 w-3 text-blue-400" />,
    ts: <Code className="h-3 w-3 text-blue-500" />,
    tsx: <Code className="h-3 w-3 text-blue-500" />,
    html: <Globe className="h-3 w-3 text-orange-400" />,
    css: <Hash className="h-3 w-3 text-green-400" />,
    json: <Braces className="h-3 w-3 text-yellow-300" />,
    md: <FileText className="h-3 w-3 text-gray-300" />,
    py: <FileCode className="h-3 w-3 text-green-500" />,
    png: <Image className="h-3 w-3 text-purple-400" />,
    jpg: <Image className="h-3 w-3 text-purple-400" />,
    jpeg: <Image className="h-3 w-3 text-purple-400" />,
    svg: <Image className="h-3 w-3 text-purple-400" />,
  }
  
  return iconMap[extension || ''] || <File className="h-3 w-3 text-gray-400" />
}
