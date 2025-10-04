import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const { name, percentage, categoryId } = await request.json()

    if (!name || !percentage || !categoryId) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 })
    }

    if (percentage < 1 || percentage > 100) {
      return NextResponse.json({ success: false, error: 'Percentage must be between 1 and 100' }, { status: 400 })
    }

    const criteria = await prisma.criteria.update({
      where: { id: parseInt(id) },
      data: {
        name,
        percentage: parseInt(percentage),
        categoryId: parseInt(categoryId)
      },
      include: { category: true } // Removed competition include
    })

    return NextResponse.json({ success: true, criteria })
  } catch (error) {
    console.error('Update criteria error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update criteria' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    await prisma.criteria.update({
      where: { id: parseInt(id) },
      data: { deleted: true }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete criteria error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete criteria' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
