import React, { useState, useEffect } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import {
  Search,
  Plus,
  Sparkles,
  Timer,
  Sun,
  Moon,
  RotateCcw,
  Menu,
} from "lucide-react";

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const {
    activeView,
    theme,
    toggleTheme,
    setCommandPaletteOpen,
    setQuickCaptureModalOpen,
    isFocusRunning,
    focusTimeRemaining,
    setActiveView,
    resetAllToDemoData,
  } = useWorkspace();

  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatFocusRemaining = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getViewTitle = () => {
    switch (activeView) {
      case "today":
        return "Workspace Today";
      case "tasks":
        return "Task Command";
      case "projects":
        return "Project Hub";
      case "notes":
        return "Knowledge & Notes";
      case "assistant":
        return "AURA Intelligence";
      case "focus":
        return "Focus Studio";
      default:
        return "AURA";
    }
  };

  return (
    <header
      id="aura-global-header"
      className="h-14 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/95 dark:bg-[#0e1015]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors"
    >
      {/* Left: Mobile Menu Trigger + View Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          id="mobile-menu-btn"
          onClick={onMobileMenuToggle}
          className="md:hidden p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
            AURA
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <h1 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 tracking-tight">
            {getViewTitle()}
          </h1>
        </div>
      </div>

      {/* Center: Command Palette Trigger Button */}
      <div className="hidden sm:flex items-center">
        <button
          id="global-search-trigger"
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/50 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all text-xs font-medium w-64 md:w-80 justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
            <span className="truncate">Search tasks, notes, commands...</span>
          </div>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400">
            <span className="text-[11px]">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Active Focus Pill */}
        {isFocusRunning ? (
          <button
            id="active-focus-pill"
            onClick={() => setActiveView("focus")}
            className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-medium hover:bg-emerald-500/20 transition-all animate-pulse cursor-pointer"
            title="Focus Session Active - Click to view"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{formatFocusRemaining(focusTimeRemaining)}</span>
          </button>
        ) : (
          <button
            id="start-focus-btn-header"
            onClick={() => setActiveView("focus")}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
            title="Open Focus Studio"
          >
            <Timer className="w-3.5 h-3.5 text-zinc-500" />
            <span>Focus</span>
          </button>
        )}

        {/* Quick Capture Button */}
        <button
          id="header-quick-capture-btn"
          onClick={() => setQuickCaptureModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-medium transition-all shadow-sm cursor-pointer"
          title="Quick Capture Thought (Hotkey: C)"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Capture</span>
          <kbd className="hidden xl:inline-block px-1 py-0.2 rounded text-[10px] font-mono bg-zinc-800 dark:bg-zinc-200 text-zinc-300 dark:text-zinc-700 ml-0.5">
            C
          </kbd>
        </button>

        {/* Date / Time */}
        <div className="hidden xl:flex flex-col text-right border-l border-zinc-200 dark:border-zinc-800 pl-3">
          <span className="text-[11px] font-mono font-medium text-zinc-800 dark:text-zinc-200">
            {currentTime}
          </span>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
            {currentDate}
          </span>
        </div>

        {/* Theme Toggle */}
        <button
          id="theme-toggle-btn"
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-zinc-600" />
          )}
        </button>

        {/* Reset Demo Data Button */}
        <div className="relative">
          <button
            id="reset-demo-data-btn"
            onClick={() => setShowResetConfirm(true)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
            title="Reset Workspace to Clean Demo State"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {showResetConfirm && (
            <div className="absolute right-0 mt-2 w-64 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-xl z-50 animate-in fade-in zoom-in-95">
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                Reset Demo Workspace?
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-3">
                This restores default projects, tasks, notes, and conversations.
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    resetAllToDemoData();
                    setShowResetConfirm(false);
                  }}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-xs"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
