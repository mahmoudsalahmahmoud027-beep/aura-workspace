import React, { useState, useEffect, useRef, useMemo } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import {
  Search,
  CheckSquare,
  FileText,
  FolderKanban,
  Sparkles,
  Timer,
  Calendar,
  Inbox,
  Sun,
  Moon,
  Plus,
  ArrowRight,
  Hash,
} from "lucide-react";

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setActiveView,
    setSelectedProjectId,
    setSelectedNoteId,
    setQuickCaptureModalOpen,
    toggleTheme,
    theme,
    startFocus,
    tasks,
    notes,
    projects,
    conversations,
    createConversation,
  } = useWorkspace();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  // Actions & Filtered Results
  const systemActions = useMemo(
    () => [
      {
        id: "act-create-task",
        type: "action" as const,
        category: "Actions",
        title: "Create Task",
        subtitle: "Add a new actionable item with priority and deadline",
        icon: <Plus className="w-4 h-4 text-emerald-500" />,
        shortcut: "T",
        run: () => {
          setActiveView("tasks");
        },
      },
      {
        id: "act-create-note",
        type: "action" as const,
        category: "Actions",
        title: "Create Note",
        subtitle: "Open the knowledge editor for structured writing",
        icon: <FileText className="w-4 h-4 text-amber-500" />,
        shortcut: "N",
        run: () => {
          setActiveView("notes");
          setSelectedNoteId(null);
        },
      },
      {
        id: "act-start-focus",
        type: "action" as const,
        category: "Actions",
        title: "Start 25m Focus Session",
        subtitle: "Initiate single-task deep work sprint with ambient sound",
        icon: <Timer className="w-4 h-4 text-cyan-500" />,
        shortcut: "F",
        run: () => {
          startFocus(25);
          setActiveView("focus");
        },
      },
      {
        id: "act-quick-capture",
        type: "action" as const,
        category: "Actions",
        title: "Quick Capture Thought",
        subtitle: "Rapid inbox scratchpad (Hotkey: C)",
        icon: <Inbox className="w-4 h-4 text-purple-500" />,
        shortcut: "C",
        run: () => {
          setQuickCaptureModalOpen(true);
        },
      },
      {
        id: "act-ask-aura",
        type: "action" as const,
        category: "Actions",
        title: "Ask AURA Intelligence",
        subtitle: "Consult AI co-thinker to plan or synthesize",
        icon: <Sparkles className="w-4 h-4 text-indigo-500" />,
        shortcut: "A",
        run: () => {
          createConversation("New Strategy Session");
          setActiveView("assistant");
        },
      },
      {
        id: "act-open-today",
        type: "action" as const,
        category: "Navigation",
        title: "Open Today Workspace",
        subtitle: "Daily view, smart next action, and priorities",
        icon: <Calendar className="w-4 h-4 text-zinc-500" />,
        shortcut: "⌘1",
        run: () => {
          setActiveView("today");
        },
      },
      {
        id: "act-toggle-theme",
        type: "action" as const,
        category: "Settings",
        title: `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`,
        subtitle: "Toggle high-contrast workspace theme",
        icon:
          theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-zinc-600" />
          ),
        run: () => {
          toggleTheme();
        },
      },
    ],
    [theme, setActiveView, setSelectedNoteId, startFocus, setQuickCaptureModalOpen, createConversation, toggleTheme]
  );

  // Grouped search results
  const searchResults = useMemo(() => {
    const q = query.toLowerCase().trim();

    if (!q) {
      return systemActions;
    }

    const tokens = q.split(/\s+/).filter(Boolean);

    const matchesTokens = (text: string) => {
      const lower = text.toLowerCase();
      return tokens.every((token) => lower.includes(token));
    };

    const matchedActions = systemActions.filter(
      (a) =>
        matchesTokens(`${a.title} ${a.subtitle} ${a.category}`)
    );

    const matchedTasks = tasks
      .filter((t) =>
        matchesTokens(`${t.title} ${t.description} ${t.tags.join(" ")}`)
      )
      .map((t) => ({
        id: `task-${t.id}`,
        type: "task" as const,
        category: "Tasks",
        title: t.title,
        subtitle: `${t.priority.toUpperCase()} · ${t.status.replace("_", " ")} · ${t.estimatedMinutes}m`,
        icon: <CheckSquare className="w-4 h-4 text-emerald-500" />,
        run: () => {
          setActiveView("tasks");
        },
      }));

    const matchedProjects = projects
      .filter((p) =>
        matchesTokens(`${p.name} ${p.description} ${p.key} ${p.tags.join(" ")}`)
      )
      .map((p) => ({
        id: `proj-${p.id}`,
        type: "project" as const,
        category: "Projects",
        title: p.name,
        subtitle: `${p.key} · ${p.progress}% completed · ${p.status}`,
        icon: <FolderKanban className="w-4 h-4 text-cyan-500" />,
        run: () => {
          setSelectedProjectId(p.id);
          setActiveView("projects");
        },
      }));

    const matchedNotes = notes
      .filter((n) =>
        matchesTokens(`${n.title} ${n.content} ${n.tags.join(" ")}`)
      )
      .map((n) => ({
        id: `note-${n.id}`,
        type: "note" as const,
        category: "Knowledge & Notes",
        title: n.title,
        subtitle: `${n.tags.join(", ") || "General Note"} · Last updated`,
        icon: <FileText className="w-4 h-4 text-amber-500" />,
        run: () => {
          setSelectedNoteId(n.id);
          setActiveView("notes");
        },
      }));

    const matchedConversations = conversations
      .filter((c) => matchesTokens(c.title))
      .map((c) => ({
        id: `conv-${c.id}`,
        type: "conversation" as const,
        category: "AI Conversations",
        title: c.title,
        subtitle: `${c.messages.length} messages in thread`,
        icon: <Sparkles className="w-4 h-4 text-indigo-500" />,
        run: () => {
          setActiveView("assistant");
        },
      }));

    return [
      ...matchedActions,
      ...matchedTasks,
      ...matchedProjects,
      ...matchedNotes,
      ...matchedConversations,
    ];
  }, [query, systemActions, tasks, projects, notes, conversations, setActiveView, setSelectedProjectId, setSelectedNoteId]);

  // Keyboard navigation inside palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        executeItem(searchResults[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setCommandPaletteOpen(false);
    }
  };

  const executeItem = (item: any) => {
    setCommandPaletteOpen(false);
    item.run();
  };

  if (!commandPaletteOpen) return null;

  return (
    <div
      id="command-palette-backdrop"
      className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-50 flex items-start justify-center pt-[12vh] px-4 animate-in fade-in duration-150"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        id="command-palette-modal"
        className="w-full max-w-xl bg-white dark:bg-[#12141a] rounded-2xl border border-zinc-200 dark:border-zinc-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[70vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search workspace..."
            className="w-full bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800"
            >
              Clear
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1">
          {searchResults.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 dark:text-zinc-500">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-medium">No matching commands or workspace records found</p>
              <p className="text-xs opacity-70 mt-0.5">Try searching for keywords like "task", "project", "note", "focus", or "plan"</p>
            </div>
          ) : (
            searchResults.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  id={`cmd-item-${item.id}`}
                  onClick={() => executeItem(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left cursor-pointer transition-all ${
                    isSelected
                      ? "bg-zinc-100 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-700/60"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-white dark:bg-zinc-700 shadow-xs"
                          : "bg-zinc-100 dark:bg-zinc-800/80"
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold truncate text-zinc-900 dark:text-zinc-100">
                          {item.title}
                        </p>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-200/60 dark:bg-zinc-800/90 text-zinc-500 dark:text-zinc-400">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-400 truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {"shortcut" in item && item.shortcut && (
                      <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                        {item.shortcut}
                      </kbd>
                    )}
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="p-2.5 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-[#0c0d12]/80 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 px-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-white dark:bg-zinc-800 px-1 rounded border border-zinc-200 dark:border-zinc-700">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-white dark:bg-zinc-800 px-1 rounded border border-zinc-200 dark:border-zinc-700">↵</kbd> Select
            </span>
          </div>
          <span className="font-mono text-[10px]">Universal Fuzzy Search</span>
        </div>
      </div>
    </div>
  );
};
