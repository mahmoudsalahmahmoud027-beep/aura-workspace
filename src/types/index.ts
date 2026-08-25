export type Priority = "urgent" | "high" | "medium" | "low";
export type TaskStatus = "todo" | "in_progress" | "in_review" | "completed" | "canceled";
export type ProjectStatus = "planning" | "active" | "paused" | "completed";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  projectId?: string;
  deadline?: string; // ISO date string or YYYY-MM-DD
  estimatedMinutes: number;
  actualMinutes?: number;
  tags: string[];
  subtasks: Subtask[];
  createdAt: string;
  completedAt?: string;
  order?: number;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

export interface ProjectActivity {
  id: string;
  timestamp: string;
  description: string;
  type: "task_completed" | "note_added" | "milestone_reached" | "status_change";
}

export interface Project {
  id: string;
  name: string;
  key: string; // e.g. "AUR"
  description: string;
  status: ProjectStatus;
  progress: number; // 0-100
  color: string; // Tailwind color token or hex
  deadline: string;
  lead: string;
  tags: string[];
  milestones: ProjectMilestone[];
  activity: ProjectActivity[];
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string; // Markdown formatted
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuickCapture {
  id: string;
  content: string;
  createdAt: string;
  convertedTo?: "task" | "note" | "dismissed";
  convertedId?: string;
}

export interface FocusSession {
  id: string;
  durationMinutes: number;
  completedAt: string;
  taskId?: string;
  taskTitle?: string;
  projectId?: string;
  soundPreset?: string;
  rating?: number; // 1-5
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  suggestedActions?: {
    label: string;
    actionType: "create_task" | "create_note" | "start_focus";
    payload?: any;
  }[];
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  messages: ChatMessage[];
}

export interface UserProfile {
  name: string;
  email?: string;
  avatarUrl?: string;
  role?: string;
}

export type ActiveView = "today" | "tasks" | "projects" | "notes" | "assistant" | "focus";

export interface WorkspaceStats {
  focusMinutesToday: number;
  completedTasksToday: number;
  openTasksCount: number;
  activeProjectsCount: number;
  inboxCount: number;
}
