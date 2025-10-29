
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { db } from "@/lib/db"
import { MainApp } from "@/components/main-app"

export default async function AppPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return null
  }
  
  // Get user's projects
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
        take: 1,
      },
    },
  })
  
  // Type-cast the projects to match our interface
  const typedProjects = projects.map(project => ({
    ...project,
    chatMessages: project.chatMessages?.map(msg => ({
      ...msg,
      role: msg.role as 'user' | 'assistant'
    }))
  }))
  
  return <MainApp initialProjects={typedProjects as any} />
}
