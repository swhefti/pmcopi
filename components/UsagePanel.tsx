'use client'

import { ArtifactType, TokenUsage } from '@/types'

interface UsagePanelProps {
  usage: Record<ArtifactType, TokenUsage | null>
  isComplete: boolean
}

const AGENT_LABELS: Record<ArtifactType, string> = {
  prd: 'PRD Agent',
  competitive: 'Competitive Agent',
  roadmap: 'Roadmap Agent',
  summary: 'Summary Agent',
}

function formatNumber(num: number): string {
  return num.toLocaleString()
}

function formatCost(cost: number): string {
  if (cost < 0.001) {
    return `$${cost.toFixed(6)}`
  }
  if (cost < 0.01) {
    return `$${cost.toFixed(4)}`
  }
  return `$${cost.toFixed(3)}`
}

export function UsagePanel({ usage, isComplete }: UsagePanelProps) {
  const agents: ArtifactType[] = ['prd', 'competitive', 'roadmap', 'summary']

  const totalInputTokens = agents.reduce(
    (sum, agent) => sum + (usage[agent]?.input_tokens || 0),
    0
  )
  const totalOutputTokens = agents.reduce(
    (sum, agent) => sum + (usage[agent]?.output_tokens || 0),
    0
  )
  const totalCost = agents.reduce(
    (sum, agent) => sum + (usage[agent]?.cost_usd || 0),
    0
  )

  const hasAnyUsage = agents.some((agent) => usage[agent] !== null)

  if (!hasAnyUsage) {
    return null
  }

  return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center gap-2">
        <svg
          className="h-5 w-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
        <h3 className="text-lg font-semibold tracking-tight text-gray-900">
          API Usage & Cost
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="pb-3 pr-4 font-medium text-gray-500">Agent</th>
              <th className="pb-3 pr-4 text-right font-medium text-gray-500">
                Input Tokens
              </th>
              <th className="pb-3 pr-4 text-right font-medium text-gray-500">
                Output Tokens
              </th>
              <th className="pb-3 text-right font-medium text-gray-500">Cost</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => {
              const agentUsage = usage[agent]
              return (
                <tr key={agent} className="border-b border-gray-100">
                  <td className="py-3 pr-4 text-gray-900">
                    {AGENT_LABELS[agent]}
                  </td>
                  <td className="py-3 pr-4 text-right font-mono text-gray-600">
                    {agentUsage ? formatNumber(agentUsage.input_tokens) : '—'}
                  </td>
                  <td className="py-3 pr-4 text-right font-mono text-gray-600">
                    {agentUsage ? formatNumber(agentUsage.output_tokens) : '—'}
                  </td>
                  <td className="py-3 text-right font-mono text-gray-600">
                    {agentUsage ? formatCost(agentUsage.cost_usd) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200 bg-gray-50">
              <td className="py-3 pr-4 font-semibold text-gray-900">Total</td>
              <td className="py-3 pr-4 text-right font-mono font-semibold text-gray-900">
                {formatNumber(totalInputTokens)}
              </td>
              <td className="py-3 pr-4 text-right font-mono font-semibold text-gray-900">
                {formatNumber(totalOutputTokens)}
              </td>
              <td className="py-3 text-right font-mono font-semibold text-indigo-600">
                {formatCost(totalCost)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-4 text-xs text-gray-400">
        Pricing: Claude Sonnet 4.6 — $3/M input tokens, $15/M output tokens
      </div>
    </div>
  )
}
