# AURA

> **Repository:** `mahmoudsalahmahmoud027-beep/aura-workspace`  
> **Status:** Portfolio project · source release

AURA is a local-first productivity workspace that combines daily planning, tasks, projects, notes, focus sessions, quick capture, and a context-aware assistant in one interface.

The application is designed to remain useful without an AI connection. Core workspace features run locally, while the optional assistant can use Gemini through the server when a key is configured.

## Features

- **Today** — daily focus, prioritized work, upcoming deadlines, and a deterministic next-action recommendation
- **Tasks** — list, board, and Eisenhower-style views with priorities, tags, deadlines, subtasks, and project links
- **Projects** — project workspaces with milestones, related tasks, notes, and activity
- **Notes** — Markdown editing, search, pinning, favorites, tags, and project relationships
- **Focus** — preset and custom focus sessions with optional task/project attachment, focus sounds, and session history
- **Quick Capture** — save thoughts quickly and convert them into structured workspace items
- **Assistant** — persistent conversations, rename/pin controls, retry, stop generation, copy, and contextual workspace grounding
- **Command Palette** — `Ctrl/Cmd + K` navigation, search, and common actions
- **Themes & persistence** — dark/light appearance and browser-local workspace persistence

## Tech Stack

- React 19
- TypeScript
- Vite
- Express
- Tailwind CSS
- Lucide Icons
- Motion
- Google GenAI SDK (optional server-side assistant)
- Web Audio API

## Architecture

AURA separates workspace state, UI features, and external AI access. The browser owns the local workspace state and persistence, while the Express server provides the optional Gemini boundary so API credentials are not embedded in the client bundle.

The assistant receives a structured snapshot of relevant workspace context rather than inventing task or project state independently.

## Local Development

### Requirements

- Node.js 20+

### Install

```bash
npm install
```

### Run

```bash
npm run dev
```

### Production build

```bash
npm run build
```

## Optional Gemini Integration

Copy `.env.example` to `.env` and configure `GEMINI_API_KEY`.

```bash
cp .env.example .env
```

The API key is read by the server only. Do not commit `.env` files or production credentials.

If Gemini is unavailable, the workspace remains usable and the assistant falls back to local deterministic behavior.

## Data & Privacy

Workspace data is stored locally in the browser for this portfolio build. No account or cloud database is required for the core experience.

## Keyboard Shortcuts

- `Ctrl/Cmd + K` — command palette
- `Escape` — close active overlays/dialogs
- Arrow keys + `Enter` — navigate command-palette results

## Project Structure

```text
src/
  components/      Feature and shared UI components
  context/         Workspace state and actions
  data/            Demo workspace data
  services/        Assistant and supporting services
  types/           TypeScript domain models
server.ts          Express server and optional Gemini endpoint
```

## Status

Portfolio release. Core productivity features work locally; remote AI functionality requires an optional server-side provider key.