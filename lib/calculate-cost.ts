import { TokenUsage } from '@/types'

// Claude Sonnet 4 pricing (per million tokens)
const INPUT_PRICE_PER_MILLION = 3.0 // $3 per 1M input tokens
const OUTPUT_PRICE_PER_MILLION = 15.0 // $15 per 1M output tokens

export function calculateCost(inputTokens: number, outputTokens: number): TokenUsage {
  const inputCost = (inputTokens / 1_000_000) * INPUT_PRICE_PER_MILLION
  const outputCost = (outputTokens / 1_000_000) * OUTPUT_PRICE_PER_MILLION
  const totalCost = inputCost + outputCost

  return {
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost_usd: Math.round(totalCost * 1_000_000) / 1_000_000, // Round to 6 decimal places
  }
}

export function formatCost(cost: number): string {
  if (cost < 0.01) {
    return `$${cost.toFixed(4)}`
  }
  return `$${cost.toFixed(2)}`
}
