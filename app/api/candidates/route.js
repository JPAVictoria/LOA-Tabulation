import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { supabaseServer } from '@/app/lib/supabaseClient'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const formData = await request.formData()
    const name = formData.get('name')
    const course = formData.get('course')
    const candidateNumber = formData.get('candidateNumber')
    const gender = formData.get('gender')
    const competitionId = formData.get('competitionId')
    const image = formData.get('image')

    if (!name || !course || !candidateNumber || !gender || !competitionId) {
      return NextResponse.json({ success: false, error: 'All fields except image are required' }, { status: 400 })
    }

    const existing = await prisma.candidate.findFirst({
      where: { candidateNumber: parseInt(candidateNumber), competitionId: parseInt(competitionId), deleted: false }
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Candidate number already exists in this competition' },
        { status: 400 }
      )
    }

    let imageUrl = null

    if (image && image.size > 0) {
      const fileExt = image.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `candidates/${fileName}`

      // Convert File → Buffer
      const buffer = Buffer.from(await image.arrayBuffer())

      const { error: uploadError } = await supabaseServer.storage
        .from('candidate')
        .upload(filePath, buffer, { contentType: image.type })

      if (uploadError) {
        return NextResponse.json({ success: false, error: 'Failed to upload image' }, { status: 500 })
      }

      const { data: publicData } = supabaseServer.storage.from('candidate').getPublicUrl(filePath)
      imageUrl = publicData.publicUrl
    }

    const candidate = await prisma.candidate.create({
      data: {
        name,
        course,
        candidateNumber: parseInt(candidateNumber),
        gender,
        imageUrl,
        competitionId: parseInt(competitionId)
      },
      include: { competition: true }
    })

    return NextResponse.json({ success: true, candidate }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create candidate' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const candidates = await prisma.candidate.findMany({
      where: { deleted: false },
      include: { competition: true },
      orderBy: { id: 'desc' }
    })

    return NextResponse.json({ success: true, candidates })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch candidates' }, { status: 500 })
  }
}
