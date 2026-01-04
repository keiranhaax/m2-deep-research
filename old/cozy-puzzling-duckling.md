# ResearchOS: Interactive Terminal Research Chat

## Overview
Build an interactive terminal chat interface (like Gemini CLI / Grok CLI) for AI-powered research. Uses React + Ink for rich TUI, with three modes (chat/plan/research) switchable via Shift+Tab. MiniMax M2.1 handles all phases in v1 (multi-model orchestration planned for v1.1+).

## Core Concept
**Interactive terminal chat that feels like chatting with an AI research assistant.** Think Gemini CLI but specialized for deep research workflows.

## User Experience Flow

### Terminal Interface
```
┌─────────────────────────────────────────────────────────────┐
│  ResearchOS v1.0                         Mode: 🔍 Research  │
│  Session: research-abc123                    [Shift+Tab]    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  You: Tell me about quantum computing in drug discovery     │
│                                                              │
│  🤖 Assistant (Planning with Gemini):                       │
│  Breaking down your query into research components...       │
│                                                              │
│  📊 Research Plan:                                          │
│  1. Quantum computing fundamentals                          │
│  2. Drug discovery applications                             │
│  3. Current industry implementations                        │
│                                                              │
│  🔬 Researcher (Kimi K2):                                   │
│  Executing deep research with web search...                 │
│  [████████████████░░░░] 80% (3/5 sources analyzed)         │
│                                                              │
│  📝 Supervisor (M2.1):                                      │
│  Synthesizing findings from 15 sources...                   │
│                                                              │
│  [Streaming response appears here in real-time...]          │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  › /search for recent papers | /save report.md | /help    │
└─────────────────────────────────────────────────────────────┘
```

### Three Modes (Switch with Shift+Tab)

**💬 Quick Chat Mode**
- Default mode for fast questions
- Uses MiniMax M2.1 only (no multi-agent workflow)
- Instant responses, maintains conversation context
- Perfect for clarifications and simple queries

**📋 Plan Mode**
- Supervisor creates research plan but doesn't execute
- Shows what would be researched
- User can approve/modify before execution
- Gemini 3 Flash generates structured plan

**🔍 Research Mode**
- Full multi-agent workflow (Planning → Research → Synthesis)
- Gemini plans, Kimi researches, M2.1 synthesizes
- Shows progress for each agent
- Generates comprehensive reports

### Architecture

**Supervisor Pattern with Interactive TUI**
```
User Input (React/Ink UI)
    ↓
Mode Router (chat | plan | research)
    ↓
┌─────────── Research Mode ───────────┐
│  MiniMax M2.1 (all phases)          │
│      ├─→ Planning phase             │
│      ├─→ Research phase             │
│      └─→ Direct APIs (web search)   │
└─────────────────────────────────────┘
    ↓
Streaming Display (React Components)
    ↓
SQLite Database (conversation history)
```

## Project Structure (Polyglot)

```
research-os/
├── package.json                 # Node.js deps (React, Ink, zod)
├── tsconfig.json
├── pyproject.toml               # Python deps (uv)
├── .env.example
│
├── src/                         # TypeScript UI
│   ├── index.tsx                # Entry point, spawns Python
│   ├── components/
│   │   ├── App.tsx
│   │   ├── ChatInterface.tsx
│   │   ├── ModeIndicator.tsx
│   │   ├── MessageList.tsx
│   │   ├── InputBox.tsx
│   │   ├── PhaseStatus.tsx      # Shows current workflow phase
│   │   ├── ProgressBar.tsx
│   │   └── StreamingMessage.tsx
│   ├── protocol/
│   │   ├── types.ts             # Discriminated union + zod validation
│   │   ├── client.ts            # Spawn Python, manage stdin/stdout
│   │   └── parser.ts            # JSONL parsing with buffering
│   └── utils/
│       └── keyboard.ts          # Key detection + fallbacks
│
├── core/                        # Python backend
│   ├── __main__.py              # Entry point (stdin → stdout JSONL)
│   ├── supervisor.py            # Orchestration
│   ├── handlers/
│   │   ├── chat.py              # Chat mode (LLM only)
│   │   ├── plan.py              # Plan mode (LLM, no tools injected)
│   │   └── research.py          # Research mode (LLM + tools)
│   ├── models/
│   │   ├── base.py              # Abstract provider
│   │   ├── minimax.py           # MiniMax M2.1
│   │   └── openrouter.py        # Fallback (optional)
│   ├── search/                  # Direct API integration
│   │   ├── base.py
│   │   ├── exa.py
│   │   ├── tavily.py
│   │   ├── firecrawl.py
│   │   └── brave.py
│   ├── database/
│   │   ├── schema.py            # SQLite schema
│   │   ├── session.py           # Session CRUD
│   │   └── migrations/
│   └── protocol/
│       ├── types.py             # Pydantic models mirroring TS
│       └── emitter.py           # JSONL event emission
│
└── tests/
    ├── ts/                      # UI + protocol tests
    └── py/                      # Backend + integration tests
```

