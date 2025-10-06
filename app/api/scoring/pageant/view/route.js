// app/api/scoring/pageant/view/route.js
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Fetch all PAGEANTRY candidates with their scores
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

    // Get all categories for PAGEANTRY
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

    // Transform data - calculate score PER JUDGE (NO averaging across judges)
    const candidatesWithAverages = candidates.map((candidate) => {
      if (candidate.scores.length === 0) {
        return {
          ...candidate,
          averageScore: null
        }
      }

      // Group scores by JUDGE first, then by category, then by criteria
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

      // Calculate score for each judge separately
      Object.keys(scoresByJudge).forEach((judgeId) => {
        const judgeCategories = scoresByJudge[judgeId]

        // Calculate weighted score for each category
        const categoryScores = []
        Object.values(judgeCategories).forEach((criteriasInCategory) => {
          let categoryScore = 0

          // For each criteria: score × (percentage / 100)
          Object.values(criteriasInCategory).forEach(({ score, percentage }) => {
            categoryScore += (score * percentage) / 100
          })

          categoryScores.push(categoryScore)
        })

        // Average all category scores: Σ(categoryScores) / number of categories
        scoresByJudge[judgeId].averageScore =
          categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length
      })

      // Attach the judge-specific average to each score
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
      totalCriteria
    })
  } catch (error) {
    console.error('Error fetching pageant scores view:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch scores' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
