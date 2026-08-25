import React from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { ActiveView } from "../../types";
import {
  Calendar,
  CheckSquare,
  FolderKanban,
  FileText,
  Sparkles,
  Timer,
  Plus,
  Compass,
  Inbox,
  ChevronRight,
  Hash,
  X,
} from "lucide-react";

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onMobileClose }) => {
  const {
    activeView,
    setActiveView,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    workspaceStats,
    isFocusRunning,
    setQuickCaptureModalOpen,
  } = useWorkspace();

  const navItems: {
    id: ActiveView;
    label: string;
    icon: React.ReactNode;
    shortcut: string;
    badge?: number | string;
  }[] = [
    {
      id: "today",
      label: "Today",
      icon: <Calendar className="w-4 h-4" />,
      shortcut: "⌘1",
    },
    {
      id: "tasks",
      label: "Tasks",
      icon: <CheckSquare className="w-4 h-4" />,
      shortcut: "⌘2",
      badge: workspaceStats.openTasksCount > 0 ? workspaceStats.openTasksCount : undefined,
    },
    {
      id: "projects",
      label: "Projects",
      icon: <FolderKanban className="w-4 h-4" />,
      shortcut: "⌘3",
      badge: projects.length,
    },
    {
      id: "notes",
      label: "Notes & Inbox",
      icon: <FileText className="w-4 h-4" />,
      shortcut: "⌘4",
      badge: workspaceStats.inboxCount > 0 ? `${workspaceStats.inboxCount} new` : undefined,
    },
    {
      id: "assistant",
      label: "AI Assistant",
      icon: <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />,
      shortcut: "⌘5",
    },
    {
      id: "focus",
      label: "Focus Studio",
      icon: <Timer className="w-4 h-4 text-emerald-500" />,
      shortcut: "⌘6",
      badge: isFocusRunning ? "Active" : undefined,
    },
  ];

  const handleNavClick = (viewId: ActiveView) => {
    setActiveView(viewId);
    if (viewId !== "projects") {
      setSelectedProjectId(null);
    }
    onMobileClose();
  };

  const handleProjectClick = (projectId: string) => {
    setActiveView("projects");
    setSelectedProjectId(projectId);
    onMobileClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={onMobileClose}
        />
      )}

      <aside
        id="aura-sidebar"
        className={`fixed md:sticky top-0 left-0 z-50 md:z-20 h-screen w-64 border-r border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/90 dark:bg-[#0c0d12]/95 backdrop-blur-md flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Top: Brand Header */}
        <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
          <div
            onClick={() => handleNavClick("today")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950 font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
              A
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                  AURA
                </span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
                  v2.0
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                Command Workspace
              </p>
            </div>
          </div>

          <button
            onClick={onMobileClose}
            className="md:hidden p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Center: Nav + Projects */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-6">
          {/* Main Navigation */}
          <div className="space-y-1">
            <div className="px-2 pb-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Workspace
            </div>
            {navItems.map((item) => {
              const isActive = activeView === item.id && !selectedProjectId;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? "bg-white dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 shadow-xs border border-zinc-200/80 dark:border-zinc-700/60 font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/40 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`transition-colors ${
                        isActive
                          ? "text-zinc-900 dark:text-zinc-100"
                          : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-medium ${
                          item.id === "focus" && isFocusRunning
                            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            : item.id === "notes" && workspaceStats.inboxCount > 0
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                            : "bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    <span className="hidden xl:inline text-[10px] font-mono text-zinc-400 dark:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.shortcut}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Projects Quick Jump */}
          <div className="space-y-1">
            <div className="px-2 pb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Active Projects
              </span>
              <button
                id="sidebar-add-project-btn"
                onClick={() => {
                  setActiveView("projects");
                  setSelectedProjectId(null);
                }}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-0.5 rounded"
                title="View All Projects"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {projects.slice(0, 5).map((project) => {
              const isSelected = activeView === "projects" && selectedProjectId === project.id;
              const colorDot =
                project.color === "emerald"
                  ? "bg-emerald-500"
                  : project.color === "amber"
                  ? "bg-amber-500"
                  : project.color === "cyan"
                  ? "bg-cyan-500"
                  : "bg-indigo-500";

              return (
                <button
                  key={project.id}
                  id={`sidebar-project-${project.id}`}
                  onClick={() => handleProjectClick(project.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all text-left group ${
                    isSelected
                      ? "bg-white dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 font-semibold shadow-xs border border-zinc-200/80 dark:border-zinc-700/60"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/40 hover:text-zinc-900 dark:hover:text-zinc-200 font-normal"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={`w-1.5 h-1.5 rounded-full ${colorDot} shrink-0`} />
                    <span className="truncate">{project.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                    {project.progress}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Capture Inbox Shortcut */}
          <div className="pt-2">
            <button
              id="sidebar-quick-inbox"
              onClick={() => {
                setActiveView("notes");
                onMobileClose();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 text-xs text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all text-left"
            >
              <div className="flex items-center gap-2">
                <Inbox className="w-3.5 h-3.5 text-zinc-500" />
                <span className="font-medium">Quick Inbox</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                {workspaceStats.inboxCount} items
              </span>
            </button>
          </div>
        </div>

        {/* Bottom Workspace Metrics Bar */}
        <div className="p-3 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white/40 dark:bg-[#0a0b0f]/60 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 px-1">
            <span>Focus Today</span>
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
              {workspaceStats.focusMinutesToday}m
            </span>
          </div>

          <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (workspaceStats.focusMinutesToday / 120) * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono">
              <span>Completed today:</span>
              <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                {workspaceStats.completedTasksToday}
              </span>
            </div>
            <button
              id="sidebar-shortcut-hint"
              onClick={() => setQuickCaptureModalOpen(true)}
              className="text-[10px] font-mono text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-0.5"
              title="Quick Capture Hotkey"
            >
              <span>[C] Capture</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