## Cherry-Picked Features

### From m2-deep-research
- ✅ Supervisor pattern with interleaved thinking
- ✅ Rich CLI with beautiful formatting
- ✅ Academic report generation with citations
- ✅ Real-time streaming display
- ✅ Multi-phase workflow orchestration

### From Goose
- ✅ Lead/worker supervisor pattern (v1.1+: multi-model)
- ✅ Environment-based configuration
- ✅ Multiple model provider support

### From CrewAI
- ✅ YAML-based agent configuration
- ✅ Role-based agent system
- ✅ Task delegation framework
- ✅ Sequential and parallel execution

### From MassGen
- ✅ Parallel async execution
- ✅ Real-time structured logging
- ✅ Multi-model consensus (v1.1+)
- ✅ Clean modular architecture

## API Integration Strategy

### Model Providers

**MiniMax M2.1** (v1 Default — All Phases)
- Base URL: `https://api.minimax.chat`
- Uses httpx adapter for MiniMax REST API
- Supports streaming for interleaved thinking
- Max tokens: 4096

**v1.1+ Planned Providers:**

**Moonshot Kimi K2** (Research — v1.1+)
- Base URL: `https://api.moonshot.ai/v1`
- OpenAI-compatible API
- Excellent at tool calling for web search
- Max tokens: 8192

**Google Gemini 3 Flash** (Planning — v1.1+)
- SDK: `google-generativeai`
- Fast query planning and decomposition
- Max tokens: 2048

**OpenRouter** (Fallback)
- Unified API for multiple models
- Automatic failover if primary models unavailable

### Rate Limiting
- MiniMax: 60 req/min
- Moonshot: 100 req/min
- Gemini: 120 req/min
- OpenRouter: 30 req/min

## CLI Usage

### Launch Command

```bash
# Start interactive terminal chat
research-os

# Resume specific session
research-os --session research-abc123

# Start in specific mode
research-os --mode research
```

### Slash Commands (In-Session)

**Research Commands:**
```
/research <query>      Trigger full research workflow (plan → research → synthesis)
/search <query>        Quick web search without full workflow
```

**Session Management:**
```
/save [filename]       Export current conversation or report
                       Formats: .md, .html, .json
/history               Show recent sessions
/resume <session-id>   Load previous session
```

**Model & Config:**
```
/models                Show current model configuration
/switch <model>        Switch supervisor model temporarily
/config                Show current settings
```

**Help:**
```
/help                  Show all commands
/about                 About ResearchOS
```

### Keyboard Shortcuts

```
Shift+Tab              Switch modes (chat ↔ plan ↔ research)
Ctrl+C                 Cancel current generation
Ctrl+D                 Exit application
Esc Esc                Abort streaming (double-tap)
Up/Down Arrow          Navigate command history
```

### Keyboard Fallbacks

Some terminals don't reliably detect Shift+Tab or Esc Esc. Fallback commands:

| Primary | Fallback | Action |
|---------|----------|--------|
| `Shift+Tab` | `/mode` | Cycle modes (chat → plan → research) |
| `Esc Esc` | `/abort` | Abort current request |
| `Ctrl+C` | — | Exit application |

## Configuration System

### Environment Variables (.env)
```bash
MINIMAX_API_KEY=sk-...
MOONSHOT_API_KEY=sk-...
GOOGLE_API_KEY=AIza...
OPENROUTER_API_KEY=sk-...
```

### Agent Configuration (config/agents.yaml)
```yaml
agents:
  supervisor:
    name: "Research Supervisor"
    model: minimax-m2.1
    role: "Coordinate research workflow and synthesize findings"
    temperature: 0.7
    max_tokens: 4096

  planner:
    name: "Query Planner"
    model: gemini-3-flash
    role: "Analyze query and create research strategy"
    temperature: 0.5
    max_tokens: 2048

  researcher:
    name: "Deep Researcher"
    model: kimi-k2
    role: "Execute research and synthesize information"
    temperature: 0.6
    max_tokens: 8192
    tools: [web_search, academic_search, document_reader]
```

### Workflow Configuration (config/workflows.yaml)
```yaml
workflows:
  deep_research:
    steps:
      - name: planning
        agent: planner
        timeout: 60
        retry: 3

      - name: research
        agent: researcher
        timeout: 180
        parallel_tasks: 3
        retry: 2

      - name: synthesis
        agent: supervisor
        timeout: 120
        requires: [planning, research]
```

## Core Implementation Details

### BaseModelProvider Interface
```python
# src/research_os/models/base.py
from abc import ABC, abstractmethod
from typing import AsyncIterator

class BaseModelProvider(ABC):
    @abstractmethod
    async def complete(
        self,
        messages: list[dict],
        temperature: float = 0.7,
        stream: bool = False
    ) -> str | AsyncIterator[str]:
        """Generate completion"""
        pass

    @abstractmethod
    async def complete_with_tools(
        self,
        messages: list[dict],
        tools: list[dict]
    ) -> dict:
        """Generate completion with tool calling"""
        pass

    @abstractmethod
    async def health_check(self) -> bool:
        """Check API availability"""
        pass
```

