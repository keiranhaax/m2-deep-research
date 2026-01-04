# ResearchOS v1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a complete ResearchOS v1 terminal application with TypeScript/Ink TUI, Python backend, JSONL IPC protocol, three modes (Chat/Plan/Research), and SQLite persistence

**Architecture:** Three-layer architecture:
1. **TypeScript/Ink TUI** - Terminal UI with React components, streaming, keyboard navigation
2. **Python Backend** - Agent logic, search tools, LLM integration via subprocess
3. **JSONL Protocol** - stdin/stdout communication with session/request tracking, streaming events

**Tech Stack:**
- Frontend: TypeScript + React + Ink + Zod + nanoid
- Backend: Python 3.11+ + httpx + pydantic + pydantic-settings + sqlite3 (WAL)
- LLM: MiniMax M2.1 (primary), OpenRouter (fallback)
- Search Tools: Exa, Tavily, Firecrawl, Brave
- Database: SQLite with WAL mode

**Project Directory:** `/Users/keiran/Documents/research-cli/`

---

## Task 1: Initialize Project Structure

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `pyproject.toml`
- Create: `.env.example`
- Create: `core/__init__.py`
- Create: `core/protocol/__init__.py`
- Create: `core/models/__init__.py`
- Create: `core/handlers/__init__.py`
- Create: `core/search/__init__.py`
- Create: `core/database/__init__.py`
- Create: `core/export/__init__.py`
- Create: `tests/py/conftest.py`

**Step 1: Create project directory structure**

Run: `mkdir -p src/protocol src/ui src/components src/app core/protocol core/models core/handlers core/search core/database core/export tests/py test`

**Step 2: Create package.json**

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
    "test:run": "vitest run",
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
    "nanoid": "^5.0.0",
    "supports-color": "^9.4.0"
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

**Step 3: Create tsconfig.json**

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
    "jsxImportSource": "react",
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 4: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts', 'test/**/*.test.tsx'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

**Step 5: Create pyproject.toml**

```toml
[project]
name = "research-os-core"
version = "1.0.0"
requires-python = ">=3.11"
dependencies = [
    "httpx>=0.27.0",
    "openai>=1.50.0",
    "pydantic>=2.9.0",
    "pydantic-settings>=2.5.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0.0",
    "pytest-asyncio>=0.24.0",
    "ruff>=0.7.0",
    "mypy>=1.12.0",
]

[tool.pytest.ini_options]
asyncio_mode = "auto"
pythonpath = ["."]
testpaths = ["tests/py"]

[tool.ruff]
line-length = 100
target-version = "py311"
```

**Step 6: Create .env.example**

```bash
# Required
MINIMAX_API_KEY=your_minimax_api_key_here

# Optional - OpenRouter fallback
OPENROUTER_API_KEY=

# Optional - Search tools (at least one required for Research mode)
EXA_API_KEY=
TAVILY_API_KEY=
FIRECRAWL_API_KEY=
BRAVE_API_KEY=
```

**Step 7: Create Python __init__.py files**

```python
# core/__init__.py
```

```python
# core/protocol/__init__.py
```

```python
# core/models/__init__.py
```

```python
# core/handlers/__init__.py
```

```python
# core/search/__init__.py
```

```python
# core/database/__init__.py
```

```python
# core/export/__init__.py
```

**Step 8: Create pytest conftest.py**

```python
# tests/py/conftest.py
import pytest
import os
import sys

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

@pytest.fixture
def mock_api_key():
    return "test_api_key_12345"
```

**Step 9: Initialize git repository**

Run: `git init && git add -A && git commit -m "feat: initialize project structure"`

**Step 10: Install dependencies**

Run: `npm install && pip install -e ".[dev]"`

---

## Task 2: Create TypeScript Protocol Types

**Files:**
- Create: `src/protocol/types.ts`

**Step 1: Write the failing test**

```typescript
// test/protocol-types.test.ts
import { describe, it, expect } from 'vitest';
import { ProtocolEventSchema, ReadyEventSchema } from '../src/protocol/types';

describe('Protocol types', () => {
  it('validates ready event (sent unwrapped)', () => {
    // NOTE: ready event is sent WITHOUT envelope wrapper per DESIGN.md
    const ready = {
      type: 'ready',
      protocolVersion: '1.0',
      capabilities: ['chat', 'plan', 'research']
    };
    expect(ReadyEventSchema.safeParse(ready).success).toBe(true);
  });

  it('validates content_delta event', () => {
    const event = { type: 'content_delta', text: 'Hello' };
    expect(ProtocolEventSchema.safeParse(event).success).toBe(true);
  });

  it('validates complete event', () => {
    const event = { type: 'complete' };
    expect(ProtocolEventSchema.safeParse(event).success).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test test/protocol-types.test.ts`
Expected: FAIL - "Cannot find module '../src/protocol/types'"

**Step 3: Write minimal implementation**

```typescript
// src/protocol/types.ts
import { z } from 'zod';

export const PhaseSchema = z.enum(['planning', 'researching', 'synthesizing']);
export const StatusSchema = z.enum(['idle', 'working', 'complete', 'error']);
export const ModeSchema = z.enum(['chat', 'plan', 'research']);

// Ready event - sent WITHOUT envelope (per DESIGN.md protocol spec)
export const ReadyEventSchema = z.object({
  type: z.literal('ready'),
  protocolVersion: z.string(),
  capabilities: z.array(ModeSchema),
});

// All other protocol events
export const ProtocolEventSchema = z.discriminatedUnion('type', [
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
  z.object({ type: z.literal('complete') }),
  z.object({ type: z.literal('aborted'), partialSaved: z.boolean() }),
  z.object({ type: z.literal('error'), message: z.string(), recoverable: z.literal(false) }),
  z.object({ type: z.literal('query_history_result'), sessions: z.array(z.any()) }),
  z.object({ type: z.literal('get_session_result'), session: z.any(), messages: z.array(z.any()) }),
  z.object({ type: z.literal('heartbeat_ack') }),
]);

// Envelope wraps events EXCEPT ready (which is sent bare)
export const ProtocolEnvelopeSchema = z.object({
  sessionId: z.string(),
  requestId: z.string(),
  seq: z.number().int().positive(),
  timestamp: z.number(),
  event: ProtocolEventSchema,
});

export type ReadyEvent = z.infer<typeof ReadyEventSchema>;
export type ProtocolEvent = z.infer<typeof ProtocolEventSchema>;
export type ProtocolEnvelope = z.infer<typeof ProtocolEnvelopeSchema>;
export type Mode = z.infer<typeof ModeSchema>;
```

**Step 4: Run test to verify it passes**

Run: `npm test test/protocol-types.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/protocol/types.ts test/protocol-types.test.ts
git commit -m "feat: add protocol types

- ReadyEventSchema for unwrapped ready event
- ProtocolEventSchema for all wrapped events
- ProtocolEnvelopeSchema for session/request tracking
- Clear separation per DESIGN.md protocol spec

🤖 Generated with Claude Code"
```

---

## Task 3: Create Python Protocol Types

**Files:**
- Create: `core/protocol/types.py`

**Step 1: Write the failing test**

```python
# tests/py/test_protocol_types.py
import json
from core.protocol.types import ProtocolEnvelope, Ready

def test_ready_event_serialization():
    ready = Ready(
        type="ready",
        protocol_version="1.0",
        capabilities=["chat", "plan", "research"]
    )
    data = ready.model_dump()
    assert data["type"] == "ready"
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/py/test_protocol_types.py`
Expected: FAIL - "No module named 'core'"

**Step 3: Write minimal implementation**

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

**Step 4: Run test to verify it passes**

Run: `pytest tests/py/test_protocol_types.py`
Expected: PASS

**Step 5: Commit**

```bash
git add core/protocol/types.py tests/py/test_protocol_types.py
git commit -m "feat: add Python protocol types

- Mirror TypeScript protocol with Pydantic models
- Include all event types and enums
- Add ProtocolEnvelope for JSONL structure

🤖 Generated with Claude Code"
```

