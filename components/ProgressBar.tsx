'use client'

import { ArtifactType } from '@/types'

interface ProgressBarProps {
  activeAgent: ArtifactType | null
  completedAgents: ArtifactType[]
}

const AGENTS: { type: ArtifactType; label: string }[] = [
  { type: 'prd', label: 'PRD' },
  { type: 'competitive', label: 'Competitive' },
  { type: 'roadmap', label: 'Roadmap' },
  { type: 'summary', label: 'Summary' },
]

export function ProgressBar({ activeAgent, completedAgents }: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {AGENTS.map((agent, index) => {
          const isCompleted = completedAgents.includes(agent.type)
          const isActive = activeAgent === agent.type
          const isPending = !isCompleted && !isActive

          return (
            <div key={agent.type} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isActive
                        ? 'animate-pulse bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                  aria-label={`${agent.label}: ${isCompleted ? 'complete' : isActive ? 'generating' : 'pending'}`}
                >
                  {isCompleted ? (
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`mt-1 text-xs font-medium ${
                    isCompleted
                      ? 'text-emerald-600'
                      : isActive
                        ? 'text-indigo-600'
                        : 'text-gray-400'
                  }`}
                >
                  {agent.label}
                </span>
              </div>
              {index < AGENTS.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 ${
                    completedAgents.includes(AGENTS[index + 1].type) ||
                    activeAgent === AGENTS[index + 1].type
                      ? 'bg-indigo-600'
                      : completedAgents.includes(agent.type)
                        ? 'bg-emerald-600'
                        : 'bg-gray-200'
                  }`}
                  aria-hidden="true"
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