### Supervisor Orchestration
```python
# src/research_os/core/supervisor.py
class Supervisor:
    """MiniMax M2.1 supervisor orchestrating workflow"""

    def __init__(
        self,
        model: BaseModelProvider,
        planner: PlanningAgent,
        researcher: ResearchAgent
    ):
        self.model = model
        self.planner = planner
        self.researcher = researcher
        self.workflow_state = WorkflowState()

    async def execute_research(
        self,
        query: str,
        depth: str = "deep",
        display: StreamingDisplay = None
    ) -> ResearchReport:
        """Execute full research workflow"""

        # Phase 1: Planning (Gemini)
        plan = await self.planner.execute(
            Task(query=query, type="planning"),
            self.workflow_state
        )

        # Phase 2: Research (Kimi K2)
        research_results = await self.researcher.execute(
            Task(query=query, type="research", research_plan=plan.content),
            self.workflow_state
        )

        # Phase 3: Synthesis (M2.1)
        report = await self._synthesize_report(query, plan, research_results)

        return report
```

### Workflow State Machine
```python
# src/research_os/core/workflow.py
from enum import Enum

class WorkflowPhase(Enum):
    INIT = "init"
    PLANNING = "planning"
    RESEARCH = "research"
    SYNTHESIS = "synthesis"
    REVIEW = "review"
    COMPLETE = "complete"
    ERROR = "error"

@dataclass
class WorkflowState:
    phase: WorkflowPhase = WorkflowPhase.INIT
    query: str = ""
    plan: Optional[dict] = None
    research_results: list = field(default_factory=list)
    report: Optional[str] = None
    iterations: int = 0
    max_iterations: int = 3
```

## Error Handling & Reliability

### Retry with Exponential Backoff
```python
@async_retry(max_attempts=3, backoff_factor=2.0)
async def call_api(endpoint, payload):
    async with httpx.AsyncClient() as client:
        response = await client.post(endpoint, json=payload)
        response.raise_for_status()
        return response.json()
```

### Circuit Breaker Pattern
- Track failures per provider
- Open circuit after 5 consecutive failures
- Half-open state for recovery testing
- Automatic reset on success

### Fallback Chain
1. Primary model (MiniMax/Kimi/Gemini)
2. OpenRouter fallback
3. Graceful degradation with error message

## Key Dependencies

### TypeScript (src/)
```json
{
  "name": "research-os",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "research-os": "./dist/index.js"
  },
  "dependencies": {
    "ink": "^5.0.0",
    "react": "^18.3.0",
    "ink-text-input": "^6.0.0",
    "ink-spinner": "^5.0.0",
    "chalk": "^5.3.0",
    "figures": "^6.1.0",
    "zod": "^3.23.0",
    "nanoid": "^5.0.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "@types/node": "^22.0.0",
    "@types/react": "^18.3.0",
    "tsx": "^4.19.0",
    "vitest": "^2.0.0",
    "esbuild": "^0.23.0"
  }
}
```

### Python (core/)
```toml
[project]
dependencies = [
    "httpx",               # MiniMax API calls + general HTTP
    "openai",              # OpenRouter (OpenAI-compatible)
    "exa-py",              # Exa search
    "tavily-python",       # Tavily search
    "firecrawl-py",        # Firecrawl
    "pydantic",            # Config validation
]
```

## Implementation Phases

### Phase 1: Basic TUI & Chat Mode (Week 1-2)
**Goal**: Working interactive terminal chat with MiniMax M2.1

**Tasks**:
1. Initialize Node.js/TypeScript project
2. Set up React + Ink basic app structure
3. Create basic chat interface components (App, ChatInterface, MessageList, InputBox)
4. Implement configuration system (dotenv + YAML)
5. Integrate MiniMax M2.1 API client
6. Build simple chat mode (no multi-agent yet)
7. Add streaming response display
8. Implement SQLite session storage
9. Add basic logging

**Validation**:
```bash
# Launch terminal chat
research-os

# Should show interactive chat interface
# Type query → see streaming M2.1 response
# Messages saved to SQLite
```

**Critical Files**:
- `src/index.tsx` - Entry point
- `src/components/App.tsx` - Root component
- `src/components/ChatInterface.tsx` - Main UI
- `src/models/base.ts` - Model provider interface
- `src/models/minimax.ts` - MiniMax integration
- `src/database/schema.ts` - SQLite schema
- `src/config/settings.ts` - Configuration

---

### Phase 2: Mode Switching & Multi-Model (Week 3-4)
**Goal**: Add three modes (chat/plan/research) with Shift+Tab switching

