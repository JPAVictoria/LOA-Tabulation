// app/api/scoring/export/route.js
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import ExcelJS from 'exceljs'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const { competition, filters } = await request.json()

    // Fetch data with filters
    const whereClause = {
      competition: competition.toUpperCase(),
      deleted: false
    }

    if (filters?.gender) {
      whereClause.gender = filters.gender
    }

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

    const categories = await prisma.category.findMany({
      where: {
        competition: competition.toUpperCase(),
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

    const criteriaByCategory = {}
    categories.forEach((category) => {
      criteriaByCategory[category.id] = category.criteria
    })

    const candidateJudgeMap = {}

    candidates.forEach((candidate) => {
      candidate.scores?.forEach((score) => {
        const key = `${candidate.id}-${score.judgeId}`

        if (!candidateJudgeMap[key]) {
          candidateJudgeMap[key] = {
            candidateNumber: candidate.candidateNumber,
            candidateName: candidate.name,
            course: candidate.course,
            gender: candidate.gender,
            level: candidate.level,
            judgeName: score.judge.username,
            criteriaScores: {},
            categoryScores: {}
          }
        }

        candidateJudgeMap[key].criteriaScores[score.criteriaId] = {
          score: parseFloat(score.score),
          percentage: parseFloat(score.criteria.percentage),
          categoryId: score.criteria.categoryId,
          categoryName: score.criteria.category.name,
          criteriaName: score.criteria.name
        }
      })
    })

    Object.values(candidateJudgeMap).forEach((item) => {
      categories.forEach((category) => {
        const criteriaInCategory = criteriaByCategory[category.id]
        let categoryScore = 0
        let hasScores = false

        criteriaInCategory.forEach((criteria) => {
          const criteriaScore = item.criteriaScores[criteria.id]
          if (criteriaScore) {
            categoryScore += (criteriaScore.score * criteriaScore.percentage) / 100
            hasScores = true
          }
        })

        item.categoryScores[category.name] = hasScores ? categoryScore : null
      })
    })

    // Create workbook with ExcelJS
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Scoring Sheet')

    // Define column structure
    const columns = [
      { key: 'no', width: 8 },
      { key: 'name', width: 25 },
      { key: 'course', width: 20 },
      { key: 'gender', width: 10 },
      { key: 'level', width: 15 },
      { key: 'judge', width: 15 },
      { key: 'sep1', width: 3 }
    ]

    let colIndex = 7

    // Add criteria columns
    categories.forEach((category) => {
      category.criteria.forEach((criteria) => {
        columns.push({
          key: `criteria_${criteria.id}`,
          width: 12
        })
      })
      columns.push({ key: `sep_cat_${category.id}`, width: 3 })
    })

    // Add category total columns
    categories.forEach((category) => {
      columns.push({
        key: `total_${category.id}`,
        width: 15
      })
    })

    worksheet.columns = columns

    // Add first header row (section headers)
    const headerRow1 = worksheet.addRow([
      'CANDIDATE INFORMATION',
      '',
      '',
      '',
      '',
      '',
      '',
      ...categories.flatMap((cat) => [cat.name.toUpperCase(), ...Array(cat.criteria.length - 1).fill(''), '']),
      'CATEGORY TOTALS',
      ...Array(categories.length - 1).fill('')
    ])

    // Style first header row
    headerRow1.font = { bold: true, size: 11 }
    headerRow1.alignment = { vertical: 'middle', horizontal: 'center' }
    headerRow1.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    }
    headerRow1.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } }

    // Merge cells for section headers
    let currentCol = 1
    worksheet.mergeCells(1, 1, 1, 6) // CANDIDATE INFORMATION
    currentCol = 8

    categories.forEach((category) => {
      const criteriaCount = category.criteria.length
      if (criteriaCount > 1) {
        worksheet.mergeCells(1, currentCol, 1, currentCol + criteriaCount - 1)
      }
      currentCol += criteriaCount + 1
    })

    worksheet.mergeCells(1, currentCol, 1, currentCol + categories.length - 1) // CATEGORY TOTALS

    // Add second header row (column names)
    const headerRow2Data = [
      'No.',
      'Name',
      'Course',
      'Gender',
      'Level',
      'Judge',
      '',
      ...categories.flatMap((cat) => [...cat.criteria.map((c) => c.name), '']),
      ...categories.map((cat) => cat.name)
    ]

    const headerRow2 = worksheet.addRow(headerRow2Data)
    headerRow2.font = { bold: true, size: 10 }
    headerRow2.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
    headerRow2.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9E1F2' }
    }

    // Add data rows
    Object.values(candidateJudgeMap).forEach((item) => {
      if (filters?.judgeName && item.judgeName !== filters.judgeName) {
        return
      }

      const rowData = [
        item.candidateNumber,
        item.candidateName,
        item.course,
        item.gender,
        item.level,
        item.judgeName,
        '', // Empty separator
        ...categories.flatMap((category) => [
          ...category.criteria.map((criteria) => {
            const criteriaScore = item.criteriaScores[criteria.id]
            return criteriaScore ? parseFloat(criteriaScore.score.toFixed(2)) : null
          }),
          '' // Empty separator
        ]),
        ...categories.map((category) => {
          const categoryScore = item.categoryScores[category.name]
          return categoryScore ? parseFloat(categoryScore.toFixed(2)) : null
        })
      ]

      const dataRow = worksheet.addRow(rowData)

      // Style data row
      dataRow.alignment = { vertical: 'middle', horizontal: 'center' }

      // Bold judge name (column 6)
      dataRow.getCell(6).font = { bold: true }

      // Number format for score cells
      dataRow.eachCell((cell, colNumber) => {
        if (colNumber > 7 && typeof cell.value === 'number') {
          cell.numFmt = '0.00'
        }
      })

      // Alternate row colors
      if (worksheet.rowCount % 2 === 0) {
        dataRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2F2F2' }
        }
      }
    })

    // Add borders to all cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
        }
      })
    })

    // Freeze panes
    worksheet.views = [{ state: 'frozen', xSplit: 7, ySplit: 2 }]

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${competition}_Detailed_Scores.xlsx"`
      }
    })
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    return NextResponse.json({ success: false, error: 'Failed to export data' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
