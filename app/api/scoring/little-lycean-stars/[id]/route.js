import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const candidateId = parseInt(id)
    const { searchParams } = new URL(request.url)
    const judgeId = parseInt(searchParams.get('judgeId'))

    if (!judgeId) {
      return NextResponse.json({ success: false, error: 'Judge ID is required' }, { status: 400 })
    }

    // Verify judge exists and is assigned to LITTLE_LYCEAN_STARS
    const judge = await prisma.user.findFirst({
      where: {
        id: judgeId,
        role: 'JUDGE',
        assignedCompetition: 'LITTLE_LYCEAN_STARS',
        deleted: false
      }
    })

    if (!judge) {
      return NextResponse.json({ success: false, error: 'Judge not found or not authorized' }, { status: 403 })
    }

    // Fetch candidate details
    const candidate = await prisma.candidate.findFirst({
      where: {
        id: candidateId,
        competition: 'LITTLE_LYCEAN_STARS',
        deleted: false
      }
    })

    if (!candidate) {
      return NextResponse.json({ success: false, error: 'Candidate not found' }, { status: 404 })
    }

    // Fetch all categories and criteria for LITTLE_LYCEAN_STARS
    const categories = await prisma.category.findMany({
      where: {
        competition: 'LITTLE_LYCEAN_STARS',
        deleted: false
      },
      include: {
        criteria: {
          where: {
            deleted: false
          },
          orderBy: {
            id: 'asc'
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    })

    // Fetch existing scores for this judge and candidate
    const existingScores = await prisma.score.findMany({
      where: {
        judgeId,
        candidateId,
        deleted: false
      },
      select: {
        id: true,
        criteriaId: true,
        score: true
      }
    })

    return NextResponse.json({
      success: true,
      candidate,
      categories,
      existingScores
    })
  } catch (error) {
    console.error('Error fetching candidate data:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch candidate data' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const candidateId = parseInt(id)
    const { judgeId, scores } = await request.json()

    // Validate required fields
    if (!judgeId || !scores || !Array.isArray(scores)) {
      return NextResponse.json({ success: false, error: 'Invalid request data' }, { status: 400 })
    }

    // Verify judge exists and is assigned to LITTLE_LYCEAN_STARS
    const judge = await prisma.user.findFirst({
      where: {
        id: judgeId,
        role: 'JUDGE',
        assignedCompetition: 'LITTLE_LYCEAN_STARS',
        deleted: false
      }
    })

    if (!judge) {
      return NextResponse.json({ success: false, error: 'Judge not found or not authorized' }, { status: 403 })
    }

    // Verify candidate exists and is in LITTLE_LYCEAN_STARS competition
    const candidate = await prisma.candidate.findFirst({
      where: {
        id: candidateId,
        competition: 'LITTLE_LYCEAN_STARS',
        deleted: false
      }
    })

    if (!candidate) {
      return NextResponse.json({ success: false, error: 'Candidate not found' }, { status: 404 })
    }

    // Validate all criteria exist and belong to LITTLE_LYCEAN_STARS
    const criteriaIds = scores.map((s) => s.criteriaId)
    const validCriteria = await prisma.criteria.findMany({
      where: {
        id: { in: criteriaIds },
        deleted: false,
        category: {
          competition: 'LITTLE_LYCEAN_STARS',
          deleted: false
        }
      }
    })

    if (validCriteria.length !== criteriaIds.length) {
      return NextResponse.json({ success: false, error: 'Invalid criteria provided' }, { status: 400 })
    }

    // Validate score values
    for (const score of scores) {
      if (score.score < 65 || score.score > 100) {
        return NextResponse.json({ success: false, error: 'Scores must be between 65 and 100' }, { status: 400 })
      }
    }

    // Get existing scores for this judge and candidate
    const existingScores = await prisma.score.findMany({
      where: {
        judgeId,
        candidateId,
        deleted: false
      }
    })

    // Create a map of existing scores by criteriaId
    const existingScoresMap = {}
    existingScores.forEach((score) => {
      existingScoresMap[score.criteriaId] = score.id
    })

    // Get the criteriaIds from the incoming scores
    const incomingCriteriaIds = scores.map((s) => s.criteriaId)

    // Find scores to delete (existing scores not in incoming scores)
    const scoresToDelete = existingScores.filter((score) => !incomingCriteriaIds.includes(score.criteriaId))

    // Prepare operations
    const operations = []

    // Delete scores that were removed (erased fields)
    for (const score of scoresToDelete) {
      operations.push(
        prisma.score.update({
          where: { id: score.id },
          data: { deleted: true }
        })
      )
    }

    // Update or create scores
    for (const score of scores) {
      const existingScoreId = existingScoresMap[score.criteriaId]

      if (existingScoreId) {
        // Update existing score
        operations.push(
          prisma.score.update({
            where: { id: existingScoreId },
            data: { score: score.score }
          })
        )
      } else {
        // Create new score
        operations.push(
          prisma.score.create({
            data: {
              judgeId,
              candidateId,
              criteriaId: score.criteriaId,
              score: score.score
            }
          })
        )
      }
    }

    // Execute all operations in a transaction
    const result = await prisma.$transaction(operations)

    return NextResponse.json({
      success: true,
      message: 'Scores updated successfully',
      scores: result
    })
  } catch (error) {
    console.error('Error updating scores:', error)
    return NextResponse.json({ success: false, error: 'Failed to update scores' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