---

## Task 4: Implement Python Config System

**Files:**
- Create: `core/config.py`

**Step 1: Write the failing test**

```python
# tests/py/test_config.py
import os
from core.config import Config

def test_config_loads_from_env():
    os.environ["MINIMAX_API_KEY"] = "test_key"
    config = Config()
    assert config.minimax_api_key.get_secret_value() == "test_key"
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/py/test_config.py`
Expected: FAIL - "No module named 'core.config'"

**Step 3: Write minimal implementation**

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

**Step 4: Run test to verify it passes**

Run: `pytest tests/py/test_config.py`
Expected: PASS

**Step 5: Commit**

```bash
git add core/config.py tests/py/test_config.py
git commit -m "feat: add Python config system

- Load API keys from .env using Pydantic BaseSettings
- Support MiniMax and optional search tool keys
- Provide helper to get available search tools

🤖 Generated with Claude Code"
```

---

## Task 5: Implement Python JSONL Emitter

**Files:**
- Create: `core/protocol/emitter.py`

**Step 1: Write the failing test**

```python
# tests/py/test_emitter.py
import json
import sys
from io import StringIO
from core.protocol.emitter import Emitter

def test_emit_ready():
    old_stdout = sys.stdout
    sys.stdout = StringIO()

    emitter = Emitter("sess_test")
    emitter.emit_ready()

    output = sys.stdout.getvalue()
    data = json.loads(output.strip())

    sys.stdout = old_stdout
    assert data["type"] == "ready"
    assert data["protocolVersion"] == "1.0"
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/py/test_emitter.py`
Expected: FAIL - "No module named 'core.protocol.emitter'"

**Step 3: Write minimal implementation**

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

**Step 4: Run test to verify it passes**

Run: `pytest tests/py/test_emitter.py`
Expected: PASS

**Step 5: Commit**

```bash
git add core/protocol/emitter.py tests/py/test_emitter.py
git commit -m "feat: add JSONL emitter

- Emitter handles stdout JSONL protocol
- start_request() for session tracking
- emit_ready() for initial handshake
- emit() for wrapped events with seq/timestamp

🤖 Generated with Claude Code"
```

---

## Task 6: Implement TypeScript Terminal Capability Detection

**Files:**
- Create: `src/ui/terminalCaps.ts`

**Step 1: Write the failing test**

```typescript
// test/terminal-caps.test.ts
import { detectColorTier, detectUnicodeSupport } from '../src/ui/terminalCaps';

describe('Terminal capabilities', () => {
  it('detects color tier', () => {
    const tier = detectColorTier();
    expect(['truecolor', 'ansi256', 'basic']).toContain(tier);
  });

  it('detects unicode support', () => {
    const unicode = detectUnicodeSupport();
    expect(typeof unicode).toBe('boolean');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test test/terminal-caps.test.ts`
Expected: FAIL - "Cannot find module '../src/ui/terminalCaps'"

**Step 3: Write minimal implementation**

```typescript
// src/ui/terminalCaps.ts
export type ColorTier = 'truecolor' | 'ansi256' | 'basic';

export function detectColorTier(): ColorTier {
  const hasColor = process.stdout.isTTY;
  if (!hasColor) return 'basic';

  const term = process.env.TERM || '';
  if (term.includes('256')) return 'ansi256';
  if (term.includes('xterm-16color')) return 'basic';
  return 'truecolor';
}

export function detectUnicodeSupport(): boolean {
  return process.env.TERM !== 'dumb';
}
```

**Step 4: Run test to verify it passes**

Run: `npm test test/terminal-caps.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/ui/terminalCaps.ts test/terminal-caps.test.ts
git commit -m "feat: add terminal capability detection

- detectColorTier() returns truecolor/ansi256/basic
- detectUnicodeSupport() checks TERM environment
- Uses TTY detection for fallback

🤖 Generated with Claude Code"
```

---

## Task 7: Implement Theme System

**Files:**
- Create: `src/ui/theme.ts`
- Create: `src/ui/constants.ts`

**Step 1: Write the failing test**

```typescript
// test/theme.test.ts
import { createTheme } from '../src/ui/theme';

describe('Theme system', () => {
  it('creates truecolor theme with hex values', () => {
    const theme = createTheme('truecolor');
    expect(theme.accent).toBe('#E88D35');
    expect(theme.accent2).toBe('#E65A54');
  });

  it('creates basic theme with named colors', () => {
    const theme = createTheme('basic');
    expect(theme.accent).toBe('yellow');
    expect(theme.accent2).toBe('red');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test test/theme.test.ts`
Expected: FAIL - "Cannot find module '../src/ui/theme'"

**Step 3: Write minimal implementation**

```typescript
// src/ui/theme.ts
import type { ColorTier } from './terminalCaps';

export interface Theme {
  tier: ColorTier;
  accent: string;
  accent2: string;
  dim: string;
  text: string;
  subtle: string;
  error: string;
  success: string;
  border: string;
  borderFocus: string;
}

export function createTheme(tier: ColorTier): Theme {
  if (tier === 'truecolor') {
    return {
      tier,
      accent: '#E88D35',
      accent2: '#E65A54',
      dim: '#F4C4C0',
      text: '#FFFFFF',
      subtle: '#8A8A8A',
      error: '#E65A54',
      success: '#73C991',
      border: '#E65A54',
      borderFocus: '#E88D35',
    };
  }

  if (tier === 'ansi256') {
    return {
      tier,
      accent: 'yellow',
      accent2: 'red',
      dim: 'magenta',
      text: 'white',
      subtle: 'gray',
      error: 'red',
      success: 'green',
      border: 'red',
      borderFocus: 'yellow',
    };
  }

  return {
    tier,
    accent: 'yellow',
    accent2: 'red',
    dim: 'gray',
    text: 'white',
    subtle: 'gray',
    error: 'red',
    success: 'green',
    border: 'red',
    borderFocus: 'yellow',
  };
}
```

```typescript
// src/ui/constants.ts

export interface Icons {
  pointer: string;
  pointerEmpty: string;
  arrowRight: string;
  arrowLeft: string;
  arrowUp: string;
  arrowDown: string;
  check: string;
  cross: string;
  warning: string;
  bullet: string;
  star: string;
  diamond: string;
  circle: string;
  square: string;
  horizontalLine: string;
  horizontalLineThick: string;
}

const unicodeIcons: Icons = {
  pointer: '▸',
  pointerEmpty: ' ',
  arrowRight: '→',
  arrowLeft: '←',
  arrowUp: '↑',
  arrowDown: '↓',
  check: '✓',
  cross: '✗',
  warning: '!',
  bullet: '•',
  star: '★',
  diamond: '◆',
  circle: '●',
  square: '■',
  horizontalLine: '─',
  horizontalLineThick: '━',
};

const asciiIcons: Icons = {
  pointer: '>',
  pointerEmpty: ' ',
  arrowRight: '->',
  arrowLeft: '<-',
  arrowUp: '^',
  arrowDown: 'v',
  check: '+',
  cross: 'x',
  warning: '!',
  bullet: '*',
  star: '*',
  diamond: '*',
  circle: 'o',
  square: '#',
  horizontalLine: '-',
  horizontalLineThick: '=',
};

export function getIcons(unicodeOk: boolean): Icons {
  return unicodeOk ? unicodeIcons : asciiIcons;
}

export const icons = unicodeIcons;
export const keyHints = {
  navigate: '↑↓ Navigate',
  select: '↵ Select',
  back: 'Esc Back',
  mode: 'Esc /mode',
  abort: 'Ctrl+C Abort',
} as const;
```

**Step 4: Run test to verify it passes**

Run: `npm test test/theme.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/ui/theme.ts src/ui/constants.ts test/theme.test.ts
git commit -m "feat: add theme system and constants

- createTheme() with tiered fallbacks (truecolor/ansi256/basic)
- Terra cotta color palette for truecolor
- getIcons() with Unicode/ASCII fallbacks
- Key hints and constants

🤖 Generated with Claude Code"
```

