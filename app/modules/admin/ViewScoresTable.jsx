'use client'
import React, { useState, useEffect } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import axios from 'axios'
import { Select, MenuItem, FormControl, InputLabel, TextField, Box, Button } from '@mui/material'
import { FilterX } from 'lucide-react'
import ExcelExportButton from './ExcelExportButton'

export default function ViewScoresTable({ competition = 'pageantry' }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [columns, setColumns] = useState([])
  const [judges, setJudges] = useState([])
  const [filters, setFilters] = useState({
    gender: '',
    candidateNumber: '',
    judgeName: ''
  })
  const [filteredRows, setFilteredRows] = useState([])

  useEffect(() => {
    fetchScoresData()
  }, [competition])

  useEffect(() => {
    applyFilters()
  }, [filters, rows])

  const applyFilters = () => {
    let filtered = [...rows]

    if (filters.gender) {
      filtered = filtered.filter((row) => row.gender === filters.gender)
    }

    if (filters.candidateNumber) {
      filtered = filtered.filter((row) => row.candidateNumber.toString().includes(filters.candidateNumber))
    }

    if (filters.judgeName) {
      filtered = filtered.filter((row) => row.judgeName === filters.judgeName)
    }

    setFilteredRows(filtered)
  }

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const resetFilters = () => {
    setFilters({
      gender: '',
      candidateNumber: '',
      judgeName: ''
    })
  }

  const fetchScoresData = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`/api/scoring/pageant/view?competition=${competition}`)

      if (data.success) {
        const transformedRows = []
        const categoriesMap = new Map()
        const judgesSet = new Set()

        data.categories.forEach((category) => {
          categoriesMap.set(category.id, category.name)
        })

        const candidateJudgeMap = {}

        data.candidates.forEach((candidate) => {
          candidate.scores?.forEach((score) => {
            const key = `${candidate.id}-${score.judgeId}`
            const judgeName = score.judge.username
            judgesSet.add(judgeName)

            if (!candidateJudgeMap[key]) {
              candidateJudgeMap[key] = {
                id: key,
                candidateNumber: candidate.candidateNumber,
                candidateName: candidate.name,
                course: candidate.course,
                gender: candidate.gender,
                judgeName: judgeName,
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

        setJudges(Array.from(judgesSet).sort())

        Object.values(candidateJudgeMap).forEach((item) => {
          const row = {
            id: item.id,
            candidateNumber: item.candidateNumber,
            candidateName: item.candidateName,
            course: item.course,
            gender: item.gender,
            judgeName: item.judgeName,
            averageScore: item.averageScore?.toFixed(2) || '-'
          }

          Object.entries(item.categoryScores).forEach(([categoryName, scores]) => {
            let categoryScore = 0
            scores.forEach(({ score, percentage }) => {
              categoryScore += (score * percentage) / 100
            })
            row[`category_${categoryName}`] = categoryScore
          })
          row.averageScore = item.averageScore || null
          transformedRows.push(row)
        })

        setRows(transformedRows)

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
            field: 'gender',
            headerName: 'Gender',
            width: 100,
            headerAlign: 'center',
            align: 'center'
          },
          {
            field: 'judgeName',
            headerName: 'Judge Name',
            width: 150,
            headerAlign: 'center',
            align: 'center'
          }
        ]

        const sortedCategories = Array.from(categoriesMap.values()).sort()
        sortedCategories.forEach((categoryName) => {
          dynamicColumns.push({
            field: `category_${categoryName}`,
            headerName: categoryName,
            width: 150,
            headerAlign: 'center',
            align: 'center',
            renderCell: ({ value }) => (
              <span className='font-semibold text-blue-600 dark:text-blue-400'>
                {value !== null && value !== undefined ? value.toFixed(2) : '-'}
              </span>
            )
          })
        })

        dynamicColumns.push({
          field: 'averageScore',
          headerName: 'Total Score',
          width: 130,
          headerAlign: 'center',
          align: 'center',
          renderCell: ({ value }) => (
            <span className='font-bold text-green-600 dark:text-green-400'>
              {value !== null && value !== undefined ? value.toFixed(2) : '-'}
            </span>
          )
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
        <Box className='mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow'>
          <div className='flex flex-wrap gap-4 items-end'>
            <FormControl size='small' style={{ minWidth: 150 }}>
              <InputLabel>Gender</InputLabel>
              <Select
                value={filters.gender}
                label='Gender'
                onChange={(e) => handleFilterChange('gender', e.target.value)}
              >
                <MenuItem value=''>All</MenuItem>
                <MenuItem value='MALE'>Male</MenuItem>
                <MenuItem value='FEMALE'>Female</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size='small'
              label='Candidate Number'
              value={filters.candidateNumber}
              onChange={(e) => handleFilterChange('candidateNumber', e.target.value)}
              style={{ minWidth: 150 }}
            />

            <FormControl size='small' style={{ minWidth: 200 }}>
              <InputLabel>Judge Name</InputLabel>
              <Select
                value={filters.judgeName}
                label='Judge Name'
                onChange={(e) => handleFilterChange('judgeName', e.target.value)}
              >
                <MenuItem value=''>All Judges</MenuItem>
                {judges.map((judge) => (
                  <MenuItem key={judge} value={judge}>
                    {judge}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button variant='outlined' size='small' onClick={resetFilters} startIcon={<FilterX size={16} />}>
              Reset
            </Button>

            <div className='ml-auto'>
              <ExcelExportButton competition={competition} filters={filters} disabled={filteredRows.length === 0} />
            </div>
          </div>
        </Box>

        <div className='h-[500px] w-full'>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            loading={loading}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
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
