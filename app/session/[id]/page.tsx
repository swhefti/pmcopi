'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  getSession,
  updateSessionStatus,
  saveArtifact,
  getSessionWithArtifacts,
  getArtifact,
} from '@/lib/storage'
import {
  ArtifactType,
  SessionWithArtifacts,
  SSEEvent,
  PRDContent,
  CompetitiveContent,
  RoadmapContent,
  SummaryContent,
  TokenUsage,
} from '@/types'
import { AgentPanel } from '@/components/AgentPanel'
import { ProgressBar } from '@/components/ProgressBar'
import { ExportButton } from '@/components/ExportButton'
import { UsagePanel } from '@/components/UsagePanel'

const AGENT_ORDER: ArtifactType[] = ['prd', 'competitive', 'roadmap', 'summary']

type ArtifactContent = PRDContent | CompetitiveContent | RoadmapContent | SummaryContent

type UsageRecord = Record<ArtifactType, TokenUsage | null>

const initialUsage: UsageRecord = {
  prd: null,
  competitive: null,
  roadmap: null,
  summary: null,
}

export default function SessionPage() {
  const { id } = useParams<{ id: string }>()
  const [sessionData, setSessionData] = useState<SessionWithArtifacts | null>(null)
  const [activeAgent, setActiveAgent] = useState<ArtifactType | null>(null)
  const [completedAgents, setCompletedAgents] = useState<ArtifactType[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasStartedGeneration, setHasStartedGeneration] = useState(false)
  const [usage, setUsage] = useState<UsageRecord>(initialUsage)

  const runGeneration = useCallback(async (sessionId: string, challenge: string) => {
    if (hasStartedGeneration) return
    setHasStartedGeneration(true)
    setUsage(initialUsage)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, challenge }),
      })

      if (!response.ok) {
        throw new Error('Failed to start generation')
      }

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const event: SSEEvent = JSON.parse(line.slice(6))

          if (event.type === 'agent_start' && event.agent) {
            setActiveAgent(event.agent)
          }
          if (event.type === 'agent_complete' && event.agent && event.content) {
            saveArtifact(sessionId, event.agent, event.content)
            setCompletedAgents((prev) => [...prev, event.agent!])
            setActiveAgent(null)
            setSessionData(getSessionWithArtifacts(sessionId))

            // Track usage
            if (event.usage) {
              setUsage((prev) => ({
                ...prev,
                [event.agent!]: event.usage!,
              }))
            }
          }
          if (event.type === 'pipeline_complete') {
            updateSessionStatus(sessionId, 'complete')
            setSessionData(getSessionWithArtifacts(sessionId))
          }
          if (event.type === 'error') {
            setError(event.error || 'An unknown error occurred')
            updateSessionStatus(sessionId, 'error')
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate'
      setError(message)
      updateSessionStatus(sessionId, 'error')
    }
  }, [hasStartedGeneration])

  useEffect(() => {
    if (!id) return

    const session = getSession(id)
    if (!session) {
      setError('Session not found')
      setIsLoading(false)
      return
    }

    // Check for existing artifacts
    const existingCompleted: ArtifactType[] = []
    for (const type of AGENT_ORDER) {
      if (getArtifact(id, type)) {
        existingCompleted.push(type)
      }
    }
    setCompletedAgents(existingCompleted)

    if (session.status === 'complete' || existingCompleted.length === 4) {
      setSessionData(getSessionWithArtifacts(id))
      setIsLoading(false)
      return
    }

    if (session.status === 'error') {
      setSessionData(getSessionWithArtifacts(id))
      setError('Previous generation failed')
      setIsLoading(false)
      return
    }

    // Start generation
    setSessionData({ ...session, artifacts: [] })
    setIsLoading(false)
    updateSessionStatus(id, 'generating')
    runGeneration(id, session.challenge)
  }, [id, runGeneration])

  const handleRetry = () => {
    if (!id) return
    setError(null)
    setHasStartedGeneration(false)
    setCompletedAgents([])
    setUsage(initialUsage)
    const session = getSession(id)
    if (session) {
      updateSessionStatus(id, 'generating')
      runGeneration(id, session.challenge)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="mt-4 text-gray-500">Loading session...</p>
        </div>
      </div>
    )
  }

  if (!sessionData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Session not found</h1>
          <Link
            href="/"
            className="mt-4 inline-block text-indigo-600 hover:text-indigo-700"
          >
            Start a new session
          </Link>
        </div>
      </div>
    )
  }

  const getAgentContent = (type: ArtifactType): ArtifactContent | null => {
    const artifact = sessionData.artifacts.find((a) => a.type === type)
    return artifact?.content ?? null
  }

  const getAgentStatus = (type: ArtifactType): 'idle' | 'generating' | 'complete' | 'error' => {
    if (completedAgents.includes(type)) return 'complete'
    if (activeAgent === type) return 'generating'
    if (error && !completedAgents.includes(type)) return 'error'
    return 'idle'
  }

  const isComplete = completedAgents.length === 4

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80">
              <span className="text-xl" aria-hidden="true">
                🚀
              </span>
              <span className="font-semibold text-gray-900">AI PM Copilot</span>
            </Link>
            <span className="text-gray-300">|</span>
            <span className="font-mono text-xs text-gray-400">
              {id.slice(0, 8)}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {isComplete && <ExportButton session={sessionData} />}
            <Link
              href="/"
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              New Session
            </Link>
          </div>
        </div>
      </header>

      {/* Challenge */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <p className="text-sm text-gray-500">Challenge:</p>
          <p className="mt-1 line-clamp-2 text-gray-700">{sessionData.challenge}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <ProgressBar activeAgent={activeAgent} completedAgents={completedAgents} />
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="border-b border-red-200 bg-red-50">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={handleRetry}
              className="rounded-lg bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Agent Panels */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {AGENT_ORDER.map((type) => (
            <AgentPanel
              key={type}
              type={type}
              status={getAgentStatus(type)}
              content={getAgentContent(type)}
            />
          ))}
        </div>

        {/* Usage Panel */}
        <UsagePanel usage={usage} isComplete={isComplete} />
      </main>
    </div>
  )
}
