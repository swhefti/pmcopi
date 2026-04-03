import Anthropic from '@anthropic-ai/sdk'
import { CompetitiveContent, PRDContent } from '@/types'
import { parseJSONFromLLM } from '@/lib/parse-json'

const client = new Anthropic()

export async function runCompetitiveAgent(
  challenge: string,
  prd: PRDContent
): Promise<CompetitiveContent> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: `You are a head of product strategy specialising in competitive intelligence.

Given a product challenge and the PRD context, identify the 3 most relevant direct or indirect competitors and produce a sharp competitive analysis.

IMPORTANT: Respond with ONLY raw JSON. Do NOT wrap in markdown code fences. No \`\`\`json, no \`\`\`, no explanation - just the JSON object:
{
  "market_context": "2 sentences on the competitive landscape",
  "competitors": [
    {
      "name": "company name",
      "description": "one sentence on what they do",
      "strengths": ["2-3 real strengths"],
      "weaknesses": ["2-3 genuine weaknesses"],
      "our_differentiator": "one sentence on how we win against them specifically"
    }
  ],
  "strategic_gap": "one paragraph on the white space this product can own"
}

Use real, well-known companies as competitors where relevant. Be analytically honest — do not invent fake companies.`,
    messages: [
      {
        role: 'user',
        content: `Product challenge: ${challenge}\n\nPRD context:\n${JSON.stringify(prd, null, 2)}`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  return parseJSONFromLLM<CompetitiveContent>(text)
}
