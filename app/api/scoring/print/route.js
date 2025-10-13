import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const competition = searchParams.get('competition')

    if (!competition) {
      return NextResponse.json({ success: false, error: 'Competition parameter is required' }, { status: 400 })
    }

    // Map competition IDs to database enum values
    const competitionMap = {
      hiphop: 'HIPHOP',
      flag_twirling: 'FLAG_TWIRLING',
      singing: 'SINGING',
      bench_cheering: 'BENCH_CHEERING'
    }

    const competitionType = competitionMap[competition]

    if (!competitionType) {
      return NextResponse.json({ success: false, error: 'Invalid competition type' }, { status: 400 })
    }

    // Fetch all candidates for the competition
    const candidates = await prisma.candidate.findMany({
      where: {
        competition: competitionType,
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

    // Get all judges assigned to this competition
    const assignedJudges = await prisma.user.findMany({
      where: {
        assignedCompetition: competitionType,
        role: 'JUDGE',
        deleted: false
      },
      select: {
        id: true,
        username: true
      }
    })

    // Get all criteria for this competition
    const criteria = await prisma.criteria.findMany({
      where: {
        deleted: false,
        category: {
          competition: competitionType,
          deleted: false
        }
      }
    })

    const totalCriteria = criteria.length

    // Transform data to include average scores
    const candidatesWithScores = candidates.map((candidate) => {
      // Calculate average score (weighted by criteria percentage)
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
        averageScore
      }
    })

    return NextResponse.json({
      success: true,
      candidates: candidatesWithScores,
      assignedJudges,
      competition: competitionType
    })
  } catch (error) {
    console.error('Error fetching print data:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch print data' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
