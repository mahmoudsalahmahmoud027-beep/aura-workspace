import { Task, Project, Note, QuickCapture, FocusSession, Conversation } from "../types";

export const initialProjects: Project[] = [
  {
    id: "proj-1",
    name: "Mobile App & Gesture Redesign",
    key: "MOB",
    description: "Re-architecting mobile navigation with native-feeling swipe gestures, fluid transitions, and responsive typography for iOS & Android.",
    status: "active",
    progress: 68,
    color: "emerald",
    deadline: "2026-09-15",
    lead: "Elena Rostova",
    tags: ["Mobile", "UX", "React Native"],
    milestones: [
      { id: "m1", title: "Bottom-sheet navigation prototype", dueDate: "2026-08-10", completed: true },
      { id: "m2", title: "Swipe-to-archive gesture handlers", dueDate: "2026-08-28", completed: false },
      { id: "m3", title: "Offline caching on mobile client", dueDate: "2026-09-15", completed: false },
    ],
    activity: [
      { id: "act-1", timestamp: "2026-08-24T14:15:00Z", description: "Validated swipe gestures on physical devices", type: "milestone_reached" },
      { id: "act-2", timestamp: "2026-08-23T11:30:00Z", description: "Merged pull request #48: Sheet dismissal physics", type: "task_completed" },
      { id: "act-3", timestamp: "2026-08-21T09:00:00Z", description: "Published mobile design token spec", type: "note_added" },
    ],
    createdAt: "2026-07-01T08:00:00Z",
    updatedAt: "2026-08-24T14:15:00Z",
  },
  {
    id: "proj-2",
    name: "Authentication Flow & Account Security",
    key: "AUTH",
    description: "Implementing seamless passkey authentication, multi-factor verification, and session token renewal.",
    status: "active",
    progress: 82,
    color: "cyan",
    deadline: "2026-09-01",
    lead: "Ahmed",
    tags: ["Security", "TypeScript", "Auth"],
    milestones: [
      { id: "m4", title: "Passkey biometric login handler", dueDate: "2026-08-15", completed: true },
      { id: "m5", title: "Session token renewal & refresh loop", dueDate: "2026-08-27", completed: false },
      { id: "m6", title: "Security audit & penetration testing", dueDate: "2026-09-01", completed: false },
    ],
    activity: [
      { id: "act-4", timestamp: "2026-08-24T10:00:00Z", description: "Verified passkey token validation on Safari and Chrome", type: "milestone_reached" },
      { id: "act-5", timestamp: "2026-08-22T16:20:00Z", description: "Updated ADR-008 for session renewal protocol", type: "note_added" },
    ],
    createdAt: "2026-07-15T09:00:00Z",
    updatedAt: "2026-08-24T10:00:00Z",
  },
  {
    id: "proj-3",
    name: "Portfolio & Workspace Redesign",
    key: "DES",
    description: "Polishing workspace layouts, micro-interactions, responsive typography scales, and keyboard navigation.",
    status: "active",
    progress: 90,
    color: "indigo",
    deadline: "2026-08-30",
    lead: "Sarah Lin",
    tags: ["Design System", "Accessibility", "CSS"],
    milestones: [
      { id: "m10", title: "High-contrast dark mode token audit", dueDate: "2026-08-05", completed: true },
      { id: "m11", title: "Keyboard focus trap & aria attributes", dueDate: "2026-08-22", completed: true },
      { id: "m12", title: "Final release verification", dueDate: "2026-08-30", completed: false },
    ],
    activity: [
      { id: "act-7", timestamp: "2026-08-22T18:00:00Z", description: "Verified aria tags on modal dialogues and command palette", type: "task_completed" },
    ],
    createdAt: "2026-06-10T14:00:00Z",
    updatedAt: "2026-08-22T18:00:00Z",
  },
  {
    id: "proj-4",
    name: "API Integration & Release Preparation",
    key: "REL",
    description: "Preparing end-to-end API documentation, SDK integration guides, and release checklist for v2 launch.",
    status: "active",
    progress: 45,
    color: "amber",
    deadline: "2026-09-30",
    lead: "Marcus Chen",
    tags: ["API", "Documentation", "Release"],
    milestones: [
      { id: "m7", title: "Interactive API documentation viewer", dueDate: "2026-08-20", completed: true },
      { id: "m8", title: "Sample code snippets for SDKs", dueDate: "2026-09-10", completed: false },
      { id: "m9", title: "Release notes draft & changelog", dueDate: "2026-09-30", completed: false },
    ],
    activity: [
      { id: "act-6", timestamp: "2026-08-24T12:45:00Z", description: "Completed API spec review with engineering team", type: "task_completed" },
    ],
    createdAt: "2026-08-01T10:00:00Z",
    updatedAt: "2026-08-24T12:45:00Z",
  },
];

