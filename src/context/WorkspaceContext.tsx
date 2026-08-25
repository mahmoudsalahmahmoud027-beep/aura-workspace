import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import {
  Task,
  Project,
  Note,
  QuickCapture,
  FocusSession,
  Conversation,
  ActiveView,
  Priority,
  TaskStatus,
  WorkspaceStats,
  UserProfile,
} from "../types";
import {
  initialTasks,
  initialProjects,
  initialNotes,
  initialQuickCaptures,
  initialFocusSessions,
  initialConversations,
} from "../data/initialData";
import { soundService } from "../services/soundService";
import confetti from "canvas-confetti";

interface WorkspaceContextType {
  // Navigation & View
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  quickCaptureModalOpen: boolean;
  setQuickCaptureModalOpen: (open: boolean) => void;

  // User Profile
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;

  // Theme
  theme: "dark" | "light";
  toggleTheme: () => void;

  // Daily Primary Focus
  dailyPrimaryFocus: string;
  setDailyPrimaryFocus: (focus: string) => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt">) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;

  // Projects
  projects: Project[];
  addProject: (project: Omit<Project, "id" | "createdAt" | "updatedAt" | "activity">) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  toggleProjectMilestone: (projectId: string, milestoneId: string) => void;

  // Notes & Quick Capture
  notes: Note[];
  addNote: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  quickCaptures: QuickCapture[];
  addQuickCapture: (content: string) => QuickCapture;
  convertQuickCaptureToTask: (id: string) => void;
  convertQuickCaptureToNote: (id: string) => void;
  deleteQuickCapture: (id: string) => void;

  // Focus Engine
  focusSessions: FocusSession[];
  isFocusRunning: boolean;
  focusTimeRemaining: number; // seconds
  focusTargetMinutes: number;
  focusActiveTask: Task | null;
  focusAmbientSound: "none" | "brown_noise" | "pink_noise" | "white_noise" | "rain";
  startFocus: (durationMinutes: number, task?: Task | null, ambient?: "none" | "brown_noise" | "pink_noise" | "white_noise" | "rain") => void;
  pauseFocus: () => void;
  resumeFocus: () => void;
  stopFocus: (completed?: boolean) => void;
  setFocusAmbientSound: (sound: "none" | "brown_noise" | "pink_noise" | "white_noise" | "rain") => void;

  // AI Assistant Conversations
  conversations: Conversation[];
  activeConversationId: string;
  setActiveConversationId: (id: string) => void;
  createConversation: (title?: string) => string;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  renameConversation: (id: string, newTitle: string) => void;
  pinConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  addMessageToActiveConversation: (role: "user" | "assistant", content: string) => void;

