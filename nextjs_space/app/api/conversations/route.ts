
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const conversations = await db.project.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        chatMessages: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        files: true,
        _count: {
          select: {
            chatMessages: true,
          },
        },
      },
    })

    // Format the data for frontend consumption
    const formattedConversations = conversations.map(conv => ({
      id: conv.id,
      name: conv.name,
      description: conv.description,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      messageCount: conv._count.chatMessages,
      lastMessage: conv.chatMessages[0] || null,
      files: conv.files,
    }))

    return NextResponse.json(formattedConversations)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description = 'New AI conversation' } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Conversation name is required' },
        { status: 400 }
      )
    }

    const conversation = await db.project.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        userId: session.user.id,
      },
      include: {
        chatMessages: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        files: true,
      },
    })

    return NextResponse.json(conversation, { status: 201 })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}
