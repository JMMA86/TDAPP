## Architecture

- **Clean Architecture scaffold**: `src/core/` (domain + use-cases) and `src/infrastructure/` (db + ollama) exist as empty directories. Business logic belongs there, NOT in route handlers. `src/components/` is for reusable UI.
- **Path alias**: `@/*` → `./src/*` (tsconfig paths).

## AI SDK (critical)

- The Ollama provider package is `ai-sdk-ollama` (NOT `@ai-sdk/ollama`). Import: `import { createOllama, streamText } from 'ai-sdk-ollama'`.
- AI SDK v6 removed `toDataStreamResponse()`. Use `toUIMessageStreamResponse()` instead.
- `ai-sdk-ollama` re-exports enhanced `streamText` with Ollama-specific reliability (synthesis, tool logging). Prefer it over importing from `'ai'` directly.
- Env vars: `OLLAMA_BASE_URL` (default `http://127.0.0.1:11434`) and `OLLAMA_MODEL`.

## Framework quirks

- **React Compiler** enabled (`reactCompiler: true` in `next.config.ts`).
- **Tailwind CSS v4** with `@tailwindcss/postcss` (uses `@import "tailwindcss"` and `@theme inline`, NOT the old `@tailwind base/components/utilities`).
- **ESLint v9 flat config** (`eslint.config.mjs`). The old `.eslintrc.json` is legacy, prefer the flat config.
- **TypeScript**: strict mode, `moduleResolution: "bundler"`, `target: "ES2017"`.

## Commands

| Command | What |
|---|---|
| `npm run dev` | Start dev server (port 3000) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

No tests are configured yet.

## Style

- **Prettier**: single quotes, semicolons, trailing commas es5, printWidth 100, tabWidth 2.
- Components: React Server Components by default (Next.js App Router). Add `'use client'` only when needed.
- Code comments in Spanish are acceptable (TDApp is spanish-language).

## OpenCode agents

Custom agents live in `.opencode/agents/`:
- `architect.md` — Prisma schemas, Next.js API routes, Clean Architecture separation
- `frontend.md` — React components, Tailwind, ADHD/low-cognitive-load design
- `prompt-engineer.md` — Ollama system prompt refinement
