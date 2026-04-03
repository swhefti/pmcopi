import Anthropic from '@anthropic-ai/sdk'
import { PRDContent } from '@/types'
import { parseJSONFromLLM } from '@/lib/parse-json'

const client = new Anthropic()

export async function runPRDAgent(challenge: string): Promise<PRDContent> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: `You are a senior product manager at a top-tier tech company with 15 years of experience writing PRDs for products used by millions.

Your task: write a structured PRD based on the product challenge provided.

IMPORTANT: Respond with ONLY raw JSON. Do NOT wrap in markdown code fences. No \`\`\`json, no \`\`\`, no explanation - just the JSON object:
{
  "background": "2-3 sentences of market/context background",
  "problem_statement": "1 precise sentence stating the core problem",
  "goals": ["3-5 specific, measurable product goals"],
  "user_stories": [
    { "persona": "type of user", "want": "what they want to do", "so_that": "the value they get" }
  ],
  "success_metrics": [
    { "metric": "name of metric", "target": "specific target value", "timeframe": "by when" }
  ]
}

Requirements:
- goals: 4-5 items, each starting with an action verb
- user_stories: 4-6 stories covering distinct personas
- success_metrics: 3-5 metrics that are genuinely measurable (no vanity metrics)
- Be specific and opinionated — avoid generic PM boilerplate`,
    messages: [{ role: 'user', content: `Product challenge: ${challenge}` }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  return parseJSONFromLLM<PRDContent>(text)
}
