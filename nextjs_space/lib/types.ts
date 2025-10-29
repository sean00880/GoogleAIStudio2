import { Session } from "next-auth"

export interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

export interface Project {
  id: string
  userId: string
  name: string
  description?: string | null
  githubRepoUrl?: string | null
  createdAt: Date
  updatedAt: Date
  files?: ProjectFile[]
  chatMessages?: ChatMessage[]
}

export interface ProjectFile {
  id: string
  projectId: string
  path: string
  content?: string | null
  language?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ChatMessage {
  id: string
  projectId: string
  role: 'user' | 'assistant'
  content: string
  model?: string | null
  createdAt: Date
}

export interface GitHubRepo {
  name: string
  fullName: string
  description?: string | null
  stars: number
  url: string
  defaultBranch: string
}

export interface GitHubFile {
  name: string
  path: string
  type: 'file' | 'dir'
  size?: number
  sha: string
  content?: string
  downloadUrl?: string | null
}

export interface AIModel {
  id: string
  name: string
  provider: string
  description: string
}

export interface ExtendedSession extends Session {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    description: 'Most capable GPT-4 model'
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    description: 'Faster and more cost-effective GPT-4'
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    description: 'Balanced performance and speed'
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: 'Most powerful Claude model'
  }
]

export const SUPPORTED_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', extension: '.js' },
  { id: 'typescript', name: 'TypeScript', extension: '.ts' },
  { id: 'html', name: 'HTML', extension: '.html' },
  { id: 'css', name: 'CSS', extension: '.css' },
  { id: 'python', name: 'Python', extension: '.py' },
  { id: 'json', name: 'JSON', extension: '.json' },
  { id: 'markdown', name: 'Markdown', extension: '.md' },
  { id: 'jsx', name: 'React JSX', extension: '.jsx' },
  { id: 'tsx', name: 'React TSX', extension: '.tsx' }
]