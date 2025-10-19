import React from 'react'

const LEVEL_LABELS = {
  COLLEGE: 'College',
  SENIOR_HIGH: 'Senior High School',
  BASIC_EDUCATION: 'Basic Education'
}

function ResultsTable({ candidates, levelLabel }) {
  const sortedCandidates = [...candidates]
    .filter((c) => c.averageScore !== null)
    .sort((a, b) => b.averageScore - a.averageScore)

  if (sortedCandidates.length === 0) return null

  return (
    <div className='mb-12'>
      <h3 className='text-lg font-bold mb-4'>{levelLabel}</h3>
      <table className='w-full border-collapse'>
        <thead>
          <tr className='border-b-2 border-black'>
            <th className='py-2 px-3 text-left text-sm font-semibold'>Candidate Name</th>
            <th className='py-2 px-3 text-center text-sm font-semibold'>Course</th>
            <th className='py-2 px-3 text-center text-sm font-semibold'>Final Score</th>
          </tr>
        </thead>
        <tbody>
          {sortedCandidates.map((candidate, index) => {
            const isTopThree = index < 3
            const title =
              index === 0 ? ' (Champion)' : index === 1 ? ' (1st Runner Up)' : index === 2 ? ' (2nd Runner Up)' : ''

            return (
              <tr key={candidate.id} className='border-b border-black'>
                <td className={`py-1.5 px-3 text-sm ${isTopThree ? 'font-bold' : ''}`}>
                  {candidate.name}
                  {title}
                </td>
                <td className={`py-1.5 px-3 text-center text-sm ${isTopThree ? 'font-bold' : ''}`}>
                  {candidate.course}
                </td>
                <td className={`py-1.5 px-3 text-center text-sm ${isTopThree ? 'font-bold' : ''}`}>
                  {candidate.averageScore.toFixed(2)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function PrintForm({ competition, candidatesByLevel, judges }) {
  // Determine which levels have candidates
  const levelsWithCandidates = Object.entries(candidatesByLevel)
    .filter(([_, candidates]) => candidates && candidates.length > 0)
    .map(([level]) => level)

  return (
    <div className='max-w-4xl mx-auto p-6 bg-white text-black'>
      {/* Header with Logo */}
      <div className='text-center mb-8'>
        <img src='/main/loa.png' alt='Lyceum of Alabang Logo' className='mx-auto mb-4 h-20 w-auto' />
        <h1 className='text-xl font-bold mb-0.5'>Lyceum of Alabang</h1>
        <h2 className='text-lg'>{competition.label} 2025</h2>
      </div>

      {/* Results by Level */}
      {levelsWithCandidates.map((level) => (
        <ResultsTable key={level} candidates={candidatesByLevel[level]} levelLabel={LEVEL_LABELS[level]} />
      ))}

      {/* Footer - Judge Signatures */}
      <div className='mt-16'>
        <div className='grid grid-cols-2 gap-x-12 gap-y-8 max-w-xl'>
          {judges.map((judge) => (
            <div key={judge.id} className='space-y-0.5'>
              <div className='border-b-2 border-black h-6 mb-1'></div>
              <p className='text-center text-sm font-medium'>{judge.username}</p>
              <p className='text-center text-xs text-gray-600'>Judge Signature</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            margin: 0.75in;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  )
}
