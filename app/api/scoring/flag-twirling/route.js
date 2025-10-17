import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request) {
  try {
    // Get judgeId from query parameters
    const { searchParams } = new URL(request.url)
    const judgeId = searchParams.get('judgeId')

    if (!judgeId) {
      return NextResponse.json({ success: false, error: 'Judge ID is required' }, { status: 400 })
    }

    // Fetch all FLAG_TWIRLING candidates
    const candidates = await prisma.candidate.findMany({
      where: {
        competition: 'FLAG_TWIRLING',
        deleted: false
      },
      select: {
        id: true,
        candidateNumber: true,
        name: true,
        gender: true,
        course: true,
        level: true,
        scores: {
          where: {
            deleted: false,
            judgeId: parseInt(judgeId) // Filter scores by logged-in judge
          },
          select: {
            id: true,
            judgeId: true,
            score: true,
            criteriaId: true,
            criteria: {
              select: {
                percentage: true
              }
            }
          }
        }
      },
      orderBy: {
        candidateNumber: 'asc'
      }
    })

    // Get all judges assigned to FLAG_TWIRLING competition
    const assignedJudges = await prisma.user.findMany({
      where: {
        assignedCompetition: 'FLAG_TWIRLING',
        role: 'JUDGE',
        deleted: false
      },
      select: {
        id: true,
        username: true
      }
    })

    // Get all criteria for FLAG_TWIRLING
    const criteria = await prisma.criteria.findMany({
      where: {
        deleted: false,
        category: {
          competition: 'FLAG_TWIRLING',
          deleted: false
        }
      }
    })

    const totalCriteria = criteria.length

    // Transform data to include scoring status and average score for the logged-in judge
    const candidatesWithStatus = candidates.map((candidate) => {
      // Check if the logged-in judge has scored all criteria
      const judgeHasScored = candidate.scores.length === totalCriteria

      let status = 'NOT_GRADED'
      if (judgeHasScored) {
        status = 'GRADED'
      } else if (candidate.scores.length > 0) {
        status = 'PENDING'
      }

      // Calculate average score for this judge only
      let averageScore = null
      if (candidate.scores.length > 0) {
        // Group scores by criteria
        const scoresByCriteria = {}
        candidate.scores.forEach((score) => {
          if (!scoresByCriteria[score.criteriaId]) {
            scoresByCriteria[score.criteriaId] = {
              score: parseFloat(score.score),
              percentage: parseFloat(score.criteria.percentage)
            }
          }
        })

        // Calculate weighted sum
        let finalScore = 0
        Object.values(scoresByCriteria).forEach(({ score, percentage }) => {
          finalScore += (score * percentage) / 100
        })

        averageScore = finalScore
      }

      return {
        id: candidate.id,
        candidateNumber: candidate.candidateNumber,
        name: candidate.name,
        gender: candidate.gender,
        course: candidate.course,
        level: candidate.level,
        scoredCount: judgeHasScored ? 1 : 0,
        totalJudges: 1, // Only showing for this judge
        status,
        averageScore
      }
    })

    return NextResponse.json({
      success: true,
      candidates: candidatesWithStatus,
      assignedJudges,
      totalJudges: 1, // Only this judge
      totalCriteria
    })
  } catch (error) {
    console.error('Error fetching flag twirling candidates:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch candidates' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request) {
  try {
    const { judgeId, candidateId, scores } = await request.json()

    // Validate required fields
    if (!judgeId || !candidateId || !scores || !Array.isArray(scores)) {
      return NextResponse.json({ success: false, error: 'Invalid request data' }, { status: 400 })
    }

    // Verify judge exists and is assigned to FLAG_TWIRLING
    const judge = await prisma.user.findFirst({
      where: {
        id: judgeId,
        role: 'JUDGE',
        assignedCompetition: 'FLAG_TWIRLING',
        deleted: false
      }
    })

    if (!judge) {
      return NextResponse.json({ success: false, error: 'Judge not found or not authorized' }, { status: 403 })
    }

    // Verify candidate exists and is in FLAG_TWIRLING competition
    const candidate = await prisma.candidate.findFirst({
      where: {
        id: candidateId,
        competition: 'FLAG_TWIRLING',
        deleted: false
      }
    })

    if (!candidate) {
      return NextResponse.json({ success: false, error: 'Candidate not found' }, { status: 404 })
    }

    // Check if judge has already scored this candidate
    const existingScores = await prisma.score.findFirst({
      where: {
        judgeId,
        candidateId,
        deleted: false
      }
    })

    if (existingScores) {
      return NextResponse.json(
        { success: false, error: 'Scores already exist for this candidate. Use update instead.' },
        { status: 409 }
      )
    }

    // Validate all criteria exist and belong to FLAG_TWIRLING
    const criteriaIds = scores.map((s) => s.criteriaId)
    const validCriteria = await prisma.criteria.findMany({
      where: {
        id: { in: criteriaIds },
        deleted: false,
        category: {
          competition: 'FLAG_TWIRLING',
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

    // Create all scores in a transaction
    const createdScores = await prisma.$transaction(
      scores.map((score) =>
        prisma.score.create({
          data: {
            judgeId,
            candidateId,
            criteriaId: score.criteriaId,
            score: score.score
          }
        })
      )
    )

    return NextResponse.json({
      success: true,
      message: 'Scores submitted successfully',
      scores: createdScores
    })
  } catch (error) {
    console.error('Error submitting scores:', error)
    return NextResponse.json({ success: false, error: 'Failed to submit scores' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
