import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const { username, password } = await request.json()

    const user = await prisma.user.findFirst({
      where: {
        username,
        password,
        deleted: false
      }
    })

    if (user) {
      return NextResponse.json({
        success: true,
        user: { id: user.id, username: user.username, role: user.role }
      })
    } else {
      return NextResponse.json({ success: false }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