export const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "Implement swipe-to-archive gesture on mobile task lists",
    description: "Add smooth horizontal pan responder with haptic feedback threshold and spring reset animation.",
    priority: "urgent",
    status: "in_progress",
    projectId: "proj-1",
    deadline: "2026-08-25",
    estimatedMinutes: 45,
    actualMinutes: 20,
    tags: ["Mobile", "UX", "Gestures"],
    subtasks: [
      { id: "st-1", title: "Configure spring damping and tension constants", completed: true },
      { id: "st-2", title: "Add haptic vibration trigger at 80px offset", completed: false },
      { id: "st-3", title: "Test touch cancellation on vertical scroll", completed: false },
    ],
    createdAt: "2026-08-24T08:30:00Z",
    order: 1,
  },
  {
    id: "task-2",
    title: "Finish authentication flow & session token refresh",
    description: "Ensure expired access tokens automatically refresh via background interceptor without interrupting the user session.",
    priority: "high",
    status: "todo",
    projectId: "proj-2",
    deadline: "2026-08-26",
    estimatedMinutes: 60,
    tags: ["Security", "Auth", "API"],
    subtasks: [
      { id: "st-4", title: "Implement token renewal retry queue", completed: false },
      { id: "st-5", title: "Add idempotency headers to authentication requests", completed: false },
    ],
    createdAt: "2026-08-23T14:00:00Z",
    order: 2,
  },
  {
    id: "task-3",
    title: "Synthesize user feedback and usability review",
    description: "Review recorded user onboarding sessions, identify common drop-off moments, and document priority friction fixes.",
    priority: "high",
    status: "todo",
    projectId: "proj-4",
    deadline: "2026-08-27",
    estimatedMinutes: 50,
    tags: ["User Feedback", "Product"],
    subtasks: [
      { id: "st-6", title: "Categorize feedback into UI, Performance, and Workflow", completed: true },
      { id: "st-7", title: "Draft actionable recommendations in product spec", completed: false },
    ],
    createdAt: "2026-08-24T09:15:00Z",
    order: 3,
  },
  {
    id: "task-4",
    title: "Verify WCAG 2.2 AA contrast on secondary badge tokens",
    description: "Audit muted status pills and metadata chips across light and dark themes using color contrast analyzer.",
    priority: "medium",
    status: "completed",
    projectId: "proj-3",
    deadline: "2026-08-24",
    estimatedMinutes: 30,
    actualMinutes: 25,
    tags: ["Design System", "Accessibility"],
    subtasks: [
      { id: "st-8", title: "Audit muted text on background surfaces", completed: true },
      { id: "st-9", title: "Update badge border alpha tokens", completed: true },
    ],
    createdAt: "2026-08-24T07:00:00Z",
    completedAt: "2026-08-24T12:30:00Z",
    order: 4,
  },
  {
    id: "task-5",
    title: "Design contextual shortcut helper overlay (⌘/)",
    description: "Create a lightweight keyboard shortcut cheat-sheet modal that shows available actions for the active view.",
    priority: "medium",
    status: "todo",
    projectId: "proj-3",
    deadline: "2026-08-29",
    estimatedMinutes: 40,
    tags: ["UI", "Shortcuts", "Productivity"],
    subtasks: [],
    createdAt: "2026-08-22T11:00:00Z",
    order: 5,
  },
  {
    id: "task-6",
    title: "Prepare API integration documentation and sample snippets",
    description: "Write clear starter guides and sample curl requests for the developer documentation portal.",
    priority: "medium",
    status: "in_progress",
    projectId: "proj-4",
    deadline: "2026-08-25",
    estimatedMinutes: 35,
    actualMinutes: 15,
    tags: ["Documentation", "API", "Developer"],
    subtasks: [
      { id: "st-10", title: "Draft TypeScript and Python quickstart code snippets", completed: true },
      { id: "st-11", title: "Add error response status table", completed: false },
    ],
    createdAt: "2026-08-24T11:00:00Z",
    order: 6,
  },
];