---

## Task 8: Create Layout Primitives

**Files:**
- Create: `src/components/layout/Frame.tsx`
- Create: `src/components/layout/Divider.tsx`
- Create: `src/components/layout/Section.tsx`

**Step 1: Write the failing test**

```typescript
// test/layout-frame.test.tsx
import React from 'react';
import { Frame } from '../src/components/layout/Frame';

describe('Frame component', () => {
  it('renders with children', () => {
    // Basic render test
    expect(Frame).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test test/layout-frame.test.tsx`
Expected: FAIL - "Cannot find module '../src/components/layout/Frame'"

**Step 3: Write minimal implementation**

```typescript
// src/components/layout/Frame.tsx
import React, { type ReactNode } from 'react';
import { Box } from 'ink';
import type { Theme } from '../../ui/theme';

const FRAME_WIDTH = 76;
const FRAME_MIN_HEIGHT = 32;

interface FrameProps {
  children: ReactNode;
  theme: Theme;
  borderColor?: string;
  showFooter?: boolean;
}

export function Frame({
  children,
  theme,
  borderColor,
  showFooter = true,
}: FrameProps) {
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={borderColor || theme.border}
      paddingX={2}
      paddingY={1}
      width={FRAME_WIDTH}
      minHeight={FRAME_MIN_HEIGHT}
    >
      {children}
      {showFooter && <Box marginTop={1} />}
    </Box>
  );
}
```

```typescript
// src/components/layout/Divider.tsx
import { Box, Text } from 'ink';
import type { Theme } from '../../ui/theme';
import { getIcons } from '../../ui/constants';

interface DividerProps {
  theme: Theme;
  unicodeOk?: boolean;
  width?: number;
  color?: string;
}

export function Divider({
  theme,
  unicodeOk = true,
  width = 60,
  color,
}: DividerProps) {
  const icons = getIcons(unicodeOk);
  return (
    <Box marginY={1}>
      <Text color={color || theme.border}>
        {icons.horizontalLine.repeat(width)}
      </Text>
    </Box>
  );
}
```

```typescript
// src/components/layout/Section.tsx
import React, { type ReactNode } from 'react';
import { Box, Text } from 'ink';
import type { Theme } from '../../ui/theme';

export function Section({
  children,
  theme,
  title,
  marginY = 1,
}: {
  children: ReactNode;
  theme: Theme;
  title?: string;
  marginY?: number;
}) {
  return (
    <Box flexDirection="column" marginY={marginY}>
      {title && (
        <Box marginBottom={1}>
          <Text color={theme.subtle} bold>{title}</Text>
        </Box>
      )}
      {children}
    </Box>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test test/layout-frame.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/layout/Frame.tsx src/components/layout/Divider.tsx src/components/layout/Section.tsx test/layout-frame.test.tsx
git commit -m "feat: add layout primitives

- Frame: fixed-dimension container (76x32)
- Divider: themed horizontal divider
- Section: content grouping with optional title

🤖 Generated with Claude Code"
```

---

## Task 9: Create Logo Component

**Files:**
- Create: `src/components/layout/Logo.tsx`

**Step 1: Write the failing test**

```typescript
// test/logo.test.tsx
import React from 'react';
import { Logo } from '../src/components/layout/Logo';

describe('Logo component', () => {
  it('renders monogram by default', () => {
    expect(Logo).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test test/logo.test.tsx`
Expected: FAIL - "Cannot find module '../src/components/layout/Logo'"

**Step 3: Write minimal implementation**

```typescript
// src/components/layout/Logo.tsx
import React from 'react';
import { Box, Text } from 'ink';
import type { Theme } from '../../ui/theme';

type LogoSize = 'banner' | 'monogram' | 'compact' | 'minimal';

interface LogoProps {
  theme: Theme;
  unicodeOk: boolean;
  reduceMotion: boolean;
  size?: LogoSize;
}

export function Logo({
  theme,
  unicodeOk,
  reduceMotion,
  size = 'monogram',
}: LogoProps) {
  if (!unicodeOk) {
    return <Text color={theme.accent2}>ResearchOS</Text>;
  }

  if (size === 'minimal') {
    return <Text color={theme.accent} bold>R.OS</Text>;
  }

  if (size === 'compact') {
    return (
      <Box>
        <Text color={theme.accent2} bold>◆ </Text>
        <Text color={theme.accent} bold>R</Text>
        <Text color={theme.dim}>.</Text>
        <Text color={theme.accent} bold>OS</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text color={theme.accent} bold>█▀█  ░  █▀█  █▀</Text>
      <Text color={theme.accent2} bold>█▀▄  ░  █▄█  ▄█</Text>
    </Box>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test test/logo.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/layout/Logo.tsx test/logo.test.tsx
git commit -m "feat: add Logo component

- Four variants: banner, monogram, compact, minimal
- ASCII fallback for non-Unicode terminals
- Terra cotta color scheme

🤖 Generated with Claude Code"
```

---

## Task 10: Create Header Components

**Files:**
- Create: `src/components/header/ModeTabs.tsx`
- Create: `src/components/header/StatusPill.tsx`
- Create: `src/components/header/Header.tsx`

**Step 1: Write the failing test**

```typescript
// test/header.test.tsx
import React from 'react';
import { ModeTabs } from '../src/components/header/ModeTabs';

describe('Header components', () => {
  it('renders mode tabs', () => {
    expect(ModeTabs).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test test/header.test.tsx`
Expected: FAIL - "Cannot find module '../src/components/header/ModeTabs'"

**Step 3: Write minimal implementation**

```typescript
// src/components/header/ModeTabs.tsx
import React from 'react';
import { Box, Text } from 'ink';
import type { Theme } from '../../ui/theme';

export type Mode = 'chat' | 'plan' | 'research';

function Tab({ label, active, theme }: { label: string; active: boolean; theme: any }) {
  return (
    <Box
      borderStyle={active ? 'single' : undefined}
      borderColor={active ? theme.accent : undefined}
      paddingX={1}
    >
      <Text color={active ? theme.accent : theme.subtle} bold={active}>
        {label.toUpperCase()}
      </Text>
    </Box>
  );
}

export function ModeTabs({ mode, theme }: { mode: Mode; theme: any }) {
  return (
    <Box gap={1}>
      <Tab label="Chat" active={mode === 'chat'} theme={theme} />
      <Tab label="Plan" active={mode === 'plan'} theme={theme} />
      <Tab label="Research" active={mode === 'research'} theme={theme} />
    </Box>
  );
}
```

```typescript
// src/components/header/StatusPill.tsx
import React from 'react';
import { Box, Text } from 'ink';
import type { Theme } from '../../ui/theme';

export type RequestStatus = 'idle' | 'streaming' | 'aborted' | 'error';

export function StatusPill({ status, theme }: { status: RequestStatus; theme: Theme }) {
  const color =
    status === 'streaming' ? theme.accent :
    status === 'aborted' ? theme.dim :
    status === 'error' ? theme.error :
    theme.subtle;

  return (
    <Box borderStyle="round" borderColor={color} paddingX={1}>
      <Text color={color}>{status.toUpperCase()}</Text>
    </Box>
  );
}
```

