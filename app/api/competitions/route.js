import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const { name, level } = await request.json()

    if (!name || !level) {
      return NextResponse.json({ success: false, error: 'Name and level are required' }, { status: 400 })
    }

    const existing = await prisma.competition.findFirst({
      where: { name, deleted: false }
    })

    if (existing) {
      return NextResponse.json({ success: false, error: 'Competition with this name already exists' }, { status: 400 })
    }

    const competition = await prisma.competition.create({
      data: { name, level }
    })

    return NextResponse.json({ success: true, competition }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create competition' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const competitions = await prisma.competition.findMany({
      where: { deleted: false },
      orderBy: { id: 'desc' }
    })

    return NextResponse.json({ success: true, competitions })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch competitions' }, { status: 500 })
  }
}