**Tasks**:
1. Implement keyboard handler for Shift+Tab
2. Create ModeIndicator component showing current mode
3. Build mode router (chat/plan/research logic)
4. Integrate Gemini API (planning agent)
5. Integrate Moonshot Kimi K2 (research agent)
6. Create phase components (PhaseStatus, ProgressBar, PlanDisplay)
7. Implement supervisor orchestration for research mode
8. Add workflow state machine
9. Per-provider rate limiting

**Validation**:
```bash
research-os

# Default: Chat mode with M2.1
# Press Shift+Tab → switches to Plan mode
# Press Shift+Tab → switches to Research mode
# Type query in research mode → see full workflow
```

**Critical Files**:
- `src/components/ModeIndicator.tsx` - Mode display
- `src/utils/keyboard.ts` - Keyboard handling
- `src/core/modeRouter.ts` - Mode routing logic
- `src/models/gemini.ts` - Gemini integration
- `src/models/moonshot.ts` - Kimi K2 integration
- `src/core/supervisor.ts` - Orchestration
- `src/components/PhaseStatus.tsx` - Phase progress UI

---

### Phase 3: Search Tools (Week 5)
**Goal**: Exa, Tavily, Firecrawl, Brave integrations

**Tasks**:
1. Implement search tool base class in Python
2. Add Exa integration
3. Add Tavily integration
4. Add Firecrawl integration
5. Add Brave integration
6. Wire tools to research mode handler
7. Add tool_call/tool_result events
8. Implement artifact storage for large outputs
9. Add citation extraction

**Validation**:
```bash
research-os

# Type: /search quantum computing
# Should show quick web search results

# Switch to research mode, type query
# Should execute searches, show progress, cite sources
```

**Critical Files**:
- `core/search/base.py` - Search tool base class
- `core/search/exa.py` - Exa integration
- `core/search/tavily.py` - Tavily integration
- `core/handlers/research.py` - Research mode handler

---

### Phase 4: Persistence & Commands (Week 6)
**Goal**: SQLite storage, slash commands, session management

**Tasks**:
1. Implement SQLite schema (sessions, requests, tool_traces, artifacts, citations)
2. Add session creation/loading
3. Implement /save (Markdown, HTML, JSON)
4. Implement /history
5. Implement /resume
6. Implement /help
7. Add message persistence
8. Wire DB to all handlers

**Validation**:
```bash
research-os

# After research conversation:
# Type: /save report.md
# Should generate markdown with citations

# Type: /history
# Should show past sessions

# Type: /resume <id>
# Should load previous session
```

**Critical Files**:
- `core/database/schema.py` - SQLite schema
- `core/database/session.py` - Session CRUD

---

### Phase 5: Polish & UX Enhancements (Week 7)
**Goal**: Beautiful, responsive terminal UI

**Tasks**:
1. Add smooth animations for mode transitions
2. Implement command history (up/down arrows)
3. Add abort capability (Esc Esc, Ctrl+C)
4. Enhance streaming display with better buffering
5. Add session resume UI (/history, /resume)
6. Implement progress indicators for long operations
7. Add sound/visual feedback for events

**Validation**:
```bash
research-os

# UI should feel smooth and responsive
# Animations when switching modes
# Can abort mid-stream with Esc Esc
# Up arrow shows previous commands
```

**Critical Files**:
- `src/components/StreamingMessage.tsx` - Enhanced streaming
- `src/utils/keyboard.ts` - Better keyboard handling
- `src/components/ProgressBar.tsx` - Progress UI
- `src/database/session.ts` - Session management

---

### Phase 6: Reliability & Error Handling (Week 8)
**Goal**: Production-ready reliability

**Tasks**:
1. Implement retry logic with exponential backoff
2. Add circuit breaker for API failures
3. Implement OpenRouter fallback chain
4. Add response caching
5. Enhance error messages and recovery
6. Add comprehensive logging with Winston
7. Implement performance monitoring
8. Write unit tests for components
9. Add integration tests for workflows
10. Add E2E terminal tests

**Validation**:
- All tests passing (80%+ coverage)
- Handles API failures gracefully
- Clear error messages
- Automatic recovery with fallbacks

**Critical Files**:
- `src/utils/retry.ts` - Retry logic
- `src/models/router.ts` - Fallback routing
- `src/utils/logger.ts` - Logging
- `tests/unit/`, `tests/integration/`, `tests/e2e/`

---

### Phase 7: Advanced Features & Optimization (Week 9-10)
**Goal**: Feature-complete professional tool

**Tasks**:
1. Add /models command to switch models
2. Implement model comparison mode
3. Add conversation search (search past sessions)
4. Enable custom system prompts
5. Add prompt templates/fragments
6. Implement response regeneration
7. Add token usage tracking and costs
8. Optimize performance (lazy loading, caching)
9. Add telemetry (optional, opt-in)

**Validation**:
```bash
research-os

# /models - show current models
# /switch gemini - temporarily use different model
# Search past conversations
# Track costs per session
```

