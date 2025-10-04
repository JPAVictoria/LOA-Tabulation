import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const { name, competition } = await request.json()

    if (!name || !competition) {
      return NextResponse.json({ success: false, error: 'Name and competition are required' }, { status: 400 })
    }

    const existing = await prisma.category.findFirst({
      where: { name, competition, deleted: false }
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Category with this name already exists in this competition' },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({
      data: { name, competition }
    })

    return NextResponse.json({ success: true, category }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create category' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { deleted: false },
      include: {
        criteria: {
          where: { deleted: false }
        }
      },
      orderBy: { id: 'desc' }
    })

    const categoriesWithCount = categories.map((cat) => ({
      ...cat,
      criteriaCount: cat.criteria.length,
      criteria: undefined
    }))

    return NextResponse.json({ success: true, categories: categoriesWithCount })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
