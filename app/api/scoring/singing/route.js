import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Fetch all SINGING candidates
    const candidates = await prisma.candidate.findMany({
      where: {
        competition: 'SINGING',
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
            deleted: false
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

    // Get all judges assigned to SINGING competition
    const assignedJudges = await prisma.user.findMany({
      where: {
        assignedCompetition: 'SINGING',
        role: 'JUDGE',
        deleted: false
      },
      select: {
        id: true,
        username: true
      }
    })

    // Get all criteria for SINGING
    const criteria = await prisma.criteria.findMany({
      where: {
        deleted: false,
        category: {
          competition: 'SINGING',
          deleted: false
        }
      }
    })

    const totalCriteria = criteria.length

    // Transform data to include scoring status and average score
    const candidatesWithStatus = candidates.map((candidate) => {
      // Group scores by judge
      const scoresByJudge = candidate.scores.reduce((acc, score) => {
        if (!acc[score.judgeId]) {
          acc[score.judgeId] = []
        }
        acc[score.judgeId].push(score)
        return acc
      }, {})

      // A judge has fully scored if they have scores for all criteria
      const judgesWhoFullyScored = Object.entries(scoresByJudge)
        .filter(([_, scores]) => scores.length === totalCriteria)
        .map(([judgeId, _]) => parseInt(judgeId))

      const totalJudges = assignedJudges.length
      const scoredCount = judgesWhoFullyScored.length

      let status = 'NOT_GRADED'
      if (scoredCount > 0 && scoredCount < totalJudges) {
        status = 'PENDING'
      } else if (scoredCount === totalJudges && totalJudges > 0) {
        status = 'GRADED'
      }

      // Calculate average score for SINGING (single category with weighted criteria)
      let averageScore = null
      if (candidate.scores.length > 0) {
        // Group scores by criteria
        const scoresByCriteria = {}
        candidate.scores.forEach((score) => {
          if (!scoresByCriteria[score.criteriaId]) {
            scoresByCriteria[score.criteriaId] = {
              scores: [],
              percentage: parseFloat(score.criteria.percentage)
            }
          }
          scoresByCriteria[score.criteriaId].scores.push(parseFloat(score.score))
        })

        // Calculate weighted sum
        let finalScore = 0
        Object.values(scoresByCriteria).forEach(({ scores, percentage }) => {
          const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length
          finalScore += (avgScore * percentage) / 100
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
        judgesWhoScored: judgesWhoFullyScored,
        totalJudges,
        scoredCount,
        status,
        averageScore
      }
    })

    return NextResponse.json({
      success: true,
      candidates: candidatesWithStatus,
      assignedJudges,
      totalJudges: assignedJudges.length,
      totalCriteria
    })
  } catch (error) {
    console.error('Error fetching singing candidates:', error)
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

    // Verify judge exists and is assigned to SINGING
    const judge = await prisma.user.findFirst({
      where: {
        id: judgeId,
        role: 'JUDGE',
        assignedCompetition: 'SINGING',
        deleted: false
      }
    })

    if (!judge) {
      return NextResponse.json({ success: false, error: 'Judge not found or not authorized' }, { status: 403 })
    }

    // Verify candidate exists and is in SINGING competition
    const candidate = await prisma.candidate.findFirst({
      where: {
        id: candidateId,
        competition: 'SINGING',
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

    // Validate all criteria exist and belong to SINGING
    const criteriaIds = scores.map((s) => s.criteriaId)
    const validCriteria = await prisma.criteria.findMany({
      where: {
        id: { in: criteriaIds },
        deleted: false,
        category: {
          competition: 'SINGING',
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
