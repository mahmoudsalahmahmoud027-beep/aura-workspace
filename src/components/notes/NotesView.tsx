import React, { useState, useMemo } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { Note, QuickCapture } from "../../types";
import Markdown from "react-markdown";
import {
  FileText,
  Plus,
  Search,
  Pin,
  Star,
  Trash2,
  Inbox,
  CheckSquare,
  Eye,
  Edit2,
  FolderKanban,
  Tag,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
} from "lucide-react";

export const NotesView: React.FC = () => {
  const {
    notes,
    selectedNoteId,
    setSelectedNoteId,
    addNote,
    updateNote,
    deleteNote,
    quickCaptures,
    convertQuickCaptureToTask,
    convertQuickCaptureToNote,
    deleteQuickCapture,
    projects,
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState<"notes" | "inbox">("notes");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Selected Note state
  const currentNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  // All unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [notes]);

  // Filtered Notes
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = n.title.toLowerCase().includes(q);
        const matchContent = n.content.toLowerCase().includes(q);
        const matchTag = n.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchContent && !matchTag) return false;
      }
      if (selectedTag !== "all" && !n.tags.includes(selectedTag)) return false;
      return true;
    });
  }, [notes, searchQuery, selectedTag]);

  // Sorted: Pinned first, then updated date
  const sortedNotes = useMemo(() => {
    return [...filteredNotes].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [filteredNotes]);

  const handleCreateNewNote = () => {
    const newNote = addNote({
      title: "Untitled Knowledge Artifact",
      content: "## Overview\n\nStart writing notes, architecture specifications, or thoughts here...",
      tags: ["Draft"],
      isPinned: false,
      isFavorite: false,
    });
    setSelectedNoteId(newNote.id);
    setActiveTab("notes");
    setIsPreviewMode(false);
  };

  return (
    <div id="notes-module" className="max-w-6xl mx-auto space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center p-0.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
            <button
              onClick={() => setActiveTab("notes")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "notes"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Knowledge Notes ({notes.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("inbox")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "inbox"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Quick Inbox ({quickCaptures.filter((q) => !q.convertedTo).length})</span>
            </button>
          </div>
        </div>

        <button
          id="create-note-btn"
          onClick={handleCreateNewNote}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white text-xs font-semibold transition-all shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Note</span>
        </button>
      </div>

      {/* TAB 1: KNOWLEDGE & NOTES 2-PANE WORKSPACE */}
      {activeTab === "notes" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[600px]">
          {/* Left Notes List Pane (4 cols) */}
          <div className="lg:col-span-4 p-3 rounded-2xl bg-zinc-50/70 dark:bg-[#0f1116] border border-zinc-200 dark:border-zinc-800 flex flex-col space-y-3">
            {/* Search & Tag Filter */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700/80">
                <Search className="w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes..."
                  className="w-full bg-transparent text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
                />
              </div>

              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => setSelectedTag("all")}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-md transition-colors ${
                      selectedTag === "all"
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    All
                  </button>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md transition-colors ${
                        selectedTag === tag
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                          : "bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Note Cards List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[520px]">
              {sortedNotes.length === 0 ? (
                <div className="py-12 text-center text-zinc-400">
                  <p className="text-xs">No matching notes found</p>
                </div>
              ) : (
                sortedNotes.map((note) => {
                  const isSelected = currentNote?.id === note.id;
                  const project = projects.find((p) => p.id === note.projectId);

                  return (
                    <div
                      key={note.id}
                      id={`note-item-${note.id}`}
                      onClick={() => setSelectedNoteId(note.id)}
                      className={`p-3 rounded-xl cursor-pointer transition-all border text-left space-y-1 ${
                        isSelected
                          ? "bg-white dark:bg-zinc-800/90 border-zinc-300 dark:border-zinc-600 shadow-xs"
                          : "bg-white/60 dark:bg-zinc-900/40 border-zinc-200/70 dark:border-zinc-800/60 hover:bg-white dark:hover:bg-zinc-800/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4
                          className={`text-xs font-semibold truncate ${
                            isSelected
                              ? "text-zinc-900 dark:text-zinc-100"
                              : "text-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          {note.title || "Untitled Note"}
                        </h4>
                        <div className="flex items-center gap-1 shrink-0">
                          {note.isPinned && (
                            <Pin className="w-3 h-3 text-amber-500 fill-amber-500/20" />
                          )}
                          {note.isFavorite && (
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          )}
                        </div>
                      </div>

                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {note.content.replace(/^[#*-`>\s]+/gm, "")}
                      </p>

                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1">
                        <span>{note.tags.join(", ") || "General"}</span>
                        {project && (
                          <span className="text-cyan-600 dark:text-cyan-400 font-semibold">
                            {project.key}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Note Editor / Markdown Preview Pane (8 cols) */}
          <div className="lg:col-span-8 p-5 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 flex flex-col space-y-4">
            {currentNote ? (
              <>
                {/* Editor Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <input
                    type="text"
                    value={currentNote.title}
                    onChange={(e) => updateNote(currentNote.id, { title: e.target.value })}
                    placeholder="Note Title..."
                    className="text-base font-bold text-zinc-900 dark:text-zinc-100 bg-transparent focus:outline-none"
                  />

                  <div className="flex items-center gap-2">
                    {/* Preview Mode Switcher */}
                    <button
                      onClick={() => setIsPreviewMode(!isPreviewMode)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        isPreviewMode
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
                      }`}
                    >
                      {isPreviewMode ? <Edit2 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{isPreviewMode ? "Edit" : "Preview"}</span>
                    </button>

                    {/* Pin Toggle */}
                    <button
                      onClick={() => updateNote(currentNote.id, { isPinned: !currentNote.isPinned })}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        currentNote.isPinned
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                          : "border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-zinc-700"
                      }`}
                      title="Pin note to top"
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>

                    {/* Favorite Toggle */}
                    <button
                      onClick={() => updateNote(currentNote.id, { isFavorite: !currentNote.isFavorite })}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        currentNote.isFavorite
                          ? "bg-amber-400/10 border-amber-400/30 text-amber-500"
                          : "border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-zinc-700"
                      }`}
                      title="Favorite note"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Note */}
                    <button
                      onClick={() => deleteNote(currentNote.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 border border-zinc-200 dark:border-zinc-700"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Metadata Settings (Tags & Project) */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-zinc-400" />
                    <input
                      type="text"
                      value={currentNote.tags.join(", ")}
                      onChange={(e) =>
                        updateNote(currentNote.id, {
                          tags: e.target.value
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="Tags (Architecture, Spec)..."
                      className="bg-transparent border-b border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-400"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <FolderKanban className="w-3.5 h-3.5 text-zinc-400" />
                    <select
                      value={currentNote.projectId || ""}
                      onChange={(e) => updateNote(currentNote.id, { projectId: e.target.value || undefined })}
                      className="bg-transparent border-b border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
                    >
                      <option value="">No Project Assigned</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Editor or Markdown View Body */}
                <div className="flex-1 min-h-[380px]">
                  {isPreviewMode ? (
                    <div className="markdown-body p-3 bg-zinc-50/50 dark:bg-zinc-900/40 rounded-xl border border-zinc-100 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed overflow-y-auto max-h-[460px] prose dark:prose-invert">
                      <Markdown>{currentNote.content || "*No content*"}</Markdown>
                    </div>
                  ) : (
                    <textarea
                      value={currentNote.content}
                      onChange={(e) => updateNote(currentNote.id, { content: e.target.value })}
                      placeholder="Type your markdown formatted note here..."
                      className="w-full h-full min-h-[380px] bg-transparent text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none resize-none font-mono leading-relaxed p-2"
                    />
                  )}
                </div>

                {/* Footer Word & Read Count */}
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-2">
                  <span>{currentNote.content.split(/\s+/).filter(Boolean).length} words</span>
                  <span>Last modified: {new Date(currentNote.updatedAt).toLocaleString()}</span>
                </div>
              </>
            ) : (
              <div className="py-24 text-center text-zinc-400">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">Select or create a note to begin writing</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: QUICK CAPTURE INBOX */}
      {activeTab === "inbox" && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Unprocessed Quick Captures
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Triage scratchpad ideas into formal tasks or knowledge notes in 1 click
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {quickCaptures.filter((q) => !q.convertedTo).length === 0 ? (
              <div className="p-12 text-center text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl">
                <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-medium">Inbox Zero. All quick captures are triaged!</p>
              </div>
            ) : (
              quickCaptures
                .filter((q) => !q.convertedTo)
                .map((qc) => (
                  <div
                    key={qc.id}
                    className="p-4 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-2.5"
                  >
                    <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
                      {qc.content}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-zinc-200/60 dark:border-zinc-800/80">
                      <span className="text-[10px] font-mono text-zinc-400">
                        {new Date(qc.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => convertQuickCaptureToTask(qc.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                        >
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Convert to Task</span>
                        </button>

                        <button
                          onClick={() => convertQuickCaptureToNote(qc.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-500" />
                          <span>Convert to Note</span>
                        </button>

                        <button
                          onClick={() => deleteQuickCapture(qc.id)}
                          className="p-1 rounded-lg text-zinc-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
