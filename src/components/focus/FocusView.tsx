import React, { useState, useEffect } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { soundService, AmbientSoundType } from "../../services/soundService";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Volume2,
  VolumeX,
  Timer,
  Waves,
  CloudRain,
  Radio,
  Flame,
  Plus,
} from "lucide-react";

export const FocusView: React.FC = () => {
  const {
    isFocusRunning,
    focusTimeRemaining,
    focusTargetMinutes,
    focusActiveTask,
    startFocus,
    pauseFocus,
    resumeFocus,
    stopFocus,
    workspaceStats,
    tasks,
    addQuickCapture,
  } = useWorkspace();

  const [selectedDuration, setSelectedDuration] = useState<number>(25);
  const [customDurationInput, setCustomDurationInput] = useState<string>("");
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [selectedSound, setSelectedSound] = useState<AmbientSoundType>("brown_noise");
  const [volume, setVolume] = useState<number>(0.25);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [quickThought, setQuickThought] = useState("");
  const [capturedThoughts, setCapturedThoughts] = useState<string[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");

  useEffect(() => {
    if (isFocusRunning && !isSoundMuted && selectedSound !== "none") {
      soundService.startAmbientSound(selectedSound, volume);
    } else {
      soundService.stopAmbientSound();
    }
  }, [isFocusRunning, selectedSound, isSoundMuted, volume]);

  const handleSoundChange = (type: AmbientSoundType) => {
    setSelectedSound(type);
    if (isFocusRunning && !isSoundMuted) {
      soundService.startAmbientSound(type, volume);
    }
  };

  const handleStartSession = () => {
    const finalDuration = isCustomDuration && Number(customDurationInput) > 0
      ? Math.min(180, Math.max(1, Number(customDurationInput)))
      : selectedDuration;
    const linkedTask = tasks.find((t) => t.id === selectedTaskId);
    startFocus(finalDuration, linkedTask || null, selectedSound);
  };

  const handleSaveThought = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickThought.trim()) return;
    addQuickCapture(quickThought.trim());
    setCapturedThoughts((prev) => [quickThought.trim(), ...prev]);
    setQuickThought("");
  };

  // Format mm:ss
  const displayTotalSecs = isFocusRunning
    ? focusTimeRemaining
    : (isCustomDuration && Number(customDurationInput) > 0 ? Number(customDurationInput) : selectedDuration) * 60;
  
  const minutes = Math.floor(displayTotalSecs / 60);
  const seconds = displayTotalSecs % 60;
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  const totalSeconds = (focusTargetMinutes || selectedDuration) * 60;
  const progressPercent = isFocusRunning
    ? Math.min(100, Math.max(0, ((totalSeconds - focusTimeRemaining) / (totalSeconds || 1)) * 100))
    : 0;

  const pendingTasks = tasks.filter((t) => t.status !== "completed");

  // Weekly focus history data for chart
  const weeklyFocusData = [
    { day: "Mon", minutes: 90, height: 60 },
    { day: "Tue", minutes: 135, height: 90 },
    { day: "Wed", minutes: 75, height: 50 },
    { day: "Thu", minutes: 120, height: 80 },
    { day: "Fri", minutes: 105, height: 70 },
    { day: "Sat", minutes: 45, height: 30 },
    { day: "Sun", minutes: 60, height: 40 },
  ];

  return (
    <div id="focus-view" className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Focus
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Single-task deep work with ambient sound.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#12151e] border border-zinc-200/80 dark:border-zinc-800 text-xs shadow-xs">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">5-day streak</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Focus Center Stage (8 cols) */}
        <div className="lg:col-span-8 p-8 sm:p-10 rounded-2xl bg-white dark:bg-[#12151e] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col items-center justify-center space-y-8 relative">
          {/* Active Objective */}
          <div className="text-center max-w-md space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Focus on
            </span>
            {focusActiveTask ? (
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {focusActiveTask.title}
              </h2>
            ) : (
              <div className="pt-1">
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  disabled={isFocusRunning}
                  className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 rounded-xl px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none max-w-xs truncate"
                >
                  <option value="">Select a task to focus on (optional)...</option>
                  {pendingTasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Large Minimal Timer */}
          <div className="relative flex flex-col items-center justify-center">
            <div className="text-7xl sm:text-8xl font-mono font-bold tracking-tight text-zinc-900 dark:text-zinc-100 select-none">
              {formattedMinutes}:{formattedSeconds}
            </div>

            {/* Progress line */}
            <div className="w-64 sm:w-80 bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-6 overflow-hidden">
              <div
                className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Duration Selector when not running */}
          {!isFocusRunning && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[15, 25, 45, 60, 90].map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    setIsCustomDuration(false);
                    setSelectedDuration(mins);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    !isCustomDuration && selectedDuration === mins
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {mins}m
                </button>
              ))}

              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl px-2 py-1">
                <span className="text-xs text-zinc-400">Custom:</span>
                <input
                  type="number"
                  min="1"
                  max="180"
                  placeholder="min"
                  value={customDurationInput}
                  onChange={(e) => {
                    setIsCustomDuration(true);
                    setCustomDurationInput(e.target.value);
                  }}
                  onFocus={() => setIsCustomDuration(true)}
                  className="w-12 bg-transparent text-xs text-zinc-900 dark:text-zinc-100 text-center focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-3">
            {!isFocusRunning ? (
              <button
                id="focus-start-btn"
                onClick={handleStartSession}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Focus</span>
              </button>
            ) : (
              <>
                {isFocusRunning ? (
                  <button
                    id="focus-pause-btn"
                    onClick={pauseFocus}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Pause className="w-4 h-4" />
                    <span>Pause</span>
                  </button>
                ) : (
                  <button
                    id="focus-resume-btn"
                    onClick={resumeFocus}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Resume</span>
                  </button>
                )}

                <button
                  id="focus-finish-btn"
                  onClick={() => stopFocus(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Finish</span>
                </button>

                <button
                  id="focus-reset-btn"
                  onClick={() => stopFocus(false)}
                  className="p-2.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Reset"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Focus Sounds Bar */}
          <div className="w-full max-w-md pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col items-center gap-3">
            <div className="flex items-center justify-between w-full text-xs text-zinc-500 dark:text-zinc-400">
              <span className="font-medium">Focus sounds</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSoundMuted(!isSoundMuted)}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  {isSoundMuted ? <VolumeX className="w-3.5 h-3.5 text-red-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.05"
                  value={volume}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setVolume(val);
                    soundService.setVolume(val);
                  }}
                  className="w-16 h-1 accent-indigo-600"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {[
                { id: "none" as const, label: "Silent", icon: VolumeX },
                { id: "rain" as const, label: "Rain", icon: CloudRain },
                { id: "brown_noise" as const, label: "Brown Noise", icon: Waves },
                { id: "pink_noise" as const, label: "Pink Noise", icon: Radio },
              ].map((sound) => {
                const isSelected = selectedSound === sound.id;
                return (
                  <button
                    key={sound.id}
                    onClick={() => handleSoundChange(sound.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                        : "bg-zinc-100 dark:bg-zinc-800/70 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {sound.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick thoughts input */}
          <div className="w-full pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
            <p className="text-[11px] text-zinc-400 mb-2">
              Save a thought without leaving your session.
            </p>
            <form onSubmit={handleSaveThought} className="flex gap-2">
              <input
                type="text"
                value={quickThought}
                onChange={(e) => setQuickThought(e.target.value)}
                placeholder="Save this for later..."
                className="flex-1 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700/80 rounded-xl px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!quickThought.trim()}
                className="px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-semibold disabled:opacity-40 cursor-pointer"
              >
                Save
              </button>
            </form>
          </div>
        </div>

        {/* Right Stats & Weekly Focus Chart (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Today's Focus Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#12151e] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Today
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Total Time</span>
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {Math.floor(workspaceStats.focusMinutesToday / 60)}h {workspaceStats.focusMinutesToday % 60}m
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Sessions</span>
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {Math.max(1, Math.round(workspaceStats.focusMinutesToday / 30))}
                </p>
              </div>
            </div>
          </div>

          {/* Focus History Bar Chart */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#12151e] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Focus History
              </h3>
              <span className="text-xs text-zinc-400">This Week</span>
            </div>

            {/* Bar chart */}
            <div className="h-36 flex items-end justify-between gap-2 pt-4 px-1">
              {weeklyFocusData.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-t-md relative flex items-end justify-center h-24 overflow-hidden">
                    <div
                      className={`w-full rounded-t-md transition-all ${
                        item.day === "Tue"
                          ? "bg-indigo-600 dark:bg-indigo-500"
                          : "bg-zinc-300 dark:bg-zinc-700"
                      }`}
                      style={{ height: `${item.height}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
