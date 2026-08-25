import React, { useState } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Play,
  ArrowRight,
  Clock,
  Calendar,
  FolderKanban,
  FileText,
  Plus,
  CheckSquare,
  Flame,
  Timer,
  Check,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

export const TodayView: React.FC = () => {
  const {
    userProfile,
    dailyPrimaryFocus,
    setDailyPrimaryFocus,
    suggestedNextAction,
    tasks,
    toggleTaskComplete,
    projects,
    notes,
    setActiveView,
    setSelectedProjectId,
    setSelectedNoteId,
    startFocus,
    setQuickCaptureModalOpen,
    createConversation,
    workspaceStats,
  } = useWorkspace();

  // Dynamic Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const todayDateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const todayStr = new Date().toISOString().split("T")[0];
  const activeTasks = tasks.filter((t) => t.status !== "completed" && t.status !== "canceled");
  const completedTodayTasks = tasks.filter(
    (t) => t.status === "completed" && t.completedAt && t.completedAt.startsWith(todayStr)
  );

  const dueTodayTasks = activeTasks.filter((t) => t.deadline && t.deadline <= todayStr);
  const activeProjects = projects.filter((p) => p.status === "active");

  const handleAskAIToPlan = () => {
    createConversation("Plan My Day");
    setActiveView("assistant");
  };

  // Up Next mock schedule time slots for display
  const upNextSlots = [
    { time: "11:30 AM", task: activeTasks[0]?.title || "Prepare release notes draft", category: "Engine" },
    { time: "1:30 PM", task: activeTasks[1]?.title || "Review API integration spec", category: "Spec" },
    { time: "3:30 PM", task: activeTasks[2]?.title || "Update project roadmap", category: "Planning" },
  ];

  return (
    <div id="today-workspace" className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Top Header: Greeting & Primary Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            {getGreeting()}{userProfile.name ? `, ${userProfile.name}` : ""} <span className="text-2xl">👋</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Let's make today productive. · <span className="font-medium text-zinc-700 dark:text-zinc-300">{todayDateStr}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="today-quick-capture-btn"
            onClick={() => setQuickCaptureModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Quick Capture</span>
          </button>

          <button
            id="today-plan-with-aura-btn"
            onClick={handleAskAIToPlan}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-xs font-medium transition-all shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Plan with AURA</span>
          </button>
        </div>
      </div>

      {/* Row 1: Focus Now Card + Today Overview Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Focus Now Card (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-zinc-900 to-zinc-950 dark:from-[#13162b] dark:via-[#0e1017] dark:to-[#090b10] border border-indigo-900/40 dark:border-indigo-900/30 text-white flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-indigo-400" />
              Focus Now
            </span>
            <span className="text-[11px] font-mono text-zinc-400 bg-white/10 px-2 py-0.5 rounded-full">
              45 min
            </span>
          </div>

          <div className="py-4 flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full bg-indigo-500/10 border-2 border-indigo-500/30 flex items-center justify-center shrink-0">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Deep Work Sprint</p>
              <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                {suggestedNextAction.task?.title || "Focus on highest priority task"}
              </p>
            </div>
          </div>

          <button
            id="today-start-focus-btn"
            onClick={() => {
              startFocus(45, suggestedNextAction.task);
              setActiveView("focus");
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Focus</span>
          </button>
        </div>

        {/* Today Overview Stats (8 cols) */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-white dark:bg-[#12151e] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-mono">
              Today Overview
            </h2>
            <span className="text-xs text-zinc-400">Live Workspace Status</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3">
            {/* Stat 1: Tasks */}
            <div
              onClick={() => setActiveView("tasks")}
              className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Tasks</span>
                <CheckSquare className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors" />
              </div>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{activeTasks.length}</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {completedTodayTasks.length > 0 ? `${completedTodayTasks.length} done today` : "remaining"}
              </p>
            </div>

            {/* Stat 2: Focus Time */}
            <div
              onClick={() => setActiveView("focus")}
              className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Focus Time</span>
                <Timer className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
              </div>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {Math.floor(workspaceStats.focusMinutesToday / 60)}h {workspaceStats.focusMinutesToday % 60}m
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">logged today</p>
            </div>

            {/* Stat 3: Projects */}
            <div
              onClick={() => setActiveView("projects")}
              className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Projects</span>
                <FolderKanban className="w-3.5 h-3.5 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
              </div>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{activeProjects.length}</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">active</p>
            </div>

            {/* Stat 4: Notes */}
            <div
              onClick={() => setActiveView("notes")}
              className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Notes</span>
                <FileText className="w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-500 transition-colors" />
              </div>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{notes.length}</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">knowledge items</p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: What should I work on next? + Up Next + Deadline Today */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* What should I work on next? (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-[#12151e] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                What should I work on next?
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Based on your tasks, deadlines, and priorities.
            </p>
          </div>

          {suggestedNextAction.task ? (
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  HIGH PRIORITY TASK
                </span>
                {suggestedNextAction.project && (
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                    {suggestedNextAction.project.name}
                  </span>
                )}
              </div>

              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {suggestedNextAction.task.title}
              </h3>

              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {suggestedNextAction.reason}
              </p>

              <div className="pt-2 flex items-center gap-2">
                <button
                  id="start-next-action-btn"
                  onClick={() => {
                    startFocus(suggestedNextAction.estimatedMinutes, suggestedNextAction.task);
                    setActiveView("focus");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Start Now</span>
                </button>

                <button
                  onClick={() => toggleTaskComplete(suggestedNextAction.task!.id)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Done</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-zinc-400 text-xs">
              All high-priority tasks completed!
            </div>
          )}
        </div>

        {/* Up Next Schedule (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-white dark:bg-[#12151e] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Up Next</h2>
            <button
              onClick={() => setActiveView("tasks")}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              All tasks
            </button>
          </div>

          <div className="space-y-2.5 flex-1">
            {upNextSlots.map((slot, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/60 text-xs"
              >
                <span className="font-mono text-[11px] text-zinc-400 font-medium shrink-0 pt-0.5">
                  {slot.time}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-zinc-800 dark:text-zinc-200 truncate">
                    {slot.task}
                  </p>
                  <span className="text-[10px] text-zinc-400 mt-0.5 inline-block">
                    {slot.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deadline Today (3 cols) */}
        <div className="lg:col-span-3 p-5 rounded-2xl bg-white dark:bg-[#12151e] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Deadline Today
            </h2>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
            <p className="font-semibold text-amber-900 dark:text-amber-200">
              {dueTodayTasks[0]?.title || "Project presentation & milestone"}
            </p>
            <p className="text-[11px] font-mono text-amber-700 dark:text-amber-400">
              6:00 PM
            </p>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
              <span>{dueTodayTasks.length || 3} tasks due today</span>
              <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">
                {Math.round(((completedTodayTasks.length || 1) / Math.max(1, (dueTodayTasks.length || 3))) * 100)}%
              </span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.round(((completedTodayTasks.length || 1) / Math.max(1, (dueTodayTasks.length || 3))) * 100))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Recent Notes + Active Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Recent Notes (6 cols) */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-white dark:bg-[#12151e] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Recent Notes
            </h2>
            <button
              onClick={() => setActiveView("notes")}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {notes.slice(0, 3).map((note, index) => {
              const relativeDates = ["Today", "Yesterday", "2 days ago"];
              return (
                <div
                  key={note.id}
                  onClick={() => {
                    setSelectedNoteId(note.id);
                    setActiveView("notes");
                  }}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500 transition-colors shrink-0" />
                    <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate">
                      {note.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 shrink-0 font-medium">
                    {relativeDates[index] || "Recent"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Projects (6 cols) */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-white dark:bg-[#12151e] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Active Projects
            </h2>
            <button
              onClick={() => setActiveView("projects")}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
            >
              <span>View all projects</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {activeProjects.slice(0, 3).map((project) => (
              <div
                key={project.id}
                onClick={() => {
                  setSelectedProjectId(project.id);
                  setActiveView("projects");
                }}
                className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                    {project.name}
                  </span>
                  <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                    {project.progress}%
                  </span>
                </div>
                <div className="w-full bg-zinc-200/80 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
