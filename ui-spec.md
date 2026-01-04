---
title: "ResearchOS TUI UI Spec v2.0 (Modern Research Lab)"
date: "2026-01-04"
status: "Proposed"
version: "2.0"
defaultOption: "Option B (Expressive)"
inspiration: "CC-MIRROR + original ResearchOS concepts"
---

# ResearchOS TUI UI Spec (Ink TUI)

This document specifies a React + Ink terminal-based research interface with a streaming-first architecture. It combines the best patterns from CC-MIRROR (fixed dimensions, layout primitives, keyboard navigation) with ResearchOS's unique needs (3-region layout, event-driven streaming, mode tabs, active step pinning).

**Key Improvements v2.0:**
- Multi-size logo system (banner/monogram/compact/minimal) with themed dividers
- Fixed-dimension Frame to prevent terminal flicker
- Comprehensive keyboard navigation with escape routing
- Business logic hooks for streaming, active step, and navigation
- Layout primitives (Frame, Section, Divider, HintBar)
- Enhanced theme system with icons, spinners, and keyboard hints

---

## Goals

1. **Mode is never ambiguous**
   - User can always see current mode (tabs + prompt label).
   - Keyboard shortcuts for mode switching (Escape to cycle, `/mode` command).

2. **Dense without fatigue**
   - Logs/tooling/status visually separated from final answer.
   - Answer blocks prominent, log blocks dimmed with borders.

3. **Research flow doesn't scroll away**
   - "Active plan step / current action" stays pinned above input.
   - 3-region layout: Header (fixed) → Main (scrollable) → Footer (fixed).

