# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## User Note

This is the user's first time using Claude Code.

## Code Style

Use comments sparingly — only comment complex or non-obvious code.

## Commands

```bash
npm run setup        # First-time setup: install deps + generate Prisma client + run migrations
npm run dev          # Start dev server (Turbopack)
npm run dev:daemon   # Start dev server in background (logs → logs.txt)
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Vitest
npm run db:reset     # Force-reset SQLite database
```

Requires `ANTHROPIC_API_KEY` in `.env`. Without it, the app falls back to a mock LLM provider.

## Architecture

UIGen is a Next.js 15 (App Router) app where Claude AI generates React components via a tool-based virtual file system.

### Core Data Flow

1. User types a prompt in `ChatInterface`
2. `ChatContext` serializes the in-memory `VirtualFileSystem` and sends messages to `POST /api/chat`
3. The API route (`src/app/api/chat/route.ts`) streams Claude responses using the Vercel AI SDK
4. Claude uses two tools (`str_replace_editor`, `file_manager`) to read/write files in the virtual FS
5. Tool results update `FileSystemContext`, which drives the Monaco editor and iframe preview
6. On completion, the serialized file system + message history is persisted to SQLite via Prisma

### Key Modules

**Virtual File System** (`src/lib/file-system.ts`) — in-memory FS (no disk I/O). Serializes to JSON for DB storage and API transmission. All AI tool calls operate on this object.

**AI Tools** (`src/lib/tools/`) — two Anthropic tools registered with the API:
- `str_replace_editor`: view/create/edit files via string replacement or insert
- `file_manager`: rename/delete files

**Context Providers** (`src/lib/contexts/`) — `FileSystemContext` and `ChatContext` are the central state managers for the UI. Both are "use client" and wrap the project workspace.

**Server Actions** (`src/actions/`) — "use server" functions for all DB operations (create/get projects, auth). Auth uses bcrypt + cookie-based sessions (`src/lib/auth.ts`).

**Preview** (`src/components/preview/PreviewFrame.tsx`) — renders components in a sandboxed iframe with live updates.

### Routing

- `/` — home, redirects authenticated users to their active project
- `/[projectId]` — main workspace (editor + chat + preview)
- `/api/chat` — streaming AI endpoint

### Database

Prisma + SQLite. Two models: `User` (email/password) and `Project` (name, userId, `messages` JSON, `data` JSON). The `data` field stores the serialized VirtualFileSystem.

The database schema is defined in `prisma/schema.prisma`. Reference it any time you need to understand the structure of data stored in the database.

### Path Aliases

`@/*` maps to `./src/*`.