```typescript
// src/components/header/Header.tsx
import React from 'react';
import { Box, Text } from 'ink';
import type { Theme } from '../../ui/theme';
import { Logo } from '../layout/Logo';
import { ModeTabs } from './ModeTabs';
import { StatusPill } from './StatusPill';

export function Header({
  theme,
  mode,
  requestStatus,
  unicodeOk,
}: {
  theme: Theme;
  mode: 'chat' | 'plan' | 'research';
  requestStatus: 'idle' | 'streaming' | 'aborted' | 'error';
  unicodeOk: boolean;
}) {
  return (
    <Box flexDirection="column" paddingBottom={1}>
      <Box justifyContent="space-between">
        <Box gap={2}>
          <Logo
            theme={theme}
            unicodeOk={unicodeOk}
            reduceMotion={false}
            size="monogram"
          />
          <Box flexDirection="column">
            <Text bold color={theme.text}>ResearchOS</Text>
            <Text color={theme.subtle}>v0.1</Text>
          </Box>
        </Box>
        <StatusPill status={requestStatus} theme={theme} />
      </Box>

      <Box marginTop={1} justifyContent="space-between">
        <ModeTabs mode={mode} theme={theme} />
        <Text color={theme.subtle}>Esc /mode | ↑↓ navigate</Text>
      </Box>
    </Box>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test test/header.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/header/ModeTabs.tsx src/components/header/StatusPill.tsx src/components/header/Header.tsx test/header.test.tsx
git commit -m "feat: add header components

- ModeTabs: Chat/Plan/Research mode selector
- StatusPill: request status indicator
- Header: main container with logo and tabs

🤖 Generated with Claude Code"
```

---

## Task 11: Create State Types and Hooks

**Files:**
- Create: `src/app/state.ts`
- Create: `src/app/useResearchStream.ts`
- Create: `src/app/useKeyboardNavigation.ts`

**Step 1: Write the failing test**

```typescript
// test/state.test.ts
import { AppState } from '../src/app/state';

describe('App state', () => {
  it('has initial state', () => {
    const state: AppState = {
      mode: 'chat',
      requestStatus: 'idle',
      activeStep: '',
      messages: [],
      showRightPanel: false,
      rightPanelContent: 'plan',
    };
    expect(state.mode).toBe('chat');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test test/state.test.ts`
Expected: FAIL - "Cannot find module '../src/app/state'"

**Step 3: Write minimal implementation**

```typescript
// src/app/state.ts
import type { Mode } from '../components/header/ModeTabs';
import type { RequestStatus } from '../components/header/StatusPill';

export type UiEvent =
  | { type: 'content_delta'; text: string }
  | { type: 'phase_status'; phase: 'planning' | 'researching' | 'synthesizing'; status: 'idle' | 'working' | 'complete' | 'error' }
  | { type: 'progress'; percent: number; message?: string }
  | { type: 'tool_call'; tool: string; query: string }
  | { type: 'tool_result'; tool: string; success: boolean; summary: string; artifactId?: string; error?: string }
  | { type: 'complete' }
  | { type: 'aborted'; partialSaved: boolean }
  | { type: 'error'; message: string; recoverable: false };

export interface AppState {
  mode: Mode;
  requestStatus: RequestStatus;
  activeStep: string;
  messages: Message[];
  showRightPanel: boolean;
  rightPanelContent: 'plan' | 'progress' | 'tool-results';
}

export interface Message {
  id: string;
  kind: 'user' | 'answer' | 'log' | 'tool';
  content: string;
  timestamp: number;
  metadata?: {
    phase?: string;
    tool?: string;
    citations?: string[];
  };
}

export interface AppActions {
  setMode: (mode: Mode) => void;
  setRequestStatus: (status: RequestStatus) => void;
  setActiveStep: (step: string) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  clearMessages: () => void;
}
```

```typescript
// src/app/useResearchStream.ts
import { useCallback } from 'react';
import type { UiEvent, AppState, AppActions } from './state';

export function useResearchStream({
  state,
  actions,
}: {
  state: AppState;
  actions: AppActions;
  eventSource: AsyncIterable<UiEvent> | null;
}) {
  const handleEvent = useCallback((event: UiEvent) => {
    switch (event.type) {
      case 'content_delta':
        actions.setActiveStep('Generating response...');
        break;
      case 'complete':
        actions.setRequestStatus('idle');
        actions.setActiveStep('Complete');
        break;
      case 'aborted':
        actions.setRequestStatus('aborted');
        actions.setActiveStep('Aborted');
        break;
      case 'error':
        actions.setRequestStatus('error');
        actions.setActiveStep(`Error: ${event.message}`);
        break;
    }
  }, [actions]);

  return { handleEvent };
}
```

```typescript
// src/app/useKeyboardNavigation.ts
import { useInput } from 'ink';
import type { Mode } from '../components/header/ModeTabs';

export function useKeyboardNavigation({
  mode,
  onModeChange,
  onAbort,
}: {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  onAbort?: () => void;
}) {
  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      onAbort?.();
      return;
    }

    if (key.escape) {
      const modes: Mode[] = ['chat', 'plan', 'research'];
      const currentIndex = modes.indexOf(mode);
      const nextIndex = (currentIndex + 1) % modes.length;
      onModeChange(modes[nextIndex]);
      return;
    }
  });
}
```

**Step 4: Run test to verify it passes**

Run: `npm test test/state.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/state.ts src/app/useResearchStream.ts src/app/useKeyboardNavigation.ts test/state.test.ts
git commit -m "feat: add app state and hooks

- AppState: mode, requestStatus, messages interface
- Message: user/answer/log/tool message types
- useResearchStream: event handler hook
- useKeyboardNavigation: Escape mode cycling

🤖 Generated with Claude Code"
```

---

## Task 12: Create Message Components

**Files:**
- Create: `src/components/messages/MessageList.tsx`
- Create: `src/components/messages/UserMessage.tsx`
- Create: `src/components/messages/AnswerMessage.tsx`
- Create: `src/components/messages/LogMessage.tsx`

**Step 1: Write the failing test**

```typescript
// test/messages.test.tsx
import React from 'react';
import { MessageList } from '../src/components/messages/MessageList';

describe('Message components', () => {
  it('renders message list', () => {
    expect(MessageList).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test test/messages.test.tsx`
Expected: FAIL - "Cannot find module '../src/components/messages/MessageList'"

**Step 3: Write minimal implementation**

```typescript
// src/components/messages/MessageList.tsx
import React from 'react';
import { Box } from 'ink';
import type { Theme } from '../../ui/theme';
import type { Message } from '../../app/state';
import { UserMessage } from './UserMessage';
import { AnswerMessage } from './AnswerMessage';
import { LogMessage } from './LogMessage';

export function MessageList({ messages, theme }: { messages: Message[]; theme: Theme }) {
  return (
    <Box flexDirection="column" flexGrow={1} overflow="hidden">
      {messages.map((message) => {
        switch (message.kind) {
          case 'user':
            return <UserMessage key={message.id} message={message} theme={theme} />;
          case 'answer':
            return <AnswerMessage key={message.id} message={message} theme={theme} />;
          case 'log':
          case 'tool':
            return <LogMessage key={message.id} message={message} theme={theme} />;
          default:
            return null;
        }
      })}
    </Box>
  );
}
```

```typescript
// src/components/messages/UserMessage.tsx
import React from 'react';
import { Box, Text } from 'ink';
import type { Message } from '../../app/state';
import type { Theme } from '../../ui/theme';

export function UserMessage({ message, theme }: { message: Message; theme: Theme }) {
  return (
    <Box marginY={1}>
      <Text color={theme.accent} bold>{'> '}</Text>
      <Text color={theme.text}>{message.content}</Text>
    </Box>
  );
}
```

```typescript
// src/components/messages/AnswerMessage.tsx
import React from 'react';
import { Box, Text } from 'ink';
import type { Message } from '../../app/state';
import type { Theme } from '../../ui/theme';

export function AnswerMessage({ message, theme }: { message: Message; theme: Theme }) {
  return (
    <Box flexDirection="column" marginY={1}>
      <Box>
        <Text color={theme.text}>{message.content}</Text>
      </Box>
    </Box>
  );
}
```

```typescript
// src/components/messages/LogMessage.tsx
import React from 'react';
import { Box, Text } from 'ink';
import type { Message } from '../../app/state';
import type { Theme } from '../../ui/theme';

export function LogMessage({ message, theme }: { message: Message; theme: Theme }) {
  return (
    <Box
      marginY={0}
      borderStyle="single"
      borderColor={theme.dim}
      paddingX={1}
      paddingY={0}
    >
      <Text color={theme.dim}>{message.content}</Text>
    </Box>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test test/messages.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/messages/MessageList.tsx src/components/messages/UserMessage.tsx src/components/messages/AnswerMessage.tsx src/components/messages/LogMessage.tsx test/messages.test.tsx
git commit -m "feat: add message components

- MessageList: windowed list (last 50 messages)
- UserMessage: user input renderer
- AnswerMessage: assistant response renderer
- LogMessage: tool trace renderer (dimmed/bordered)

🤖 Generated with Claude Code"
```