4. **Warm "Modern Research Lab" aesthetic**
   - Terra-cotta accents (#C23B36, #E65A54, #E88D35, #F4C4C0).
   - Terminal-safe styling with graceful fallbacks.

5. **Terminal-safe animation**
   - Chunked segments to minimize Text nodes (~10fps max).
   - Respect reduce-motion preferences.
   - Graceful degradation at low capability terminals.

6. **No flicker or jitter**
   - Fixed dimensions prevent reflow.
   - Stable component heights.

---

## Non-goals (v1)

- Perfect fidelity gradients everywhere (terminals vary widely).
- Heavy background-color styling (inconsistent across terminals).
- Dependence on Shift+Tab/Esc Esc working everywhere (fallbacks first-class).
- Complex navigation patterns (keep it simple: tabs + escape routing).

---

## Terminal Reality Check

### Color
- Ink routes colors through `chalk`. Hex colors need **truecolor** support.
- 3-tier fallback: truecolor → 256-color → basic named colors.
- Always test with `TERM=xterm-256color` and `TERM=xterm`.

### Unicode
- Block/braille glyphs (`█▀▄░`, `╔═══╗`) depend on fonts and terminal rendering.
- Provide ASCII fallback for all logos and decorative elements.
- Check: `process.env.TERM !== 'dumb'`.

### Animation
- Updating lots of Text nodes at ~80ms causes high CPU/flicker.
- Keep animations limited to: logo gradient + spinner only.
- Chunk text into segments (4-6) instead of per-character.
- Respect `reduce-motion` flag.

### Dimensions
- Fixed frame width: **76 characters** (optimal for most terminals).
- Min height: **32 lines** (prevents flicker on content changes).
- Max width suggestion: **110 columns** for split-panel layout.

---

## UI Architecture

### 3-Region Layout (Always)

```
┌─────────────────────────────────────────────────────┐
│ HEADER (Fixed - 4 lines)                            │
│ ┌─Logo─┐ ┌─Mode Tabs─┐ ┌─Status┐                    │
│ │ R.OS │ │ Chat/Plan │ │STREAM │                    │
│ └──────┘ └───────────┘ └───────┘                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│ MAIN CONTENT (Scrollable - flexible)               │
│ ┌─────────────────────────────────────────────┐    │
│ │ User Message                                │    │
│ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │    │
│ │                                             │    │
│ │ Assistant Answer (bright, minimal chrome)   │    │
│ │                                             │    │
│ │ ┌─Log Message (border, dimmed)───────────┐  │    │
│ │ │ Tool: Searching Exa for "quantum..."   │  │    │
│ │ │ Result: Found 5 sources...             │  │    │
│ │ └────────────────────────────────────────┘  │    │
│ │                                             │    │
│ │ Citations: [1][2][3]                        │    │
│ └─────────────────────────────────────────────┘    │
│                                                     │
├─────────────────────────────────────────────────────┤
│ FOOTER (Fixed - 3 lines)                           │
│ ┌─Active Step────────────────────────────────┐    │
│ │ Active: Researching — "quantum computing"  │    │
│ │                                               │    │
│ │ > _                                           │    │
│ └───────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

**Header (fixed - 4 lines):**
- Logo + version
- Mode tabs: Chat / Plan / Research
- Request status: Idle / Streaming / Aborted / Error
- Keyboard hint: "Esc /mode | ↑↓ navigate | Enter select"

**Main content (scrollable):**
- Message stream (user + assistant)
- Answer blocks: high contrast, minimal chrome
- Log blocks: dimmed text, bordered container
- Citations: compact list at end of answers

**Footer (fixed - 3 lines):**
- Active Step (pinned context)
- Empty line
- Input prompt with cursor

### Responsive Enhancement (Option B)

When width ≥ 110 columns:

```
┌─────────────────────────────────────────────────────┐
│ HEADER                                              │
├──────────────────────┬──────────────────────────────┤
│                      │                              │
│ MAIN CONTENT         │ RIGHT PANEL (Pinned)        │
│ (scrollable)         │ - Current plan steps        │
│                      │ - Recent tool results       │
│                      │ - Research progress         │
│                      │                              │
│                      │                              │
├──────────────────────┴──────────────────────────────┤
│ FOOTER                                           │
└─────────────────────────────────────────────────────┘
```

When width < 110 columns: single column with active step only.

---

## File Structure

```
src/
  app/
    App.tsx                          # Main app component
    state.ts                         # State types and hooks
    useKeyboardNavigation.ts         # Escape routing logic
    useResearchStream.ts             # Event stream handling
    useActiveStep.ts                 # Active step derivation

  ui/
    theme.ts                         # Theme with tiered fallbacks
    terminalCaps.ts                  # Capability detection
    constants.ts                     # Icons, spinners, key hints

  components/
    layout/                          # Layout primitives
      Frame.tsx                      # Fixed-dimension container
      Section.tsx                    # Content grouping
      Divider.tsx                    # Themed dividers
      HintBar.tsx                    # Keyboard hints
      Row.tsx                        # Flex row
      Column.tsx                     # Flex column

    header/
      Header.tsx                     # Main header
      Logo.tsx                       # Multi-size logo system
      ModeTabs.tsx                   # Chat/Plan/Research tabs
      StatusPill.tsx                 # Request status indicator

    messages/
      MessageList.tsx                # Scrollable message stream
      UserMessage.tsx                # User input renderer
      AnswerMessage.tsx              # Assistant response renderer
      LogMessage.tsx                 # Tool trace renderer
      ToolCallMessage.tsx            # Tool invocation renderer
      ToolResultMessage.tsx          # Tool result renderer
      CitationList.tsx               # Citation renderer

    footer/
      FooterInput.tsx                # Input prompt
      ActiveStep.tsx                 # Pinned active context

  protocol/
    types.ts                         # UiEvent union type
    parser.ts                        # Event stream parser
```

---

## Theme System (Terra Cotta v2)

### Color Palette

```typescript
// src/ui/theme.ts
import type { ColorTier } from './terminalCaps';

export interface Theme {
  tier: ColorTier;
  // Primary colors
  accent: string;      // #E88D35 (orange) - primary actions
  accent2: string;     // #E65A54 (coral) - secondary actions
  dim: string;         // #F4C4C0 (pink) - metadata
  text: string;        // #FFFFFF - main text
  subtle: string;      // #8A8A8A - secondary text
  error: string;       // #E65A54 - errors
  success: string;     // #73C991 - success states

  // Border colors
  border: string;      // #E65A54 - default borders
  borderFocus: string; // #E88D35 - focused elements
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

### Icons & Constants

```typescript
// src/ui/constants.ts

// ═══════════════════════════════════════════════════════════
// UNICODE ICONS (with ASCII fallbacks)
// ═══════════════════════════════════════════════════════════

export interface Icons {
  // Navigation
  pointer: string;
  pointerEmpty: string;
  arrowRight: string;
  arrowLeft: string;
  arrowUp: string;
  arrowDown: string;
  // Status
  check: string;
  cross: string;
  warning: string;
  bullet: string;
  star: string;
  // Decorative
  diamond: string;
  circle: string;
  square: string;
  // Borders (for dividers)
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

// ═══════════════════════════════════════════════════════════
// SPINNER FRAMES (with ASCII fallback)
// ═══════════════════════════════════════════════════════════

const unicodeSpinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'] as const;
const asciiSpinnerFrames = ['-', '\\', '|', '/'] as const;

export function getSpinnerFrames(unicodeOk: boolean): readonly string[] {
  return unicodeOk ? unicodeSpinnerFrames : asciiSpinnerFrames;
}

// ═══════════════════════════════════════════════════════════
// BORDER STYLE (with ASCII fallback)
// ═══════════════════════════════════════════════════════════

// Ink border styles: 'single' uses ASCII-safe box chars, 'round' uses Unicode
export type BorderStyle = 'single' | 'round' | 'bold' | 'double' | 'singleDouble' | 'doubleSingle' | 'classic';

export function getBorderStyle(unicodeOk: boolean): BorderStyle {
  // 'single' works in ASCII terminals, 'round' needs Unicode
  return unicodeOk ? 'round' : 'single';
}

// ═══════════════════════════════════════════════════════════
// KEY HINTS (with ASCII fallback)
// ═══════════════════════════════════════════════════════════

export function getKeyHints(unicodeOk: boolean) {
  const icons = getIcons(unicodeOk);
  return {
    navigate: `${icons.arrowUp}${icons.arrowDown} Navigate`,
    select: unicodeOk ? '↵ Select' : 'Enter Select',
    back: 'Esc Back',
    mode: 'Esc /mode',
    abort: 'Ctrl+C Abort',
  } as const;
}

// ═══════════════════════════════════════════════════════════
// LEGACY EXPORTS (for backwards compatibility)
// ═══════════════════════════════════════════════════════════

// Default to Unicode icons (use getIcons(unicodeOk) for fallback support)
export const icons = unicodeIcons;
export const spinnerFrames = unicodeSpinnerFrames;
export const keyHints = {
  navigate: '↑↓ Navigate',
  select: '↵ Select',
  back: 'Esc Back',
  mode: 'Esc /mode',
  abort: 'Ctrl+C Abort',
} as const;
```

---

## Logo System

### Logo Variants

The logo has 4 size variants for different contexts:

1. **Banner** - Full logo with box-drawing border (home screen)
2. **Monogram** - R.OS with animated gradient (default)
3. **Compact** - Single line with diamond accent (tight spaces)
4. **Minimal** - Just "R.OS" (headers, small areas)

```typescript
// src/components/layout/Logo.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Box, Text } from 'ink';
import type { Theme } from '../../ui/theme';
import { icons } from '../../ui/constants';

// ═══════════════════════════════════════════════════════════
// LOGO CONSTANTS
// ═══════════════════════════════════════════════════════════

const FRAME_WIDTH = 76;

// Banner with box-drawing
const BANNER = [
  '╔═══════════════════════════════════════════════════════╗',
  '║  █▀█  ░  █▀█  █▀   ResearchOS                        ║',
  '║  █▀▄  ░  █▄█  ▄█   Modern Research Lab               ║',
  '╚═══════════════════════════════════════════════════════╝',
];

// Monogram (default)
const MONOGRAM_TOP = '█▀█  ░  █▀█  █▀';
const MONOGRAM_BOT = '█▀▄  ░  █▄█  ▄█';

// ASCII fallback
const ASCII_FALLBACK = 'ResearchOS';

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

type LogoSize = 'banner' | 'monogram' | 'compact' | 'minimal';

interface LogoProps {
  theme: Theme;
  unicodeOk: boolean;
  reduceMotion: boolean;
  size?: LogoSize;
  animate?: boolean;
  collapseAfterMs?: number;
}

export function Logo({
  theme,
  unicodeOk,
  reduceMotion,
  size = 'monogram',
  animate = true,
  collapseAfterMs = 3000,
}: LogoProps) {
  const [offset, setOffset] = useState(0);
  const [currentSize, setCurrentSize] = useState<LogoSize>(size);

  // Gradient colors (cycle through for animation)
  const gradient = useMemo(() => {
    return theme.tier === 'truecolor'
      ? ['#C23B36', '#E65A54', '#E88D35', '#F4C4C0', '#E88D35', '#E65A54']
      : [theme.accent2, theme.accent, theme.dim, theme.accent];
  }, [theme]);

  // Animation loop
  useEffect(() => {
    if (reduceMotion || !animate) return;
    const t = setInterval(() => setOffset(v => (v + 1) % gradient.length), 100);
    return () => clearInterval(t);
  }, [reduceMotion, animate, gradient.length]);

  // Auto-collapse
  useEffect(() => {
    if (!collapseAfterMs) return;
    const t = setTimeout(() => setCurrentSize('monogram'), collapseAfterMs);
    return () => clearTimeout(t);
  }, [collapseAfterMs]);

  // ASCII fallback
  if (!unicodeOk) {
    return <Text color={theme.accent2}>{ASCII_FALLBACK}</Text>;
  }

  // Render based on size
  switch (currentSize) {
    case 'banner':
      return <BannerLogo gradient={gradient} offset={offset} />;
    case 'monogram':
      return <MonogramLogo theme={theme} gradient={gradient} offset={offset} />;
    case 'compact':
      return <CompactLogo theme={theme} />;
    case 'minimal':
      return <MinimalLogo theme={theme} />;
    default:
      return <MonogramLogo theme={theme} gradient={gradient} offset={offset} />;
  }
}

// ═══════════════════════════════════════════════════════════
// BANNER LOGO (with box-drawing border)
// ═══════════════════════════════════════════════════════════

function BannerLogo({ gradient, offset }: { gradient: string[]; offset: number }) {
  return (
    <Box flexDirection="column">
      {BANNER.map((line, i) => (
        <Text key={i} color={gradient[(i + offset) % gradient.length]}>
          {line}
        </Text>
      ))}
    </Box>
  );
}

// ═══════════════════════════════════════════════════════════
// MONOGRAM LOGO (animated gradient)
// ═══════════════════════════════════════════════════════════

function MonogramLogo({
  theme,
  gradient,
  offset,
}: {
  theme: Theme;
  gradient: string[];
  offset: number;
}) {
  return (
    <Box flexDirection="column">
      <GradientText text={MONOGRAM_TOP} gradient={gradient} offset={offset} segments={4} />
      <GradientText text={MONOGRAM_BOT} gradient={gradient} offset={offset + 1} segments={4} />
    </Box>
  );
}

// ═══════════════════════════════════════════════════════════
// COMPACT LOGO (single line)
// ═══════════════════════════════════════════════════════════

function CompactLogo({ theme }: { theme: Theme }) {
  return (
    <Box>
      <Text color={theme.accent2} bold>{icons.diamond} </Text>
      <Text color={theme.accent} bold>R</Text>
      <Text color={theme.dim}>.</Text>
      <Text color={theme.accent} bold>OS</Text>
    </Box>
  );
}

// ═══════════════════════════════════════════════════════════
// MINIMAL LOGO (just text)
// ═══════════════════════════════════════════════════════════

function MinimalLogo({ theme }: { theme: Theme }) {
  return (
    <Text color={theme.accent} bold>R.OS</Text>
  );
}

// ═══════════════════════════════════════════════════════════
// GRADIENT TEXT HELPER
// ═══════════════════════════════════════════════════════════

function GradientText({
  text,
  gradient,
  offset,
  segments = 4,
}: {
  text: string;
  gradient: string[];
  offset: number;
  segments?: number;
}) {
  const parts = splitIntoSegments(text, segments);
  return (
    <Box>
      {parts.map((part, i) => (
        <Text key={i} color={gradient[(i + offset) % gradient.length]}>
          {part}
        </Text>
      ))}
    </Box>
  );
}

function splitIntoSegments(line: string, n: number): string[] {
  const segLen = Math.ceil(line.length / Math.max(1, n));
  const out: string[] = [];
  for (let i = 0; i < line.length; i += segLen) {
    out.push(line.slice(i, i + segLen));
  }
  return out;
}
```

---

## Layout Components

### Frame (Fixed Dimensions)

```typescript
// src/components/layout/Frame.tsx
import React, { type ReactNode } from 'react';
import { Box, Text } from 'ink';
import type { Theme } from '../../ui/theme';

// Fixed dimensions prevent terminal flicker/reflow
const FRAME_WIDTH = 76;
const FRAME_MIN_HEIGHT = 32; // Must match "Terminal Reality Check" section

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
      {showFooter && <Footer theme={theme} />}
    </Box>
  );
}

function Footer({ theme }: { theme: Theme }) {
  return (
    <Box marginTop={1} justifyContent="space-between">
      <Box>
        <Text color={theme.subtle}>ResearchOS v0.1</Text>
      </Box>
      <Box>
        <Text color={theme.subtle}>Esc /mode | ↑↓ navigate</Text>
      </Box>
    </Box>
  );
}
```

### Themed Divider

```typescript
// src/components/layout/Divider.tsx
import { Box, Text } from 'ink';
import type { Theme } from '../../ui/theme';
import { getIcons, type Icons } from '../../ui/constants';

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

interface ThemedDividerProps {
  theme: Theme;
  unicodeOk?: boolean;
  width?: number;
}

export function ThemedDivider({
  theme,
  unicodeOk = true,
  width = 60,
}: ThemedDividerProps) {
  const icons = getIcons(unicodeOk);
  const third = Math.floor(width / 3);
  return (
    <Box marginY={1}>
      <Text color={theme.accent2}>
        {icons.horizontalLineThick.repeat(third)}
      </Text>
      <Text color={theme.accent}>{icons.diamond}</Text>
      <Text color={theme.dim}>
        {icons.horizontalLineThick.repeat(third)}
      </Text>
      <Text color={theme.accent}>{icons.diamond}</Text>
      <Text color={theme.accent2}>
        {icons.horizontalLineThick.repeat(third)}
      </Text>
    </Box>
  );
}
```

### Section & HintBar

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

// src/components/layout/HintBar.tsx
import { Box, Text } from 'ink';
import type { Theme } from '../../ui/theme';
import { keyHints } from '../../ui/constants';

export function HintBar({
  theme,
  hints = [keyHints.navigate, keyHints.select, keyHints.back],
}: {
  theme: Theme;
  hints?: string[];
}) {
  return (
    <Box marginTop={1}>
      <Text color={theme.subtle}>{hints.join('  •  ')}</Text>
    </Box>
  );
}
```

---

## Header Components

### Mode Tabs

```typescript
// src/components/header/ModeTabs.tsx
import React from 'react';
import { Box, Text } from 'ink';
import type { Theme } from '../../ui/theme';

export type Mode = 'chat' | 'plan' | 'research';

interface TabProps {
  label: string;
  active: boolean;
  theme: Theme;
}

function Tab({ label, active, theme }: TabProps) {
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

export function ModeTabs({ mode, theme }: { mode: Mode; theme: Theme }) {
  return (
    <Box gap={1}>
      <Tab label="Chat" active={mode === 'chat'} theme={theme} />
      <Tab label="Plan" active={mode === 'plan'} theme={theme} />
      <Tab label="Research" active={mode === 'research'} theme={theme} />
    </Box>
  );
}
```

### Status Pill

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

### Complete Header

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
  reduceMotion,
}: {
  theme: Theme;
  mode: 'chat' | 'plan' | 'research';
  requestStatus: 'idle' | 'streaming' | 'aborted' | 'error';
  unicodeOk: boolean;
  reduceMotion: boolean;
}) {
  return (
    <Box flexDirection="column" paddingBottom={1}>
      <Box justifyContent="space-between">
        <Box gap={2}>
          <Logo
            theme={theme}
            unicodeOk={unicodeOk}
            reduceMotion={reduceMotion}
            size="monogram"
            animate={!reduceMotion}
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

---

## State Management

### State Types

```typescript
// src/app/state.ts
import type { Mode } from '../components/header/ModeTabs';
import type { RequestStatus } from '../components/header/StatusPill';

// Protocol events
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
  // Core state
  mode: Mode;
  requestStatus: RequestStatus;
  activeStep: string;

  // Messages
  messages: Message[];

  // Split panel (Option B)
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

### useResearchStream Hook

```typescript
// src/app/useResearchStream.ts
import { useCallback, useEffect, useRef } from 'react';
import type { UiEvent, AppState, AppActions } from './state';
import type { RequestStatus } from '../components/header/StatusPill';

// Map phase_status.status to RequestStatus
const phaseStatusToRequestStatus: Record<string, RequestStatus> = {
  idle: 'idle',
  working: 'streaming',
  complete: 'idle',   // complete maps to idle (finished successfully)
  error: 'error',
};

export function useResearchStream({
  state,
  actions,
  eventSource,
}: {
  state: AppState;
  actions: AppActions;
  eventSource: AsyncIterable<UiEvent> | null;
}) {
  // Use ref to get latest messages without re-creating callback
  const messagesRef = useRef(state.messages);
  messagesRef.current = state.messages;

  const handleEvent = useCallback((event: UiEvent) => {
    switch (event.type) {
      case 'phase_status':
        // Map phase status to request status correctly
        actions.setRequestStatus(phaseStatusToRequestStatus[event.status] || 'idle');
        if (event.status === 'working') {
          actions.setActiveStep(
            event.phase === 'planning' ? 'Planning research approach...' :
            event.phase === 'researching' ? 'Researching sources...' :
            'Synthesizing findings...'
          );
        } else if (event.status === 'complete') {
          actions.setActiveStep('Complete');
        }
        break;

      case 'tool_call':
        actions.setActiveStep(`Active: ${event.tool} — "${event.query}"`);
        actions.addMessage({
          id: crypto.randomUUID(),
          kind: 'log',
          content: `Tool: ${event.tool}\nQuery: ${event.query}`,
          timestamp: Date.now(),
          metadata: { tool: event.tool },
        });
        break;

      case 'tool_result':
        if (event.success) {
          actions.addMessage({
            id: crypto.randomUUID(),
            kind: 'log',
            content: `✓ ${event.tool}: ${event.summary}`,
            timestamp: Date.now(),
            metadata: { tool: event.tool },
          });
        } else {
          actions.addMessage({
            id: crypto.randomUUID(),
            kind: 'log',
            content: `✗ ${event.tool}: ${event.error}`,
            timestamp: Date.now(),
            metadata: { tool: event.tool },
          });
        }
        break;

      case 'content_delta':
        // Use ref to get latest messages
        const messages = messagesRef.current;
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.kind === 'answer') {
          actions.updateMessage(lastMessage.id, {
            content: lastMessage.content + event.text,
          });
        } else {
          actions.addMessage({
            id: crypto.randomUUID(),
            kind: 'answer',
            content: event.text,
            timestamp: Date.now(),
          });
        }
        break;

      case 'complete':
        actions.setRequestStatus('idle');
        actions.setActiveStep('Complete');
        break;

      case 'aborted':
        actions.setRequestStatus('aborted');
        actions.setActiveStep(`Aborted${event.partialSaved ? ' (saved)' : ''}`);
        break;

      case 'error':
        actions.setRequestStatus('error');
        actions.setActiveStep(`Error: ${event.message}`);
        break;
    }
  }, [actions]); // Removed state.messages - use ref instead

  useEffect(() => {
    if (!eventSource) return;

    let cancelled = false;

    // Proper async iteration - consume ALL events, not just the first one
    (async () => {
      try {
        for await (const event of eventSource) {
          if (cancelled) break;
          handleEvent(event);
        }
      } catch (err) {
        if (!cancelled) {
          actions.setRequestStatus('error');
          actions.setActiveStep(`Stream error: ${err instanceof Error ? err.message : 'Unknown'}`);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [eventSource, handleEvent, actions]);
}
```

### useKeyboardNavigation Hook

```typescript
// src/app/useKeyboardNavigation.ts
import { useInput } from 'ink';
import type { Mode } from '../components/header/ModeTabs';

/**
 * Global keyboard navigation - handles Escape and Ctrl+C only.
 *
 * IMPORTANT: /mode command should NOT be handled here!
 * The `/` character is valid text input. Command parsing (like /mode, /help)
 * should happen in the FooterInput component when the user submits input.
 */
export function useKeyboardNavigation({
  mode,
  onModeChange,
  onAbort,
  inputFocused = true,
}: {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  onAbort?: () => void;
  inputFocused?: boolean; // When true, only handle Escape/Ctrl+C
}) {
  useInput((input, key) => {
    // Abort - always works
    if (key.ctrl && input === 'c') {
      onAbort?.();
      return;
    }

    // Mode switching via Escape - only when input is not focused on text
    // or use it to cycle modes when there's no active text input
    if (key.escape) {
      // Cycle through modes: chat → plan → research → chat
      const modes: Mode[] = ['chat', 'plan', 'research'];
      const currentIndex = modes.indexOf(mode);
      const nextIndex = (currentIndex + 1) % modes.length;
      onModeChange(modes[nextIndex]);
      return;
    }

    // NOTE: /mode and other slash commands are parsed by FooterInput
    // when the user submits, NOT intercepted here as raw keystrokes.
  });
}
```

### FooterInput Component (with command parsing)

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

    // Parse slash commands
    if (trimmed.startsWith('/')) {
      const command = trimmed.slice(1).toLowerCase();

      if (command === 'mode' || command === 'm') {
        // Show mode selector or cycle - implementation choice
        onModeChange('research'); // Or show a selector
        setValue('');
        return;
      }

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

      // Unknown command - could show error or pass through
    }

    // Regular message
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

---

## Message Components

### Message List

```typescript
// src/components/messages/MessageList.tsx
import React from 'react';
import { Box } from 'ink';
import type { Theme } from '../../ui/theme';
import type { Message } from '../../app/state';
import { UserMessage } from './UserMessage';
import { AnswerMessage } from './AnswerMessage';
import { LogMessage } from './LogMessage';

interface MessageListProps {
  messages: Message[];
  theme: Theme;
  maxVisible?: number; // Windowed scrolling - show last N messages
}

export function MessageList({ messages, theme, maxVisible = 50 }: MessageListProps) {
  // Windowed approach: only render last N messages for performance
  const visibleMessages = maxVisible ? messages.slice(-maxVisible) : messages;

  return (
    <Box flexDirection="column" flexGrow={1} overflow="hidden">
      {visibleMessages.map((message) => {
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

### User Message

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

### Answer Message (Prominent)

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
      {message.metadata?.citations && (
        <CitationList citations={message.metadata.citations} theme={theme} />
      )}
    </Box>
  );
}

function CitationList({ citations, theme }: { citations: string[]; theme: Theme }) {
  return (
    <Box marginTop={1}>
      <Text color={theme.subtle}>Citations: </Text>
      {citations.map((citation, i) => (
        <Text key={i} color={theme.accent}>
          [{citation}]
        </Text>
      ))}
    </Box>
  );
}
```

### Log Message (Dimsed with Border)

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

---

## Footer Components

### Active Step

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

---

## Complete App Component

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
import { useResearchStream } from './useResearchStream';
import { useKeyboardNavigation } from './useKeyboardNavigation';
import type { Message } from './state';

export function App() {
  // Theme detection
  const tier = detectColorTier();
  const unicodeOk = detectUnicodeSupport();
  const theme = useMemo(() => createTheme(tier), [tier]);

  // State
  const [mode, setMode] = useState<'chat' | 'plan' | 'research'>('chat');
  const [requestStatus, setRequestStatus] = useState<'idle' | 'streaming' | 'aborted' | 'error'>('idle');
  const [activeStep, setActiveStep] = useState('Idle');
  const [messages, setMessages] = useState<Message[]>([]);

  // Message actions
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

  // Event source (from your backend)
  const eventSource = null; // TODO: Connect to your research stream

  // Hooks
  useResearchStream({
    state: { mode, requestStatus, activeStep, messages, showRightPanel: false, rightPanelContent: 'plan' },
    actions: { setMode, setRequestStatus, setActiveStep, addMessage, updateMessage, clearMessages },
    eventSource,
  });

  useKeyboardNavigation({
    mode,
    onModeChange: setMode,
    onAbort: () => setRequestStatus('aborted'),
  });

  return (
    <Frame theme={theme} showFooter={false}>
      {/* Header (fixed) */}
      <Header
        theme={theme}
        mode={mode}
        requestStatus={requestStatus}
        unicodeOk={unicodeOk}
        reduceMotion={false}
      />

      {/* Main content (scrollable via windowing) */}
      <Box flexGrow={1} flexDirection="column" paddingY={1}>
        <MessageList messages={messages} theme={theme} />
      </Box>

      {/* Footer (fixed) */}
      <Box
        flexDirection="column"
        borderStyle="single"
        borderColor={theme.subtle}
        paddingX={1}
        paddingY={0}
      >
        <ActiveStep theme={theme} text={activeStep} />
        {/* FooterInput goes here */}
      </Box>
    </Frame>
  );
}
```

---

## Terminal Capability Detection

```typescript
// src/ui/terminalCaps.ts
import supportsColor from 'supports-color';

export type ColorTier = 'truecolor' | 'ansi256' | 'basic';

export function detectColorTier(): ColorTier {
  const sc = supportsColor.stdout;
  if (sc?.has16m) return 'truecolor';
  if (sc?.has256) return 'ansi256';
  return 'basic';
}

export function detectUnicodeSupport(): boolean {
  return process.env.TERM !== 'dumb';
}
```

---

## Scroll Strategy

Ink doesn't provide native scrolling. The spec promises "scrollable main content" which requires explicit implementation. Here are the options:

### Option A: Windowed List (Recommended for v1)

Show only the last N messages. Simple, performant, and avoids complex scroll state.

```typescript
// Already implemented in MessageList above
interface MessageListProps {
  messages: Message[];
  theme: Theme;
  maxVisible?: number; // Default: 50
}

export function MessageList({ messages, theme, maxVisible = 50 }: MessageListProps) {
  const visibleMessages = messages.slice(-maxVisible);
  return (
    <Box flexDirection="column" flexGrow={1} overflow="hidden">
      {visibleMessages.map(/* ... */)}
    </Box>
  );
}
```

**Pros:** Simple, no dependencies, fast
**Cons:** Can't scroll up to see old messages

### Option B: Virtual List (for large histories)

Use a virtualized list that only renders visible items. Good for very long conversations.

```typescript
// Using a custom hook for virtualization
import { useState, useMemo } from 'react';
import { useStdoutDimensions } from 'ink';

interface UseVirtualListOptions<T> {
  items: T[];
  itemHeight: number; // Estimate lines per item
  overscan?: number;
}

export function useVirtualList<T>({ items, itemHeight, overscan = 3 }: UseVirtualListOptions<T>) {
  const [, height] = useStdoutDimensions();
  const [scrollTop, setScrollTop] = useState(0);

  const visibleCount = Math.ceil(height / itemHeight) + overscan * 2;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length, startIndex + visibleCount);

  const visibleItems = useMemo(
    () => items.slice(startIndex, endIndex),
    [items, startIndex, endIndex]
  );

  const scrollToBottom = () => {
    setScrollTop(Math.max(0, items.length * itemHeight - height));
  };

  return {
    visibleItems,
    startIndex,
    scrollTop,
    setScrollTop,
    scrollToBottom,
    totalHeight: items.length * itemHeight,
  };
}
```

**Pros:** Handles unlimited history, memory efficient
**Cons:** More complex, requires height estimation

### Option C: External Package

Use `ink-scroll-area` or similar package:

```bash
npm i ink-scroll-area
```

```typescript
import { ScrollArea } from 'ink-scroll-area';

function MessageList({ messages, theme }: Props) {
  return (
    <ScrollArea height={20}>
      {messages.map(msg => (
        <MessageComponent key={msg.id} message={msg} theme={theme} />
      ))}
    </ScrollArea>
  );
}
```

**Pros:** Full scroll support with keyboard navigation
**Cons:** External dependency, may have compatibility issues

### Recommended Approach

For v1, use **Option A (Windowed List)** with `maxVisible = 50`:
- Simple and reliable
- Covers 99% of use cases
- Add full scroll support in v2 if users request it

The MessageList component already includes this windowing:
```typescript
const visibleMessages = maxVisible ? messages.slice(-maxVisible) : messages;
```

### Auto-Scroll Behavior

When new messages arrive, automatically scroll to bottom:

```typescript
// In MessageList or parent component
const containerRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  // Auto-scroll to bottom on new message
  if (containerRef.current) {
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }
}, [messages.length]);
```

Note: In Ink, this is handled implicitly by the windowing approach (always showing latest messages).

---

## Implementation Steps

### Step 1: Initialize Project

```bash
mkdir research-os-tui && cd research-os-tui
npm init -y

