import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(request, { params }) {
  try {
    const { id } = await params 
    const { name, competitionId } = await request.json()

    if (!name || !competitionId) {
      return NextResponse.json({ success: false, error: 'Name and competition are required' }, { status: 400 })
    }

    const duplicate = await prisma.category.findFirst({
      where: {
        name,
        competitionId: parseInt(competitionId),
        deleted: false,
        id: { not: parseInt(id) }
      }
    })

    if (duplicate) {
      return NextResponse.json(
        { success: false, error: 'Category with this name already exists in this competition' },
        { status: 400 }
      )
    }

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name, competitionId: parseInt(competitionId) },
      include: { competition: true }
    })

    return NextResponse.json({ success: true, category })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params 

    await prisma.category.update({
      where: { id: parseInt(id) },
      data: { deleted: true }
    })

    return NextResponse.json({ success: true, message: 'Category deleted successfully' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete category' }, { status: 500 })
  }
}
