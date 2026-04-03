/**
 * Test script to verify the agent pipeline works end-to-end.
 * Run with: npx tsx scripts/test-pipeline.ts
 *
 * Requires ANTHROPIC_API_KEY to be set in .env.local
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { runPRDAgent } from '../lib/agents/prd-agent'
import { runCompetitiveAgent } from '../lib/agents/competitive-agent'
import { runRoadmapAgent } from '../lib/agents/roadmap-agent'
import { runSummaryAgent } from '../lib/agents/summary-agent'

const TEST_CHALLENGE = `We need to improve retention for our B2B SaaS tool — users churn after 30 days because onboarding is too complex. Our target users are mid-size companies (50-500 employees) using our project management software.`

async function main() {
  console.log('🚀 Starting agent pipeline test...\n')
  console.log('Challenge:', TEST_CHALLENGE)
  console.log('\n' + '='.repeat(60) + '\n')

  let totalInputTokens = 0
  let totalOutputTokens = 0
  let totalCost = 0

  try {
    // Agent 1: PRD
    console.log('📝 Running PRD Agent...')
    const prdResult = await runPRDAgent(TEST_CHALLENGE)
    console.log('✅ PRD Agent complete')
    console.log('Usage:', prdResult.usage)
    console.log(JSON.stringify(prdResult.content, null, 2))
    totalInputTokens += prdResult.usage.input_tokens
    totalOutputTokens += prdResult.usage.output_tokens
    totalCost += prdResult.usage.cost_usd
    console.log('\n' + '='.repeat(60) + '\n')

    // Agent 2: Competitive
    console.log('🔍 Running Competitive Agent...')
    const competitiveResult = await runCompetitiveAgent(TEST_CHALLENGE, prdResult.content)
    console.log('✅ Competitive Agent complete')
    console.log('Usage:', competitiveResult.usage)
    console.log(JSON.stringify(competitiveResult.content, null, 2))
    totalInputTokens += competitiveResult.usage.input_tokens
    totalOutputTokens += competitiveResult.usage.output_tokens
    totalCost += competitiveResult.usage.cost_usd
    console.log('\n' + '='.repeat(60) + '\n')

    // Agent 3: Roadmap
    console.log('🗺️ Running Roadmap Agent...')
    const roadmapResult = await runRoadmapAgent(TEST_CHALLENGE, prdResult.content, competitiveResult.content)
    console.log('✅ Roadmap Agent complete')
    console.log('Usage:', roadmapResult.usage)
    console.log(JSON.stringify(roadmapResult.content, null, 2))
    totalInputTokens += roadmapResult.usage.input_tokens
    totalOutputTokens += roadmapResult.usage.output_tokens
    totalCost += roadmapResult.usage.cost_usd
    console.log('\n' + '='.repeat(60) + '\n')

    // Agent 4: Summary
    console.log('📊 Running Summary Agent...')
    const summaryResult = await runSummaryAgent(TEST_CHALLENGE, prdResult.content, competitiveResult.content, roadmapResult.content)
    console.log('✅ Summary Agent complete')
    console.log('Usage:', summaryResult.usage)
    console.log(JSON.stringify(summaryResult.content, null, 2))
    totalInputTokens += summaryResult.usage.input_tokens
    totalOutputTokens += summaryResult.usage.output_tokens
    totalCost += summaryResult.usage.cost_usd
    console.log('\n' + '='.repeat(60) + '\n')

    console.log('🎉 All agents completed successfully!')
    console.log('\n📊 Total Usage:')
    console.log(`   Input tokens:  ${totalInputTokens.toLocaleString()}`)
    console.log(`   Output tokens: ${totalOutputTokens.toLocaleString()}`)
    console.log(`   Total cost:    $${totalCost.toFixed(4)}`)
  } catch (error) {
    console.error('❌ Pipeline failed:', error)
    process.exit(1)
  }
}

main()
