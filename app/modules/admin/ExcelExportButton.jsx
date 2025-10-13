// components/ExcelExportButton.jsx
'use client'
import React, { useState } from 'react'
import axios from 'axios'
import { ShinyButton } from '@/components/ui/shiny-button'
import { Download, Loader2 } from 'lucide-react'

export default function ExcelExportButton({ competition, filters, disabled = false }) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)

      // Make API request with filters
      const response = await axios.post(
        '/api/scoring/export',
        {
          competition,
          filters
        },
        {
          responseType: 'blob' // Important for file download
        }
      )

      // Create blob and download file
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0]
      link.download = `${competition}_scores_${timestamp}.xlsx`

      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      alert('Failed to export data. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div onClick={handleExport}>
      <ShinyButton disabled={disabled || isExporting}>
        {isExporting ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Exporting...
          </>
        ) : (
          <>
            <Download className='mr-2 h-4 w-4' />
            Export to Excel
          </>
        )}
      </ShinyButton>
    </div>
  )
}
