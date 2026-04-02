'use client'

import {
  ArtifactType,
  PRDContent,
  CompetitiveContent,
  RoadmapContent,
  SummaryContent,
} from '@/types'

interface AgentPanelProps {
  type: ArtifactType
  status: 'idle' | 'generating' | 'complete' | 'error'
  content:
    | PRDContent
    | CompetitiveContent
    | RoadmapContent
    | SummaryContent
    | null
}

const PANEL_CONFIG: Record<ArtifactType, { title: string; icon: string }> = {
  prd: { title: 'Product Requirements Document', icon: '📝' },
  competitive: { title: 'Competitive Analysis', icon: '🔍' },
  roadmap: { title: 'Product Roadmap', icon: '🗺️' },
  summary: { title: 'Executive Summary', icon: '📊' },
}

export function AgentPanel({ type, status, content }: AgentPanelProps) {
  const config = PANEL_CONFIG[type]

  return (
    <div
      className={`rounded-lg border bg-white p-6 transition-all ${
        status === 'generating'
          ? 'border-indigo-300 ring-2 ring-indigo-100'
          : status === 'complete'
            ? 'border-gray-200'
            : status === 'error'
              ? 'border-red-300'
              : 'border-gray-200 opacity-60'
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-gray-900">
          <span aria-hidden="true">{config.icon}</span>
          {config.title}
        </h3>
        {status === 'generating' && (
          <span className="flex items-center gap-2 text-sm text-indigo-600">
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
            Thinking...
          </span>
        )}
        {status === 'idle' && (
          <span className="text-sm text-gray-400">Waiting...</span>
        )}
      </div>

      <div className="min-h-[200px]">
        {status === 'idle' && <IdleSkeleton />}
        {status === 'generating' && <GeneratingSkeleton />}
        {status === 'error' && (
          <div className="text-sm text-red-500">
            An error occurred while generating this artifact.
          </div>
        )}
        {status === 'complete' && content && (
          <ContentRenderer type={type} content={content} />
        )}
      </div>
    </div>
  )
}

function IdleSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-4 rounded bg-gray-100"
          style={{ width: `${80 - i * 10}%` }}
        />
      ))}
    </div>
  )
}

function GeneratingSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-4 animate-pulse rounded bg-indigo-50"
          style={{ width: `${80 - i * 10}%` }}
        />
      ))}
    </div>
  )
}

function ContentRenderer({
  type,
  content,
}: {
  type: ArtifactType
  content: PRDContent | CompetitiveContent | RoadmapContent | SummaryContent
}) {
  switch (type) {
    case 'prd':
      return <PRDRenderer content={content as PRDContent} />
    case 'competitive':
      return <CompetitiveRenderer content={content as CompetitiveContent} />
    case 'roadmap':
      return <RoadmapRenderer content={content as RoadmapContent} />
    case 'summary':
      return <SummaryRenderer content={content as SummaryContent} />
    default:
      return null
  }
}

function PRDRenderer({ content }: { content: PRDContent }) {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <p className="italic text-gray-600">{content.background}</p>
      </div>

      <div className="rounded-md bg-amber-50 p-3">
        <h4 className="text-xs font-medium uppercase tracking-wide text-amber-800">
          Problem Statement
        </h4>
        <p className="mt-1 font-medium text-gray-900">
          {content.problem_statement}
        </p>
      </div>

      <div>
        <h4 className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Goals
        </h4>
        <ol className="mt-2 list-inside list-decimal space-y-1 text-gray-700">
          {content.goals.map((goal, i) => (
            <li key={i}>{goal}</li>
          ))}
        </ol>
      </div>

      <div>
        <h4 className="text-xs font-medium uppercase tracking-wide text-gray-500">
          User Stories
        </h4>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-2 font-medium text-gray-500">Persona</th>
                <th className="pb-2 font-medium text-gray-500">Want</th>
                <th className="pb-2 font-medium text-gray-500">So That</th>
              </tr>
            </thead>
            <tbody>
              {content.user_stories.map((story, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2 pr-2 text-gray-900">{story.persona}</td>
                  <td className="py-2 pr-2 text-gray-700">{story.want}</td>
                  <td className="py-2 text-gray-600">{story.so_that}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Success Metrics
        </h4>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-2 font-medium text-gray-500">Metric</th>
                <th className="pb-2 font-medium text-gray-500">Target</th>
                <th className="pb-2 font-medium text-gray-500">Timeframe</th>
              </tr>
            </thead>
            <tbody>
              {content.success_metrics.map((metric, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2 pr-2 text-gray-900">{metric.metric}</td>
                  <td className="py-2 pr-2 font-medium text-emerald-600">
                    {metric.target}
                  </td>
                  <td className="py-2 text-gray-600">{metric.timeframe}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function CompetitiveRenderer({ content }: { content: CompetitiveContent }) {
  return (
    <div className="space-y-4 text-sm">
      <p className="text-gray-600">{content.market_context}</p>

      <div className="grid gap-4 md:grid-cols-3">
        {content.competitors.map((comp, i) => (
          <div key={i} className="rounded-lg border border-gray-100 p-3">
            <h4 className="font-semibold text-gray-900">{comp.name}</h4>
            <p className="mt-1 text-xs text-gray-500">{comp.description}</p>

            <div className="mt-3 space-y-2">
              <div>
                <span className="text-xs font-medium text-emerald-600">
                  Strengths
                </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {comp.strengths.map((s, j) => (
                    <span
                      key={j}
                      className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-red-600">
                  Weaknesses
                </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {comp.weaknesses.map((w, j) => (
                    <span
                      key={j}
                      className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-700"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-3 rounded bg-indigo-50 p-2">
              <span className="text-xs font-medium text-indigo-600">
                Our Edge:
              </span>
              <p className="mt-0.5 text-xs text-indigo-900">
                {comp.our_differentiator}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-gray-50 p-3">
        <h4 className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Strategic Gap
        </h4>
        <p className="mt-1 text-gray-700">{content.strategic_gap}</p>
      </div>
    </div>
  )
}

function RoadmapRenderer({ content }: { content: RoadmapContent }) {
  const priorityColors = {
    'Must Have': 'bg-red-100 text-red-700',
    'Should Have': 'bg-amber-100 text-amber-700',
    'Nice to Have': 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="space-y-4 text-sm">
      <p className="text-gray-600">{content.strategic_rationale}</p>

      <div className="space-y-4">
        {content.phases.map((phase, i) => (
          <div key={i} className="rounded-lg border border-gray-100 p-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">{phase.name}</h4>
              <span className="text-xs text-gray-500">{phase.timeline}</span>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-2 font-medium text-gray-500">Feature</th>
                    <th className="pb-2 font-medium text-gray-500">Priority</th>
                    <th className="pb-2 font-medium text-gray-500">Effort</th>
                    <th className="pb-2 font-medium text-gray-500">Rationale</th>
                  </tr>
                </thead>
                <tbody>
                  {phase.items.map((item, j) => (
                    <tr key={j} className="border-b border-gray-50">
                      <td className="py-2 pr-2 font-medium text-gray-900">
                        {item.feature}
                      </td>
                      <td className="py-2 pr-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[item.priority]}`}
                        >
                          {item.priority}
                        </span>
                      </td>
                      <td className="py-2 pr-2 font-mono text-gray-600">
                        {item.effort}
                      </td>
                      <td className="py-2 text-gray-600">{item.rationale}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SummaryRenderer({ content }: { content: SummaryContent }) {
  return (
    <div className="space-y-4 text-sm">
      <h4 className="text-xl font-bold tracking-tight text-gray-900">
        {content.headline}
      </h4>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <h5 className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Problem
            </h5>
            <p className="mt-1 text-gray-700">{content.problem}</p>
          </div>

          <div>
            <h5 className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Solution
            </h5>
            <p className="mt-1 text-gray-700">{content.solution}</p>
          </div>

          <div>
            <h5 className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Market Opportunity
            </h5>
            <p className="mt-1 text-gray-700">{content.market_opportunity}</p>
          </div>

          <div>
            <h5 className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Competitive Edge
            </h5>
            <p className="mt-1 text-gray-700">{content.competitive_edge}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h5 className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Next Steps
            </h5>
            <ul className="mt-2 list-inside list-disc space-y-1 text-gray-700">
              {content.next_steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Key Metrics
            </h5>
            <ul className="mt-2 list-inside list-disc space-y-1 text-gray-700">
              {content.key_metrics.map((metric, i) => (
                <li key={i}>{metric}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
