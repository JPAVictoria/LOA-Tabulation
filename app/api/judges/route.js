import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const judges = await prisma.user.findMany({
      where: {
        role: 'JUDGE',
        deleted: false
      }
    })

    return NextResponse.json({
      success: true,
      judges
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch judges'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request) {
  try {
    const { username, password, assignedCompetition } = await request.json()

    const judge = await prisma.user.create({
      data: {
        username,
        password,
        role: 'JUDGE',
        assignedCompetition
      }
    })

    return NextResponse.json({
      success: true,
      judge
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create judge'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
