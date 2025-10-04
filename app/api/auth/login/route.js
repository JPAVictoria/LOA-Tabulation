import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const { username, password, requiredCompetition } = await request.json()

    const user = await prisma.user.findFirst({
      where: {
        username,
        password,
        deleted: false
      }
    })

    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid username or password' }, { status: 401 })
    }

    if (requiredCompetition && user.role === 'JUDGE') {
      if (!user.assignedCompetition) {
        return NextResponse.json(
          {
            success: false,
            message: 'You are not assigned to any competition. Please contact an administrator.'
          },
          { status: 403 }
        )
      }

      if (user.assignedCompetition !== requiredCompetition) {
        return NextResponse.json(
          {
            success: false,
            message: `You are not assigned to the ${requiredCompetition} competition. You are assigned to ${user.assignedCompetition}.`
          },
          { status: 403 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        assignedCompetition: user.assignedCompetition
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ success: false, message: 'An error occurred during login' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