## React/Ink Implementation Details

### Core App Component Structure

```tsx
// src/components/App.tsx
import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { ChatInterface } from './ChatInterface.js';
import { ModeIndicator } from './ModeIndicator.js';
import { Database } from '../database/schema.js';

type Mode = 'chat' | 'plan' | 'research';

export function App() {
  const [mode, setMode] = useState<Mode>('chat');
  const [session, setSession] = useState<string | null>(null);

  useEffect(() => {
    // Initialize database and session
    const db = Database.getInstance();
    const sessionId = db.createSession();
    setSession(sessionId);

    // Set up Shift+Tab listener
    const handleKeyPress = (input: string, key: any) => {
      if (key.shift && key.tab) {
        // Cycle through modes: chat → plan → research → chat
        setMode(prev => {
          if (prev === 'chat') return 'plan';
          if (prev === 'plan') return 'research';
          return 'chat';
        });
      }
    };

    // Return cleanup
    return () => { /* cleanup */ };
  }, []);

  return (
    <Box flexDirection="column" height="100%">
      {/* Header */}
      <Box borderStyle="round" borderColor="cyan" paddingX={2}>
        <Text bold color="cyan">ResearchOS v1.0</Text>
        <Box flexGrow={1} />
        <ModeIndicator mode={mode} />
      </Box>

      {/* Main Chat Interface */}
      <ChatInterface mode={mode} sessionId={session} />
    </Box>
  );
}
```

### Chat Interface with Streaming

```tsx
// src/components/ChatInterface.tsx
import React, { useState } from 'react';
import { Box } from 'ink';
import { MessageList } from './MessageList.js';
import { InputBox } from './InputBox.js';
import { PhaseStatus } from './PhaseStatus.js';
import { useModeRouter } from '../core/modeRouter.js';

interface Props {
  mode: 'chat' | 'plan' | 'research';
  sessionId: string | null;
}

export function ChatInterface({ mode, sessionId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [phaseStatus, setPhaseStatus] = useState<PhaseStatusData | null>(null);

  const router = useModeRouter(mode);

  const handleSubmit = async (input: string) => {
    // Add user message
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);

    setIsProcessing(true);

    try {
      // Route to appropriate handler based on mode
      const stream = await router.process(input);

      // Stream assistant response
      let fullResponse = '';
      for await (const chunk of stream) {
        if (chunk.type === 'phase_status') {
          setPhaseStatus(chunk.data);
        } else if (chunk.type === 'content') {
          fullResponse += chunk.text;
          // Update last message with streaming content
          setMessages(prev => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (updated[lastIdx]?.role === 'assistant') {
              updated[lastIdx].content = fullResponse;
            } else {
              updated.push({ role: 'assistant', content: fullResponse });
            }
            return updated;
          });
        }
      }
    } finally {
      setIsProcessing(false);
      setPhaseStatus(null);
    }
  };

  return (
    <Box flexDirection="column" flexGrow={1}>
      {/* Message History */}
      <MessageList messages={messages} />

      {/* Agent Status (when processing) */}
      {phaseStatus && <PhaseStatus status={phaseStatus} />}

      {/* Input Box */}
      <InputBox
        onSubmit={handleSubmit}
        disabled={isProcessing}
        mode={mode}
      />
    </Box>
  );
}
```

### Mode Switching with Keyboard

```tsx
// src/utils/keyboard.ts
import { useInput } from 'ink';

export function useModeSwitcher(
  currentMode: Mode,
  setMode: (mode: Mode) => void
) {
  useInput((input, key) => {
    // Shift+Tab to cycle modes
    if (key.shift && key.tab) {
      const modes: Mode[] = ['chat', 'plan', 'research'];
      const currentIdx = modes.indexOf(currentMode);
      const nextIdx = (currentIdx + 1) % modes.length;
      setMode(modes[nextIdx]);
    }

    // Esc Esc to abort (within 500ms)
    // Ctrl+C to exit
    // etc.
  });
}
```

### Streaming Display

```tsx
// src/components/StreamingMessage.tsx
import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';

interface Props {
  content: string;
  isStreaming: boolean;
  agent?: string;
}

export function StreamingMessage({ content, isStreaming, agent }: Props) {
  return (
    <Box flexDirection="column" marginY={1}>
      {agent && (
        <Text bold color="blue">
          {isStreaming && <Spinner type="dots" />} {agent}:
        </Text>
      )}
      <Text>{content}</Text>
    </Box>
  );
}
```

### Mode Router

