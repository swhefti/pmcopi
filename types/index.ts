export type SessionStatus = 'pending' | 'generating' | 'complete' | 'error'
export type ArtifactType = 'prd' | 'competitive' | 'roadmap' | 'summary'

export interface Session {
  id: string
  challenge: string
  status: SessionStatus
  created_at: string
  updated_at: string
}

export interface Artifact {
  id: string
  session_id: string
  type: ArtifactType
  content: PRDContent | CompetitiveContent | RoadmapContent | SummaryContent | null
  raw_text: string | null
  created_at: string
}

export interface SessionWithArtifacts extends Session {
  artifacts: Artifact[]
}

// --- PRD ---
export interface PRDContent {
  background: string
  problem_statement: string
  goals: string[]
  user_stories: UserStory[]
  success_metrics: SuccessMetric[]
}
export interface UserStory {
  persona: string
  want: string
  so_that: string
}
export interface SuccessMetric {
  metric: string
  target: string
  timeframe: string
}

// --- Competitive Analysis ---
export interface CompetitiveContent {
  market_context: string
  competitors: Competitor[]
  strategic_gap: string
}
export interface Competitor {
  name: string
  description: string
  strengths: string[]
  weaknesses: string[]
  our_differentiator: string
}

// --- Roadmap ---
export interface RoadmapContent {
  strategic_rationale: string
  phases: RoadmapPhase[]
}
export interface RoadmapPhase {
  name: string
  timeline: string
  items: RoadmapItem[]
}
export interface RoadmapItem {
  feature: string
  priority: 'Must Have' | 'Should Have' | 'Nice to Have'
  effort: 'S' | 'M' | 'L' | 'XL'
  rationale: string
}

// --- Executive Summary ---
export interface SummaryContent {
  headline: string
  problem: string
  solution: string
  market_opportunity: string
  competitive_edge: string
  next_steps: string[]
  key_metrics: string[]
}

// --- Token Usage ---
export interface TokenUsage {
  input_tokens: number
  output_tokens: number
  cost_usd: number
}

export interface AgentUsage {
  agent: ArtifactType
  usage: TokenUsage
}

// --- Streaming ---
export interface SSEEvent {
  type: 'agent_start' | 'agent_complete' | 'pipeline_complete' | 'error'
  agent?: ArtifactType
  content?: PRDContent | CompetitiveContent | RoadmapContent | SummaryContent
  usage?: TokenUsage
  error?: string
}
