import React, { useState, useEffect, useRef } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { Inbox, CheckSquare, FileText, X, Sparkles, CornerDownLeft } from "lucide-react";

export const QuickCaptureModal: React.FC = () => {
  const {
    quickCaptureModalOpen,
    setQuickCaptureModalOpen,
    addQuickCapture,
    addTask,
    addNote,
  } = useWorkspace();

  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (quickCaptureModalOpen) {
      setContent("");
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [quickCaptureModalOpen]);

  const handleSaveToInbox = () => {
    if (!content.trim()) return;
    addQuickCapture(content.trim());
    setQuickCaptureModalOpen(false);
  };

  const handleConvertToTask = () => {
    if (!content.trim()) return;
    const lines = content.trim().split("\n");
    const title = lines[0].slice(0, 80);
    const description = lines.slice(1).join("\n");

    addTask({
      title,
      description,
      priority: "medium",
      status: "todo",
      estimatedMinutes: 30,
      tags: ["Inbox"],
      subtasks: [],
    });
    setQuickCaptureModalOpen(false);
  };

  const handleConvertToNote = () => {
    if (!content.trim()) return;
    const lines = content.trim().split("\n");
    const title = lines[0].slice(0, 60);

    addNote({
      title,
      content: content.trim(),
      tags: ["Captured"],
      isPinned: false,
      isFavorite: false,
    });
    setQuickCaptureModalOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSaveToInbox();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setQuickCaptureModalOpen(false);
    }
  };

  if (!quickCaptureModalOpen) return null;

  return (
    <div
      id="quick-capture-backdrop"
      className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-50 flex items-start justify-center pt-[14vh] px-4 animate-in fade-in duration-150"
      onClick={() => setQuickCaptureModalOpen(false)}
    >
      <div
        id="quick-capture-modal"
        className="w-full max-w-lg bg-white dark:bg-[#12141a] rounded-2xl border border-zinc-200 dark:border-zinc-700/80 shadow-2xl overflow-hidden p-4 space-y-3 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
              <Inbox className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              Quick Capture
            </span>
          </div>
          <button
            onClick={() => setQuickCaptureModalOpen(false)}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Dump an idea, bug to fix, follow-up, or note here... (⌘+Enter to save)"
          rows={4}
          className="w-full bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 resize-none font-sans leading-relaxed"
        />

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5">
            <button
              id="qc-save-task-btn"
              onClick={handleConvertToTask}
              disabled={!content.trim()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-40 transition-colors"
            >
              <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
              <span>As Task</span>
            </button>

            <button
              id="qc-save-note-btn"
              onClick={handleConvertToNote}
              disabled={!content.trim()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-40 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              <span>As Note</span>
            </button>
          </div>

          <button
            id="qc-submit-inbox-btn"
            onClick={handleSaveToInbox}
            disabled={!content.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white disabled:opacity-40 transition-all shadow-xs"
          >
            <span>Save to Inbox</span>
            <kbd className="text-[10px] font-mono opacity-70">⌘↵</kbd>
          </button>
        </div>
      </div>
    </div>
  );
};
