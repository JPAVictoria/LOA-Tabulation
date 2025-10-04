import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Fetch all PAGEANTRY candidates
    const candidates = await prisma.candidate.findMany({
      where: {
        competition: 'PAGEANTRY',
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
            }
          }
        }
      },
      orderBy: {
        candidateNumber: 'asc'
      }
    })

    // Get all judges assigned to PAGEANTRY competition
    const assignedJudges = await prisma.user.findMany({
      where: {
        assignedCompetition: 'PAGEANTRY',
        role: 'JUDGE',
        deleted: false
      },
      select: {
        id: true,
        username: true
      }
    })

    // Get all criteria for PAGEANTRY to count total scores needed per judge
    const categories = await prisma.category.findMany({
      where: {
        competition: 'PAGEANTRY',
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

    // Transform data to include scoring status
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
        status
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
    console.error('Error fetching pageant candidates:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch candidates' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
