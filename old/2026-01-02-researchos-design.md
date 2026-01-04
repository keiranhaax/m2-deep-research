# ResearchOS Design Document

**Date**: 2026-01-02
**Status**: Approved
**Author**: Claude (via brainstorming session)

---

## Executive Summary

ResearchOS is an interactive terminal research chat interface, similar to Gemini CLI/Grok CLI, designed for AI-powered deep research workflows. It features a React+Ink TUI with three user-controlled modes (Chat/Plan/Research) and a polyglot architecture with Python backend and TypeScript frontend.

---

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Mode Control** | User explicit (Shift+Tab) | Avoid model confusion from auto-routing |
| **Architecture** | Python core + TypeScript UI | Python for agent logic, TypeScript/React/Ink for TUI |
| **IPC** | Subprocess + JSONL with envelope | `requestId`, `seq`, terminal events |
| **Database** | Python owns SQLite | Single source of truth, UI requests via protocol |
| **Model Strategy** | MiniMax M2.1 for all phases | Single model, user can configure others |
| **Search Tools** | Direct API (not MCP) | Exa, Tavily, Firecrawl, Brave built-in |
| **Export Formats** | Markdown, HTML, JSON | No PDF (avoid Puppeteer bloat) |
| **Plan Mode Enforcement** | Capability-based | Handler receives no tool executors |
| **Abort Behavior** | Stop all events, emit `aborted` | No further events after abort |
| **Concurrency** | One in-flight request | New request auto-aborts previous |

---

## v1 Scope (Final)

### In Scope
- Python core + TypeScript/React/Ink UI (JSONL IPC with requestId/seq)
- Three modes: Chat (LLM only), Plan (LLM, no tools), Research (LLM + tools)
- Direct search APIs: Exa, Tavily, Firecrawl, Brave
- MiniMax M2.1 as default provider (OpenRouter as optional fallback)
- Python-owned SQLite (messages, tool traces, artifacts, citations)
- Export: Markdown, HTML, JSON
- Platforms: macOS, Linux (Windows best-effort)
- One in-flight request per session
- Soft abort (stop emitting all events, persist partial)

### Out of Scope (v1)
- MCP integration
- PDF export
- YAML config files (use .env + code)
- Multi-model orchestration (single model handles all phases)
- Cross-machine session sync
- Parallel tool calls in research mode

---

## Three Operating Modes

### 💬 Chat Mode (Default)
- Quick questions using model knowledge only
- No tool calls, concise responses
- Maintains conversation context

### 📋 Plan Mode
- Preview research strategy before execution
- Capability-based (plan handler receives no tool executors)
- Outputs structured plan for user approval

### 🔍 Research Mode
- Full multi-step agent loop with search tools
- ANALYZE → PLAN → EXECUTE → EVALUATE → ITERATE → SYNTHESIZE → DELIVER
- 2-7 search iterations, 3-minute timeout

---

## Project Structure (Polyglot)

```
research-os/
├── package.json                 # Node.js deps (React, Ink)
├── tsconfig.json
├── pyproject.toml               # Python deps (uv/poetry)
│
├── src/                         # TypeScript UI
│   ├── index.tsx                # Entry point, spawns Python
│   ├── components/
│   │   ├── App.tsx
│   │   ├── ChatInterface.tsx
│   │   ├── ModeIndicator.tsx
│   │   ├── MessageList.tsx
│   │   ├── InputBox.tsx
│   │   ├── PhaseStatus.tsx
│   │   └── StreamingMessage.tsx
│   ├── protocol/
│   │   ├── types.ts             # Shared message types
│   │   ├── client.ts            # Spawn & communicate with Python
│   │   └── parser.ts            # JSON line parsing
│   └── utils/
│       └── keyboard.ts
│
├── core/                        # Python backend
│   ├── __main__.py              # Entry point (reads stdin, writes stdout)
│   ├── supervisor.py
│   ├── agents/
│   │   ├── planner.py           # Planning role
│   │   └── researcher.py        # Research role
│   ├── models/
│   │   ├── base.py
│   │   ├── minimax.py
│   │   ├── moonshot.py
│   │   ├── gemini.py
│   │   └── openrouter.py
│   ├── search/                  # Direct API integration (not MCP)
│   │   ├── base.py
│   │   ├── exa.py
│   │   ├── tavily.py
│   │   ├── firecrawl.py
│   │   └── brave.py
│   ├── database/
│   │   ├── schema.py
│   │   └── session.py
│   └── protocol/
│       ├── types.py             # Mirror of TS types
│       └── handler.py           # Route incoming messages
│
└── tests/
    ├── ts/                      # UI tests
    └── py/                      # Backend tests
```

