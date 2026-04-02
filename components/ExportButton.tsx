'use client'

import { useState, useEffect } from 'react'
import { SessionWithArtifacts } from '@/types'

interface ExportButtonProps {
  session: SessionWithArtifacts
}

export function ExportButton({ session }: ExportButtonProps) {
  const [isClient, setIsClient] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleExport = async () => {
    if (isGenerating) return
    setIsGenerating(true)

    try {
      // Dynamically import PDF libraries only on client
      const [{ pdf }, { ReportDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./pdf/ReportDocument'),
      ])

      const blob = await pdf(<ReportDocument session={session} />).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `pm-copilot-${session.id.slice(0, 8)}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('PDF generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  if (!isClient) {
    return (
      <button
        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white opacity-50"
        disabled
      >
        Export as PDF
      </button>
    )
  }

  return (
    <button
      onClick={handleExport}
      disabled={isGenerating}
      className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-400"
      aria-label={isGenerating ? 'Preparing PDF...' : 'Export as PDF'}
    >
      {isGenerating ? (
        <>
          <svg
            className="h-4 w-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Preparing PDF...
        </>
      ) : (
        <>
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Export as PDF
        </>
      )}
    </button>
  )
}
