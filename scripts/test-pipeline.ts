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

  try {
    // Agent 1: PRD
    console.log('📝 Running PRD Agent...')
    const prd = await runPRDAgent(TEST_CHALLENGE)
    console.log('✅ PRD Agent complete')
    console.log(JSON.stringify(prd, null, 2))
    console.log('\n' + '='.repeat(60) + '\n')

    // Agent 2: Competitive
    console.log('🔍 Running Competitive Agent...')
    const competitive = await runCompetitiveAgent(TEST_CHALLENGE, prd)
    console.log('✅ Competitive Agent complete')
    console.log(JSON.stringify(competitive, null, 2))
    console.log('\n' + '='.repeat(60) + '\n')

    // Agent 3: Roadmap
    console.log('🗺️ Running Roadmap Agent...')
    const roadmap = await runRoadmapAgent(TEST_CHALLENGE, prd, competitive)
    console.log('✅ Roadmap Agent complete')
    console.log(JSON.stringify(roadmap, null, 2))
    console.log('\n' + '='.repeat(60) + '\n')

    // Agent 4: Summary
    console.log('📊 Running Summary Agent...')
    const summary = await runSummaryAgent(TEST_CHALLENGE, prd, competitive, roadmap)
    console.log('✅ Summary Agent complete')
    console.log(JSON.stringify(summary, null, 2))
    console.log('\n' + '='.repeat(60) + '\n')

    console.log('🎉 All agents completed successfully!')
  } catch (error) {
    console.error('❌ Pipeline failed:', error)
    process.exit(1)
  }
}

main()
