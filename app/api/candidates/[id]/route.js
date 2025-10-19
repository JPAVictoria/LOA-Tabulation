import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { supabaseServer } from '@/app/lib/supabaseClient'

const prisma = new PrismaClient()

const deleteImageFromStorage = async (imageUrl) => {
  if (!imageUrl) return
  try {
    const fileName = imageUrl.split('/').pop()
    const filePath = `candidates/${fileName}`
    await supabaseServer.storage.from('candidate').remove([filePath])
  } catch (error) {
    console.error('Failed to delete image:', error)
  }
}

const uploadImage = async (image) => {
  const fileExt = image.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `candidates/${fileName}`
  const buffer = Buffer.from(await image.arrayBuffer())

  const { error: uploadError } = await supabaseServer.storage
    .from('candidate')
    .upload(filePath, buffer, { contentType: image.type })

  if (uploadError) throw new Error('Failed to upload image')

  const { data: publicData } = supabaseServer.storage.from('candidate').getPublicUrl(filePath)
  return publicData.publicUrl
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const candidateId = parseInt(id)

    if (!candidateId) {
      return NextResponse.json({ success: false, error: 'Invalid candidate ID' }, { status: 400 })
    }

    const existingCandidate = await prisma.candidate.findUnique({
      where: { id: candidateId, deleted: false }
    })

    if (!existingCandidate) {
      return NextResponse.json({ success: false, error: 'Candidate not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const name = formData.get('name')
    const course = formData.get('course')
    const candidateNumber = parseInt(formData.get('candidateNumber'))
    const gender = formData.get('gender')
    const competition = formData.get('competition')
    const level = formData.get('level')
    const image = formData.get('image')
    const removeImage = formData.get('removeImage')

    if (!name || !course || !candidateNumber || !gender || !competition || !level) {
      return NextResponse.json({ success: false, error: 'All fields except image are required' }, { status: 400 })
    }

    const existing = await prisma.candidate.findFirst({
      where: {
        candidateNumber,
        competition,
        level,
        deleted: false,
        id: { not: candidateId }
      }
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Candidate number already exists in this competition' },
        { status: 400 }
      )
    }

    let imageUrl = existingCandidate.imageUrl

    if (removeImage === 'true') {
      await deleteImageFromStorage(existingCandidate.imageUrl)
      imageUrl = null
    } else if (image && image.size > 0) {
      await deleteImageFromStorage(existingCandidate.imageUrl)
      imageUrl = await uploadImage(image)
    }

    const updatedCandidate = await prisma.candidate.update({
      where: { id: candidateId },
      data: { name, course, candidateNumber, gender, competition, level, imageUrl }
    })

    return NextResponse.json({ success: true, candidate: updatedCandidate })
  } catch (error) {
    console.error('Error updating candidate:', error)
    return NextResponse.json({ success: false, error: 'Failed to update candidate' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const candidateId = parseInt(id)

    if (!candidateId) {
      return NextResponse.json({ success: false, error: 'Invalid candidate ID' }, { status: 400 })
    }

    const existingCandidate = await prisma.candidate.findUnique({
      where: { id: candidateId, deleted: false }
    })

    if (!existingCandidate) {
      return NextResponse.json({ success: false, error: 'Candidate not found' }, { status: 404 })
    }

    await prisma.candidate.update({
      where: { id: candidateId },
      data: { deleted: true }
    })

    await deleteImageFromStorage(existingCandidate.imageUrl)

    return NextResponse.json({ success: true, message: 'Candidate deleted successfully' })
  } catch (error) {
    console.error('Error deleting candidate:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete candidate' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
