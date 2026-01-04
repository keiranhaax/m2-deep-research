# ResearchOS Design Document v1.0

**Date**: 2026-01-03
**Status**: Approved (Amended)
**Based on**: Original design + two rounds of AI critique

---

## Executive Summary

ResearchOS is an interactive terminal research chat interface (like Gemini CLI/Grok CLI) for AI-powered deep research workflows. It features a React+Ink TUI with three user-controlled modes (Chat/Plan/Research) and a polyglot architecture with Python backend and TypeScript frontend communicating via JSONL IPC.

---

## Table of Contents

1. [Architecture Decisions](#architecture-decisions)
2. [v1 Scope](#v1-scope)
3. [Operating Modes](#operating-modes)
4. [Project Structure](#project-structure)
5. [JSONL Protocol](#jsonl-protocol)
6. [Timeout & Cancellation](#timeout--cancellation)
7. [Keyboard & Commands](#keyboard--commands)
8. [Database Schema](#database-schema)
9. [Dependencies](#dependencies)
10. [Subprocess Lifecycle](#subprocess-lifecycle)
11. [Streaming & Buffering](#streaming--buffering)
12. [Security](#security)
13. [Implementation Phases](#implementation-phases)
14. [System Prompt](#system-prompt)
15. [Success Criteria](#success-criteria)
16. [Pre-Implementation Checklist](#pre-implementation-checklist)

---

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **UI Framework** | TypeScript + React + Ink | Proven TUI framework (Gemini CLI uses it) |
| **Backend** | Python subprocess | Python for agent logic, ML ecosystem |
| **IPC** | JSONL over stdin/stdout | Simple, no ports, works everywhere |
| **Protocol** | Envelope with sessionId/requestId/seq | Request tracking, crash recovery |
| **Database** | Python owns SQLite (WAL mode) | Single source of truth, concurrent reads |
| **Model Strategy** | MiniMax M2.1 for all phases (v1) | Single model simplicity |
| **Search Tools** | Direct API (not MCP) | Exa, Tavily, Firecrawl, Brave built-in |
| **Config** | `.env` + Python dataclasses | No YAML in v1 |
| **Export Formats** | Markdown, HTML, JSON | No PDF (avoid Puppeteer bloat) |
| **Mode Control** | User explicit (Shift+Tab / `/mode`) | Avoid model confusion from auto-routing |
| **Plan Mode** | Capability-based (no tools) | Handler receives no tool executors |
| **Abort** | Soft abort | Stop events, let HTTP finish, persist partial |
| **Concurrency** | One in-flight request per session | New request auto-aborts previous |

---

## v1 Scope

### In Scope

- Python core + TypeScript/React/Ink UI
- JSONL IPC with sessionId/requestId/seq envelopes
- Three modes: Chat (LLM only), Plan (LLM, no tools), Research (LLM + tools)
- Direct search APIs: Exa, Tavily, Firecrawl, Brave
- MiniMax M2.1 as default (must work end-to-end with MiniMax only)
- OpenRouter as optional fallback provider
- Python-owned SQLite with WAL mode
- Export: Markdown, HTML, JSON
- Platforms: macOS, Linux (Windows best-effort)
- `/mode` and `/abort` commands from day one
- Subprocess lifecycle management with heartbeat
- Content delta buffering (100ms flush)
- 3-layer timeout structure

### Out of Scope (v1)

- MCP integration
- PDF export
- YAML config files
- Multi-model orchestration (Gemini/Kimi/etc.)
- Cross-machine session sync
- Parallel tool calls in research mode
- Windows Shift+Tab parity (use `/mode` fallback)

### Deferred to v1.1+

- Multi-model orchestration (Gemini planner, Kimi researcher)
- YAML config files with schema validation
- Request deduplication/caching
- Multiple concurrent sessions
- Plugin system

---

## Operating Modes

### 💬 Chat Mode (Default)

**Purpose**: Quick questions using model knowledge only.

**Tools Available**: None

**Behavior**:
- Respond directly from model knowledge
- Keep responses concise (1-3 short paragraphs)
- No multi-step workflows
- Maintain conversation context

**System enforcement**: No tools injected into handler.

---

### 📋 Plan Mode

**Purpose**: Preview research strategy before execution.

**Tools Available**: None (planning only)

**Behavior**:
- Analyze query to identify research components
- Generate structured research plan
- Present plan for user approval
- DO NOT execute any searches

**System enforcement**: Handler receives no tool executors (capability-based).

**Output Format**:
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

**Tools Available**: All configured search tools

**Behavior**:
- Execute iterative agent loop (ANALYZE → PLAN → EXECUTE → EVALUATE → ITERATE → SYNTHESIZE → DELIVER)
- Use all available search tools
- Synthesize findings across sources
- Provide citations and source attribution
- Generate structured reports

**Iteration Limits**:
- Minimum searches: 2
- Maximum searches: 7
- Overall timeout: 180s (3 minutes)

---

## Project Structure

```
research-os/
├── package.json                 # Node.js deps (React, Ink)
├── tsconfig.json                # Strict TypeScript config
├── pyproject.toml               # Python deps (uv)
├── .env.example                 # API key template
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
│   │   ├── types.ts             # Zod schemas + discriminated unions
│   │   ├── client.ts            # Spawn Python, lifecycle management
│   │   └── parser.ts            # JSONL parsing with buffering
│   ├── hooks/
│   │   ├── useStreamBuffer.ts   # 100ms content buffering
│   │   └── useModeSwitcher.ts   # Keyboard + command handling
│   └── utils/
│       ├── keyboard.ts          # Key detection + fallbacks
│       └── assertNever.ts       # Exhaustiveness helper
│
├── core/                        # Python backend
│   ├── __init__.py
│   ├── __main__.py              # Entry point (stdin → stdout JSONL)
│   ├── config.py                # Dataclass-based config from .env
│   ├── supervisor.py            # Mode routing + orchestration
│   ├── handlers/
│   │   ├── __init__.py
│   │   ├── chat.py              # Chat mode (LLM only)
│   │   ├── plan.py              # Plan mode (LLM, no tools)
│   │   └── research.py          # Research mode (LLM + tools)
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py              # Abstract provider interface
│   │   ├── minimax.py           # MiniMax M2.1 (httpx)
│   │   └── openrouter.py        # Fallback (OpenAI-compatible)
│   ├── search/
│   │   ├── __init__.py
│   │   ├── base.py              # Abstract search tool
│   │   ├── exa.py
│   │   ├── tavily.py
│   │   ├── firecrawl.py
│   │   └── brave.py
│   ├── database/
│   │   ├── __init__.py
│   │   ├── schema.py            # SQLite schema + WAL mode
│   │   └── session.py           # Session CRUD + queries
│   ├── export/
│   │   ├── __init__.py
│   │   ├── markdown.py
│   │   ├── html.py              # With XSS sanitization
│   │   └── json.py
│   └── protocol/
│       ├── __init__.py
│       ├── types.py             # Pydantic models (mirror TS)
│       ├── emitter.py           # JSONL emission (stdout only)
│       └── handler.py           # Route incoming commands
│
└── tests/
    ├── ts/                      # UI + protocol tests
    │   ├── protocol.test.ts     # Golden tests
    │   └── components.test.tsx
    ├── py/                      # Backend tests
    │   ├── test_protocol.py     # Golden tests (mirror TS)
    │   ├── test_handlers.py
    │   └── test_models.py
    └── fixtures/
        └── protocol/            # Golden test fixtures
            ├── chat_request.jsonl
            ├── research_flow.jsonl
            └── abort_flow.jsonl
```

---

## JSONL Protocol

### Protocol Version

On startup, Python emits a ready message:

```json
{"type": "ready", "protocolVersion": "1.0", "capabilities": ["chat", "plan", "research"]}
```

The UI must validate `protocolVersion` and fail fast with a clear error if the
backend reports an unsupported version. Any breaking protocol change requires a
version bump and updated fixtures in `tests/fixtures/protocol/`.

### Envelope Format

Every event is wrapped with session and request tracking:

```json
{
  "sessionId": "sess_xyz789",
  "requestId": "req_abc123",
  "seq": 1,
  "timestamp": 1704153600000,
  "event": {"type": "content_delta", "text": "Analyzing..."}
}
```

**Invariants**:
- `seq` starts at 1, increments per event within a request
- `sessionId` prevents cross-session contamination after restarts
- Exactly ONE terminal event per request: `complete`, `aborted`, or `error`
- After terminal event, no more events for that `requestId`
- UI ignores events where `requestId !== activeRequestId`
- Max payload size: 1MB (use artifactId for larger)

### UI → Python Commands

```json
{"type": "chat", "content": "What is quantum computing?", "requestId": "req_abc123"}
{"type": "set_mode", "mode": "research"}
{"type": "command", "name": "search", "args": "recent papers"}
{"type": "abort"}
{"type": "heartbeat"}
{"type": "query_history", "limit": 10, "offset": 0}
{"type": "get_session", "sessionId": "sess_xyz789"}
```

### Python → UI Events

**Streaming Events**:
```json
{"type": "content_delta", "text": "Quantum computing is..."}
{"type": "phase_status", "phase": "planning", "status": "working"}
{"type": "progress", "percent": 45, "message": "Analyzing sources..."}
{"type": "tool_call", "tool": "exa", "query": "quantum computing"}
{"type": "tool_result", "tool": "exa", "success": true, "summary": "Found 5 results", "artifactId": "art_xyz"}
```

**Terminal Events** (exactly one per request):
```json
{"type": "complete"}
{"type": "aborted", "partialSaved": true}
{"type": "error", "message": "API rate limit", "recoverable": false}
```

**Query Responses**:
```json
{"type": "query_history_result", "sessions": [...]}
{"type": "get_session_result", "session": {...}, "messages": [...]}
```

### Protocol Types (TypeScript)

```typescript
// src/protocol/types.ts
import { z } from 'zod';

export const PhaseSchema = z.enum(['planning', 'researching', 'synthesizing']);
export const StatusSchema = z.enum(['idle', 'working', 'complete', 'error']);
export const ModeSchema = z.enum(['chat', 'plan', 'research']);

export const ProtocolEventSchema = z.discriminatedUnion('type', [
  // Streaming events
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
    error: z.string().optional(),
  }),
  // Terminal events
  z.object({ type: z.literal('complete') }),
  z.object({ type: z.literal('aborted'), partialSaved: z.boolean() }),
  z.object({ type: z.literal('error'), message: z.string(), recoverable: z.literal(false) }),
  // Query responses
  z.object({ type: z.literal('query_history_result'), sessions: z.array(z.any()) }),
  z.object({ type: z.literal('get_session_result'), session: z.any(), messages: z.array(z.any()) }),
  // System
  z.object({ type: z.literal('ready'), protocolVersion: z.string(), capabilities: z.array(ModeSchema) }),
  z.object({ type: z.literal('heartbeat_ack') }),
]);

export const ProtocolEnvelopeSchema = z.object({
  sessionId: z.string(),
  requestId: z.string(),
  seq: z.number().int().positive(),
  timestamp: z.number(),
  event: ProtocolEventSchema,
});

export type ProtocolEvent = z.infer<typeof ProtocolEventSchema>;
export type ProtocolEnvelope = z.infer<typeof ProtocolEnvelopeSchema>;
export type Mode = z.infer<typeof ModeSchema>;
```

### Protocol Types (Python)

```python
# core/protocol/types.py
from pydantic import BaseModel
from typing import Literal, Union
from enum import Enum

class Phase(str, Enum):
    PLANNING = "planning"
    RESEARCHING = "researching"
    SYNTHESIZING = "synthesizing"

class Status(str, Enum):
    IDLE = "idle"
    WORKING = "working"
    COMPLETE = "complete"
    ERROR = "error"

class Mode(str, Enum):
    CHAT = "chat"
    PLAN = "plan"
    RESEARCH = "research"

# Events
class ContentDelta(BaseModel):
    type: Literal["content_delta"] = "content_delta"
    text: str

class PhaseStatus(BaseModel):
    type: Literal["phase_status"] = "phase_status"
    phase: Phase
    status: Status

class Progress(BaseModel):
    type: Literal["progress"] = "progress"
    percent: int
    message: str

class ToolCall(BaseModel):
    type: Literal["tool_call"] = "tool_call"
    tool: str
    query: str

class ToolResult(BaseModel):
    type: Literal["tool_result"] = "tool_result"
    tool: str
    success: bool
    summary: str
    artifact_id: str | None = None
    error: str | None = None

class Complete(BaseModel):
    type: Literal["complete"] = "complete"

class Aborted(BaseModel):
    type: Literal["aborted"] = "aborted"
    partial_saved: bool

class Error(BaseModel):
    type: Literal["error"] = "error"
    message: str
    recoverable: Literal[False] = False

class Ready(BaseModel):
    type: Literal["ready"] = "ready"
    protocol_version: str
    capabilities: list[Mode]

ProtocolEvent = Union[
    ContentDelta, PhaseStatus, Progress, ToolCall, ToolResult,
    Complete, Aborted, Error, Ready
]

class ProtocolEnvelope(BaseModel):
    session_id: str
    request_id: str
    seq: int
    timestamp: int
    event: ProtocolEvent
```

---

## Timeout & Cancellation

### 3-Layer Timeout Structure

| Layer | Default | Override | Description |
|-------|---------|----------|-------------|
| Overall request | 180s | `--timeout` flag | Total time for a research request |
| Per-provider call | 30s | Per-provider config | Single LLM API call |
| Per-tool call | 60s | Per-tool config | Single search tool call |

### Cancellation Model

Python uses `asyncio.CancelledError` for cancellation:

```python
# core/handlers/research.py
import asyncio

class ResearchHandler:
    async def handle(self, query: str, cancel_event: asyncio.Event):
        try:
            async with asyncio.timeout(180):  # Overall timeout
                while not cancel_event.is_set():
                    # Execute search iteration
                    result = await self._search_iteration(query)
                    if self._is_complete(result):
                        break
        except asyncio.TimeoutError:
            await self._emit_error("Request timed out after 3 minutes")
        except asyncio.CancelledError:
            await self._emit_aborted(partial_saved=True)
```

### Abort Flow

1. UI sends `{"type": "abort"}`
2. Backend sets `cancel_event`
3. Backend stops emitting: `content_delta`, `phase_status`, `progress`, `tool_call`, `tool_result`
4. In-flight HTTP requests finish silently (httpx doesn't support mid-stream cancel)
5. Partial results persisted to DB
6. Backend emits exactly one: `{"type": "aborted", "partialSaved": true}`
7. Backend goes silent for that `requestId`

---

## Keyboard & Commands

### Keyboard Shortcuts

| Key | Action | Notes |
|-----|--------|-------|
| `Shift+Tab` | Cycle modes (chat → plan → research) | May not work in all terminals |
| `Esc Esc` | Abort current request | Double-tap within 500ms |
| `Ctrl+C` | Exit application | Standard Unix behavior |
| `Ctrl+D` | Exit application | EOF |
| `Up/Down` | Navigate command history | |

### Fallback Commands

| Command | Action | Fallback for |
|---------|--------|--------------|
| `/mode` | Cycle modes | Shift+Tab |
| `/mode chat` | Switch to chat mode | |
| `/mode plan` | Switch to plan mode | |
| `/mode research` | Switch to research mode | |
| `/abort` | Abort current request | Esc Esc |
| `/save [file]` | Export conversation | |
| `/history` | Show past sessions | |
| `/resume <id>` | Load previous session | |
| `/help` | Show all commands | |

### Implementation

```typescript
// src/hooks/useModeSwitcher.ts
import { useInput } from 'ink';
import { useState, useRef } from 'react';

export function useModeSwitcher(onModeChange: (mode: Mode) => void, onAbort: () => void) {
  const [mode, setMode] = useState<Mode>('chat');
  const lastEscTime = useRef<number>(0);

  useInput((input, key) => {
    // Shift+Tab to cycle modes
    if (key.shift && key.tab) {
      const modes: Mode[] = ['chat', 'plan', 'research'];
      const nextMode = modes[(modes.indexOf(mode) + 1) % 3];
      setMode(nextMode);
      onModeChange(nextMode);
      return;
    }

    // Esc Esc to abort (within 500ms)
    if (key.escape) {
      const now = Date.now();
      if (now - lastEscTime.current < 500) {
        onAbort();
        lastEscTime.current = 0;
      } else {
        lastEscTime.current = now;
      }
      return;
    }
  });

  return { mode, setMode };
}
```

---

## Database Schema

### SQLite Configuration

```python
# core/database/schema.py
import sqlite3
from pathlib import Path

def init_db(path: Path) -> sqlite3.Connection:
    conn = sqlite3.connect(str(path))
    conn.row_factory = sqlite3.Row

    # Enable WAL mode for concurrent reads
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout=5000")
    conn.execute("PRAGMA foreign_keys=ON")

    # Create tables
    conn.executescript(SCHEMA)
    conn.commit()
    return conn
```

### Schema

```sql
-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    mode TEXT NOT NULL DEFAULT 'chat',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- Requests (per user message)
CREATE TABLE IF NOT EXISTS requests (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    mode TEXT NOT NULL,
    user_content TEXT NOT NULL,
    assistant_content TEXT,
    status TEXT NOT NULL DEFAULT 'pending',  -- pending, streaming, complete, aborted, error
    created_at INTEGER NOT NULL,
    completed_at INTEGER,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Tool call/result traces
CREATE TABLE IF NOT EXISTS tool_traces (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL,
    tool TEXT NOT NULL,
    query TEXT NOT NULL,
    success INTEGER NOT NULL,
    summary TEXT,
    error TEXT,
    duration_ms INTEGER,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (request_id) REFERENCES requests(id)
);

-- Large tool outputs (stored separately)
CREATE TABLE IF NOT EXISTS artifacts (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL,
    tool TEXT NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'text/plain',
    size_bytes INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (request_id) REFERENCES requests(id)
);

-- Extracted citations
CREATE TABLE IF NOT EXISTS citations (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL,
    url TEXT NOT NULL,
    title TEXT,
    snippet TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (request_id) REFERENCES requests(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_requests_session ON requests(session_id);
CREATE INDEX IF NOT EXISTS idx_tool_traces_request ON tool_traces(request_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_request ON artifacts(request_id);
CREATE INDEX IF NOT EXISTS idx_citations_request ON citations(request_id);
CREATE INDEX IF NOT EXISTS idx_sessions_updated ON sessions(updated_at DESC);
```

---

## Dependencies

### Python (pyproject.toml)

```toml
[project]
name = "research-os-core"
version = "1.0.0"
requires-python = ">=3.11"
dependencies = [
    "httpx>=0.27.0",                    # MiniMax API + general HTTP
    "openai>=1.50.0",                   # OpenRouter (OpenAI-compatible)
    "google-generativeai>=0.8.0",       # Gemini (v1.1+)
    "exa-py>=1.0.0",                    # Exa search
    "tavily-python>=0.3.0",             # Tavily search
    "firecrawl-py>=1.0.0",              # Firecrawl
    "pydantic>=2.9.0",                  # Config + protocol validation
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0.0",
    "pytest-asyncio>=0.24.0",
    "ruff>=0.7.0",
    "mypy>=1.12.0",
]
```

### TypeScript (package.json)

```json
{
  "name": "research-os",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "research-os": "./dist/index.js"
  },
  "scripts": {
    "dev": "tsx src/index.tsx",
    "build": "tsup src/index.tsx --format esm --dts",
    "test": "vitest",
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit"
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
    "tsup": "^8.3.0",
    "vitest": "^2.0.0",
    "eslint": "^9.0.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0"
  }
}
```

### TypeScript Config (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Subprocess Lifecycle

### Python Environment Setup

On first run, the TypeScript CLI creates a venv:

```typescript
// src/protocol/client.ts
import { spawn, ChildProcess } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { execSync } from 'child_process';

const VENV_PATH = join(homedir(), '.research-os', 'venv');
const CORE_PATH = join(__dirname, '..', 'core');

async function ensurePythonEnv(): Promise<string> {
  const pythonPath = join(VENV_PATH, 'bin', 'python');

  if (!existsSync(pythonPath)) {
    console.log('Setting up Python environment (first run)...');
    execSync(`python3 -m venv ${VENV_PATH}`);
    execSync(`${pythonPath} -m pip install --quiet -e ${CORE_PATH}`);
    console.log('Setup complete!');
  }

  return pythonPath;
}
```

### Lifecycle Management

```typescript
// src/protocol/client.ts
export class PythonClient {
  private process: ChildProcess | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private buffer = '';

  async spawn(): Promise<void> {
    const pythonPath = await ensurePythonEnv();

    this.process = spawn(pythonPath, ['-m', 'core'], {
      stdio: ['pipe', 'pipe', 'inherit'],  // stderr → terminal
      env: { ...process.env },
    });

    // Parse JSONL from stdout
    this.process.stdout?.on('data', (chunk: Buffer) => {
      this.buffer += chunk.toString();
      this.processBuffer();
    });

    // Heartbeat every 5s
    this.heartbeatInterval = setInterval(() => {
      this.send({ type: 'heartbeat' });
    }, 5000);

    // Cleanup handlers
    process.on('exit', () => this.kill());
    process.on('SIGINT', () => this.kill());
    process.on('SIGTERM', () => this.kill());

    // Handle unexpected exit
    this.process.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Python process exited with code ${code}`);
      }
    });

    // Wait for ready event
    await this.waitForReady();
  }

  private processBuffer(): void {
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() ?? '';  // Keep incomplete line

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const parsed = JSON.parse(line);
        const result = ProtocolEnvelopeSchema.safeParse(parsed);
        if (result.success) {
          this.emit('event', result.data);
        } else {
          console.error('[protocol] Invalid envelope:', result.error);
        }
      } catch {
        console.error('[protocol] Non-JSON line:', line);
      }
    }
  }

  send(command: object): void {
    if (!this.process?.stdin?.writable) {
      throw new Error('Python process not running');
    }
    this.process.stdin.write(JSON.stringify(command) + '\n');
  }

  kill(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.process) {
      this.process.kill('SIGTERM');
      this.process = null;
    }
  }
}
```

### Python Heartbeat Handling

```python
# core/protocol/handler.py
import asyncio
import sys
import json

class ProtocolHandler:
    def __init__(self):
        self.last_heartbeat = asyncio.get_event_loop().time()
        self.watchdog_task: asyncio.Task | None = None

    async def start_watchdog(self, timeout: float = 15.0):
        """Kill self if no heartbeat received within timeout."""
        while True:
            await asyncio.sleep(5)
            if asyncio.get_event_loop().time() - self.last_heartbeat > timeout:
                print("No heartbeat received, exiting", file=sys.stderr)
                sys.exit(1)

    async def handle_command(self, command: dict):
        if command.get("type") == "heartbeat":
            self.last_heartbeat = asyncio.get_event_loop().time()
            self.emit({"type": "heartbeat_ack"})
            return
        # ... handle other commands
```

---

## Streaming & Buffering

### Content Delta Buffering

To prevent render thrashing, buffer deltas and flush every 100ms:

```typescript
// src/hooks/useStreamBuffer.ts
import { useReducer, useEffect, useRef, useCallback } from 'react';

interface State {
  displayed: string;
  pending: string;
}

type Action =
  | { type: 'delta'; text: string }
  | { type: 'flush' }
  | { type: 'reset' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'delta':
      return { ...state, pending: state.pending + action.text };
    case 'flush':
      return { displayed: state.displayed + state.pending, pending: '' };
    case 'reset':
      return { displayed: '', pending: '' };
    default:
      return state;
  }
}

export function useStreamBuffer(flushInterval = 100) {
  const [state, dispatch] = useReducer(reducer, { displayed: '', pending: '' });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      dispatch({ type: 'flush' });
    }, flushInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [flushInterval]);

  const appendDelta = useCallback((text: string) => {
    dispatch({ type: 'delta', text });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'reset' });
  }, []);

  return {
    content: state.displayed + state.pending,  // Show pending too for responsiveness
    appendDelta,
    reset,
  };
}
```

### Python JSONL Emission

**Critical**: stdout is protocol-only. All logs go to stderr.

```python
# core/protocol/emitter.py
import sys
import json
import time
from typing import Any

class Emitter:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.request_id: str | None = None
        self.seq = 0

    def start_request(self, request_id: str):
        self.request_id = request_id
        self.seq = 0

    def emit(self, event: dict[str, Any]) -> None:
        """Emit event as single JSON line to stdout."""
        if self.request_id is None:
            raise RuntimeError("No active request")

        self.seq += 1
        envelope = {
            "sessionId": self.session_id,
            "requestId": self.request_id,
            "seq": self.seq,
            "timestamp": int(time.time() * 1000),
            "event": event,
        }

        line = json.dumps(envelope, ensure_ascii=False)
        sys.stdout.write(line + '\n')
        sys.stdout.flush()

    def emit_ready(self):
        """Emit ready event (no envelope)."""
        ready = {
            "type": "ready",
            "protocolVersion": "1.0",
            "capabilities": ["chat", "plan", "research"],
        }
        sys.stdout.write(json.dumps(ready) + '\n')
        sys.stdout.flush()
```

---

## Security

### API Key Management

```python
# core/config.py
from pydantic import BaseModel, SecretStr
from pydantic_settings import BaseSettings
import os

class Config(BaseSettings):
    minimax_api_key: SecretStr
    openrouter_api_key: SecretStr | None = None
    exa_api_key: SecretStr | None = None
    tavily_api_key: SecretStr | None = None
    firecrawl_api_key: SecretStr | None = None
    brave_api_key: SecretStr | None = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    def get_available_search_tools(self) -> list[str]:
        tools = []
        if self.exa_api_key:
            tools.append("exa")
        if self.tavily_api_key:
            tools.append("tavily")
        if self.firecrawl_api_key:
            tools.append("firecrawl")
        if self.brave_api_key:
            tools.append("brave")
        return tools
```

### Research Mode Validation

```python
# core/handlers/research.py
class ResearchHandler:
    async def handle(self, query: str, config: Config):
        available_tools = config.get_available_search_tools()

        if not available_tools:
            raise ConfigError(
                "Research mode requires at least one search API configured. "
                "Set one of: EXA_API_KEY, TAVILY_API_KEY, FIRECRAWL_API_KEY, BRAVE_API_KEY"
            )

        # Proceed with research...
```

### HTML Export Sanitization

```python
# core/export/html.py
import html
from markupsafe import Markup, escape

def export_html(report: str, citations: list[dict]) -> str:
    """Export report to HTML with XSS protection."""

    # Escape all content
    safe_report = escape(report)

    # Build safe citations
    safe_citations = []
    for c in citations:
        safe_citations.append({
            "url": escape(c["url"]),
            "title": escape(c.get("title", "")),
            "snippet": escape(c.get("snippet", "")),
        })

    return TEMPLATE.format(
        content=safe_report,
        citations=safe_citations,
    )
```

### Logging Security

```python
# core/__main__.py
import logging
import sys

# Configure logging to stderr only
logging.basicConfig(
    stream=sys.stderr,
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
)

# Filter to prevent secret leakage
class SecretFilter(logging.Filter):
    PATTERNS = ['api_key', 'apikey', 'secret', 'token', 'password']

    def filter(self, record: logging.LogRecord) -> bool:
        msg = str(record.msg).lower()
        return not any(p in msg for p in self.PATTERNS)

logging.getLogger().addFilter(SecretFilter())
```

---

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1-2)

**Goal**: Python subprocess + JSONL protocol + basic TUI + MiniMax chat

**Tasks**:
1. Initialize Node.js/TypeScript project with strict config (enable `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
2. Initialize Python project with pyproject.toml
3. Implement JSONL protocol (types, emitter, parser) with protocol version guardrails
4. Implement subprocess lifecycle with heartbeat + Python/venv bootstrap checks
5. Create basic Ink components (App, ChatInterface, InputBox)
6. Implement MiniMax M2.1 provider (httpx)
7. Implement chat mode handler
8. Add `/mode` and `/abort` commands (day one!)
9. Set up SQLite with WAL mode
10. Write versioned protocol fixtures + golden tests (both TS and Python)

**Validation**:
```bash
research-os
# Should show chat interface
# Type query → see streaming M2.1 response
# /mode → cycles through modes
# Ctrl+C → exits cleanly
```

**Critical Files**:
- `src/protocol/types.ts`
- `src/protocol/client.ts`
- `src/protocol/parser.ts`
- `core/protocol/types.py`
- `core/protocol/emitter.py`
- `core/protocol/handler.py`
- `core/models/minimax.py`
- `core/handlers/chat.py`

---

### Phase 2: Modes & Streaming (Week 3-4)

**Goal**: Three modes working with proper phase status

**Tasks**:
1. Implement plan mode handler
2. Implement research mode handler (skeleton)
3. Add phase status UI component
4. Implement content delta buffering
5. Add Shift+Tab detection with `/mode` fallback
6. Implement Esc Esc abort with `/abort` fallback
7. Add progress indicators
8. Test mode switching across terminals

**Validation**:
```bash
research-os
# Shift+Tab or /mode → switches modes
# Plan mode → shows structured plan
# Esc Esc or /abort → aborts request
```

---

### Phase 3: Search Tools (Week 5)

**Goal**: Exa, Tavily, Firecrawl, Brave integrations

**Tasks**:
1. Implement search tool base class
2. Implement Exa integration
3. Implement Tavily integration
4. Implement Firecrawl integration
5. Implement Brave integration
6. Wire tools to research handler
7. Implement tool_call/tool_result events
8. Add artifact storage for large outputs
9. Implement citation extraction
10. Add "no search APIs configured" error

**Validation**:
```bash
research-os
# Switch to research mode
# Type query → see tool calls, progress, final report with citations
```

---

### Phase 4: Additional Providers (Week 6)

**Goal**: OpenRouter fallback

**Tasks**:
1. Implement OpenRouter provider
2. Add provider fallback logic
3. Add circuit breaker pattern
4. Implement retry with exponential backoff
5. Add `⚡ via [provider]` indicator for fallbacks

---

### Phase 5: Persistence & Commands (Week 7)

**Goal**: SQLite storage, session management, export

**Tasks**:
1. Implement session CRUD
2. Add query_history and get_session protocol commands
3. Implement /save (Markdown, HTML, JSON)
4. Implement /history
5. Implement /resume
6. Implement /help
7. Wire DB to all handlers

**Validation**:
```bash
research-os
# After conversation:
/save report.md  # Generates markdown
/history         # Shows past sessions
/resume <id>     # Loads previous session
```

---

### Phase 6: Polish & Reliability (Week 8)

**Goal**: Production-ready reliability

**Tasks**:
1. Comprehensive error handling
2. Clear error messages
3. Rate limiting compliance
4. Performance optimization
5. Terminal compatibility testing
6. Documentation
7. 80%+ test coverage

---

## System Prompt

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

## Operating Modes

You operate in three distinct modes, controlled by the user via Shift+Tab or /mode command.

### 💬 Chat Mode (Default)

**Purpose**: Quick questions, clarifications, and simple queries.
**Tools Available**: None (uses model knowledge only)
**Behavior**: Respond directly, keep responses concise (1-3 paragraphs), no workflows.

### 📋 Plan Mode

**Purpose**: Preview and validate research strategy before execution.
**Tools Available**: None (planning only)
**Behavior**: Analyze query, generate structured plan, DO NOT execute searches.

### 🔍 Research Mode

**Purpose**: Full multi-step research workflow with deep analysis.
**Tools Available**: All configured search tools
**Behavior**: Execute agent loop, synthesize findings, provide citations.

## Agent Loop (Research Mode)

1. **ANALYZE** → Understand query and current state
2. **PLAN** → Determine next research action
3. **EXECUTE** → Call one search tool
4. **EVALUATE** → Assess results, check completeness
5. **ITERATE** → Repeat until sufficient (2-7 searches)
6. **SYNTHESIZE** → Combine findings
7. **DELIVER** → Present results with citations

## Output Style

**Concise & Direct**: No preambles, no postambles.
**Brevity by Mode**: Chat (1-3 paragraphs), Plan (structured bullets), Research (comprehensive report).
**Formatting**: GitHub-flavored Markdown.

## Session Context

Current date: {current_date}
Session ID: {session_id}
Mode: {current_mode}
Available tools: {available_tools}
```

---

## Success Criteria

### Functional Requirements
- ✅ Interactive terminal chat with React/Ink
- ✅ Three modes switchable via Shift+Tab / `/mode`
- ✅ MiniMax M2.1 for all phases (v1)
- ✅ Direct search API integration
- ✅ Python-owned SQLite with WAL mode
- ✅ Export: Markdown, HTML, JSON
- ✅ Session management

### User Experience
- ✅ Beautiful terminal UI
- ✅ Instant mode switching
- ✅ Real-time phase status
- ✅ Keyboard shortcuts + command fallbacks
- ✅ Works like Gemini CLI

### Performance
- ✅ Sub-2s for chat mode
- ✅ Sub-180s for research mode
- ✅ Smooth streaming (100ms buffer)
- ✅ Responsive input while streaming

### Reliability
- ✅ 80%+ test coverage
- ✅ Handles API failures gracefully
- ✅ Rate limiting compliance
- ✅ Clear error messages
- ✅ Subprocess lifecycle management

---

## Pre-Implementation Checklist

Before starting Phase 1, verify:

- [ ] **MiniMax M2.1 API**: Confirm streaming format, test with httpx
- [ ] **Package names**: Verify all Python packages exist with correct names
- [ ] **Ink compatibility**: Test basic Ink app on macOS and Linux
- [ ] **Shift+Tab detection**: Test on iTerm2, Terminal.app, tmux, kitty
- [ ] **Distribution strategy**: Decide Node+Python vs bundled runtime, validate on a clean machine
- [ ] **Bootstrap checks**: Confirm python3 version detection + venv creation failure messaging
- [ ] **Python 3.11+ availability**: Document requirement in README
- [ ] **API keys**: Create .env.example with all required keys

---

*Document amended 2026-01-03 based on two rounds of AI critique.*
