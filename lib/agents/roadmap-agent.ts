import Anthropic from '@anthropic-ai/sdk'
import { RoadmapContent, PRDContent, CompetitiveContent } from '@/types'
import { parseJSONFromLLM } from '@/lib/parse-json'

const client = new Anthropic()

export async function runRoadmapAgent(
  challenge: string,
  prd: PRDContent,
  competitive: CompetitiveContent
): Promise<RoadmapContent> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: `You are a VP of Product planning a 9-month roadmap. Your job is to translate strategy into a phased, prioritised build plan.

Given the product challenge, PRD, and competitive analysis, produce a 3-phase roadmap.

IMPORTANT: Respond with ONLY raw JSON. Do NOT wrap in markdown code fences. No \`\`\`json, no \`\`\`, no explanation - just the JSON object:
{
  "strategic_rationale": "2 sentences explaining the phasing logic",
  "phases": [
    {
      "name": "Phase name (e.g. Foundation, Growth, Scale)",
      "timeline": "e.g. Months 1-3",
      "items": [
        {
          "feature": "feature name",
          "priority": "Must Have" | "Should Have" | "Nice to Have",
          "effort": "S" | "M" | "L" | "XL",
          "rationale": "one sentence why this item is in this phase"
        }
      ]
    }
  ]
}

Phase 1 (Months 1-3): 4-6 Must Have items — core MVP
Phase 2 (Months 4-6): 4-5 items — growth features
Phase 3 (Months 7-9): 3-4 items — scale and differentiation

Effort guide: S=1 sprint, M=2-3 sprints, L=1-2 months, XL=2+ months`,
    messages: [
      {
        role: 'user',
        content: `Product challenge: ${challenge}\n\nPRD:\n${JSON.stringify(prd, null, 2)}\n\nCompetitive Analysis:\n${JSON.stringify(competitive, null, 2)}`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  return parseJSONFromLLM<RoadmapContent>(text)
}