```ts
// src/core/modeRouter.ts
import { MinimaxProvider } from '../models/minimax.js';
import { Supervisor } from './supervisor.js';

type Mode = 'chat' | 'plan' | 'research';

export class ModeRouter {
  constructor(
    private minimax: MinimaxProvider,
    private supervisor: Supervisor
  ) {}

  async *process(input: string, mode: Mode) {
    switch (mode) {
      case 'chat':
        // Simple chat with M2.1 only
        yield* this.chatMode(input);
        break;

      case 'plan':
        // Generate plan but don't execute
        yield* this.planMode(input);
        break;

      case 'research':
        // Full workflow: plan → research → synthesize
        yield* this.researchMode(input);
        break;
    }
  }

  private async *chatMode(input: string) {
    const stream = await this.minimax.streamChat(input);
    for await (const chunk of stream) {
      yield { type: 'content', text: chunk };
    }
  }

  private async *planMode(input: string) {
    yield { type: 'phase_status', data: { phase: 'planning', status: 'working' } };
    const plan = await this.supervisor.createPlan(input);
    yield { type: 'content', text: plan };
    yield { type: 'phase_status', data: { phase: 'planning', status: 'complete' } };
  }

  private async *researchMode(input: string) {
    // Full supervisor workflow
    yield* this.supervisor.executeResearch(input);
  }
}
```

### Database Schema (Python-owned SQLite)

Database is owned by Python backend. See `core/database/schema.py` for implementation.

**Tables**:
- `sessions` — session metadata (id, mode, created_at, updated_at)
- `requests` — per-message request tracking (id, session_id, mode, user_content, assistant_content, status)
- `tool_traces` — tool call/result log (id, request_id, tool, query, success, summary, error)
- `artifacts` — large tool outputs stored separately (id, request_id, tool, content, content_type)
- `citations` — extracted sources (id, request_id, url, title, snippet)

**Invariant**: UI never writes to DB directly; all persistence via protocol commands.

**Example SQL Schema**:
```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  mode TEXT NOT NULL DEFAULT 'chat',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE requests (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  mode TEXT NOT NULL,
  user_content TEXT NOT NULL,
  assistant_content TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at INTEGER NOT NULL,
  completed_at INTEGER,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

CREATE TABLE tool_traces (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  tool TEXT NOT NULL,
  query TEXT NOT NULL,
  success INTEGER NOT NULL,
  summary TEXT,
  error TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (request_id) REFERENCES requests(id)
);

CREATE TABLE artifacts (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  tool TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text/plain',
  created_at INTEGER NOT NULL,
  FOREIGN KEY (request_id) REFERENCES requests(id)
);

CREATE TABLE citations (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  url TEXT NOT NULL,
  title TEXT,
  snippet TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (request_id) REFERENCES requests(id)
);
```

## Success Criteria

### Functional Requirements
- ✅ Interactive terminal chat interface with React/Ink
- ✅ Three modes (chat/plan/research) switchable via Shift+Tab
- ✅ Slash commands (/research, /search, /save, /help, /models)
- ✅ Single model for all phases (MiniMax M2.1 default, configurable)
- ✅ Supervisor pattern with proper delegation in research mode
- ✅ Direct API integration for web search (Exa, Tavily, Firecrawl, Brave)
- ✅ SQLite conversation history storage (Python-owned)
- ✅ Real-time streaming response display
- ✅ Multiple export formats (Markdown, HTML, JSON)
- ✅ Session management (save/resume conversations)

### User Experience
- ✅ Beautiful terminal UI with smooth animations
- ✅ Instant mode switching (no lag)
- ✅ Real-time phase status indicators
- ✅ Progress bars for long operations
- ✅ Keyboard shortcuts (Shift+Tab, Ctrl+C, Esc Esc, arrows)
- ✅ Clear visual feedback for all actions
- ✅ Feels like chatting with Gemini CLI / Grok CLI

### Performance
- ✅ Sub-2s for chat mode responses (M2.1 only)
- ✅ Sub-60s for plan mode (Gemini planning)
- ✅ Sub-5min for full research mode workflow
- ✅ Smooth streaming (no flicker)
- ✅ Responsive input (can type while streaming)

### Reliability
- ✅ 80%+ test coverage
- ✅ Handles API failures gracefully with fallbacks
- ✅ Rate limiting compliance for all providers
- ✅ Comprehensive error handling with clear messages
- ✅ Circuit breaker for cascading failures
- ✅ Automatic retry with exponential backoff

### Production Readiness
- ✅ Structured logging with Winston
- ✅ Token usage and cost tracking
- ✅ API key security (never logged)
- ✅ Comprehensive documentation
- ✅ Example configurations
- ✅ Easy installation (`npm install -g research-os`)
- ✅ Works on macOS, Linux, Windows

## Technical Decisions

### Why React + Ink?
- **Rich TUI**: Beautiful terminal UI with components
- **Familiar React**: Component-based architecture
- **Declarative**: Easy to reason about state and UI
- **Ecosystem**: Great components (spinners, inputs, boxes)
- **Proven**: Used by Gemini CLI, many production tools

### Why TypeScript?
- **Type Safety**: Catch errors at compile time
- **Better IDE**: Autocomplete, refactoring
- **Maintainability**: Self-documenting code
- **Modern JS**: ES modules, async/await
- **Node.js ecosystem**: Access to all npm packages

