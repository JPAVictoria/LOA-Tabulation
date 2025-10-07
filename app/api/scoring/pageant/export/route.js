// app/api/scoring/pageant/export/route.js
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const { competition, filters } = await request.json()

    // Fetch data with filters
    const whereClause = {
      competition: competition.toUpperCase(),
      deleted: false
    }

    // Apply gender filter
    if (filters?.gender) {
      whereClause.gender = filters.gender
    }

    // Apply candidate number filter
    if (filters?.candidateNumber) {
      whereClause.candidateNumber = {
        equals: parseInt(filters.candidateNumber)
      }
    }

    const candidates = await prisma.candidate.findMany({
      where: whereClause,
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

    // Get all categories
    const categories = await prisma.category.findMany({
      where: {
        competition: competition.toUpperCase(),
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

    // Transform data similar to view route
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

    // Build Excel data
    const categoriesMap = new Map()
    categories.forEach((category) => {
      categoriesMap.set(category.id, category.name)
    })

    const candidateJudgeMap = {}

    candidatesWithAverages.forEach((candidate) => {
      candidate.scores?.forEach((score) => {
        const key = `${candidate.id}-${score.judgeId}`

        if (!candidateJudgeMap[key]) {
          candidateJudgeMap[key] = {
            candidateNumber: candidate.candidateNumber,
            candidateName: candidate.name,
            course: candidate.course,
            gender: candidate.gender,
            judgeName: score.judge.username,
            categoryScores: {},
            averageScore: score.averageScore
          }
        }

        const categoryName = score.criteria.category.name

        if (!candidateJudgeMap[key].categoryScores[categoryName]) {
          candidateJudgeMap[key].categoryScores[categoryName] = []
        }

        candidateJudgeMap[key].categoryScores[categoryName].push({
          score: parseFloat(score.score),
          percentage: parseFloat(score.criteria.percentage)
        })
      })
    })

    const exportData = []
    Object.values(candidateJudgeMap).forEach((item) => {
      // Apply judge name filter
      if (filters?.judgeName && item.judgeName !== filters.judgeName) {
        return
      }

      const row = {
        'Candidate No.': item.candidateNumber,
        'Candidate Name': item.candidateName,
        Course: item.course,
        Gender: item.gender,
        'Judge Name': item.judgeName
      }

      // Add category scores
      const sortedCategories = Array.from(categoriesMap.values()).sort()
      sortedCategories.forEach((categoryName) => {
        const scores = item.categoryScores[categoryName]
        if (scores) {
          let categoryScore = 0
          scores.forEach(({ score, percentage }) => {
            categoryScore += (score * percentage) / 100
          })
          row[categoryName] = parseFloat(categoryScore.toFixed(2))
        } else {
          row[categoryName] = null
        }
      })

      row['Total Score'] = item.averageScore ? parseFloat(item.averageScore.toFixed(2)) : null
      exportData.push(row)
    })

    // Create Excel file with proper number formatting
    const worksheet = XLSX.utils.json_to_sheet(exportData)

    // Set column types to ensure numbers are recognized
    const range = XLSX.utils.decode_range(worksheet['!ref'])
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + '1'
      if (!worksheet[address]) continue

      for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
        if (!worksheet[cellAddress]) continue

        const cell = worksheet[cellAddress]
        if (typeof cell.v === 'number') {
          cell.t = 'n'
        }
      }
    }

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Scores')

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' })

    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${competition}_scores.xlsx"`
      }
    })
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    return NextResponse.json({ success: false, error: 'Failed to export data' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
