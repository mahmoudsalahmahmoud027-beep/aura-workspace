import React, { useState, useMemo } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { Task, Priority, TaskStatus } from "../../types";
import {
  CheckSquare,
  Plus,
  Search,
  Circle,
  CheckCircle2,
  Clock,
  Calendar,
  Trash2,
  Edit3,
  Play,
  LayoutList,
  Columns,
  Grid2X2,
  X,
} from "lucide-react";

export const TasksView: React.FC = () => {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    projects,
    startFocus,
    setActiveView,
  } = useWorkspace();

  const [viewMode, setViewMode] = useState<"list" | "board" | "matrix">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [activeTaskModal, setActiveTaskModal] = useState<Task | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // Form State for Create/Edit
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPriority, setFormPriority] = useState<Priority>("medium");
  const [formStatus, setFormStatus] = useState<TaskStatus>("todo");
  const [formProjectId, setFormProjectId] = useState<string>("");
  const [formDeadline, setFormDeadline] = useState("");
  const [formEstimatedMinutes, setFormEstimatedMinutes] = useState(30);
  const [formTags, setFormTags] = useState("");

  const openCreateModal = () => {
    setFormTitle("");
    setFormDescription("");
    setFormPriority("medium");
    setFormStatus("todo");
    setFormProjectId(projects[0]?.id || "");
    setFormDeadline("");
    setFormEstimatedMinutes(30);
    setFormTags("");
    setActiveTaskModal(null);
    setIsCreatingTask(true);
  };

  const openEditModal = (task: Task) => {
    setFormTitle(task.title);
    setFormDescription(task.description);
    setFormPriority(task.priority);
    setFormStatus(task.status);
    setFormProjectId(task.projectId || "");
    setFormDeadline(task.deadline || "");
    setFormEstimatedMinutes(task.estimatedMinutes);
    setFormTags(task.tags.join(", "));
    setActiveTaskModal(task);
    setIsCreatingTask(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const tagsArray = formTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (activeTaskModal) {
      updateTask(activeTaskModal.id, {
        title: formTitle.trim(),
        description: formDescription.trim(),
        priority: formPriority,
        status: formStatus,
        projectId: formProjectId || undefined,
        deadline: formDeadline || undefined,
        estimatedMinutes: Number(formEstimatedMinutes) || 30,
        tags: tagsArray,
      });
    } else {
      addTask({
        title: formTitle.trim(),
        description: formDescription.trim(),
        priority: formPriority,
        status: formStatus,
        projectId: formProjectId || undefined,
        deadline: formDeadline || undefined,
        estimatedMinutes: Number(formEstimatedMinutes) || 30,
        tags: tagsArray,
        subtasks: [],
      });
    }

    setIsCreatingTask(false);
    setActiveTaskModal(null);
  };

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description.toLowerCase().includes(q);
        const matchTag = t.tags.some((tag) => tag.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchTag) return false;
      }

      if (selectedPriority !== "all" && t.priority !== selectedPriority) return false;
      if (selectedStatus !== "all" && t.status !== selectedStatus) return false;
      if (selectedProject !== "all" && t.projectId !== selectedProject) return false;

      return true;
    });
  }, [tasks, searchQuery, selectedPriority, selectedStatus, selectedProject]);

  const priorityBadges: Record<Priority, string> = {
    urgent: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    high: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    medium: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    low: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
  };

  const statusColumns: { id: TaskStatus; label: string }[] = [
    { id: "todo", label: "To Do" },
    { id: "in_progress", label: "In Progress" },
    { id: "in_review", label: "In Review" },
    { id: "completed", label: "Completed" },
  ];

  return (
    <div id="tasks-module" className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Tasks
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {filteredTasks.length} active tasks · {tasks.filter((t) => t.status === "completed").length} completed
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center p-0.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "list"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
              title="List View"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "board"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
              title="Kanban Board"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("matrix")}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "matrix"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
              title="Priority Matrix"
            >
              <Grid2X2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            id="create-task-primary-btn"
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2.5 p-3 rounded-2xl bg-white dark:bg-[#12151e] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[180px]">
          <Search className="w-3.5 h-3.5 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, descriptions, tags..."
            className="w-full bg-transparent text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-zinc-400 hover:text-zinc-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Priority Filter */}
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 rounded-xl px-2.5 py-1 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none"
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 rounded-xl px-2.5 py-1 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="in_review">In Review</option>
          <option value="completed">Completed</option>
        </select>

        {/* Project Filter */}
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 rounded-xl px-2.5 py-1 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none max-w-[150px] truncate"
        >
          <option value="all">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* VIEW MODES */}

      {/* 1. LIST VIEW */}
      {viewMode === "list" && (
        <div className="space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 bg-white dark:bg-[#12151e] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80">
              <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-medium">No tasks found matching your filters</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isDone = task.status === "completed";
              const project = projects.find((p) => p.id === task.projectId);

              return (
                <div
                  key={task.id}
                  id={`task-row-${task.id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#12151e] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all gap-3 group"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className="text-zinc-400 hover:text-emerald-500 transition-colors shrink-0 mt-0.5 sm:mt-0"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-xs font-medium cursor-pointer ${
                            isDone
                              ? "line-through text-zinc-400"
                              : "text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400"
                          }`}
                          onClick={() => openEditModal(task)}
                        >
                          {task.title}
                        </span>

                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded border font-medium uppercase ${
                            priorityBadges[task.priority]
                          }`}
                        >
                          {task.priority}
                        </span>

                        {project && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                            {project.key}
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Metadata & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-7 sm:pl-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2.5 text-[11px] text-zinc-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.estimatedMinutes}m
                      </span>
                      {task.deadline && (
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                          <Calendar className="w-3 h-3" />
                          {task.deadline}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          startFocus(task.estimatedMinutes, task);
                          setActiveView("focus");
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-500 hover:bg-emerald-500/10 cursor-pointer"
                        title="Start Focus"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>

                      <button
                        onClick={() => openEditModal(task)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                        title="Edit Task"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                        title="Delete Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 2. KANBAN BOARD VIEW */}
      {viewMode === "board" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusColumns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className="p-3.5 rounded-2xl bg-zinc-50/70 dark:bg-[#0f1116] border border-zinc-200/80 dark:border-zinc-800/80 space-y-3 flex flex-col min-h-[400px]"
              >
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {col.label}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2 flex-1">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl bg-white dark:bg-[#151821] border border-zinc-200/80 dark:border-zinc-700/70 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-600 transition-all space-y-2 group cursor-pointer"
                      onClick={() => openEditModal(task)}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-semibold uppercase ${
                            priorityBadges[task.priority]
                          }`}
                        >
                          {task.priority}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTaskComplete(task.id);
                          }}
                          className="text-zinc-400 hover:text-emerald-500"
                        >
                          {task.status === "completed" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      <h4 className="text-xs font-medium text-zinc-900 dark:text-zinc-100 leading-snug">
                        {task.title}
                      </h4>

                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                        <span>{task.estimatedMinutes}m</span>
                        {task.deadline && (
                          <span className="text-amber-600 dark:text-amber-400">
                            {task.deadline}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. EISENHOWER MATRIX VIEW */}
      {viewMode === "matrix" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider font-mono">
                Quadrant I: Urgent & Critical
              </span>
              <span className="text-xs font-mono font-bold text-red-600">
                {filteredTasks.filter((t) => t.priority === "urgent" && t.status !== "completed").length}
              </span>
            </div>
            <div className="space-y-2">
              {filteredTasks
                .filter((t) => t.priority === "urgent" && t.status !== "completed")
                .map((task) => (
                  <div
                    key={task.id}
                    onClick={() => openEditModal(task)}
                    className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/40 shadow-xs flex items-center justify-between cursor-pointer"
                  >
                    <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                      {task.title}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startFocus(task.estimatedMinutes, task);
                        setActiveView("focus");
                      }}
                      className="p-1 rounded bg-red-500/10 text-red-600 text-[10px] font-mono"
                    >
                      Focus
                    </button>
                  </div>
                ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider font-mono">
                Quadrant II: High Leverage
              </span>
              <span className="text-xs font-mono font-bold text-amber-600">
                {filteredTasks.filter((t) => t.priority === "high" && t.status !== "completed").length}
              </span>
            </div>
            <div className="space-y-2">
              {filteredTasks
                .filter((t) => t.priority === "high" && t.status !== "completed")
                .map((task) => (
                  <div
                    key={task.id}
                    onClick={() => openEditModal(task)}
                    className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/40 shadow-xs flex items-center justify-between cursor-pointer"
                  >
                    <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                      {task.title}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">{task.estimatedMinutes}m</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider font-mono">
                Quadrant III: Operational / Batch
              </span>
              <span className="text-xs font-mono font-bold text-blue-600">
                {filteredTasks.filter((t) => t.priority === "medium" && t.status !== "completed").length}
              </span>
            </div>
            <div className="space-y-2">
              {filteredTasks
                .filter((t) => t.priority === "medium" && t.status !== "completed")
                .map((task) => (
                  <div
                    key={task.id}
                    onClick={() => openEditModal(task)}
                    className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between cursor-pointer"
                  >
                    <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                      {task.title}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">{task.estimatedMinutes}m</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-500/5 dark:bg-zinc-500/10 border border-zinc-300 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-mono">
                Quadrant IV: Low Priority / Backlog
              </span>
              <span className="text-xs font-mono font-bold text-zinc-500">
                {filteredTasks.filter((t) => t.priority === "low" && t.status !== "completed").length}
              </span>
            </div>
            <div className="space-y-2">
              {filteredTasks
                .filter((t) => t.priority === "low" && t.status !== "completed")
                .map((task) => (
                  <div
                    key={task.id}
                    onClick={() => openEditModal(task)}
                    className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between cursor-pointer"
                  >
                    <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                      {task.title}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">{task.estimatedMinutes}m</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT TASK MODAL */}
      {isCreatingTask && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#12151e] rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xl p-5 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {activeTaskModal ? "Edit Task" : "Create New Task"}
              </h3>
              <button
                onClick={() => setIsCreatingTask(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Implement authentication flow"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Description / Context
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Technical context, acceptance criteria..."
                  rows={3}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as Priority)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as TaskStatus)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="in_review">In Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Project
                  </label>
                  <select
                    value={formProjectId}
                    onChange={(e) => setFormProjectId(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  >
                    <option value="">No Project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Estimated Time (min)
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={formEstimatedMinutes}
                    onChange={(e) => setFormEstimatedMinutes(Number(e.target.value))}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="Engineering, Design"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200/80 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingTask(false)}
                  className="px-3.5 py-2 text-xs font-medium rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs cursor-pointer"
                >
                  {activeTaskModal ? "Save Changes" : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