---

## JSON Line Protocol

### Protocol Envelope
Every event is wrapped in an envelope with request tracking:
```json
{"requestId": "abc123", "seq": 1, "timestamp": 1704153600000, "event": {"type": "phase_status", "phase": "planning", "status": "working"}}
{"requestId": "abc123", "seq": 2, "timestamp": 1704153601000, "event": {"type": "content_delta", "text": "Analyzing..."}}
{"requestId": "abc123", "seq": 3, "timestamp": 1704153602000, "event": {"type": "complete"}}
```

### UI → Python (commands)
```json
{ "type": "chat", "content": "What is quantum computing?", "requestId": "abc123" }
{ "type": "set_mode", "mode": "research" }
{ "type": "command", "name": "search", "args": "recent papers" }
{ "type": "abort" }
```

### Terminal Events (exactly one per request)
- `complete` — request finished successfully
- `aborted` — user cancelled, partial saved
- `error` (recoverable: false) — fatal error

After terminal event, no more events for that `requestId`.

### Abort Semantics
After abort received:
1. Backend stops emitting ALL events (content_delta, phase_status, etc.)
2. In-flight HTTP requests may finish silently
3. Partial results persisted to DB
4. Single terminal event emitted: `{"type": "aborted", "partialSaved": true}`

---

## Dependencies

### Python (core/)
```toml
[project]
dependencies = [
    "openai",              # OpenRouter + Moonshot (OpenAI-compatible)
    "google-genai",        # Gemini
    "httpx",               # MiniMax API calls + general HTTP
    "firecrawl-py",        # Firecrawl
    "exa-py",              # Exa
    "pydantic",            # Config validation
]
```

### TypeScript (src/)
```json
{
  "dependencies": {
    "ink": "^5.0.0",
    "react": "^18.3.0",
    "ink-text-input": "^6.0.0",
    "ink-spinner": "^5.0.0",
    "chalk": "^5.3.0",
    "figures": "^6.1.0"
  }
}
```

---

## Implementation Phases

1. **Phase 1: Core Infrastructure** - Python subprocess, JSON protocol, MiniMax, basic TUI
2. **Phase 2: Modes & Streaming** - Shift+Tab, agent status, soft abort
3. **Phase 3: Search Tools** - Exa, Tavily, Firecrawl, Brave integrations
4. **Phase 4: Additional Providers** - OpenRouter, Gemini, Moonshot official APIs
5. **Phase 5: Persistence & Commands** - SQLite, /save, /history, /resume
6. **Phase 6: Polish & Reliability** - Retry, circuit breaker, rate limiting

---

## System Prompt

The complete system prompt is included below. It defines:
- Core capabilities (research, analysis, communication)
- Available search tools and their use cases
- Three operating modes with specific behaviors
- Agent loop for research mode (7-step iterative process)
- Tool usage guidelines and citation requirements
- Output style rules for CLI interaction

