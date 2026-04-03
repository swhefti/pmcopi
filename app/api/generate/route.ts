import { NextRequest } from 'next/server'
import { runPRDAgent } from '@/lib/agents/prd-agent'
import { runCompetitiveAgent } from '@/lib/agents/competitive-agent'
import { runRoadmapAgent } from '@/lib/agents/roadmap-agent'
import { runSummaryAgent } from '@/lib/agents/summary-agent'
import { SSEEvent } from '@/types'

export const maxDuration = 300

export async function POST(req: NextRequest) {
  const { sessionId, challenge } = await req.json()

  if (!sessionId || !challenge) {
    return new Response(JSON.stringify({ error: 'Missing sessionId or challenge' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: SSEEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
      }

      try {
        // Agent 1: PRD
        send({ type: 'agent_start', agent: 'prd' })
        const prdResult = await runPRDAgent(challenge)
        send({ type: 'agent_complete', agent: 'prd', content: prdResult.content, usage: prdResult.usage })

        // Agent 2: Competitive
        send({ type: 'agent_start', agent: 'competitive' })
        const compResult = await runCompetitiveAgent(challenge, prdResult.content)
        send({ type: 'agent_complete', agent: 'competitive', content: compResult.content, usage: compResult.usage })

        // Agent 3: Roadmap
        send({ type: 'agent_start', agent: 'roadmap' })
        const roadmapResult = await runRoadmapAgent(challenge, prdResult.content, compResult.content)
        send({ type: 'agent_complete', agent: 'roadmap', content: roadmapResult.content, usage: roadmapResult.usage })

        // Agent 4: Summary
        send({ type: 'agent_start', agent: 'summary' })
        const summaryResult = await runSummaryAgent(
          challenge,
          prdResult.content,
          compResult.content,
          roadmapResult.content
        )
        send({ type: 'agent_complete', agent: 'summary', content: summaryResult.content, usage: summaryResult.usage })

        send({ type: 'pipeline_complete' })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        send({ type: 'error', error: message })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
