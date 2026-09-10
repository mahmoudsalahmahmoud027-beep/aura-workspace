# AURA

AURA is a local-first productivity workspace that combines daily planning, tasks, projects, notes, focus sessions, quick capture, and a context-aware assistant in one interface.

The project is designed around a simple principle: core productivity features should remain useful even when remote services are unavailable.

## Highlights

- Today view with priorities, deadlines, and deterministic next-action recommendations
- Task management with priorities, tags, deadlines, subtasks, projects, and multiple views
- Project workspaces with milestones, related tasks, notes, and activity
- Markdown notes with search, pinning, favorites, tags, and project relationships
- Focus sessions with optional task/project context and session history
- Quick Capture for turning unstructured input into organized workspace items
- Persistent assistant conversations with retry, stop, copy, rename, and pin controls
- Context-aware assistant boundary that can use workspace state without inventing application data
- Command palette and keyboard-first navigation
- Local persistence and graceful offline fallback behavior
- Responsive interface with light and dark appearance support

## Architecture

AURA separates product state, UI features, persistence, and external intelligence access.

```text
src/components/   product views and shared UI
src/context/      workspace state and actions
src/data/         initial workspace data
src/services/     assistant and supporting service boundaries
src/types/        domain models
server.ts         optional remote assistant boundary
```

The browser owns the workspace state. External model access is isolated behind a server boundary so credentials are never bundled into the client.

If the remote provider is unavailable, the application falls back to deterministic workspace-aware behavior instead of making the rest of the product unusable.

## Tech Stack

- React 19
- TypeScript
- Vite
- Node.js / Express
- Tailwind CSS
- Motion
- Lucide Icons

## Local Development

```bash
npm install
npm run dev
```

Production checks:

```bash
npm run lint
npm run build
```

## Configuration

Remote assistant access is optional and configured through environment variables on the server. Secrets are not committed to the repository or exposed in the browser bundle.

## Engineering Focus

AURA demonstrates local-first product architecture, contextual model integration, graceful degradation, explicit server boundaries, persistent conversation UX, and responsive application design.