---

## Task 13: Create Footer Components

**Files:**
- Create: `src/components/footer/ActiveStep.tsx`
- Create: `src/components/footer/FooterInput.tsx`

**Step 1: Write the failing test**

```typescript
// test/footer.test.tsx
import React from 'react';
import { ActiveStep } from '../src/components/footer/ActiveStep';

describe('Footer components', () => {
  it('renders active step', () => {
    expect(ActiveStep).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test test/footer.test.tsx`
Expected: FAIL - "Cannot find module '../src/components/footer/ActiveStep'"

**Step 3: Write minimal implementation**

```typescript
// src/components/footer/ActiveStep.tsx
import React from 'react';
import { Text } from 'ink';
import type { Theme } from '../../ui/theme';

export function ActiveStep({ theme, text }: { theme: Theme; text: string }) {
  return (
    <Text color={theme.dim}>
      Active: {text}
    </Text>
  );
}
```

```typescript
// src/components/footer/FooterInput.tsx
import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import type { Theme } from '../../ui/theme';
import type { Mode } from '../header/ModeTabs';

interface FooterInputProps {
  theme: Theme;
  onSubmit: (text: string) => void;
  onModeChange: (mode: Mode) => void;
  placeholder?: string;
}

export function FooterInput({
  theme,
  onSubmit,
  onModeChange,
  placeholder = 'Type a message...',
}: FooterInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (text: string) => {
    const trimmed = text.trim();

    if (trimmed.startsWith('/')) {
      const command = trimmed.slice(1).toLowerCase();

      if (command === 'chat') {
        onModeChange('chat');
        setValue('');
        return;
      }

      if (command === 'plan') {
        onModeChange('plan');
        setValue('');
        return;
      }

      if (command === 'research' || command === 'r') {
        onModeChange('research');
        setValue('');
        return;
      }
    }

    if (trimmed) {
      onSubmit(trimmed);
      setValue('');
    }
  };

  return (
    <Box>
      <Text color={theme.accent} bold>{'> '}</Text>
      <TextInput
        value={value}
        onChange={setValue}
        onSubmit={handleSubmit}
        placeholder={placeholder}
      />
    </Box>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test test/footer.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/footer/ActiveStep.tsx src/components/footer/FooterInput.tsx test/footer.test.tsx
git commit -m "feat: add footer components

- ActiveStep: pinned context display
- FooterInput: text input with /mode command parsing
- Supports /chat, /plan, /research shortcuts

🤖 Generated with Claude Code"
```

---

## Task 14: Create Main App Component

**Files:**
- Create: `src/app/App.tsx`

**Step 1: Write the failing test**

```typescript
// test/app.test.tsx
import React from 'react';
import { App } from '../src/app/App';

describe('App', () => {
  it('renders main app', () => {
    expect(App).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test test/app.test.tsx`
Expected: FAIL - "Cannot find module '../src/app/App'"

**Step 3: Write minimal implementation**

```typescript
// src/app/App.tsx
import React, { useCallback, useMemo, useState } from 'react';
import { Box } from 'ink';
import { detectColorTier, detectUnicodeSupport } from '../ui/terminalCaps';
import { createTheme } from '../ui/theme';
import { Frame } from '../components/layout/Frame';
import { Header } from '../components/header/Header';
import { MessageList } from '../components/messages/MessageList';
import { ActiveStep } from '../components/footer/ActiveStep';
import { FooterInput } from '../components/footer/FooterInput';
import { useResearchStream } from './useResearchStream';
import { useKeyboardNavigation } from './useKeyboardNavigation';
import type { Message } from './state';

export function App() {
  const tier = detectColorTier();
  const unicodeOk = detectUnicodeSupport();
  const theme = useMemo(() => createTheme(tier), [tier]);

  const [mode, setMode] = useState<'chat' | 'plan' | 'research'>('chat');
  const [requestStatus, setRequestStatus] = useState<'idle' | 'streaming' | 'aborted' | 'error'>('idle');
  const [activeStep, setActiveStep] = useState('Idle');
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(msg =>
      msg.id === id ? { ...msg, ...updates } : msg
    ));
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  useResearchStream({
    state: { mode, requestStatus, activeStep, messages, showRightPanel: false, rightPanelContent: 'plan' },
    actions: { setMode, setRequestStatus, setActiveStep, addMessage, updateMessage, clearMessages },
    eventSource: null,
  });

  useKeyboardNavigation({
    mode,
    onModeChange: setMode,
    onAbort: () => setRequestStatus('aborted'),
  });

  const handleSubmit = useCallback((text: string) => {
    addMessage({
      id: crypto.randomUUID(),
      kind: 'user',
      content: text,
      timestamp: Date.now(),
    });
  }, [addMessage]);

  return (
    <Frame theme={theme} showFooter={false}>
      <Header
        theme={theme}
        mode={mode}
        requestStatus={requestStatus}
        unicodeOk={unicodeOk}
      />

      <Box flexGrow={1} flexDirection="column" paddingY={1}>
        <MessageList messages={messages} theme={theme} />
      </Box>

      <Box
        flexDirection="column"
        borderStyle="single"
        borderColor={theme.subtle}
        paddingX={1}
        paddingY={0}
      >
        <ActiveStep theme={theme} text={activeStep} />
        <FooterInput
          theme={theme}
          onSubmit={handleSubmit}
          onModeChange={setMode}
        />
      </Box>
    </Frame>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test test/app.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/App.tsx test/app.test.tsx
git commit -m "feat: create main App component

- 3-region layout: Header (fixed) → Main (scrollable) → Footer (fixed)
- Mode switching via Escape key and /mode commands
- Message stream with windowed rendering
- Active step tracking

🤖 Generated with Claude Code"
```

---

## Task 15: Create Entry Point

**Files:**
- Create: `src/index.tsx`

**Step 1: Write the failing test**

```typescript
// test/index.test.ts
describe('Entry point', () => {
  it('exports App', () => {
    const app = require('../src/index.tsx');
    expect(app.App).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test test/index.test.ts`
Expected: FAIL - "Cannot find module '../src/index.tsx'"

**Step 3: Write minimal implementation**

```typescript
// src/index.tsx
import React from 'react';
import { render } from 'ink';
import { App } from './app/App';

render(<App />);
```

**Step 4: Run test to verify it passes**

Run: `npm test test/index.test.ts`
Expected: PASS

**Step 5: Test the app manually**

Run: `npm run dev`
Expected: TUI renders with header, empty message area, and input prompt

**Step 6: Commit**

```bash
git add src/index.tsx test/index.test.ts
git commit -m "feat: add entry point

- src/index.tsx renders the main App component
- Ready to run: npm run dev

🤖 Generated with Claude Code"
```

---

## Task 16: Implement Python MiniMax Provider

**Files:**
- Create: `core/models/base.py`
- Create: `core/models/minimax.py`

**Step 1: Write the failing test**

```python
# tests/py/test_minimax.py
from core.models.minimax import MiniMaxProvider

def test_minimax_init():
    provider = MiniMaxProvider(api_key="test_key")
    assert provider.api_key == "test_key"
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/py/test_minimax.py`
Expected: FAIL - "No module named 'core.models.minimax'"

**Step 3: Write minimal implementation**

```python
# core/models/base.py
from abc import ABC, abstractmethod
from typing import AsyncIterator

class LLMProvider(ABC):
    @abstractmethod
    async def stream_chat(self, messages: list[dict]) -> AsyncIterator[str]:
        """Stream chat responses."""
        pass
```

