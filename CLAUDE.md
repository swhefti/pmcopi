# CLAUDE.md — AI PM Copilot

## Mission
Build a full-stack web app where a user describes a product challenge and a 4-agent AI pipeline generates a complete PM artifact pack: PRD, competitive analysis, roadmap, and executive summary. Each artifact streams live. Sessions are persisted in localStorage (no database required). Everything exports to PDF. Deploy to Vercel.

This is a portfolio showcase. Code quality, UI polish, and demo-readiness are first-class requirements — not afterthoughts.

---

## Non-negotiable constraints

- **Language**: TypeScript everywhere. No `any` types except in third-party adapter shims.
- **Framework**: Next.js 14 App Router. No Pages Router.
- **Styling**: Tailwind CSS only. No CSS modules, no styled-components.
- **AI**: Anthropic SDK (`@anthropic-ai/sdk`) with real streaming via Server-Sent Events.
- **Persistence**: localStorage only. No database, no backend state. All session data lives in the browser. Use `lib/storage.ts` as the single module for all read/write operations — never call `localStorage` directly from components.
- **PDF**: `@react-pdf/renderer` — client-side, pure React, no Puppeteer.
- **Deployment**: Vercel. All API routes must work within Vercel's serverless constraints.
- **No mock data** in production paths. Every agent call hits the real Anthropic API.

---

## Implementation order — follow this exactly

### Phase 0: Scaffold and config
1. `npx create-next-app@latest ai-pm-copilot --typescript --tailwind --app --no-src-dir`
2. Install all dependencies (see list below)
3. Create `.env.local` with all required variables
4. Set up Anthropic client (`lib/anthropic.ts`)
5. Create `lib/storage.ts` — the localStorage abstraction layer (see spec below)
6. Create `types/index.ts` with all shared types
7. Verify dev server starts with no errors before proceeding

### Phase 1: Agent library
Build each agent in `lib/agents/` as a pure async function. No UI yet.
1. `prd-agent.ts`
2. `competitive-agent.ts`
3. `roadmap-agent.ts`
4. `summary-agent.ts`
5. Write a simple `scripts/test-pipeline.ts` that runs all 4 agents sequentially and logs output. Run it with `ts-node` to verify the full pipeline works before touching the UI.

### Phase 2: API route (single route only)
There is only ONE API route needed: the streaming generation pipeline. Session creation and retrieval happen entirely on the client via `lib/storage.ts`.

1. `POST /api/generate` — accepts `{ sessionId, challenge }`, runs all 4 agents sequentially, streams SSE events back. The client writes each completed artifact to localStorage as events arrive.

### Phase 3: UI
Build in this order:
1. Root layout (`app/layout.tsx`) — navigation, global styles
2. Landing page (`app/page.tsx`) — input form
3. Session page (`app/session/[id]/page.tsx`) — streaming output with 4 panels
4. PDF export component (`components/pdf/ReportDocument.tsx`)
5. Wire up export button

### Phase 4: Polish and deploy
1. Error states for all API calls
2. Loading skeletons for artifact panels
3. Mobile responsive layout check
4. Vercel deployment config
5. README with setup instructions and live URL

---

## Folder structure

```
ai-pm-copilot/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                          # landing — input form
│   ├── globals.css
│   ├── session/
│   │   └── [id]/
│   │       └── page.tsx                  # session — streaming results
│   └── api/
│       └── generate/
│           └── route.ts                  # POST stream generation pipeline
├── components/
│   ├── InputForm.tsx
│   ├── AgentPanel.tsx
│   ├── StreamingText.tsx
│   ├── ProgressBar.tsx
│   ├── ExportButton.tsx
│   └── pdf/
│       └── ReportDocument.tsx
├── lib/
│   ├── storage.ts                        # ALL localStorage operations — never call localStorage directly
│   ├── anthropic.ts
│   └── agents/
│       ├── prd-agent.ts
│       ├── competitive-agent.ts
│       ├── roadmap-agent.ts
│       └── summary-agent.ts
├── types/
│   └── index.ts
├── scripts/
│   └── test-pipeline.ts
├── .env.local
├── .env.example
├── vercel.json
└── CLAUDE.md
```

---

## Dependencies

Install all at once:
```bash
npm install @anthropic-ai/sdk @react-pdf/renderer
npm install -D @types/node
```

