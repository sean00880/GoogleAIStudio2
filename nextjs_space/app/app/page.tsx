
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { db } from "@/lib/db"
import { EnhancedMainApp } from "@/components/enhanced-main-app"

export default async function AppPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return null
  }
  
  // Get user's projects with enhanced data
  const projects = await db.project.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      files: true,
      chatMessages: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })
  
  // Type-cast and format the projects to match our interface
  const typedProjects = projects.map(project => ({
    ...project,
    chatMessages: project.chatMessages?.map(msg => ({
      ...msg,
      role: msg.role as 'user' | 'assistant'
    }))
  }))
  
  return <EnhancedMainApp initialProjects={typedProjects as any} />
}