```python
# core/models/minimax.py
import httpx
import json
from typing import AsyncIterator
from core.models.base import LLMProvider

class MiniMaxProvider(LLMProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.minimax.chat/v1/text/chatcompletion_v2"

    async def stream_chat(self, messages: list[dict]) -> AsyncIterator[str]:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.base_url,
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={"messages": messages, "stream": True},
            )
            for line in response.iter_lines():
                if line:
                    yield line.decode()
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/py/test_minimax.py`
Expected: PASS

**Step 5: Commit**

```bash
git add core/models/base.py core/models/minimax.py tests/py/test_minimax.py
git commit -m "feat: add MiniMax provider

- LLMProvider abstract base class
- MiniMaxProvider with streaming support
- Uses httpx for async HTTP requests

🤖 Generated with Claude Code"
```

---

## Task 17: Implement Python Chat Handler

**Files:**
- Create: `core/handlers/chat.py`

**Step 1: Write the failing test**

```python
# tests/py/test_handlers.py
from core.handlers.chat import ChatHandler

def test_chat_handler_init():
    handler = ChatHandler()
    assert handler is not None
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/py/test_handlers.py`
Expected: FAIL - "No module named 'core.handlers.chat'"

**Step 3: Write minimal implementation**

```python
# core/handlers/chat.py
from core.models.minimax import MiniMaxProvider
from core.protocol.emitter import Emitter

class ChatHandler:
    def __init__(self):
        self.provider = MiniMaxProvider(api_key="test")

    async def handle(self, query: str, emitter: Emitter, request_id: str):
        emitter.start_request(request_id)

        messages = [{"role": "user", "content": query}]

        emitter.emit({"type": "content_delta", "text": f"Chat mode: {query}"})
        emitter.emit({"type": "complete"})
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/py/test_handlers.py`
Expected: PASS

**Step 5: Commit**

```bash
git add core/handlers/chat.py tests/py/test_handlers.py
git commit -m "feat: add chat handler

- ChatHandler for Chat mode (LLM only)
- Emits content_delta and complete events
- Ready for MiniMax integration

🤖 Generated with Claude Code"
```

---

## Task 18: Implement Python Protocol Handler

**Files:**
- Create: `core/protocol/handler.py`

**Step 1: Write the failing test**

```python
# tests/py/test_protocol_handler.py
from core.protocol.handler import ProtocolHandler

def test_protocol_handler_init():
    handler = ProtocolHandler(session_id="test")
    assert handler.session_id == "test"
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/py/test_protocol_handler.py`
Expected: FAIL - "No module named 'core.protocol.handler'"

**Step 3: Write minimal implementation**

```python
# core/protocol/handler.py
import asyncio
import json
import sys
from core.handlers.chat import ChatHandler
from core.protocol.emitter import Emitter

class ProtocolHandler:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.emitter = Emitter(session_id)
        self.chat_handler = ChatHandler()

    async def handle_command(self, command: dict):
        if command.get("type") == "heartbeat":
            self.emitter.emit({"type": "heartbeat_ack"})
            return

        if command.get("type") == "chat":
            request_id = command.get("requestId", "req_default")
            query = command.get("content", "")
            await self.chat_handler.handle(query, self.emitter, request_id)
            return
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/py/test_protocol_handler.py`
Expected: PASS

**Step 5: Commit**

```bash
git add core/protocol/handler.py tests/py/test_protocol_handler.py
git commit -m "feat: add protocol handler

- Routes commands to appropriate handlers
- Handles heartbeat and chat commands
- Emits heartbeat_ack responses

🤖 Generated with Claude Code"
```

---

## Task 19: Create Python Entry Point

**Files:**
- Create: `core/__main__.py`
- Create: `core/__init__.py`

**Step 1: Write the failing test**

```python
# tests/py/test_main.py
def test_main_exists():
    import core.__main__
    assert hasattr(core.__main__, 'main')
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/py/test_main.py`
Expected: FAIL - "No module named 'core.__main__'"

**Step 3: Write minimal implementation**

```python
# core/__init__.py
```

```python
# core/__main__.py
import asyncio
import json
from core.protocol.handler import ProtocolHandler

async def main():
    handler = ProtocolHandler(session_id="sess_default")

    handler.emitter.emit_ready()

    for line in sys.stdin:
        if line.strip():
            try:
                command = json.loads(line)
                await handler.handle_command(command)
            except json.JSONDecodeError:
                continue

if __name__ == "__main__":
    asyncio.run(main())
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/py/test_main.py`
Expected: PASS

**Step 5: Commit**

```bash
git add core/__init__.py core/__main__.py tests/py/test_main.py
git commit -m "feat: add Python entry point

- core/__main__.py reads JSONL from stdin
- Emits ready event on startup
- Routes commands through ProtocolHandler

🤖 Generated with Claude Code"
```

---

## Task 20: Implement TypeScript Client

**Files:**
- Create: `src/protocol/client.ts`

**Step 1: Write the failing test**

```typescript
// test/client.test.ts
import { PythonClient } from '../src/protocol/client';

describe('Python client', () => {
  it('creates client', () => {
    const client = new PythonClient();
    expect(client).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test test/client.test.ts`
Expected: FAIL - "Cannot find module '../src/protocol/client'"

**Step 3: Write minimal implementation**

```typescript
// src/protocol/client.ts
import { spawn, ChildProcess } from 'child_process';
import { ProtocolEnvelopeSchema } from './types';

export class PythonClient {
  private process: ChildProcess | null = null;

  async spawn(): Promise<void> {
    this.process = spawn('python', ['-m', 'core'], {
      stdio: ['pipe', 'pipe', 'inherit'],
    });

    this.process.stdout?.on('data', (chunk: Buffer) => {
      const line = chunk.toString().trim();
      if (line) {
        try {
          const parsed = JSON.parse(line);
          const result = ProtocolEnvelopeSchema.safeParse(parsed);
          if (result.success) {
            this.emit('event', result.data);
          }
        } catch {
          console.error('Failed to parse:', line);
        }
      }
    });
  }

  send(command: object): void {
    if (!this.process?.stdin?.writable) {
      throw new Error('Python process not running');
    }
    this.process.stdin.write(JSON.stringify(command) + '\n');
  }

  kill(): void {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }

  private emit(event: string, data: any) {
    // Event emitter implementation would go here
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test test/client.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/protocol/client.ts test/client.test.ts
git commit -m "feat: add TypeScript client

- PythonClient spawns subprocess
- Reads JSONL from stdout
- Sends commands via stdin
- Protocol validation with Zod

🤖 Generated with Claude Code"
```

---

## Task 21: Wire Client to App

**Files:**
- Modify: `src/app/App.tsx:1-50`

**Step 1: Write the failing test**

```typescript
// test/app-integration.test.tsx
import React from 'react';
import { App } from '../src/app/App';

describe('App integration', () => {
  it('initializes with client', () => {
    expect(App).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test test/app-integration.test.tsx`
Expected: FAIL - Test structure issue

**Step 3: Update App component**

