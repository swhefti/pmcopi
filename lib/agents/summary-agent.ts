import Anthropic from '@anthropic-ai/sdk'
import { SummaryContent, PRDContent, CompetitiveContent, RoadmapContent } from '@/types'
import { parseJSONFromLLM } from '@/lib/parse-json'

const client = new Anthropic()

export async function runSummaryAgent(
  challenge: string,
  prd: PRDContent,
  competitive: CompetitiveContent,
  roadmap: RoadmapContent
): Promise<SummaryContent> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: `You are a chief product officer writing a board-ready executive summary.

Synthesise the PRD, competitive analysis, and roadmap into a crisp one-pager that a non-technical executive can read in 90 seconds.

IMPORTANT: Respond with ONLY raw JSON. Do NOT wrap in markdown code fences. No \`\`\`json, no \`\`\`, no explanation - just the JSON object:
{
  "headline": "one punchy sentence (max 15 words) describing the product opportunity",
  "problem": "2 sentences — the pain, quantified if possible",
  "solution": "2 sentences — what you're building and how it solves the problem",
  "market_opportunity": "1-2 sentences on market size and timing",
  "competitive_edge": "2 sentences on sustainable differentiation",
  "next_steps": ["3-4 concrete immediate actions"],
  "key_metrics": ["4-5 north star metrics to track at launch"]
}

Write for a C-suite audience. Avoid jargon. Be specific about numbers where the context allows.`,
    messages: [
      {
        role: 'user',
        content: `Product challenge: ${challenge}\n\nPRD:\n${JSON.stringify(prd, null, 2)}\n\nCompetitive Analysis:\n${JSON.stringify(competitive, null, 2)}\n\nRoadmap:\n${JSON.stringify(roadmap, null, 2)}`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  return parseJSONFromLLM<SummaryContent>(text)
}