---

## Environment variables

`.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`.env.example`: same keys with empty values — commit this, never commit `.env.local`.

No database credentials needed. The only secret is the Anthropic API key, which stays server-side and is never exposed to the client.

---

## localStorage storage module (`lib/storage.ts`)

This is the ONLY place in the codebase that touches `localStorage`. All components and hooks import from here — never call `localStorage` directly elsewhere.

```typescript
import { Session, Artifact, SessionWithArtifacts, ArtifactType } from '@/types'

const SESSION_INDEX_KEY = 'pm_copilot:sessions'
const sessionKey = (id: string) => `pm_copilot:session:${id}`
const artifactKey = (sessionId: string, type: ArtifactType) =>
  `pm_copilot:artifact:${sessionId}:${type}`

// Guard: localStorage is unavailable during SSR
const isClient = typeof window !== 'undefined'

export function createSession(challenge: string): Session {
  const session: Session = {
    id: crypto.randomUUID(),
    challenge,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  if (!isClient) return session
  localStorage.setItem(sessionKey(session.id), JSON.stringify(session))
  // Maintain an index of all session IDs for the history page
  const index = getSessionIndex()
  localStorage.setItem(SESSION_INDEX_KEY, JSON.stringify([session.id, ...index]))
  return session
}

export function getSession(id: string): Session | null {
  if (!isClient) return null
  const raw = localStorage.getItem(sessionKey(id))
  return raw ? JSON.parse(raw) : null
}

export function updateSessionStatus(id: string, status: Session['status']): void {
  if (!isClient) return
  const session = getSession(id)
  if (!session) return
  localStorage.setItem(sessionKey(id), JSON.stringify({
    ...session,
    status,
    updated_at: new Date().toISOString(),
  }))
}

export function saveArtifact(sessionId: string, type: ArtifactType, content: unknown): Artifact {
  const artifact: Artifact = {
    id: crypto.randomUUID(),
    session_id: sessionId,
    type,
    content: content as Artifact['content'],
    raw_text: null,
    created_at: new Date().toISOString(),
  }
  if (!isClient) return artifact
  localStorage.setItem(artifactKey(sessionId, type), JSON.stringify(artifact))
  return artifact
}

export function getArtifact(sessionId: string, type: ArtifactType): Artifact | null {
  if (!isClient) return null
  const raw = localStorage.getItem(artifactKey(sessionId, type))
  return raw ? JSON.parse(raw) : null
}

export function getSessionWithArtifacts(id: string): SessionWithArtifacts | null {
  const session = getSession(id)
  if (!session) return null
  const types: ArtifactType[] = ['prd', 'competitive', 'roadmap', 'summary']
  const artifacts = types
    .map(type => getArtifact(id, type))
    .filter((a): a is Artifact => a !== null)
  return { ...session, artifacts }
}

export function getSessionIndex(): string[] {
  if (!isClient) return []
  const raw = localStorage.getItem(SESSION_INDEX_KEY)
  return raw ? JSON.parse(raw) : []
}

export function getAllSessions(): Session[] {
  return getSessionIndex()
    .map(id => getSession(id))
    .filter((s): s is Session => s !== null)
}
```

---

## Shared types (`types/index.ts`)

```typescript
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

// --- Streaming ---
export interface SSEEvent {
  type: 'agent_start' | 'agent_complete' | 'pipeline_complete' | 'error'
  agent?: ArtifactType
  content?: PRDContent | CompetitiveContent | RoadmapContent | SummaryContent
  error?: string
}
```

---

## Agent implementations (`lib/agents/`)

All agents follow this contract:
- Accept the challenge string + previously generated content as context
- Call Anthropic with a structured system prompt
- Return the parsed typed content object
- Throw on failure — let the caller handle errors

### System prompt strategy
Each agent is told:
1. Its exact role and persona ("You are a senior product manager...")
2. The expected output format (JSON schema embedded in the prompt)
3. That it MUST respond with ONLY valid JSON — no preamble, no markdown fences
4. The challenge context and any prior agent outputs

### PRD agent (`lib/agents/prd-agent.ts`)

```typescript
import Anthropic from '@anthropic-ai/sdk'
import { PRDContent } from '@/types'

const client = new Anthropic()

export async function runPRDAgent(challenge: string): Promise<PRDContent> {
  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 4096,
    system: `You are a senior product manager at a top-tier tech company with 15 years of experience writing PRDs for products used by millions.

Your task: write a structured PRD based on the product challenge provided.

Respond with ONLY valid JSON matching this exact schema. No markdown, no explanation:
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
  return JSON.parse(text) as PRDContent
}
```

### Competitive agent (`lib/agents/competitive-agent.ts`)

Same pattern. System prompt:
```
You are a head of product strategy specialising in competitive intelligence.

Given a product challenge and the PRD context, identify the 3 most relevant direct or indirect competitors and produce a sharp competitive analysis.

Respond with ONLY valid JSON:
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

Use real, well-known companies as competitors where relevant. Be analytically honest — do not invent fake companies.
```

Input: `Product challenge: ${challenge}\n\nPRD context:\n${JSON.stringify(prd)}`

### Roadmap agent (`lib/agents/roadmap-agent.ts`)

System prompt:
```
You are a VP of Product planning a 9-month roadmap. Your job is to translate strategy into a phased, prioritised build plan.

Given the product challenge, PRD, and competitive analysis, produce a 3-phase roadmap.

Respond with ONLY valid JSON:
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

Effort guide: S=1 sprint, M=2-3 sprints, L=1-2 months, XL=2+ months
```

Input: challenge + PRD + competitive context.

### Summary agent (`lib/agents/summary-agent.ts`)

System prompt:
```
You are a chief product officer writing a board-ready executive summary.

Synthesise the PRD, competitive analysis, and roadmap into a crisp one-pager that a non-technical executive can read in 90 seconds.

Respond with ONLY valid JSON:
{
  "headline": "one punchy sentence (max 15 words) describing the product opportunity",
  "problem": "2 sentences — the pain, quantified if possible",
  "solution": "2 sentences — what you're building and how it solves the problem",
  "market_opportunity": "1-2 sentences on market size and timing",
  "competitive_edge": "2 sentences on sustainable differentiation",
  "next_steps": ["3-4 concrete immediate actions"],
  "key_metrics": ["4-5 north star metrics to track at launch"]
}

Write for a C-suite audience. Avoid jargon. Be specific about numbers where the context allows.
```

Input: challenge + all three prior outputs.

---

## Streaming API route (`app/api/generate/route.ts`)

This route is the only API endpoint. It receives `{ sessionId, challenge }` from the client, runs the 4 agents, and streams SSE events back. It does NOT touch localStorage — all persistence happens on the client when it receives `agent_complete` events.

```typescript
import { NextRequest } from 'next/server'
import { runPRDAgent } from '@/lib/agents/prd-agent'
import { runCompetitiveAgent } from '@/lib/agents/competitive-agent'
import { runRoadmapAgent } from '@/lib/agents/roadmap-agent'
import { runSummaryAgent } from '@/lib/agents/summary-agent'
import { ArtifactType, SSEEvent } from '@/types'

export async function POST(req: NextRequest) {
  const { sessionId, challenge } = await req.json()

  if (!sessionId || !challenge) {
    return new Response(JSON.stringify({ error: 'Missing sessionId or challenge' }), {
      status: 400,
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
        const prdContent = await runPRDAgent(challenge)
        send({ type: 'agent_complete', agent: 'prd', content: prdContent })

        // Agent 2: Competitive
        send({ type: 'agent_start', agent: 'competitive' })
        const compContent = await runCompetitiveAgent(challenge, prdContent)
        send({ type: 'agent_complete', agent: 'competitive', content: compContent })

        // Agent 3: Roadmap
        send({ type: 'agent_start', agent: 'roadmap' })
        const roadmapContent = await runRoadmapAgent(challenge, prdContent, compContent)
        send({ type: 'agent_complete', agent: 'roadmap', content: roadmapContent })

        // Agent 4: Summary
        send({ type: 'agent_start', agent: 'summary' })
        const summaryContent = await runSummaryAgent(challenge, prdContent, compContent, roadmapContent)
        send({ type: 'agent_complete', agent: 'summary', content: summaryContent })

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
      'Connection': 'keep-alive',
    },
  })
}
```

### Client-side SSE listener pattern (inside `app/session/[id]/page.tsx`)

The session page is responsible for:
1. Reading the session from localStorage on mount
2. If status is `pending`, immediately starting the generation POST
3. Saving each artifact to localStorage as `agent_complete` events arrive
4. Updating session status in localStorage as pipeline progresses

```typescript
'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  getSession, updateSessionStatus, saveArtifact, getSessionWithArtifacts
} from '@/lib/storage'
import { ArtifactType, SessionWithArtifacts, SSEEvent } from '@/types'

export default function SessionPage() {
  const { id } = useParams<{ id: string }>()
  const [sessionData, setSessionData] = useState<SessionWithArtifacts | null>(null)
  const [activeAgent, setActiveAgent] = useState<ArtifactType | null>(null)

  useEffect(() => {
    const session = getSession(id)
    if (!session) return

    if (session.status === 'complete') {
      setSessionData(getSessionWithArtifacts(id))
      return
    }

    // Start generation
    updateSessionStatus(id, 'generating')
    const eventSource = new EventSource(`/api/generate?sessionId=${id}`)
    // Note: EventSource only supports GET; use fetch with ReadableStream instead:
    // Use fetch + ReadableStream to handle POST with SSE
    runGeneration(id, session.challenge)
  }, [id])

  async function runGeneration(sessionId: string, challenge: string) {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, challenge }),
    })

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const event: SSEEvent = JSON.parse(line.slice(6))

        if (event.type === 'agent_start') {
          setActiveAgent(event.agent!)
        }
        if (event.type === 'agent_complete' && event.agent && event.content) {
          saveArtifact(sessionId, event.agent, event.content)
          setSessionData(getSessionWithArtifacts(sessionId))
          setActiveAgent(null)
        }
        if (event.type === 'pipeline_complete') {
          updateSessionStatus(sessionId, 'complete')
          setSessionData(getSessionWithArtifacts(sessionId))
        }
        if (event.type === 'error') {
          updateSessionStatus(sessionId, 'error')
        }
      }
    }
  }

  // ... render sessionData panels
}
```

---

## UI specifications

### Landing page (`app/page.tsx`)

Layout:
- Full viewport, vertically centered content
- Top-left: small logo + "AI PM Copilot" wordmark
- Center: large heading (48px) + subheading
- Large textarea (min 4 rows) with placeholder: "Describe your product challenge. E.g. 'We need to improve retention for our B2B SaaS tool — users churn after 30 days because onboarding is too complex...'"
- Character count display (min 50, max 2000 chars)
- Submit button: "Generate PM Artifacts →"
- Below textarea: 3 example chips the user can click to pre-fill

On submit:
1. Call `createSession(challenge)` from `lib/storage.ts` — generates a UUID client-side, writes to localStorage
2. Redirect to `/session/[id]`
3. Button shows spinner during the brief localStorage write

Example chips:
- "Improve retention in a B2B SaaS product with complex onboarding"
- "Launch an AI-powered feature for a mobile consumer app"
- "Build a marketplace for freelance designers targeting SMBs"

### Session page (`app/session/[id]/page.tsx`)

Layout:
- Narrow header: challenge text (truncated), session ID, "New session" link
- Progress bar: 4 steps (PRD → Competitive → Roadmap → Summary), each fills as agents complete
- 2×2 grid of agent panels (stacks to 1 column on mobile)
- When all complete: "Export as PDF" button appears (prominent, top right)

Agent panel states:
- `idle`: grayed out, agent name + icon, "Waiting..."
- `generating`: subtle pulse animation on border, spinner icon, "Thinking..."
- `complete`: full content rendered (see below)

#### PRD panel — when complete:
- Section header: "Product Requirements Document"
- Background: italic paragraph
- Problem statement: bold callout box
- Goals: numbered list
- User Stories: 3-column table (Persona | Want | So That)
- Success Metrics: table (Metric | Target | Timeframe)

#### Competitive panel — when complete:
- Section header: "Competitive Analysis"
- Market context: paragraph
- 3 competitor cards side by side: name, description, strengths (green tags), weaknesses (red tags), our differentiator (blue callout)
- Strategic gap: highlighted text block

#### Roadmap panel — when complete:
- Section header: "Product Roadmap"
- Strategic rationale: paragraph
- Phase tabs (Phase 1 / 2 / 3) — default open on Phase 1
- Per phase: table with columns Feature | Priority (color-coded badge) | Effort | Rationale
- Priority colors: Must Have = red, Should Have = amber, Nice to Have = gray

#### Summary panel — when complete:
- Section header: "Executive Summary"
- Headline: large bold text (24px)
- 2-column layout: left = Problem/Solution/Market/Competitive Edge as labeled paragraphs, right = Next Steps + Key Metrics as bullet lists

### Color palette

Use this Tailwind palette consistently:
- Background: `gray-50`
- Cards: `white` with `border border-gray-200`
- Primary accent: `indigo-600` (buttons, links, active states)
- Success: `emerald-600`
- Warning: `amber-500`
- Danger: `red-500`
- Text primary: `gray-900`
- Text secondary: `gray-500`
- "Generating" pulse: `indigo-100` border with animation

### Typography
- Headings: `font-semibold tracking-tight`
- Body: `text-sm text-gray-700 leading-relaxed`
- Labels/badges: `text-xs font-medium uppercase tracking-wide`
- Code/IDs: `font-mono text-xs`

---

## PDF export (`components/pdf/ReportDocument.tsx`)

Use `@react-pdf/renderer`. The document must have 4 clearly separated sections:
1. Cover page: challenge text, date generated, "AI PM Copilot" branding
2. PRD section with all fields
3. Competitive Analysis section
4. Roadmap section (table format)
5. Executive Summary section

The `ExportButton` component:
```typescript
'use client'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { ReportDocument } from './pdf/ReportDocument'
import { SessionWithArtifacts } from '@/types'

export function ExportButton({ session }: { session: SessionWithArtifacts }) {
  return (
    <PDFDownloadLink
      document={<ReportDocument session={session} />}
      fileName={`pm-copilot-${session.id.slice(0, 8)}.pdf`}
    >
      {({ loading }) => (
        <button className="...tailwind classes...">
          {loading ? 'Preparing PDF...' : 'Export as PDF'}
        </button>
      )}
    </PDFDownloadLink>
  )
}
```

---

## `vercel.json`

```json
{
  "functions": {
    "app/api/generate/[sessionId]/route.ts": {
      "maxDuration": 300
    }
  }
}
```

The generate route can take up to ~60 seconds for all 4 agents. Set maxDuration to 300 to be safe. This requires a Vercel Pro account (which Samuel has).

---

## Error handling requirements

Every async operation must have explicit error handling:
- API route: return `{ error: string }` with appropriate HTTP status
- Agent functions: throw typed errors with context
- Client SSE reader: handle `error` event type and show inline error state with retry button
- localStorage reads: always guard with `isClient` check and null-check the result
- Session page: if session status is `error`, show a retry button that re-triggers generation

---

## Accessibility requirements

- All interactive elements must have `aria-label` attributes
- Color is never the only indicator of state (always pair with text/icon)
- Keyboard navigation works for all controls
- Focus ring visible on all focusable elements (`focus:ring-2 focus:ring-indigo-500`)

---

## Performance requirements

- Use `loading.tsx` files for all routes
- Artifact panels use React Suspense boundaries
- PDF export is lazy-loaded (only import `@react-pdf/renderer` on client after interaction)
- No `useEffect` polling — use SSE for real-time updates

---

## README requirements

The README must include:
1. What it does (3 sentences max)
2. Live demo URL (fill in after deploy)
3. Architecture diagram (ASCII is fine)
4. Local setup steps (clone → set ANTHROPIC_API_KEY in .env.local → npm run dev)
5. How the agent pipeline works
6. Tech stack table
7. Screenshot (placeholder note: "add screenshot after first deploy")

---

## Definition of done

The project is complete when:
- [ ] All 4 agents run successfully end-to-end on a real challenge input
- [ ] Streaming status updates work (panels activate as each agent completes)
- [ ] Sessions persist in localStorage and survive page refresh (re-opening `/session/[id]` shows the completed artifacts)
- [ ] PDF export downloads a readable, well-formatted document
- [ ] App is deployed to Vercel with a public URL
- [ ] No TypeScript errors (`tsc --noEmit` passes)
- [ ] Mobile layout works at 375px width
- [ ] Error states are handled gracefully (no blank screens, no raw error objects)

---

## Starting command

```bash
npx create-next-app@latest ai-pm-copilot --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd ai-pm-copilot
```

Then implement in phase order. Do not skip phases or reorder them.