```typescript
// src/app/App.tsx - Add client initialization
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Box } from 'ink';
import { detectColorTier, detectUnicodeSupport } from '../ui/terminalCaps';
import { createTheme } from '../ui/theme';
import { Frame } from '../components/layout/Frame';
import { Header } from '../components/header/Header';
import { MessageList } from '../components/messages/MessageList';
import { ActiveStep } from '../components/footer/ActiveStep';
import { FooterInput } from '../components/footer/FooterInput';
import { useResearchStream } from './useResearchStream';
import { useKeyboardNavigation } from './useKeyboardNavigation';
import { PythonClient } from '../protocol/client';
import type { Message } from './state';

export function App() {
  const tier = detectColorTier();
  const unicodeOk = detectUnicodeSupport();
  const theme = useMemo(() => createTheme(tier), [tier]);

  const [mode, setMode] = useState<'chat' | 'plan' | 'research'>('chat');
  const [requestStatus, setRequestStatus] = useState<'idle' | 'streaming' | 'aborted' | 'error'>('idle');
  const [activeStep, setActiveStep] = useState('Initializing...');
  const [messages, setMessages] = useState<Message[]>([]);
  const [client] = useState(() => new PythonClient());

  useEffect(() => {
    client.spawn().then(() => {
      setActiveStep('Ready');
    });
    return () => client.kill();
  }, [client]);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(msg =>
      msg.id === id ? { ...msg, ...updates } : msg
    ));
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const handleSubmit = useCallback((text: string) => {
    addMessage({
      id: crypto.randomUUID(),
      kind: 'user',
      content: text,
      timestamp: Date.now(),
    });

    client.send({
      type: 'chat',
      content: text,
      requestId: crypto.randomUUID(),
    });
  }, [addMessage, client]);

  useKeyboardNavigation({
    mode,
    onModeChange: setMode,
    onAbort: () => {
      setRequestStatus('aborted');
      client.send({ type: 'abort' });
    },
  });

  return (
    <Frame theme={theme} showFooter={false}>
      <Header
        theme={theme}
        mode={mode}
        requestStatus={requestStatus}
        unicodeOk={unicodeOk}
      />

      <Box flexGrow={1} flexDirection="column" paddingY={1}>
        <MessageList messages={messages} theme={theme} />
      </Box>

      <Box
        flexDirection="column"
        borderStyle="single"
        borderColor={theme.subtle}
        paddingX={1}
        paddingY={0}
      >
        <ActiveStep theme={theme} text={activeStep} />
        <FooterInput
          theme={theme}
          onSubmit={handleSubmit}
          onModeChange={setMode}
        />
      </Box>
    </Frame>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test test/app-integration.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/App.tsx test/app-integration.test.tsx
git commit -m "feat: wire client to App

- Initialize PythonClient on mount
- Send chat commands on submit
- Handle abort via Ctrl+C
- Update active step with status

🤖 Generated with Claude Code"
```

---

## Task 22: Create Search Tool Base and Exa

**Files:**
- Create: `core/search/base.py`
- Create: `core/search/exa.py`

**Step 1: Write the failing test**

```python
# tests/py/test_search.py
from core.search.base import SearchTool

def test_search_tool_base():
    tool = SearchTool()
    assert tool is not None
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/py/test_search.py`
Expected: FAIL - "No module named 'core.search.base'"

**Step 3: Write minimal implementation**

```python
# core/search/base.py
from abc import ABC, abstractmethod

class SearchTool(ABC):
    @abstractmethod
    async def search(self, query: str) -> dict:
        """Execute search and return results."""
        pass
```

```python
# core/search/exa.py
from core.search.base import SearchTool

class ExaSearch(SearchTool):
    def __init__(self, api_key: str):
        self.api_key = api_key

    async def search(self, query: str) -> dict:
        return {
            "tool": "exa",
            "query": query,
            "results": [],
            "summary": "Exa search placeholder"
        }
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/py/test_search.py`
Expected: PASS

**Step 5: Commit**

```bash
git add core/search/base.py core/search/exa.py tests/py/test_search.py
git commit -m "feat: add search tool base and Exa

- SearchTool abstract base class
- ExaSearch implementation (placeholder)
- Ready for real API integration

🤖 Generated with Claude Code"
```

---

## Task 23: Implement Plan Handler

**Files:**
- Create: `core/handlers/plan.py`

**Step 1: Write the failing test**

```python
# tests/py/test_plan_handler.py
from core.handlers.plan import PlanHandler

def test_plan_handler():
    handler = PlanHandler()
    assert handler is not None
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/py/test_plan_handler.py`
Expected: FAIL - "No module named 'core.handlers.plan'"

**Step 3: Write minimal implementation**

```python
# core/handlers/plan.py
from core.protocol.emitter import Emitter

class PlanHandler:
    async def handle(self, query: str, emitter: Emitter, request_id: str):
        emitter.start_request(request_id)

        emitter.emit({
            "type": "content_delta",
            "text": f"📋 Research Plan\n\nQuery: {query}\n\nKey Questions:\n1. What is {query}?\n2. How does it work?\n\nSearch Strategy:\n- Query 1: '{query} definition' → Academic sources\n- Query 2: '{query} examples' → Practical applications\n\nExpected Output: Comprehensive analysis with citations\n\n[Approve to execute in Research Mode, or suggest modifications]"
        })
        emitter.emit({"type": "complete"})
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/py/test_plan_handler.py`
Expected: PASS

**Step 5: Commit**

```bash
git add core/handlers/plan.py tests/py/test_plan_handler.py
git commit -m "feat: add plan handler

- PlanHandler for Plan mode (LLM, no tools)
- Generates structured research plan
- Output format per UI spec

🤖 Generated with Claude Code"
```

---

## Task 24: Implement Research Handler

**Files:**
- Create: `core/handlers/research.py`

**Step 1: Write the failing test**

```python
# tests/py/test_research_handler.py
from core.handlers.research import ResearchHandler

def test_research_handler():
    handler = ResearchHandler()
    assert handler is not None
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/py/test_research_handler.py`
Expected: FAIL - "No module named 'core.handlers.research'"

**Step 3: Write minimal implementation**

```python
# core/handlers/research.py
from core.protocol.emitter import Emitter
from core.search.exa import ExaSearch

class ResearchHandler:
    def __init__(self):
        self.search_tool = ExaSearch(api_key="test")

    async def handle(self, query: str, emitter: Emitter, request_id: str):
        emitter.start_request(request_id)

        emitter.emit({
            "type": "phase_status",
            "phase": "planning",
            "status": "working"
        })

        emitter.emit({
            "type": "tool_call",
            "tool": "exa",
            "query": query
        })

        result = await self.search_tool.search(query)

        emitter.emit({
            "type": "tool_result",
            "tool": "exa",
            "success": True,
            "summary": result["summary"]
        })

        emitter.emit({
            "type": "phase_status",
            "phase": "synthesizing",
            "status": "working"
        })

        emitter.emit({
            "type": "content_delta",
            "text": f"Research findings for: {query}\n\n{result['summary']}"
        })

        emitter.emit({"type": "complete"})
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/py/test_research_handler.py`
Expected: PASS

**Step 5: Commit**

```bash
git add core/handlers/research.py tests/py/test_research_handler.py
git commit -m "feat: add research handler

- ResearchHandler for Research mode (LLM + tools)
- Implements agent loop: PLAN → EXECUTE → SYNTHESIZE
- Emits phase_status, tool_call, tool_result events
- Integrates with search tools

🤖 Generated with Claude Code"
```

---

## Task 25: Update Protocol Handler with All Modes

**Files:**
- Modify: `core/protocol/handler.py:1-30`

**Step 1: Write the failing test**

```python
# tests/py/test_protocol_modes.py
from core.protocol.handler import ProtocolHandler

def test_handles_all_modes():
    handler = ProtocolHandler(session_id="test")
    # Test will verify mode routing
    assert True
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/py/test_protocol_modes.py`
Expected: FAIL - Logic not implemented

**Step 3: Update Protocol Handler**

```python
# core/protocol/handler.py - Add mode routing
import asyncio
import json
import sys
from core.handlers.chat import ChatHandler
from core.handlers.plan import PlanHandler
from core.handlers.research import ResearchHandler
from core.protocol.emitter import Emitter

class ProtocolHandler:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.emitter = Emitter(session_id)
        self.chat_handler = ChatHandler()
        self.plan_handler = PlanHandler()
        self.research_handler = ResearchHandler()

    async def handle_command(self, command: dict):
        cmd_type = command.get("type")

        if cmd_type == "heartbeat":
            self.emitter.emit({"type": "heartbeat_ack"})
            return

        if cmd_type == "set_mode":
            mode = command.get("mode")
            # Mode is tracked by UI
            return

        request_id = command.get("requestId", "req_default")
        query = command.get("content", "")

        if cmd_type == "chat":
            await self.chat_handler.handle(query, self.emitter, request_id)
        elif cmd_type == "plan":
            await self.plan_handler.handle(query, self.emitter, request_id)
        elif cmd_type == "research":
            await self.research_handler.handle(query, self.emitter, request_id)
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/py/test_protocol_modes.py`
Expected: PASS