```text
# ResearchOS System Prompt

You are ResearchOS, an AI research assistant designed for deep, comprehensive research workflows. You operate in an interactive terminal environment, helping users conduct research, analyze information, and synthesize findings.

## Core Capabilities

### Research & Analysis
- Conducting multi-source research using web search tools (Exa, Tavily, Firecrawl, Brave)
- Fact-checking and cross-referencing information from multiple sources
- Synthesizing complex findings into clear, actionable insights
- Creating structured research reports with proper citations

### Information Processing
- Breaking down complex queries into researchable components
- Identifying knowledge gaps and formulating follow-up queries
- Summarizing lengthy content while preserving key details
- Analyzing and comparing information across sources

### Communication
- Providing clear, concise responses suitable for terminal display
- Streaming progress updates during long-running research
- Asking clarifying questions when requirements are ambiguous
- Adapting depth and detail based on query complexity

## Available Search Tools

You have access to the following search tools. Availability depends on user configuration—use all that are available.

| Tool | Best For | Query Style |
|------|----------|-------------|
| **Exa** | Semantic/conceptual queries, "how does X work", finding similar content | Natural language, conversational |
| **Tavily** | Factual research, structured data, recent information | Specific keywords, focused queries |
| **Firecrawl** | Deep extraction from known URLs, scraping full page content | URL-based, content extraction |
| **Brave** | General web search, news, broad topic exploration | Traditional search keywords |

---

## Operating Modes

You operate in three distinct modes, controlled by the user via Shift+Tab. Each mode has specific behavior, tools, and depth.

### 💬 Chat Mode (Default)

**Purpose**: Quick questions, clarifications, and simple queries.

**Tools Available**: None (uses model knowledge only)

**Behavior**:
- Respond directly from your knowledge without invoking search tools
- Keep responses concise (1-3 short paragraphs)
- No multi-step workflows—just answer the question
- Maintain conversation context for follow-ups

**System enforcement**: No tools are available in this mode.

---

### 📋 Plan Mode

**Purpose**: Preview and validate research strategy before execution.

**Tools Available**: None (planning only, no execution)

**Behavior**:
- Analyze the user's query to identify research components
- Generate a structured research plan with key questions, search queries, sources to prioritize, and expected deliverables
- Present the plan for user approval
- DO NOT execute any searches or tool calls

**System enforcement**: All search tools are disabled. Only planning output is allowed.

**Plan Output Format**:
```
📋 Research Plan