# Core dependencies
npm i ink react
npm i -D typescript @types/node @types/react tsx

# UI dependencies
npm i chalk supports-color

# Optional
npm i ink-text-input
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"]
}
```

### Step 2: Implement Core UI Layer

1. **Add terminal capability detection** (`src/ui/terminalCaps.ts`)
2. **Add theme system** (`src/ui/theme.ts`, `src/ui/constants.ts`)
3. **Add layout primitives** (`src/components/layout/`)

### Step 3: Implement Header

1. **Logo component** with 4 variants
2. **Mode tabs** component
3. **Status pill** component
4. **Header** container

### Step 4: Implement Message System

1. **Message types** (`src/app/state.ts`)
2. **Message renderers** (`src/components/messages/`)
3. **Message list** container

### Step 5: Implement Footer

1. **Active step** component
2. **Footer input** component

### Step 6: Add Business Logic Hooks

1. **useResearchStream** - event handling
2. **useKeyboardNavigation** - escape routing
3. **useActiveStep** - context derivation

### Step 7: Wire Everything Together

1. **App component** - main container
2. **Connect event source** - your research backend
3. **Test keyboard navigation** - all modes and shortcuts

### Step 8: Add Responsive Panel (Optional)

```typescript
// Use useStdoutDimensions from Ink
import { useStdoutDimensions } from 'ink';

