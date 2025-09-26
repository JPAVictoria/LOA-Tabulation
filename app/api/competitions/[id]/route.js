import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const { name, level } = await request.json()

    if (!name || !level) {
      return NextResponse.json({ success: false, error: 'Name and level are required' }, { status: 400 })
    }

    const updatedCompetition = await prisma.competition.update({
      where: { id: parseInt(id) },
      data: { name, level }
    })

    return NextResponse.json({ success: true, competition: updatedCompetition })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update competition' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    await prisma.competition.update({
      where: { id: parseInt(id) },
      data: { deleted: true }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete competition' }, { status: 500 })
  }
}