export const initialNotes: Note[] = [
  {
    id: "note-1",
    title: "ADR-008: Authentication Architecture & Session Tokens",
    content: `## Context & Objectives
To ensure seamless user authentication without unexpected logouts, our application uses short-lived JWT access tokens paired with secure HTTP-only refresh tokens.

## Key Design Decisions
1. **Short-Lived Access Tokens**: 15-minute expiration to reduce risk exposure.
2. **Background Refresh Loop**:
\`\`\`typescript
interface TokenSession {
  accessToken: string;
  expiresAt: number;
  user: { id: string; name: string; role: string };
}
\`\`\`
3. **Graceful Fallback**: If a refresh attempt fails due to temporary network unavailability, queue the request and retry before signing out.

## Outcomes
- Continuous session state without sudden user interruption.
- Secure token handling conforming to modern web security guidelines.`,
    tags: ["Architecture", "Security", "Auth"],
    isPinned: true,
    isFavorite: true,
    projectId: "proj-2",
    createdAt: "2026-08-21T09:00:00Z",
    updatedAt: "2026-08-24T13:40:00Z",
  },
  {
    id: "note-2",
    title: "Design System: Typographic Scale & Spacing Ratios",
    content: `### Typography Guidelines
A disciplined typographic hierarchy creates visual clarity and reduces visual fatigue for people using the workspace throughout the day.

### Core Rules
- **Modular Scale**: Major Second (1.125) for dense tables and data views; Minor Third (1.20) for reading views.
- **Line Length**: Constrain reading containers to 65–75 characters for comfortable scanning.
- **Contrast Ratios**: Body text strictly adheres to WCAG 2.2 AA (minimum 4.5:1 ratio against container backgrounds).
- **Transitions**: Keep hover transitions quick (150ms) to ensure the interface feels snappy.`,
    tags: ["Design System", "Typography", "CSS"],
    isPinned: true,
    isFavorite: false,
    projectId: "proj-3",
    createdAt: "2026-08-22T16:20:00Z",
    updatedAt: "2026-08-24T11:10:00Z",
  },
  {
    id: "note-3",
    title: "User Research & Usability Feedback",
    content: `### Observations from Cohort Testing
1. **First-Time Flow**: Users who set their primary daily goal within the first 60 seconds engaged significantly more with their task lists.
2. **Keyboard Navigation**: Power users frequently utilized the command bar (\`⌘K\`) and quick capture (\`C\`).
3. **Action Items**:
   - Provide clear placeholder guidance when lists are empty.
   - Keep onboarding steps lightweight and optional.`,
    tags: ["Product", "User Research", "Feedback"],
    isPinned: false,
    isFavorite: true,
    projectId: "proj-4",
    createdAt: "2026-08-19T14:30:00Z",
    updatedAt: "2026-08-20T10:15:00Z",
  },
];

