import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Fetch all LITTLE_LYCEAN_STARS candidates
    const candidates = await prisma.candidate.findMany({
      where: {
        competition: 'LITTLE_LYCEAN_STARS',
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
            judge: {
              select: {
                id: true,
                username: true
              }
            },
            criteria: {
              select: {
                percentage: true,
                categoryId: true
              }
            }
          }
        }
      },
      orderBy: {
        candidateNumber: 'asc'
      }
    })

    // Get all judges assigned to LITTLE_LYCEAN_STARS competition
    const assignedJudges = await prisma.user.findMany({
      where: {
        assignedCompetition: 'LITTLE_LYCEAN_STARS',
        role: 'JUDGE',
        deleted: false
      },
      select: {
        id: true,
        username: true
      }
    })

    // Get all criteria for LITTLE_LYCEAN_STARS to count total scores needed per judge
    const categories = await prisma.category.findMany({
      where: {
        competition: 'LITTLE_LYCEAN_STARS',
        deleted: false
      },
      include: {
        criteria: {
          where: {
            deleted: false
          }
        }
      }
    })

    const totalCriteria = categories.reduce((sum, cat) => sum + cat.criteria.length, 0)

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

      // Calculate average score with 30% weight per category (90% total, 10% reserved for manual scoring)
      let averageScore = null
      if (candidate.scores.length > 0) {
        // Group scores by category, then by criteria
        const scoresByCategory = {}
        candidate.scores.forEach((score) => {
          const categoryId = score.criteria.categoryId

          if (!scoresByCategory[categoryId]) {
            scoresByCategory[categoryId] = {}
          }

          if (!scoresByCategory[categoryId][score.criteriaId]) {
            scoresByCategory[categoryId][score.criteriaId] = {
              scores: [],
              percentage: parseFloat(score.criteria.percentage)
            }
          }

          scoresByCategory[categoryId][score.criteriaId].scores.push(parseFloat(score.score))
        })

        // Calculate weighted score for each category
        const categoryScores = []
        Object.values(scoresByCategory).forEach((criteriasInCategory) => {
          let categoryScore = 0

          // For each criteria in this category
          Object.values(criteriasInCategory).forEach(({ scores, percentage }) => {
            const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length
            categoryScore += (avgScore * percentage) / 100
          })

          categoryScores.push(categoryScore)
        })

        // Apply 30% weight to each category (90% total)
        const categoryWeight = 30 / 100
        averageScore = categoryScores.reduce((sum, score) => sum + score * categoryWeight, 0)
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
    console.error('Error fetching Little Lycean Stars candidates:', error)
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
