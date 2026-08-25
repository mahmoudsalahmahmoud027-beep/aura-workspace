import React, { useState, useRef, useEffect } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { aiService } from "../../services/aiService";
import Markdown from "react-markdown";
import {
  Sparkles,
  Send,
  Plus,
  Trash2,
  Zap,
  User,
  Copy,
  Check,
  Pin,
  Edit2,
  RotateCw,
  Square,
  MessageSquare,
} from "lucide-react";

export const AssistantView: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    createConversation,
    addMessageToActiveConversation,
    renameConversation,
    pinConversation,
    deleteConversation,
    tasks,
    projects,
    notes,
    workspaceStats,
  } = useWorkspace();

  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || conversations[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages, isLoading]);

  const quickPrompts = [
    {
      label: "Plan my afternoon",
      prompt:
        "Based on my active tasks and deadlines, suggest a realistic focus schedule for this afternoon with practical time blocks.",
    },
    {
      label: "Break down milestone",
      prompt:
        "Analyze my active projects and break down the upcoming milestone into clear, actionable tasks with estimated time.",
    },
    {
      label: "Summarize notes",
      prompt:
        "Review my recent workspace notes and summarize the main decisions and takeaways.",
    },
    {
      label: "Review priorities",
      prompt:
        "Review my pending tasks and recommend which ones I should focus on first today.",
    },
  ];

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleStartRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingConvId(id);
    setEditingTitle(currentTitle);
  };

  const handleSaveRename = (id: string) => {
    if (editingTitle.trim()) {
      renameConversation(id, editingTitle.trim());
    }
    setEditingConvId(null);
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    let targetConvId = activeConversationId;
    if (!activeConversation) {
      targetConvId = createConversation("Workspace Session");
    }

    addMessageToActiveConversation("user", textToSend);
    setInputMessage("");
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const workspaceContext = {
        tasks: tasks.map((t) => ({
          title: t.title,
          priority: t.priority,
          status: t.status,
          deadline: t.deadline,
          estimatedMinutes: t.estimatedMinutes,
        })),
        projects: projects.map((p) => ({
          name: p.name,
          key: p.key,
          progress: p.progress,
          deadline: p.deadline,
        })),
        notes: notes.slice(0, 5).map((n) => ({
          title: n.title,
          tags: n.tags,
        })),
        focusStats: workspaceStats,
      };

      const aiResponse = await aiService.generateStrategicResponse(
        textToSend,
        workspaceContext,
        activeConversation?.messages || [],
        controller.signal
      );

      addMessageToActiveConversation("assistant", aiResponse);
    } catch (err: any) {
      if (err?.name === "AbortError" || controller.signal.aborted) {
        // Generation cancelled by user
      } else {
        console.error(err);
        addMessageToActiveConversation(
          "assistant",
          "A temporary connection error occurred. Your workspace data is safely stored."
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleRetryLastMessage = () => {
    if (!activeConversation || isLoading) return;
    const lastUserMessage = [...activeConversation.messages].reverse().find((m) => m.role === "user");
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage.content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Sort conversations: pinned first, then by creation date
  const sortedConversations = [...conversations].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div id="assistant-module" className="max-w-6xl mx-auto space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Assistant
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-500/20">
              Workspace Intelligence
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Grounded in your active tasks, projects, notes, and focus sessions.
          </p>
        </div>

        <button
          id="new-chat-btn"
          onClick={() => createConversation("New Session")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Session</span>
        </button>
      </div>

      {/* 2-Column Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[620px]">
        {/* Left Threads History (3 cols) */}
        <div className="lg:col-span-3 p-3 rounded-2xl bg-zinc-50/70 dark:bg-[#0f1116] border border-zinc-200/80 dark:border-zinc-800 flex flex-col space-y-2">
          <div className="flex items-center justify-between px-2 pt-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Conversations
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              {conversations.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1 max-h-[540px]">
            {sortedConversations.map((conv) => {
              const isSelected = activeConversation?.id === conv.id;
              const isEditing = editingConvId === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    if (!isEditing) setActiveConversationId(conv.id);
                  }}
                  className={`group flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                    isSelected
                      ? "bg-white dark:bg-zinc-800 font-semibold text-zinc-900 dark:text-zinc-100 shadow-xs border border-zinc-200/80 dark:border-zinc-700"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-white/60 dark:hover:bg-zinc-800/40"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {conv.isPinned ? (
                      <Pin className="w-3.5 h-3.5 text-indigo-500 fill-current shrink-0" />
                    ) : (
                      <MessageSquare className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 shrink-0" />
                    )}

                    {isEditing ? (
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={() => handleSaveRename(conv.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveRename(conv.id);
                          if (e.key === "Escape") setEditingConvId(null);
                        }}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        className="bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded text-xs text-zinc-900 dark:text-zinc-100 w-full focus:outline-none"
                      />
                    ) : (
                      <span className="truncate">{conv.title}</span>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          pinConversation(conv.id);
                        }}
                        className={`p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 ${
                          conv.isPinned ? "text-indigo-500" : "text-zinc-400"
                        }`}
                        title={conv.isPinned ? "Unpin session" : "Pin session"}
                      >
                        <Pin className="w-3 h-3" />
                      </button>

                      <button
                        onClick={(e) => handleStartRename(conv.id, conv.title, e)}
                        className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        title="Rename session"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>

                      {conversations.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conv.id);
                          }}
                          className="p-1 rounded text-zinc-400 hover:text-rose-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                          title="Delete session"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Active Conversation Stage (9 cols) */}
        <div className="lg:col-span-9 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between space-y-4">
          {/* Quick Prebuilt Prompts */}
          <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mr-1 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Prompts:
            </span>
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(qp.prompt)}
                disabled={isLoading}
                className="text-xs px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition-colors cursor-pointer"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto space-y-4 max-h-[460px] pr-2">
            {activeConversation?.messages.map((msg, index) => {
              const isUser = msg.role === "user";
              const isLastAssistantMessage =
                !isUser && index === activeConversation.messages.length - 1;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 text-xs leading-relaxed ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`p-3.5 rounded-2xl max-w-2xl relative group ${
                      isUser
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium"
                        : "bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 text-zinc-800 dark:text-zinc-200"
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="markdown-body prose dark:prose-invert text-xs max-w-none">
                        <Markdown>{msg.content}</Markdown>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-zinc-200/50 dark:border-zinc-800/50 text-xs text-zinc-400">
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      <div className="flex items-center gap-2">
                        {!isUser && isLastAssistantMessage && !isLoading && (
                          <button
                            onClick={handleRetryLastMessage}
                            className="flex items-center gap-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                            title="Retry response"
                          >
                            <RotateCw className="w-3 h-3" />
                            <span>Retry</span>
                          </button>
                        )}

                        {!isUser && (
                          <button
                            onClick={() => handleCopyMessage(msg.id, msg.content)}
                            className="flex items-center gap-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                          >
                            {copiedMessageId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span className="text-emerald-500">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
                <div className="flex items-center gap-2.5 text-xs text-indigo-700 dark:text-indigo-300">
                  <Sparkles className="w-4 h-4 animate-spin text-indigo-500" />
                  <span>Generating response...</span>
                </div>
                <button
                  onClick={handleStopGeneration}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors"
                >
                  <Square className="w-3 h-3 fill-current text-rose-500" />
                  <span>Stop</span>
                </button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Form */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-end gap-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl p-2 focus-within:ring-1 focus-within:ring-zinc-400">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask assistant to plan your schedule, summarize notes, or break down goals... (Enter to send)"
                rows={2}
                className="w-full bg-transparent text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none resize-none p-1.5"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="p-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white disabled:opacity-30 transition-all shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