### Why MiniMax M2.1?
- **Advanced reasoning**: Interleaved thinking for complex queries
- **REST API**: Clean httpx adapter, no SDK dependency
- **Streaming support**: Real-time response delivery
- **v1.1+**: Additional providers (OpenRouter, Gemini, etc.) planned for future

### Why Supervisor Pattern?
- Clear delegation hierarchy
- Maintains context across agents
- Quality control via supervisor review
- Extensible for new agents
- Proven pattern from research

### Why SQLite?
- **Embedded**: No separate database server
- **Fast**: Great for local data
- **Portable**: Single file database
- **Python-owned**: Single source of truth via JSONL protocol
- **Perfect for CLI**: Local storage

### Why Three Modes?
- **Flexibility**: Choose appropriate level of depth
- **UX**: Quick chat for simple queries, research for deep dives
- **Cost**: Save tokens by using chat mode when appropriate
- **User Control**: Let user decide complexity vs. speed

## Quick Start After Implementation

```bash
# Install
npm install -g research-os

# Set up API keys
research-os --setup
# Prompts for: MINIMAX_API_KEY, MOONSHOT_API_KEY, GOOGLE_API_KEY

# Launch
research-os

# You'll see:
# ┌────────────────────────────────────────┐
# │ ResearchOS v1.0        Mode: 💬 Chat  │
# └────────────────────────────────────────┘
#
# › Type your message...
```

## Next Steps After Plan Approval

1. Initialize Node.js/TypeScript project (`npm init -y`)
2. Install core dependencies (React, Ink, TypeScript)
3. Set up `tsconfig.json` and build configuration
4. Create `.env.example` with API key placeholders
5. Implement Phase 1 critical files (App.tsx, ChatInterface.tsx)
6. Test basic TUI rendering
7. Integrate MiniMax M2.1 for chat mode
8. Validate with streaming responses
9. Iterate through remaining phases

## Estimated Timeline

- **Phase 1** (Basic TUI & Chat): 2 weeks
- **Phase 2** (Modes & Multi-Model): 2 weeks
- **Phase 3** (Search Tools & Direct APIs): 1 week
- **Phase 4** (Reports & Export): 1 week
- **Phase 5** (Polish & UX): 1 week
- **Phase 6** (Reliability & Tests): 2 weeks
- **Phase 7** (Advanced Features): 1 week
- **Total**: 10 weeks to feature-complete production tool

## Risk Mitigation

### React/Ink Learning Curve
- Study Grok CLI source code for patterns
- Start with simple components
- Use Ink documentation and examples
- Test components incrementally

### API Rate Limits
- Implement per-provider rate limiting with p-queue
- Add request queuing
- Provide clear error messages in UI

### API Failures
- Circuit breaker pattern
- OpenRouter fallback chain
- Retry with exponential backoff
- Graceful degradation in UI

### Cost Management
- Token usage tracking per session
- Cost estimation display before research mode
- Configurable model selection
- Chat mode as default (cheaper)

### Terminal Compatibility
- Test on multiple terminals (iTerm, Terminal.app, Windows Terminal)
- Handle terminal resize events
- Support different color schemes
- Graceful fallback for limited terminals

### Complexity
- Start simple (Phase 1: basic chat)
- Add features incrementally
- Comprehensive testing at each phase
- User testing for UX feedback

---

## Brainstorming Session Decisions (2025-01-02)

### Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Mode Control** | User explicit (Shift+Tab) | Avoid model confusion from auto-routing |
| **Architecture** | Python core + TypeScript UI | Python for agent logic, TypeScript/React/Ink for TUI |
| **IPC** | Subprocess + JSON lines | Simple, no ports, works everywhere |
| **Database** | Python owns SQLite | Single source of truth, UI requests via protocol |
| **Model Strategy** | MiniMax M2.1 default for all roles | Single model simplicity, user can configure others |
| **Additional Providers** | OpenRouter + official APIs | User-configurable per role |
| **Search Tools** | Direct API (not MCP) | Exa, Tavily, Firecrawl, Brave built-in |
| **Export Formats** | Markdown, HTML, JSON | No PDF (avoid Puppeteer bloat) |
| **Database Layer** | Raw sqlite3 + dataclasses | Minimal dependencies |
| **Plan Mode** | Capability-based (no tool executor) | Handler receives no tools |
| **Abort Behavior** | Soft abort | Stop UI streaming, let API finish, save partial |
| **Fallback Indicator** | Subtle "⚡ via [provider]" | Informative but unobtrusive |

### Updated Project Structure (Polyglot)

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

### JSON Line Protocol (Final)

**Envelope format** — every event wrapped with request tracking:
```json
{"requestId": "abc123", "seq": 1, "timestamp": 1704153600000, "event": {...}}
```

**Invariants**:
- `seq` starts at 1, increments per event within a request
- Exactly ONE terminal event per request: `complete`, `aborted`, or `error`
- After terminal event, no more events for that `requestId`
- UI ignores events where `requestId !== currentActiveRequest`

