import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const { name, percentage, categoryId } = await request.json()

    if (!name || !percentage || !categoryId) {
      return NextResponse.json(
        { success: false, error: 'Name, percentage, and category are required' },
        { status: 400 }
      )
    }

    if (percentage < 1 || percentage > 100) {
      return NextResponse.json({ success: false, error: 'Percentage must be between 1 and 100' }, { status: 400 })
    }

    const existing = await prisma.criteria.findFirst({
      where: { name, categoryId, deleted: false }
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Criteria with this name already exists in this category' },
        { status: 400 }
      )
    }

    const criteria = await prisma.criteria.create({
      data: { name, percentage: parseInt(percentage), categoryId: parseInt(categoryId) },
      include: { category: { include: { competition: true } } }
    })

    return NextResponse.json({ success: true, criteria }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create criteria' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const criteria = await prisma.criteria.findMany({
      where: { deleted: false },
      include: { category: { include: { competition: true } } },
      orderBy: { id: 'desc' }
    })

    return NextResponse.json({ success: true, criteria })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch criteria' }, { status: 500 })
  }
}