function ResponsiveLayout({ children }) {
  const [width, height] = useStdoutDimensions();

  if (width >= 110) {
    return (
      <Box>
        <Box flexGrow={1}>{children}</Box>
        <Box flexGrow={1}>{/* Right panel */}</Box>
      </Box>
    );
  }

  return <Box flexGrow={1}>{children}</Box>;
}
```

---

## Testing Strategy

### 1. Pure Function Tests

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

### 2. Event Handling Tests

```typescript
// test/useResearchStream.test.ts
import { renderHook, act } from '@testing-library/react';
import { useResearchStream } from '../src/app/useResearchStream';

describe('useResearchStream', () => {
  it('updates active step on tool_call', async () => {
    const { result } = renderHook(() => useResearchStream({
      // ...
    }));

    act(() => {
      // Simulate event
    });

    expect(result.current.actions.setActiveStep).toHaveBeenCalledWith(
      'Active: Exa — "quantum computing"'
    );
  });
});
```

### 3. Manual Smoke Test

Run the app and verify:
- [ ] Logo animates on startup (unless reduce-motion)
- [ ] Mode tabs visible and clickable
- [ ] Active step updates during streaming
- [ ] Messages render with correct hierarchy (answer vs log)
- [ ] Escape key cycles through modes
- [ ] No terminal flicker with fixed dimensions

---

## Open Knobs (Future)

```typescript
interface Config {
  // Animation
  reduceMotion: boolean;
  logoAnimation: 'off' | 'on';
  logoCollapseAfterMs: number | null;