export const initialQuickCaptures: QuickCapture[] = [
  {
    id: "qc-1",
    content: "Test responsive bottom navigation bar on smaller mobile viewports (iPhone SE / iPad Mini).",
    createdAt: "2026-08-24T15:10:00Z",
  },
  {
    id: "qc-2",
    content: "Add subtle keyboard shortcut badge to Quick Capture button in top header.",
    createdAt: "2026-08-24T13:20:00Z",
  },
  {
    id: "qc-3",
    content: "Schedule sync with Marcus to review developer documentation portal draft.",
    createdAt: "2026-08-23T18:05:00Z",
  },
];

export const initialFocusSessions: FocusSession[] = [
  {
    id: "fs-1",
    durationMinutes: 45,
    completedAt: "2026-08-24T10:45:00Z",
    taskId: "task-1",
    taskTitle: "Implement swipe-to-archive gesture on mobile task lists",
    projectId: "proj-1",
    soundPreset: "brown_noise",
    rating: 5,
  },
  {
    id: "fs-2",
    durationMinutes: 25,
    completedAt: "2026-08-24T12:00:00Z",
    taskId: "task-4",
    taskTitle: "Verify WCAG 2.2 AA contrast on secondary badge tokens",
    projectId: "proj-3",
    soundPreset: "rain",
    rating: 5,
  },
  {
    id: "fs-3",
    durationMinutes: 50,
    completedAt: "2026-08-23T16:00:00Z",
    taskTitle: "Synthesize user feedback and usability review",
    projectId: "proj-4",
    soundPreset: "pink_noise",
    rating: 4,
  },
];

export const initialConversations: Conversation[] = [
  {
    id: "conv-1",
    title: "Sprint Planning & Prioritization",
    createdAt: "2026-08-24T08:00:00Z",
    updatedAt: "2026-08-24T08:15:00Z",
    isPinned: true,
    messages: [
      {
        id: "msg-1",
        role: "user",
        content: "What are my highest priority tasks for today, and how should I sequence them?",
        timestamp: "2026-08-24T08:00:00Z",
      },
      {
        id: "msg-2",
        role: "assistant",
        content: `### Suggested Focus Sequence for Today

You have about 2.5 hours of planned work across your active projects. Here is a practical order to tackle them:

1. **Morning Focus (45 min)**:
   - **Task**: *Implement swipe-to-archive gesture on mobile task lists*
   - **Why**: Urgent item for the Mobile App Redesign that allows gesture testing on physical devices.

2. **Mid-Day Task (60 min)**:
   - **Task**: *Finish authentication flow & session token refresh*
   - **Why**: High priority task for account security due tomorrow.

3. **Afternoon Wrap-Up (35 min)**:
   - **Task**: *Prepare API integration documentation and sample snippets*
   - **Why**: Solid progress towards the developer documentation release.

Would you like to start a focus session for the first task?`,
        timestamp: "2026-08-24T08:02:00Z",
      },
    ],
  },
  {
    id: "conv-2",
    title: "Design Review: Mobile Navigation Patterns",
    createdAt: "2026-08-23T11:00:00Z",
    updatedAt: "2026-08-23T11:20:00Z",
    isPinned: false,
    messages: [
      {
        id: "msg-3",
        role: "user",
        content: "What are the key trade-offs between bottom-sheet navigation and modal views on mobile?",
        timestamp: "2026-08-23T11:00:00Z",
      },
      {
        id: "msg-4",
        role: "assistant",
        content: `### Mobile Navigation Trade-Offs

| Pattern | Strengths | Trade-Offs |
|---|---|---|
| **Bottom Sheet** | Easy thumb reachability, preserves background context, fluid gesture dismissal. | Limited screen real estate for complex multi-step forms. |
| **Full Modal View** | Maximizes vertical space, great for rich document editing. | Higher cognitive barrier, feels like leaving the current workflow. |

**Recommendation for AURA**:
Use **interactive bottom sheets** for Quick Capture and task detail inspection, while reserving **full views** for comprehensive knowledge authoring.`,
        timestamp: "2026-08-23T11:03:00Z",
      },
    ],
  },
];

