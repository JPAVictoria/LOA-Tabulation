'use client'
import React, { useState, useEffect } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Chip } from '@mui/material'
import axios from 'axios'

export default function ViewScoresTable() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [columns, setColumns] = useState([
    {
      field: 'candidateNumber',
      headerName: 'Candidate No.',
      width: 130,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'candidateName',
      headerName: 'Candidate Name',
      flex: 1,
      minWidth: 180
    },
    {
      field: 'course',
      headerName: 'Course',
      width: 150
    },
    {
      field: 'judgeName',
      headerName: 'Judge Name',
      width: 150,
      headerAlign: 'center',
      align: 'center'
    }
  ])

  useEffect(() => {
    fetchScoresData()
  }, [])

  const fetchScoresData = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/scoring/pageant/view')

      if (data.success) {
        const transformedRows = []
        const categoriesMap = new Map()

        // First, collect all unique categories
        data.categories.forEach((category) => {
          categoriesMap.set(category.id, category.name)
        })

        // Group data by candidate and judge
        const candidateJudgeMap = {}

        data.candidates.forEach((candidate) => {
          candidate.scores?.forEach((score) => {
            const key = `${candidate.id}-${score.judgeId}`

            if (!candidateJudgeMap[key]) {
              candidateJudgeMap[key] = {
                id: key,
                candidateNumber: candidate.candidateNumber,
                candidateName: candidate.name,
                course: candidate.course,
                judgeName: score.judge.username,
                categoryScores: {},
                averageScore: candidate.averageScore
              }
            }

            const categoryId = score.criteria.categoryId
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

        // Calculate category scores and build rows
        Object.values(candidateJudgeMap).forEach((item) => {
          const row = {
            id: item.id,
            candidateNumber: item.candidateNumber,
            candidateName: item.candidateName,
            course: item.course,
            judgeName: item.judgeName,
            averageScore: item.averageScore?.toFixed(2) || '-'
          }

          // Calculate score for each category
          Object.entries(item.categoryScores).forEach(([categoryName, scores]) => {
            let categoryScore = 0
            scores.forEach(({ score, percentage }) => {
              categoryScore += (score * percentage) / 100
            })
            row[`category_${categoryName}`] = categoryScore.toFixed(2)
          })

          transformedRows.push(row)
        })

        setRows(transformedRows)

        // Build dynamic columns
        const dynamicColumns = [
          {
            field: 'candidateNumber',
            headerName: 'Candidate No.',
            width: 130,
            headerAlign: 'center',
            align: 'center',
            renderCell: ({ value }) => <span className='font-semibold text-gray-900 dark:text-gray-100'>#{value}</span>
          },
          {
            field: 'candidateName',
            headerName: 'Candidate Name',
            flex: 1,
            minWidth: 180
          },
          {
            field: 'course',
            headerName: 'Course',
            width: 150
          },
          {
            field: 'judgeName',
            headerName: 'Judge Name',
            width: 150,
            headerAlign: 'center',
            align: 'center'
          }
        ]

        // Add category columns
        const sortedCategories = Array.from(categoriesMap.values()).sort()
        sortedCategories.forEach((categoryName) => {
          dynamicColumns.push({
            field: `category_${categoryName}`,
            headerName: categoryName,
            width: 150,
            headerAlign: 'center',
            align: 'center',
            renderCell: ({ value }) => (
              <span className='font-semibold text-blue-600 dark:text-blue-400'>{value || '-'}</span>
            )
          })
        })

        // Add total score column
        dynamicColumns.push({
          field: 'averageScore',
          headerName: 'Total Score',
          width: 130,
          headerAlign: 'center',
          align: 'center',
          renderCell: ({ value }) => <span className='font-bold text-green-600 dark:text-green-400'>{value}</span>
        })

        setColumns(dynamicColumns)
      }
    } catch (error) {
      console.error('Error fetching scores:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='mt-6 flex flex-col items-center justify-center p-4'>
      <div className='w-full max-w-full px-4'>
        <div className='h-[500px] w-full'>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
              sorting: {
                sortModel: [{ field: 'candidateNumber', sort: 'asc' }]
              }
            }}
            disableRowSelectionOnClick
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                fontWeight: 'bold'
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
