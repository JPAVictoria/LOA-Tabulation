// app/api/scoring/view/route.js
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const competition = searchParams.get('competition')?.toUpperCase() || 'PAGEANTRY'

    // Fetch candidates with their scores
    const candidates = await prisma.candidate.findMany({
      where: {
        competition,
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
                id: true,
                name: true,
                percentage: true,
                categoryId: true,
                category: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        candidateNumber: 'asc'
      }
    })

    // Get all categories for the competition
    const categories = await prisma.category.findMany({
      where: {
        competition,
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

    // Calculate scores per judge
    const candidatesWithAverages = candidates.map((candidate) => {
      if (candidate.scores.length === 0) {
        return {
          ...candidate,
          averageScore: null
        }
      }

      const scoresByJudge = {}
      candidate.scores.forEach((score) => {
        const judgeId = score.judgeId
        const categoryId = score.criteria.categoryId

        if (!scoresByJudge[judgeId]) {
          scoresByJudge[judgeId] = {}
        }

        if (!scoresByJudge[judgeId][categoryId]) {
          scoresByJudge[judgeId][categoryId] = {}
        }

        scoresByJudge[judgeId][categoryId][score.criteriaId] = {
          score: parseFloat(score.score),
          percentage: parseFloat(score.criteria.percentage)
        }
      })

      Object.keys(scoresByJudge).forEach((judgeId) => {
        const judgeCategories = scoresByJudge[judgeId]
        const categoryScores = []

        Object.values(judgeCategories).forEach((criteriasInCategory) => {
          let categoryScore = 0
          Object.values(criteriasInCategory).forEach(({ score, percentage }) => {
            categoryScore += (score * percentage) / 100
          })
          categoryScores.push(categoryScore)
        })

        scoresByJudge[judgeId].averageScore =
          categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length
      })

      const scoresWithAverage = candidate.scores.map((score) => ({
        ...score,
        averageScore: scoresByJudge[score.judgeId].averageScore
      }))

      return {
        ...candidate,
        scores: scoresWithAverage
      }
    })

    return NextResponse.json({
      success: true,
      candidates: candidatesWithAverages,
      categories,
      competition
    })
  } catch (error) {
    console.error('Error fetching scores view:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch scores' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
