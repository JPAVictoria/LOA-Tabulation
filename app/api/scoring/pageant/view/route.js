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

    // Transform data to include average score calculation
    const candidatesWithAverages = candidates.map((candidate) => {
      let averageScore = null

      if (candidate.scores.length > 0) {
        // Group scores by category
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

          Object.values(criteriasInCategory).forEach(({ scores, percentage }) => {
            const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length
            categoryScore += (avgScore * percentage) / 100
          })

          categoryScores.push(categoryScore)
        })

        // Average all category scores
        averageScore = categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length
      }

      return {
        ...candidate,
        averageScore
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
