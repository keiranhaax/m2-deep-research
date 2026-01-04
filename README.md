# ResearchOS

Interactive terminal research chat interface (like Gemini CLI/Grok CLI) for AI-powered deep research workflows.

## Features

- **Three modes**: Chat (LLM only), Plan (strategy), Research (LLM + tools)
- **TypeScript/Ink TUI** with React components
- **Python backend** with JSONL IPC protocol
- **SQLite persistence** with WAL mode
- **Export**: Markdown, HTML with citations

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    TypeScript/Ink TUI                        │
│  ┌─────────┐  ┌─────────────┐  ┌────────────────────────┐  │
│  │ Header  │  │  Messages   │  │        Footer          │  │
│  │ (modes) │  │  (stream)   │  │  (input + status)      │  │
│  └─────────┘  └─────────────┘  └────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │ JSONL (stdin/stdout)
┌──────────────────────▼──────────────────────────────────────┐
│                    Python Backend                            │
│  ┌─────────┐  ┌─────────────┐  ┌────────────────────────┐  │
│  │ Handler │  │   Models    │  │    Search Tools        │  │
│  │ (modes) │  │  (MiniMax)  │  │  (Exa, Tavily, etc.)   │  │
│  └─────────┘  └─────────────┘  └────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Installation

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -e ".[dev]"

# Build the application
npm run build
```

## Configuration

Copy `.env.example` to `.env` and add your API keys:

```bash
cp .env.example .env
```

Required:
- `MINIMAX_API_KEY` - MiniMax M2.1 API key

Optional (for Research mode):
- `EXA_API_KEY` - Exa search
- `TAVILY_API_KEY` - Tavily search
- `FIRECRAWL_API_KEY` - Firecrawl scraping
- `BRAVE_API_KEY` - Brave search

## Usage

```bash
# Run in development mode
npm run dev

# Or run the built version
node dist/index.js
```

### Commands

- `/chat` - Switch to Chat mode (LLM only)
- `/plan` - Switch to Plan mode (generates research strategy)
- `/research` or `/r` - Switch to Research mode (LLM + tools)
- `Esc` - Cycle through modes
- `Ctrl+C` - Abort current request

### Modes

| Mode | Description | Tools |
|------|-------------|-------|
| **Chat** | Direct LLM conversation | None |
| **Plan** | Generate research strategy | None |
| **Research** | Full agent loop | Exa, Tavily, Firecrawl, Brave |

## Development

```bash
# Run TypeScript tests
npm test

# Run Python tests
pytest tests/py/

# Type check
npm run typecheck

# Lint
npm run lint
```

## Tech Stack

**Frontend:**
- TypeScript + React + Ink
- Zod for validation
- nanoid for IDs

**Backend:**
- Python 3.11+
- httpx for async HTTP
- Pydantic for models
- SQLite with WAL mode

**LLM:**
- MiniMax M2.1 (primary)
- OpenRouter (fallback)

## License

MIT
