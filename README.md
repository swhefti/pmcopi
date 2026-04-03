# AI PM Copilot

A full-stack web app where you describe a product challenge and a 4-agent AI pipeline generates a complete PM artifact pack: PRD, competitive analysis, roadmap, and executive summary. Each artifact streams live. Export everything to PDF.

**Live Demo:** https://ai-pm-copilot.vercel.app

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Client                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │ Landing     │    │ Session     │    │ localStorage        │  │
│  │ Page        │───>│ Page        │<──>│ (sessions, artifacts)│  │
│  └─────────────┘    └──────┬──────┘    └─────────────────────┘  │
│                            │ SSE                                 │
└────────────────────────────┼────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                          Server                                  │
│                   ┌────────▼────────┐                           │
│                   │ POST /api/generate │                         │
│                   └────────┬────────┘                           │
│                            │                                     │
│    ┌───────────────────────┼───────────────────────┐            │
│    │                       ▼                       │            │
│    │   ┌─────┐  ┌──────────────┐  ┌────────┐  ┌───────┐        │
│    │   │ PRD │─>│ Competitive  │─>│Roadmap │─>│Summary│        │
│    │   │Agent│  │    Agent     │  │ Agent  │  │ Agent │        │
│    │   └─────┘  └──────────────┘  └────────┘  └───────┘        │
│    │                 Agent Pipeline                  │           │
│    └─────────────────────────────────────────────────┘           │
│                            │                                     │
│                    ┌───────▼───────┐                            │
│                    │ Anthropic API │                            │
│                    │ (Claude)      │                            │
│                    └───────────────┘                            │
└──────────────────────────────────────────────────────────────────┘
```

## Local Setup

```bash
# Clone the repo
git clone https://github.com/swhefti/pmcopi.git
cd pmcopi

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY

# Start development server
npm run dev
```

Open http://localhost:3000 in your browser.

## How the Agent Pipeline Works

1. **PRD Agent** - Generates a structured Product Requirements Document with background, problem statement, goals, user stories, and success metrics.

2. **Competitive Agent** - Analyzes the market, identifies 3 real competitors with strengths/weaknesses, and finds the strategic gap.

3. **Roadmap Agent** - Creates a 3-phase, 9-month roadmap with prioritized features and effort estimates.

4. **Summary Agent** - Synthesizes everything into a board-ready executive summary.

Each agent receives the outputs of previous agents as context, building on the analysis sequentially. Results stream via SSE so you see progress in real-time.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| AI | Anthropic Claude API |
| PDF | @react-pdf/renderer |
| Persistence | localStorage |
| Deployment | Vercel |

## Project Structure

```
app/
├── page.tsx              # Landing page with input form
├── session/[id]/page.tsx # Session page with streaming results
└── api/generate/route.ts # SSE streaming endpoint

components/
├── InputForm.tsx         # Challenge input with examples
├── AgentPanel.tsx        # Artifact display with renderers
├── ProgressBar.tsx       # Agent completion progress
├── ExportButton.tsx      # PDF download trigger
└── pdf/ReportDocument.tsx # PDF layout

lib/
├── storage.ts            # localStorage abstraction
├── anthropic.ts          # Anthropic client
└── agents/               # Agent implementations
```

## Screenshot

*(Add screenshot after deployment)*

---

Built with Claude by Samuel Hefti