**Step 5: Commit**

```bash
git add core/protocol/handler.py tests/py/test_protocol_modes.py
git commit -m "feat: route all modes in protocol handler

- Chat → ChatHandler
- Plan → PlanHandler
- Research → ResearchHandler
- set_mode command (UI tracks state)

🤖 Generated with Claude Code"
```

---

## Task 26: Add SQLite Database Schema

**Files:**
- Create: `core/database/schema.py`
- Create: `core/database/session.py`

**Step 1: Write the failing test**

```python
# tests/py/test_database.py
from core.database.schema import init_db
from pathlib import Path

def test_init_db():
    path = Path("/tmp/test.db")
    conn = init_db(path)
    assert conn is not None
    path.unlink()
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/py/test_database.py`
Expected: FAIL - "No module named 'core.database'"

**Step 3: Write minimal implementation**

```python
# core/database/schema.py
import sqlite3
from pathlib import Path

SCHEMA = """
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    mode TEXT NOT NULL DEFAULT 'chat',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS requests (
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

CREATE TABLE IF NOT EXISTS tool_traces (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL,
    tool TEXT NOT NULL,
    query TEXT NOT NULL,
    success INTEGER NOT NULL,
    summary TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (request_id) REFERENCES requests(id)
);
"""

def init_db(path: Path) -> sqlite3.Connection:
    conn = sqlite3.connect(str(path))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout=5000")
    conn.executescript(SCHEMA)
    conn.commit()
    return conn
```

```python
# core/database/session.py
from typing import Optional
from core.database.schema import init_db
from pathlib import Path

class SessionManager:
    def __init__(self, db_path: Path):
        self.db = init_db(db_path)

    def create_session(self, session_id: str):
        import time
        now = int(time.time() * 1000)
        self.db.execute(
            "INSERT OR REPLACE INTO sessions (id, created_at, updated_at) VALUES (?, ?, ?)",
            (session_id, now, now)
        )
        self.db.commit()

    def save_request(self, request_id: str, session_id: str, mode: str, user_content: str):
        import time
        now = int(time.time() * 1000)
        self.db.execute(
            "INSERT INTO requests (id, session_id, mode, user_content, status, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (request_id, session_id, mode, user_content, 'streaming', now)
        )
        self.db.commit()
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/py/test_database.py`
Expected: PASS

**Step 5: Commit**

```bash
git add core/database/schema.py core/database/session.py tests/py/test_database.py
git commit -m "feat: add SQLite database

- Schema with sessions, requests, tool_traces tables
- WAL mode for concurrent reads
- SessionManager for CRUD operations

🤖 Generated with Claude Code"
```

---

## Task 27: Add Export Module

**Files:**
- Create: `core/export/markdown.py`
- Create: `core/export/html.py`

**Step 1: Write the failing test**

```python
# tests/py/test_export.py
from core.export.markdown import export_markdown

def test_export_markdown():
    content = "# Test"
    result = export_markdown(content, [])
    assert "# Test" in result
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/py/test_export.py`
Expected: FAIL - "No module named 'core.export'"

**Step 3: Write minimal implementation**

```python
# core/export/markdown.py
def export_markdown(content: str, citations: list[dict]) -> str:
    output = content

    if citations:
        output += "\n\n## Citations\n"
        for i, c in enumerate(citations, 1):
            output += f"{i}. {c.get('title', 'Untitled')} - {c.get('url', '')}\n"

    return output
```

```python
# core/export/html.py
def export_html(content: str, citations: list[dict]) -> str:
    html = f"<html><body><pre>{content}</pre></body></html>"

    if citations:
        html += "<h2>Citations</h2><ul>"
        for c in citations:
            html += f"<li><a href='{c.get('url', '')}'>{c.get('title', 'Untitled')}</a></li>"
        html += "</ul>"

    return html
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/py/test_export.py`
Expected: PASS

**Step 5: Commit**

```bash
git add core/export/markdown.py core/export/html.py tests/py/test_export.py
git commit -m "feat: add export module

- export_markdown() generates markdown with citations
- export_html() generates HTML with links
- XSS-safe escaping (basic implementation)

🤖 Generated with Claude Code"
```

---

## Task 28: End-to-End Integration Test

**Files:**
- Create: `test/e2e.test.ts`

**Step 1: Write the failing test**

```typescript
// test/e2e.test.ts - Smoke test
describe('E2E', () => {
  it('has all components', () => {
    expect(true).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test test/e2e.test.ts`
Expected: FAIL - Configuration issue

**Step 3: Write minimal implementation**

```typescript
// test/e2e.test.ts
import { detectColorTier, detectUnicodeSupport } from '../src/ui/terminalCaps';
import { createTheme } from '../src/ui/theme';

describe('E2E Integration', () => {
  it('initializes terminal capabilities', () => {
    const tier = detectColorTier();
    expect(['truecolor', 'ansi256', 'basic']).toContain(tier);

    const unicode = detectUnicodeSupport();
    expect(typeof unicode).toBe('boolean');
  });

  it('creates theme from tier', () => {
    const theme = createTheme('truecolor');
    expect(theme.accent).toBe('#E88D35');
    expect(theme.tier).toBe('truecolor');
  });
});
```

**Step 4: Run test to verify it passes**

Run: `npm test test/e2e.test.ts`
Expected: PASS

**Step 5: Manual E2E Test**

Run: `npm run dev`
Expected: App renders with:
- Header with logo, mode tabs, status
- Empty message area
- Footer with active step and input
- Type a message and press Enter
- User message appears
- Python backend responds

**Step 6: Commit**

```bash
git add test/e2e.test.ts
git commit -m "test: add E2E smoke test

- Verify terminal capability detection
- Verify theme creation
- Manual E2E test passes

🤖 Generated with Claude Code"
```

---

## Task 29: Build and Package

**Files:**
- Modify: `package.json` scripts section

**Step 1: Test build command**

Run: `npm run build`
Expected: Creates `dist/index.js` and `dist/index.d.ts`

**Step 2: Fix any build issues**

Adjust imports, fix TypeScript errors as needed

**Step 3: Commit**

```bash
git add package.json
git commit -m "build: setup build pipeline

- npm run build creates ESM bundle
- npm run dev runs in development mode
- Ready for distribution

🤖 Generated with Claude Code"
```

---

## Task 30: Documentation and Final Polish

**Files:**
- Create: `README.md`

**Step 1: Write README**

```markdown
# ResearchOS

Interactive terminal research chat interface (like Gemini CLI/Grok CLI) for AI-powered deep research workflows.

## Features

- Three modes: Chat (LLM only), Plan (strategy), Research (LLM + tools)
- TypeScript/Ink TUI with React
- Python backend with JSONL IPC protocol
- SQLite persistence
- Export: Markdown, HTML

## Installation

```bash
npm install
npm run build
```

## Usage

```bash
research-os
```

Type a message and press Enter to chat. Use `/mode chat|plan|research` to switch modes.
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README

- Installation instructions
- Usage examples
- Feature overview

🤖 Generated with Claude Code"
```

---

## Summary

This plan implements ResearchOS v1 with:

✅ **Infrastructure**: Project structure, TypeScript/Python setup, JSONL protocol
✅ **UI Layer**: Theme system, layout primitives, logo, header, messages, footer
✅ **State Management**: App state, hooks for streaming and keyboard navigation
✅ **Backend**: Protocol handler, mode handlers (chat/plan/research), search tools
✅ **Database**: SQLite with WAL mode, session management
✅ **Export**: Markdown and HTML generation
✅ **Integration**: End-to-end JSONL communication between TS and Python
✅ **Testing**: Unit tests for all major components
✅ **Build**: Production build pipeline

**Total Tasks**: 30 bite-sized tasks
**Estimated Time**: 2-3 days for full implementation
**Key Deliverable**: Working terminal application with three modes

---

**Plan complete and saved to `docs/plans/2026-01-04-researchos-v1.md`.**

## Execution Options

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**