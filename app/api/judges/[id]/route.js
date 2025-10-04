import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { username, password, assignedCompetition } = body

    const updateData = {
      username,
      assignedCompetition
    }

    if (password && password.trim() !== '') {
      updateData.password = password
    }

    const updatedJudge = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      judge: updatedJudge
    })
  } catch (error) {
    console.error('Error updating judge:', error)
    return NextResponse.json({ success: false, error: 'Failed to update judge' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { deleted: true }
    })

    return NextResponse.json({
      success: true,
      message: 'Judge deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting judge:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete judge' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