**UI → Python (commands):**
```json
{ "type": "chat", "content": "What is quantum computing?", "requestId": "abc123" }
{ "type": "set_mode", "mode": "research" }
{ "type": "command", "name": "search", "args": "recent papers" }
{ "type": "abort" }
```

**Python → UI (events):**
```json
{ "type": "content_delta", "text": "Quantum computing is..." }
{ "type": "phase_status", "phase": "planning", "status": "working" }
{ "type": "progress", "percent": 45, "message": "Analyzing sources..." }
{ "type": "tool_call", "tool": "exa", "query": "quantum computing" }
{ "type": "tool_result", "tool": "exa", "success": true, "summary": "Found 5 results", "artifactId": "art_xyz" }
{ "type": "complete" }
{ "type": "aborted", "partialSaved": true }
{ "type": "error", "message": "API rate limit", "recoverable": false }
```

### Protocol Types (TypeScript with zod)

```typescript
// src/protocol/types.ts
import { z } from 'zod';

const PhaseSchema = z.enum(['planning', 'researching', 'synthesizing']);
const StatusSchema = z.enum(['idle', 'working', 'complete', 'error']);

const ProtocolEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('content_delta'), text: z.string() }),
  z.object({ type: z.literal('phase_status'), phase: PhaseSchema, status: StatusSchema }),
  z.object({ type: z.literal('progress'), percent: z.number(), message: z.string() }),
  z.object({ type: z.literal('tool_call'), tool: z.string(), query: z.string() }),
  z.object({
    type: z.literal('tool_result'),
    tool: z.string(),
    success: z.boolean(),
    summary: z.string(),
    artifactId: z.string().optional(),
    error: z.string().optional()
  }),
  // Terminal events
  z.object({ type: z.literal('complete') }),
  z.object({ type: z.literal('aborted'), partialSaved: z.boolean() }),
  z.object({ type: z.literal('error'), message: z.string(), recoverable: z.literal(false) }),
]);

const ProtocolEnvelopeSchema = z.object({
  requestId: z.string(),
  seq: z.number().int().positive(),
  timestamp: z.number(),
  event: ProtocolEventSchema,
});

export type ProtocolEvent = z.infer<typeof ProtocolEventSchema>;
export type ProtocolEnvelope = z.infer<typeof ProtocolEnvelopeSchema>;

export function parseEnvelope(line: string): ProtocolEnvelope | null {
  try {
    const result = ProtocolEnvelopeSchema.safeParse(JSON.parse(line));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
```

### Updated Dependencies

**Python (core/):**
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

**TypeScript (src/):**
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

### Updated Implementation Phases

1. **Phase 1: Core Infrastructure** - Python subprocess, JSON protocol, MiniMax, basic TUI
2. **Phase 2: Modes & Streaming** - Shift+Tab, phase status, soft abort
3. **Phase 3: Search Tools** - Exa, Tavily, Firecrawl, Brave integrations
4. **Phase 4: Additional Providers** - OpenRouter, Gemini, Moonshot official APIs
5. **Phase 5: Persistence & Commands** - SQLite, /save, /history, /resume
6. **Phase 6: Polish & Reliability** - Retry, circuit breaker, rate limiting

---

## v1 Scope (Final)

### In Scope
- Python core + TypeScript/React/Ink UI (JSONL IPC with requestId/seq)
- Three modes: Chat (LLM only), Plan (LLM, no tools), Research (LLM + tools)
- Direct search APIs: Exa, Tavily, Firecrawl, Brave
- MiniMax M2.1 as default (v1 must work end-to-end with MiniMax only; other providers optional)
- Python-owned SQLite (messages, tool traces, artifacts, citations)
- Export: Markdown, HTML, JSON
- Platforms: macOS, Linux (Windows best-effort, no Shift+Tab parity guarantee)
- One in-flight request per session (new request auto-aborts previous)
- Soft abort (stop emitting all events, persist partial, emit single `aborted` terminal event)

### Out of Scope (v1)
- MCP integration
- PDF export
- YAML config files (use .env + Python dataclasses)
- Multi-model orchestration (single model handles all phases)
- Cross-machine session sync
- Parallel tool calls in research mode
- Windows Shift+Tab parity

### Clarifications Resolved
| Question | Answer |
|----------|--------|
| Global mode or per-message? | Global mode (Shift+Tab switches for all subsequent messages) |
| Plan mode calls LLM? | Yes, generates plan via LLM but no tools injected |
| Abort: cancel or let finish? | Let HTTP finish silently, stop emitting events |
| Concurrent requests? | No, one in-flight per session |
| Minimum persistence? | Messages + tool traces + artifacts + citations |
| Post-abort events? | None except single `aborted` terminal event |
| Seq numbering? | Per-request, starting at 1 |
| Large tool outputs? | Summary in event, full in DB with artifactId |

---

## System Prompt (Finalized)

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