  // Intelligence & Calculations
  suggestedNextAction: {
    task: Task | null;
    reason: string;
    project: Project | null;
    estimatedMinutes: number;
  };
  workspaceStats: WorkspaceStats;
  resetAllToDemoData: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  TASKS: "aura_tasks_v2",
  PROJECTS: "aura_projects_v2",
  NOTES: "aura_notes_v2",
  QUICK_CAPTURES: "aura_qc_v2",
  FOCUS_SESSIONS: "aura_focus_v2",
  CONVERSATIONS: "aura_convs_v2",
  DAILY_FOCUS: "aura_daily_focus_v2",
  THEME: "aura_theme_v2",
  PROFILE: "aura_user_profile_v2",
};

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation State
  const [activeView, setActiveView] = useState<ActiveView>("today");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [quickCaptureModalOpen, setQuickCaptureModalOpen] = useState(false);

  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.PROFILE);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      name: "Ahmed",
      email: "ahmed@aura.workspace",
      role: "Lead Engineer & Designer",
    };
  });

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem(LOCAL_STORAGE_KEYS.PROFILE, JSON.stringify(next));
      return next;
    });
  };

  // Theme State
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.THEME);
    return saved === "light" ? "light" : "dark";
  });

  useEffect(() => {
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(theme);
    localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Daily Primary Focus
  const [dailyPrimaryFocus, setDailyPrimaryFocusState] = useState<string>(() => {
    return (
      localStorage.getItem(LOCAL_STORAGE_KEYS.DAILY_FOCUS) ||
      "Finish authentication flow & mobile sign-in testing"
    );
  });

  const setDailyPrimaryFocus = (focus: string) => {
    setDailyPrimaryFocusState(focus);
    localStorage.setItem(LOCAL_STORAGE_KEYS.DAILY_FOCUS, focus);
  };

  // Tasks State
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.TASKS);
      return saved ? JSON.parse(saved) : initialTasks;
    } catch {
      return initialTasks;
    }
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  // Projects State
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.PROJECTS);
      return saved ? JSON.parse(saved) : initialProjects;
    } catch {
      return initialProjects;
    }
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  // Notes State
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.NOTES);
      return saved ? JSON.parse(saved) : initialNotes;
    } catch {
      return initialNotes;
    }
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.NOTES, JSON.stringify(notes));
  }, [notes]);

  // Quick Captures State
  const [quickCaptures, setQuickCaptures] = useState<QuickCapture[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.QUICK_CAPTURES);
      return saved ? JSON.parse(saved) : initialQuickCaptures;
    } catch {
      return initialQuickCaptures;
    }
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.QUICK_CAPTURES, JSON.stringify(quickCaptures));
  }, [quickCaptures]);

  // Focus Sessions State
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.FOCUS_SESSIONS);
      return saved ? JSON.parse(saved) : initialFocusSessions;
    } catch {
      return initialFocusSessions;
    }
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.FOCUS_SESSIONS, JSON.stringify(focusSessions));
  }, [focusSessions]);

  // AI Conversations State
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CONVERSATIONS);
      return saved ? JSON.parse(saved) : initialConversations;
    } catch {
      return initialConversations;
    }
  });

  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    return conversations[0]?.id || "conv-1";
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  }, [conversations]);

  // Focus Active Engine State
  const [isFocusRunning, setIsFocusRunning] = useState(false);
  const [focusTimeRemaining, setFocusTimeRemaining] = useState(25 * 60);
  const [focusTargetMinutes, setFocusTargetMinutes] = useState(25);
  const [focusActiveTask, setFocusActiveTask] = useState<Task | null>(null);
  const [focusAmbientSound, setFocusAmbientSoundState] = useState<
    "none" | "brown_noise" | "pink_noise" | "white_noise" | "rain"
  >("brown_noise");

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isFocusRunning && focusTimeRemaining > 0) {
      interval = setInterval(() => {
        setFocusTimeRemaining((prev) => {
          if (prev <= 1) {
            // Focus completed
            setIsFocusRunning(false);
            soundService.stopAmbientSound();
            soundService.playCompletionChime();
            try {
              confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.7 },
                colors: ["#10b981", "#06b6d4", "#f59e0b"],
              });
            } catch {}

            // Record completed session
            const newSession: FocusSession = {
              id: `fs-${Date.now()}`,
              durationMinutes: focusTargetMinutes,
              completedAt: new Date().toISOString(),
              taskId: focusActiveTask?.id,
              taskTitle: focusActiveTask?.title || "Deep Focus Sprint",
              projectId: focusActiveTask?.projectId,
              soundPreset: focusAmbientSound,
              rating: 5,
            };
            setFocusSessions((s) => [newSession, ...s]);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFocusRunning, focusTimeRemaining, focusTargetMinutes, focusActiveTask, focusAmbientSound]);

  // Sound handler on focus start/ambient change
  const setFocusAmbientSound = (sound: "none" | "brown_noise" | "pink_noise" | "white_noise" | "rain") => {
    setFocusAmbientSoundState(sound);
    if (isFocusRunning) {
      soundService.startAmbientSound(sound);
    }
  };

  const startFocus = useCallback(
    (
      durationMinutes: number,
      task: Task | null = null,
      ambient: "none" | "brown_noise" | "pink_noise" | "white_noise" | "rain" = "brown_noise"
    ) => {
      setFocusTargetMinutes(durationMinutes);
      setFocusTimeRemaining(durationMinutes * 60);
      setFocusActiveTask(task);
      setFocusAmbientSoundState(ambient);
      setIsFocusRunning(true);
      soundService.playFocusStartTone();
      soundService.startAmbientSound(ambient);
    },
    []
  );

  const pauseFocus = useCallback(() => {
    setIsFocusRunning(false);
    soundService.stopAmbientSound();
  }, []);

  const resumeFocus = useCallback(() => {
    setIsFocusRunning(true);
    soundService.startAmbientSound(focusAmbientSound);
  }, [focusAmbientSound]);

  const stopFocus = useCallback(
    (completed: boolean = false) => {
      setIsFocusRunning(false);
      soundService.stopAmbientSound();
      if (completed) {
        soundService.playCompletionChime();
        const spentMin = Math.max(1, Math.round((focusTargetMinutes * 60 - focusTimeRemaining) / 60));
        const newSession: FocusSession = {
          id: `fs-${Date.now()}`,
          durationMinutes: spentMin,
          completedAt: new Date().toISOString(),
          taskId: focusActiveTask?.id,
          taskTitle: focusActiveTask?.title || "Deep Focus Sprint",
          projectId: focusActiveTask?.projectId,
          soundPreset: focusAmbientSound,
        };
        setFocusSessions((s) => [newSession, ...s]);
      }
      setFocusTimeRemaining(focusTargetMinutes * 60);
    },
    [focusTargetMinutes, focusTimeRemaining, focusActiveTask, focusAmbientSound]
  );

  // Task Handlers
  const addTask = useCallback((taskData: Omit<Task, "id" | "createdAt">): Task => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      order: tasks.length + 1,
    };
    setTasks((prev) => [newTask, ...prev]);

    // If task belongs to a project, record activity
    if (taskData.projectId) {
      setProjects((prevProjects) =>
        prevProjects.map((p) => {
          if (p.id === taskData.projectId) {
            return {
              ...p,
              activity: [
                {
                  id: `act-${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  description: `Created task: ${newTask.title}`,
                  type: "task_completed",
                },
                ...p.activity,
              ],
              updatedAt: new Date().toISOString(),
            };
          }
          return p;
        })
      );
    }
    return newTask;
  }, [tasks.length]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return { ...t, ...updates };
        }
        return t;
      })
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleTaskComplete = useCallback(
    (id: string) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            const isNowCompleted = t.status !== "completed";
            if (isNowCompleted) {
              soundService.playCompletionChime();
              try {
                confetti({
                  particleCount: 30,
                  spread: 50,
                  origin: { y: 0.8 },
                });
              } catch {}
            }
            const updated: Task = {
              ...t,
              status: isNowCompleted ? "completed" : "todo",
              completedAt: isNowCompleted ? new Date().toISOString() : undefined,
            };

            // Update project activity if completed
            if (isNowCompleted && t.projectId) {
              setProjects((prevProjects) =>
                prevProjects.map((p) => {
                  if (p.id === t.projectId) {
                    const linkedTasks = prev.filter((tsk) => tsk.projectId === p.id);
                    const completedCount = linkedTasks.filter((tsk) => tsk.id === id || tsk.status === "completed").length;
                    const newProgress = Math.min(100, Math.round((completedCount / Math.max(1, linkedTasks.length)) * 100));
                    return {
                      ...p,
                      progress: newProgress,
                      activity: [
                        {
                          id: `act-${Date.now()}`,
                          timestamp: new Date().toISOString(),
                          description: `Completed task: ${t.title}`,
                          type: "task_completed",
                        },
                        ...p.activity,
                      ],
                      updatedAt: new Date().toISOString(),
                    };
                  }
                  return p;
                })
              );
            }
            return updated;
          }
          return t;
        })
      );
    },
    []
  );

  // Project Handlers
  const addProject = useCallback(
    (projectData: Omit<Project, "id" | "createdAt" | "updatedAt" | "activity">): Project => {
      const newProj: Project = {
        ...projectData,
        id: `proj-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        activity: [
          {
            id: `act-${Date.now()}`,
            timestamp: new Date().toISOString(),
            description: `Project initialized: ${projectData.name}`,
            type: "status_change",
          },
        ],
      };
      setProjects((prev) => [newProj, ...prev]);
      return newProj;
    },
    []
  );

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (selectedProjectId === id) {
      setSelectedProjectId(null);
    }
  }, [selectedProjectId]);

  const toggleProjectMilestone = useCallback((projectId: string, milestoneId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const updatedMilestones = p.milestones.map((m) => {
            if (m.id === milestoneId) {
              const nowDone = !m.completed;
              if (nowDone) soundService.playCompletionChime();
              return { ...m, completed: nowDone };
            }
            return m;
          });
          const doneCount = updatedMilestones.filter((m) => m.completed).length;
          const progress = Math.round((doneCount / Math.max(1, updatedMilestones.length)) * 100);
          return {
            ...p,
            milestones: updatedMilestones,
            progress,
            activity: [
              {
                id: `act-${Date.now()}`,
                timestamp: new Date().toISOString(),
                description: `Updated milestone status`,
                type: "milestone_reached",
              },
              ...p.activity,
            ],
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );
  }, []);

  // Notes & Quick Capture Handlers
  const addNote = useCallback((noteData: Omit<Note, "id" | "createdAt" | "updatedAt">): Note => {
    const newNote: Note = {
      ...noteData,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
    return newNote;
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n))
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
    }
  }, [selectedNoteId]);

  const addQuickCapture = useCallback((content: string): QuickCapture => {
    const newQc: QuickCapture = {
      id: `qc-${Date.now()}`,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    setQuickCaptures((prev) => [newQc, ...prev]);
    return newQc;
  }, []);

  const convertQuickCaptureToTask = useCallback(
    (id: string) => {
      const qc = quickCaptures.find((q) => q.id === id);
      if (!qc) return;

      const title = qc.content.split("\n")[0].slice(0, 80);
      const desc = qc.content.length > 80 ? qc.content : "";

      addTask({
        title,
        description: desc,
        priority: "medium",
        status: "todo",
        estimatedMinutes: 30,
        tags: ["Inbox"],
        subtasks: [],
      });

      setQuickCaptures((prev) =>
        prev.map((q) => (q.id === id ? { ...q, convertedTo: "task" as const } : q))
      );
    },
    [quickCaptures, addTask]
  );

  const convertQuickCaptureToNote = useCallback(
    (id: string) => {
      const qc = quickCaptures.find((q) => q.id === id);
      if (!qc) return;

      const lines = qc.content.split("\n");
      const title = lines[0].slice(0, 60);

      addNote({
        title,
        content: qc.content,
        tags: ["Captured"],
        isPinned: false,
        isFavorite: false,
      });

      setQuickCaptures((prev) =>
        prev.map((q) => (q.id === id ? { ...q, convertedTo: "note" as const } : q))
      );
    },
    [quickCaptures, addNote]
  );

  const deleteQuickCapture = useCallback((id: string) => {
    setQuickCaptures((prev) => prev.filter((q) => q.id !== id));
  }, []);

  // AI Conversations Handlers
  const createConversation = useCallback((title: string = "New Thought Partner Session"): string => {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: `Hello! I am **AURA**, your workspace intelligence engine.
How can I assist your workflow right now? You can ask me to:
- **Plan your afternoon** based on active deadlines
- **Break down a complex goal** into sequenced tasks
- **Summarize notes** or draft architectural specifications
- **Analyze priority trade-offs** across projects`,
          timestamp: new Date().toISOString(),
        },
      ],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    return newConv.id;
  }, []);

  const updateConversation = useCallback((id: string, updates: Partial<Conversation>) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    );
  }, []);

  const renameConversation = useCallback((id: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: trimmed, updatedAt: new Date().toISOString() } : c))
    );
  }, []);

  const pinConversation = useCallback((id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isPinned: !c.isPinned, updatedAt: new Date().toISOString() } : c))
    );
  }, []);

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const filtered = prev.filter((c) => c.id !== id);
        if (activeConversationId === id && filtered.length > 0) {
          setActiveConversationId(filtered[0].id);
        }
        return filtered;
      });
    },
    [activeConversationId]
  );

  const addMessageToActiveConversation = useCallback(
    (role: "user" | "assistant", content: string) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConversationId) {
            const newMsg = {
              id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              role,
              content,
              timestamp: new Date().toISOString(),
            };
            return {
              ...c,
              messages: [...c.messages, newMsg],
              updatedAt: new Date().toISOString(),
            };
          }
          return c;
        })
      );
    },
    [activeConversationId]
  );

  // Deterministic "WHAT SHOULD I DO NEXT?" Engine
  const suggestedNextAction = useMemo(() => {
    const openTasks = tasks.filter((t) => t.status !== "completed" && t.status !== "canceled");
    if (openTasks.length === 0) {
      return {
        task: null,
        reason: "All active tasks are complete. Take a breather or brainstorm next steps in Notes.",
        project: null,
        estimatedMinutes: 0,
      };
    }

    // Scoring algorithm:
    // 1. Priority weight: urgent=100, high=60, medium=30, low=10
    // 2. Status weight: in_progress=40 (bias to finishing started work)
    // 3. Deadline urgency: overdue=80, today=50, next 3 days=25
    // 4. Project active weight: active project=+15
    const priorityWeights: Record<Priority, number> = { urgent: 100, high: 60, medium: 30, low: 10 };
    const statusWeights: Record<TaskStatus, number> = {
      in_progress: 45,
      todo: 20,
      in_review: 15,
      completed: 0,
      canceled: 0,
    };

    const todayStr = new Date().toISOString().split("T")[0];

    const scored = openTasks.map((task) => {
      let score = priorityWeights[task.priority] + (statusWeights[task.status] || 0);

      if (task.deadline) {
        if (task.deadline < todayStr) {
          score += 85; // Overdue
        } else if (task.deadline === todayStr) {
          score += 55; // Due today
        } else {
          score += 20;
        }
      }

      const project = projects.find((p) => p.id === task.projectId);
      if (project && project.status === "active") {
        score += 15;
      }

      let reason = "";
      if (task.status === "in_progress") {
        reason = `Currently in progress (${task.estimatedMinutes}m). Ready to finish.`;
      } else if (task.priority === "urgent") {
        reason = `High priority task — blocking other team items.`;
      } else if (task.deadline && task.deadline <= todayStr) {
        reason = `Due today for ${project?.name || "active project"}.`;
      } else {
        reason = `High-impact milestone item (${task.estimatedMinutes}m).`;
      }

      return {
        task,
        score,
        reason,
        project: project || null,
        estimatedMinutes: task.estimatedMinutes,
      };
    });

    scored.sort((a, b) => b.score - a.score);
    const top = scored[0];
    return {
      task: top.task,
      reason: top.reason,
      project: top.project,
      estimatedMinutes: top.estimatedMinutes,
    };
  }, [tasks, projects]);

  // Calculated Stats
  const workspaceStats = useMemo<WorkspaceStats>(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const completedToday = tasks.filter(
      (t) => t.status === "completed" && t.completedAt && t.completedAt.startsWith(todayStr)
    ).length;

    const focusMinsToday = focusSessions
      .filter((s) => s.completedAt.startsWith(todayStr))
      .reduce((acc, s) => acc + s.durationMinutes, 0);

    const openCount = tasks.filter((t) => t.status !== "completed" && t.status !== "canceled").length;
    const activeProjects = projects.filter((p) => p.status === "active").length;
    const inboxUnprocessed = quickCaptures.filter((q) => !q.convertedTo).length;

    return {
      focusMinutesToday: focusMinsToday,
      completedTasksToday: completedToday,
      openTasksCount: openCount,
      activeProjectsCount: activeProjects,
      inboxCount: inboxUnprocessed,
    };
  }, [tasks, focusSessions, projects, quickCaptures]);

  // Global Keyboard Shortcuts (⌘K, C, ⌘1-6)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing inside standard inputs or content editable
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // ⌘K or Ctrl+K -> Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Quick Capture with "C" if not typing in input
      if (e.key.toLowerCase() === "c" && !isInput && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setQuickCaptureModalOpen(true);
        return;
      }

      // ⌘1 to ⌘6 view navigation
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey) {
        const views: ActiveView[] = ["today", "tasks", "projects", "notes", "assistant", "focus"];
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= 6) {
          e.preventDefault();
          setActiveView(views[num - 1]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const resetAllToDemoData = () => {
    setTasks(initialTasks);
    setProjects(initialProjects);
    setNotes(initialNotes);
    setQuickCaptures(initialQuickCaptures);
    setFocusSessions(initialFocusSessions);
    setConversations(initialConversations);
    setActiveConversationId("conv-1");
    setDailyPrimaryFocus("Finish authentication flow & mobile sign-in testing");
    localStorage.removeItem(LOCAL_STORAGE_KEYS.TASKS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.NOTES);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.QUICK_CAPTURES);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.FOCUS_SESSIONS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.CONVERSATIONS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.DAILY_FOCUS);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        activeView,
        setActiveView,
        selectedProjectId,
        setSelectedProjectId,
        selectedNoteId,
        setSelectedNoteId,
        commandPaletteOpen,
        setCommandPaletteOpen,
        quickCaptureModalOpen,
        setQuickCaptureModalOpen,
        userProfile,
        updateUserProfile,
        theme,
        toggleTheme,
        dailyPrimaryFocus,
        setDailyPrimaryFocus,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        projects,
        addProject,
        updateProject,
        deleteProject,
        toggleProjectMilestone,
        notes,
        addNote,
        updateNote,
        deleteNote,
        quickCaptures,
        addQuickCapture,
        convertQuickCaptureToTask,
        convertQuickCaptureToNote,
        deleteQuickCapture,
        focusSessions,
        isFocusRunning,
        focusTimeRemaining,
        focusTargetMinutes,
        focusActiveTask,
        focusAmbientSound,
        startFocus,
        pauseFocus,
        resumeFocus,
        stopFocus,
        setFocusAmbientSound,
        conversations,
        activeConversationId,
        setActiveConversationId,
        createConversation,
        updateConversation,
        renameConversation,
        pinConversation,
        deleteConversation,
        addMessageToActiveConversation,
        suggestedNextAction,
        workspaceStats,
        resetAllToDemoData,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
