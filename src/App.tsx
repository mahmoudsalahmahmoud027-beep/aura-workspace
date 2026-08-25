import React, { useState } from "react";
import { WorkspaceProvider, useWorkspace } from "./context/WorkspaceContext";
import { Header } from "./components/common/Header";
import { Sidebar } from "./components/common/Sidebar";
import { CommandPalette } from "./components/common/CommandPalette";
import { QuickCaptureModal } from "./components/common/QuickCaptureModal";
import { TodayView } from "./components/today/TodayView";
import { TasksView } from "./components/tasks/TasksView";
import { ProjectsView } from "./components/projects/ProjectsView";
import { NotesView } from "./components/notes/NotesView";
import { FocusView } from "./components/focus/FocusView";
import { AssistantView } from "./components/assistant/AssistantView";

const MainWorkspace: React.FC = () => {
  const { activeView } = useWorkspace();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeView) {
      case "today":
        return <TodayView />;
      case "tasks":
        return <TasksView />;
      case "projects":
        return <ProjectsView />;
      case "notes":
        return <NotesView />;
      case "focus":
        return <FocusView />;
      case "assistant":
        return <AssistantView />;
      default:
        return <TodayView />;
    }
  };

  return (
    <div id="aura-application-root" className="min-h-screen bg-[#fcfcfd] dark:bg-[#090a0f] text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-150">
      {/* Universal Top Header */}
      <Header onMobileMenuToggle={() => setMobileSidebarOpen((prev) => !prev)} />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar (Desktop & Mobile Drawer) */}
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        {/* Dynamic Viewport */}
        <main
          id="aura-viewport-main"
          className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6"
        >
          {renderActiveView()}
        </main>
      </div>

      {/* Global Command Palette (⌘K) */}
      <CommandPalette />

      {/* Rapid Quick Capture Modal (C) */}
      <QuickCaptureModal />
    </div>
  );
};

export default function App() {
  return (
    <WorkspaceProvider>
      <MainWorkspace />
    </WorkspaceProvider>
  );
}