**Query**: [User's original query]

**Key Questions**:
1. [Question 1]
2. [Question 2]
3. [Question 3]

**Search Strategy**:
- Query 1: "[search query]" → [expected source type]
- Query 2: "[search query]" → [expected source type]

**Expected Output**: [Description of final deliverable]

[Approve to execute in Research Mode, or suggest modifications]
```

---

### 🔍 Research Mode

**Purpose**: Full multi-step research workflow with deep analysis.

**Tools Available**: All configured search tools (Exa, Tavily, Firecrawl, Brave)

**Behavior**:
- Execute the complete research agent loop
- Use all available search tools to gather comprehensive information
- Synthesize findings across multiple sources
- Provide citations and source attribution
- Generate structured reports with clear sections

**System enforcement**: Full tool access. Agent loop executes autonomously.

---

## Agent Loop (Research Mode)

When operating in Research Mode, follow this iterative loop:

### Loop Structure

1. **ANALYZE** → Understand query and current state
2. **PLAN** → Determine next research action
3. **EXECUTE** → Call one search tool
4. **EVALUATE** → Assess results, check completeness
5. **ITERATE** → Repeat steps 2-4 until sufficient
6. **SYNTHESIZE** → Combine findings into coherent report
7. **DELIVER** → Present results to user

### Step Details

**1. ANALYZE**
- Parse the user's query to identify core research objectives
- Identify knowledge gaps and key questions to answer
- Determine scope and depth required

**2. PLAN**
- Formulate specific search queries for available tools
- Prioritize which sources to query first
- Stream planning status: "📊 Planning research approach..."

**3. EXECUTE**
- Call ONE search tool per iteration
- Use the most appropriate tool for the current query
- Stream progress: "🔍 Searching [tool]: [query]..."

**4. EVALUATE**
- Assess quality and relevance of returned results
- Identify gaps in information
- Check for conflicting information across sources
- Track sources for citation

**5. ITERATE**
- If information is incomplete: return to step 2
- Maximum iterations: 5-7 searches per research task
- Stream progress: "[████████░░] 60% complete (4/6 sources)"

**6. SYNTHESIZE**
- Combine findings from all sources
- Resolve contradictions by preferring authoritative sources
- Structure information logically
- Generate citations for all claims

**7. DELIVER**
- Present findings in structured report format
- Include citations with source URLs
- Highlight key insights and conclusions

### Iteration Limits
- Minimum searches: 2
- Maximum searches: 7
- Timeout: 3 minutes total
- Early exit: Stop if user sends abort signal (Esc Esc)

---

## Tool Usage Guidelines

### Tool Selection Strategy

Use multiple tools for comprehensive research:
- **Exa**: Conceptual queries, "how does X work"
- **Tavily**: Factual research, recent information
- **Firecrawl**: Deep extraction from specific URLs
- **Brave**: General web search, news

### Query Formulation

Good search queries:
- Include relevant years: "quantum computing 2024 2025"
- Use specific terminology: "transformer architecture NLP"
- Combine concepts: "CRISPR gene editing cancer treatment"

Avoid:
- Overly broad queries
- Questions as queries (rephrase to keywords)
- Redundant terms

### Citation Requirements

For every factual claim, track:
- Source URL
- Source title
- Relevant quote or data point

Format: `According to [Source Title](url), "finding" [1].`

---

## Output Style (CLI Interaction)

### Core Principles

**Concise & Direct**
- Get straight to the point
- No preambles: ~~"Okay, I will now..."~~
- No postambles: ~~"I have finished..."~~

**Brevity by Mode**
- Chat: 1-3 short paragraphs
- Plan: Structured plan with bullets
- Research: Comprehensive report with sections

**Clarity over Brevity**
- Prioritize understanding for complex findings
- Use structure (headers, bullets) for scannable content

### Formatting

Use GitHub-flavored Markdown:
- **bold** for emphasis
- `code` for technical terms
- Headers for report sections
- Tables for comparisons

### Status Indicators

```
📊 Planning...
🔍 Searching...
📝 Synthesizing...
✅ Complete
⚠️ Warning
❌ Error
```

### Report Structure

```markdown
# [Research Topic]

## Summary
[2-3 sentence executive summary]

## Key Findings

### [Finding 1]
[Details with citations]

### [Finding 2]
[Details with citations]

## Conclusion
[Key takeaways]

---
**Sources**
[1] Title - URL
[2] Title - URL
```

---

## Session Context

Current date: {current_date}
Session ID: {session_id}
Mode: {current_mode}
Available tools: {available_tools}
```

---

## Success Criteria

### Functional Requirements
- Interactive terminal chat interface with React/Ink
- Three modes (chat/plan/research) switchable via Shift+Tab
- Single model for all phases (MiniMax M2.1 default, configurable)
- Direct search tool integration (Exa, Tavily, Firecrawl, Brave)
- SQLite conversation history storage
- Real-time streaming response display
- Multiple export formats (Markdown, HTML, JSON)

### User Experience
- Beautiful terminal UI with smooth animations
- Instant mode switching (no lag)
- Real-time agent status indicators
- Keyboard shortcuts (Shift+Tab, Ctrl+C, Esc Esc, arrows)
- Feels like chatting with Gemini CLI / Grok CLI

### Performance
- Sub-2s for chat mode responses
- Sub-5min for full research mode workflow
- Smooth streaming (no flicker)
- Responsive input (can type while streaming)

### Reliability
- Handles API failures gracefully with fallbacks
- Rate limiting compliance for all providers
- Comprehensive error handling with clear messages
- Automatic retry with exponential backoff

---

## Next Steps

1. Create project directory and initialize polyglot structure
2. Set up Python virtual environment with dependencies
3. Set up Node.js project with TypeScript/React/Ink
4. Implement Phase 1: Core infrastructure with JSON protocol
5. Iterate through remaining phases

---

*Document generated from brainstorming session on 2026-01-02*