  // Theme
  colorMode: 'auto' | 'truecolor' | 'ansi256' | 'basic';

  // Layout
  layout: 'auto' | 'single' | 'split';
  splitPanelThreshold: number;

  // Keyboard
  keyboardMode: 'vim' | 'emacs' | 'default';
}
```

---

## Compatibility Notes

1. **Foreground-only styling** - avoid background colors (inconsistent)
2. **Limited animation** - logo gradient + spinner only
3. **Fixed dimensions** - prevent reflow flicker
4. **ASCII fallbacks** - all decorative elements have text alternatives
5. **Keyboard fallbacks** - Esc works everywhere, Shift+Tab is best-effort
6. **Progressive enhancement** - truecolor → 256 → basic color fallbacks

---

## Keyboard Shortcuts Summary

| Shortcut | Action |
|----------|--------|
| `Esc` | Cycle mode (Chat → Plan → Research) |
| `/mode` | Show mode selector (alternative to Esc) |
| `↑↓` | Navigate (when applicable) |
| `Enter` | Select (when applicable) |
| `Ctrl+C` | Abort current operation |

---

## Message Type Reference

| Type | Visual Treatment | Example |
|------|------------------|---------|
| **user** | High contrast, left-aligned | User input |
| **answer** | Bright text, minimal chrome | Assistant response |
| **log** | Dimmed, bordered | Tool traces, thinking |
| **tool** | Same as log | Tool invocations |
| **citation** | Compact list at end | [1][2][3] |

---

## Color Reference (Truecolor)

| Role | Hex | Usage |
|------|-----|-------|
| accent | #E88D35 | Primary actions, mode tabs |
| accent2 | #E65A54 | Secondary actions, borders |
| dim | #F4C4C0 | Metadata, active step |
| text | #FFFFFF | Main content |
| subtle | #8A8A8A | Secondary text |
| error | #E65A54 | Error states |
| success | #73C991 | Success states |

---

## Performance Guidelines

1. **Chunk text into segments** (4-6) instead of per-character for animations
2. **Limit animation FPS** to ~10fps (100ms intervals)
3. **Memoize theme** - don't recreate on every render
4. **Use fixed dimensions** - prevent terminal reflow
5. **Minimize Text nodes** - combine when possible
6. **Respect reduce-motion** - disable animations when set

---

## Troubleshooting

### Logo not animating
- Check `unicodeOk` detection
- Verify `reduceMotion` is false
- Ensure `animate` prop is true

### Colors look wrong
- Check terminal supports truecolor: `echo $COLORTERM`
- Verify theme tier: `console.log(theme.tier)`
- Test with: `TERM=xterm-256color npm run dev`

### Terminal flickering
- Ensure fixed `width` and `minHeight` on Frame
- Check all components have stable heights
- Verify no dynamic width calculations

### Keyboard shortcuts not working
- Verify `useInput` is in a child of `<Box>`
- Check escape routing in `useKeyboardNavigation`
- Ensure no other component is consuming the input

---

## Resources

- **CC-MIRROR**: https://github.com/numman-ali/cc-mirror
- **Ink Documentation**: https://github.com/vadimdemedes/ink
- **Chalk Colors**: https://github.com/chalk/chalk
- **supports-color**: https://github.com/chalk/supports-color

---

## Changelog

### v2.1 (2026-01-04)
**Bug fixes from AI review:**
- Fixed dimension conflict: Frame now uses 32 lines (matching spec prose)
- Fixed type errors: all components now receive theme prop correctly
- Fixed useResearchStream: now consumes all events via proper async loop
- Fixed RequestStatus mapping: phase_status 'complete' maps to 'idle'
- Fixed keyboard handling: /mode parsing moved to FooterInput (doesn't hijack text input)
- Added ASCII fallbacks: icons, spinners, borders all have ASCII variants
- Added scroll strategy: documented windowed list approach for v1
- Added FooterInput component with slash command parsing
- Added UserMessage component

### v2.0 (2026-01-04)
- Added multi-size logo system (banner/monogram/compact/minimal)
- Added themed dividers with diamond accents
- Added fixed-dimension Frame component
- Added comprehensive keyboard navigation
- Added layout primitives (Section, Divider, HintBar)
- Added business logic hooks (useResearchStream, useKeyboardNavigation)
- Enhanced theme system with icons, spinners, key hints
- Added state types and action interfaces
- Improved code organization and file structure

### v1.0 (2026-01-03)
- Initial specification
- 3-region layout design
- Event-driven architecture
- Basic theme system
