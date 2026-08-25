import React, { useState } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { Project, ProjectStatus } from "../../types";
import {
  FolderKanban,
  Plus,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Calendar,
  User,
  Tag,
  CheckSquare,
  FileText,
  Activity,
  Trash2,
  Edit3,
  Clock,
  Sparkles,
  X,
  PlusCircle,
} from "lucide-react";

export const ProjectsView: React.FC = () => {
  const {
    projects,
    selectedProjectId,
    setSelectedProjectId,
    tasks,
    notes,
    toggleTaskComplete,
    addTask,
    addNote,
    toggleProjectMilestone,
    addProject,
    deleteProject,
    updateProject,
    setActiveView,
    setSelectedNoteId,
    userProfile,
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState<"tasks" | "notes" | "milestones" | "activity">("tasks");
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectKey, setNewProjectKey] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectLead, setNewProjectLead] = useState(userProfile.name || "Lead Engineer");
  const [newProjectDeadline, setNewProjectDeadline] = useState("2026-10-30");
  const [newProjectColor, setNewProjectColor] = useState("emerald");

  // Inline task creation in project
  const [quickTaskTitle, setQuickTaskTitle] = useState("");
  const [quickNoteTitle, setQuickNoteTitle] = useState("");

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const created = addProject({
      name: newProjectName.trim(),
      key: newProjectKey.trim().toUpperCase() || "PRJ",
      description: newProjectDesc.trim(),
      status: "active",
      progress: 0,
      color: newProjectColor,
      deadline: newProjectDeadline,
      lead: newProjectLead,
      tags: ["Active"],
      milestones: [
        { id: `m-${Date.now()}-1`, title: "Phase 1: Initial Discovery & Scope", dueDate: newProjectDeadline, completed: false },
        { id: `m-${Date.now()}-2`, title: "Phase 2: Alpha Implementation", dueDate: newProjectDeadline, completed: false },
      ],
    });

    setIsCreatingProject(false);
    setSelectedProjectId(created.id);
  };

  const handleAddQuickTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim() || !selectedProjectId) return;

    addTask({
      title: quickTaskTitle.trim(),
      description: "",
      priority: "medium",
      status: "todo",
      projectId: selectedProjectId,
      estimatedMinutes: 30,
      tags: [selectedProject?.key || "Task"],
      subtasks: [],
    });
    setQuickTaskTitle("");
  };

  const handleAddQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNoteTitle.trim() || !selectedProjectId) return;

    const newNote = addNote({
      title: quickNoteTitle.trim(),
      content: `## ${quickNoteTitle.trim()}\n\nProject reference note for ${selectedProject?.name}.`,
      tags: [selectedProject?.key || "Spec"],
      isPinned: false,
      isFavorite: false,
      projectId: selectedProjectId,
    });
    setQuickNoteTitle("");
    setSelectedNoteId(newNote.id);
    setActiveView("notes");
  };

  // Color mapping
  const getColorClasses = (color: string) => {
    switch (color) {
      case "emerald":
        return { bg: "bg-emerald-500", text: "text-emerald-500", light: "bg-emerald-500/10" };
      case "amber":
        return { bg: "bg-amber-500", text: "text-amber-500", light: "bg-amber-500/10" };
      case "cyan":
        return { bg: "bg-cyan-500", text: "text-cyan-500", light: "bg-cyan-500/10" };
      default:
        return { bg: "bg-indigo-500", text: "text-indigo-500", light: "bg-indigo-500/10" };
    }
  };

  // PROJECT DETAIL PAGE
  if (selectedProject) {
    const linkedTasks = tasks.filter((t) => t.projectId === selectedProject.id);
    const linkedNotes = notes.filter((n) => n.projectId === selectedProject.id);
    const completedTasksCount = linkedTasks.filter((t) => t.status === "completed").length;

    return (
      <div id="project-detail-view" className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
        {/* Back Button & Top Meta */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <button
            id="back-to-projects-btn"
            onClick={() => setSelectedProjectId(null)}
            className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Projects</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase font-bold">
              {selectedProject.status}
            </span>
            <button
              onClick={() => deleteProject(selectedProject.id)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10"
              title="Delete Project"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Project Hero Header */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-bold">
                  {selectedProject.key}
                </span>
                <div className="flex items-center gap-1">
                  {selectedProject.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {selectedProject.name}
              </h2>

              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                {selectedProject.description}
              </p>
            </div>

            {/* Progress Big Ring / Metric */}
            <div className="text-right shrink-0">
              <div className="text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-100">
                {selectedProject.progress}%
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                {completedTasksCount} / {linkedTasks.length} tasks done
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getColorClasses(selectedProject.color).bg}`}
              style={{ width: `${selectedProject.progress}%` }}
            />
          </div>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Lead: {selectedProject.lead}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Target: {selectedProject.deadline}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{linkedTasks.length} linked tasks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>{linkedNotes.length} linked specs</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 text-xs font-medium">
          <button
            id="proj-tab-tasks"
            onClick={() => setActiveTab("tasks")}
            className={`pb-2.5 px-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "tasks"
                ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-bold"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tasks ({linkedTasks.length})</span>
          </button>

          <button
            id="proj-tab-notes"
            onClick={() => setActiveTab("notes")}
            className={`pb-2.5 px-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "notes"
                ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-bold"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Notes & Specs ({linkedNotes.length})</span>
          </button>

          <button
            id="proj-tab-milestones"
            onClick={() => setActiveTab("milestones")}
            className={`pb-2.5 px-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "milestones"
                ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-bold"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Milestones ({selectedProject.milestones.length})</span>
          </button>

          <button
            id="proj-tab-activity"
            onClick={() => setActiveTab("activity")}
            className={`pb-2.5 px-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "activity"
                ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-bold"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Activity Stream</span>
          </button>
        </div>

        {/* TAB CONTENTS */}

        {/* 1. TASKS TAB */}
        {activeTab === "tasks" && (
          <div className="space-y-4">
            {/* Quick add task inside project */}
            <form onSubmit={handleAddQuickTask} className="flex gap-2">
              <input
                type="text"
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                placeholder="Add a new task to this project..."
                className="flex-1 bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
              <button
                type="submit"
                disabled={!quickTaskTitle.trim()}
                className="px-3 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-semibold disabled:opacity-40"
              >
                Add Task
              </button>
            </form>

            <div className="space-y-2">
              {linkedTasks.length === 0 ? (
                <div className="p-8 text-center text-zinc-400 bg-white dark:bg-[#12141a] rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <p className="text-xs">No tasks attached to this project yet.</p>
                </div>
              ) : (
                linkedTasks.map((task) => {
                  const isDone = task.status === "completed";
                  return (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => toggleTaskComplete(task.id)}
                          className="text-zinc-400 hover:text-emerald-500"
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                        <span
                          className={`text-xs font-medium truncate ${
                            isDone ? "line-through text-zinc-400" : "text-zinc-900 dark:text-zinc-100"
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {task.estimatedMinutes}m · {task.priority}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 2. NOTES & SPECS TAB */}
        {activeTab === "notes" && (
          <div className="space-y-4">
            <form onSubmit={handleAddQuickNote} className="flex gap-2">
              <input
                type="text"
                value={quickNoteTitle}
                onChange={(e) => setQuickNoteTitle(e.target.value)}
                placeholder="Draft new technical note / spec..."
                className="flex-1 bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!quickNoteTitle.trim()}
                className="px-3 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-semibold disabled:opacity-40"
              >
                Create Spec Note
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {linkedNotes.length === 0 ? (
                <div className="col-span-2 p-8 text-center text-zinc-400 bg-white dark:bg-[#12141a] rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <p className="text-xs">No documentation or notes linked to this project yet.</p>
                </div>
              ) : (
                linkedNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => {
                      setSelectedNoteId(note.id);
                      setActiveView("notes");
                    }}
                    className="p-3.5 rounded-xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer space-y-1"
                  >
                    <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {note.title}
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {note.content}
                    </p>
                    <span className="text-[10px] font-mono text-zinc-400 block pt-1">
                      {note.tags.join(", ")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 3. MILESTONES TAB */}
        {activeTab === "milestones" && (
          <div className="p-4 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              Project Milestones & Deliverables
            </h3>
            <div className="space-y-2">
              {selectedProject.milestones.map((m) => (
                <div
                  key={m.id}
                  onClick={() => toggleProjectMilestone(selectedProject.id, m.id)}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button className="text-zinc-400 hover:text-emerald-500">
                      {m.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <span
                      className={`text-xs font-medium ${
                        m.completed ? "line-through text-zinc-400" : "text-zinc-900 dark:text-zinc-100"
                      }`}
                    >
                      {m.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">Due: {m.dueDate}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. ACTIVITY TAB */}
        {activeTab === "activity" && (
          <div className="p-4 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              Audit & Activity Log
            </h3>
            <div className="space-y-2">
              {selectedProject.activity.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 text-xs"
                >
                  <div className="w-2 h-2 rounded-full bg-zinc-400 mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-zinc-800 dark:text-zinc-200 font-medium">
                      {act.description}
                    </p>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {new Date(act.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ALL PROJECTS HUB GRID
  return (
    <div id="projects-grid-view" className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Project Hub
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {projects.length} active initiatives and research tracks
          </p>
        </div>

        <button
          id="create-project-btn"
          onClick={() => setIsCreatingProject(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white text-xs font-semibold transition-all shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project) => {
          const linkedTasks = tasks.filter((t) => t.projectId === project.id);
          const colorStyles = getColorClasses(project.color);

          return (
            <div
              key={project.id}
              id={`project-card-${project.id}`}
              onClick={() => setSelectedProjectId(project.id)}
              className="p-5 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer space-y-3 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold">
                    {project.key}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 uppercase">
                    {project.status}
                  </span>
                </div>
                <span className="text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {project.progress}%
                </span>
              </div>

              <div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {project.name}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${colorStyles.bg}`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>

              {/* Footer Meta */}
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
                <span>{linkedTasks.length} tasks linked</span>
                <span>Due: {project.deadline}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE PROJECT MODAL */}
      {isCreatingProject && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#12141a] rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-2xl p-5 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Create New Project
              </h3>
              <button
                onClick={() => setIsCreatingProject(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Portfolio redesign"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Key Prefix (3 letters)
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={newProjectKey}
                    onChange={(e) => setNewProjectKey(e.target.value)}
                    placeholder="PORT"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Accent Color
                  </label>
                  <select
                    value={newProjectColor}
                    onChange={(e) => setNewProjectColor(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  >
                    <option value="emerald">Emerald</option>
                    <option value="cyan">Cyan</option>
                    <option value="amber">Amber</option>
                    <option value="indigo">Indigo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Objective & Scope
                </label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Goals, scope, milestones, and important context..."
                  rows={3}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Target Deadline
                  </label>
                  <input
                    type="date"
                    value={newProjectDeadline}
                    onChange={(e) => setNewProjectDeadline(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Lead
                  </label>
                  <input
                    type="text"
                    value={newProjectLead}
                    onChange={(e) => setNewProjectLead(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingProject(false)}
                  className="px-3 py-1.5 text-xs font-medium rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white shadow-xs"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
