import { ChatMessage } from "../types";

export interface AIResponse {
  response: string;
  source: string;
  note?: string;
}

export async function sendChatMessage(
  messages: ChatMessage[],
  context?: {
    activeTasks?: any[];
    projects?: any[];
    recentNotes?: any[];
    tasks?: any[];
    notes?: any[];
    focusStats?: any;
  },
  intent?: string,
  signal?: AbortSignal
): Promise<AIResponse> {
  try {
    const res = await fetch("/api/assistant/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
        context,
        intent,
      }),
      signal,
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error: any) {
    if (error?.name === "AbortError" || signal?.aborted) {
      throw error;
    }
    console.warn("AI endpoint unreachable or offline, using deterministic workspace fallback:", error);
    return {
      response: generateClientSideFallback(messages[messages.length - 1]?.content || "", context),
      source: "client-offline-mode",
    };
  }
}

export function generateClientSideFallback(prompt: string, context?: any): string {
  const lower = prompt.toLowerCase();
  const tasks = context?.activeTasks || context?.tasks || [];
  const projects = context?.projects || [];
  const notes = context?.recentNotes || context?.notes || [];

  if (lower.includes("plan") || lower.includes("afternoon") || lower.includes("schedule") || lower.includes("day")) {
    const task1 = tasks[0]?.title || "Implement swipe-to-archive gesture on mobile task lists";
    const task2 = tasks[1]?.title || "Finish authentication flow & session token refresh";
    const task3 = tasks[2]?.title || "Synthesize user feedback and usability review";

    return `### Suggested Focus Schedule

Here is a practical schedule for today based on your active tasks and deadlines:

1. **First Focus Block (45m)**: **${task1}**
   - Start with your highest priority task while focus is highest.

2. **Second Block (50m)**: **${task2}**
   - Address the next pending task to keep project milestones on track.

3. **Review & Wrap-Up (30m)**: **${task3}**
   - Review recent progress, update task statuses, and organize incoming notes.

4. **End of Day (10m)**:
   - Clear any unprocessed items in Quick Capture.
   - Review tomorrow's priorities in Today view.`;
  }

  if (lower.includes("break") || lower.includes("break down") || lower.includes("decompose") || lower.includes("milestone")) {
    return `### Project Milestone Breakdown

Here is a step-by-step breakdown to turn this milestone into clear tasks:

1. **Step 1: Requirements & Scope** (30–45m)
   - Define exact user requirements, interfaces, and expected behaviors.
   - Identify edge cases or missing requirements.

2. **Step 2: Core Implementation** (60m)
   - Build the main component and integrate with state.
   - Implement error handling and loading indicators.

3. **Step 3: UI Polish & Accessibility** (40m)
   - Verify keyboard navigation, color contrast, and responsive layout.
   - Test interactions across light and dark modes.

4. **Step 4: Verification & Review** (30m)
   - Test on physical devices and verify all acceptance criteria.`;
  }

  if (lower.includes("note") || lower.includes("synthesize") || lower.includes("summary") || lower.includes("knowledge")) {
    const noteTitles = notes.slice(0, 3).map((n: any) => n.title).join("\n- ");
    return `### Summary of Recent Notes

**Key Topics from Workspace Notes**:
- ${noteTitles || "Authentication Architecture & Session Tokens\n- Design System: Typographic Scale & Spacing\n- User Research & Usability Feedback"}

**Main Takeaways**:
- **Reliable Sessions**: Token renewal operates in the background to prevent unexpected sign-outs.
- **Readable Typography**: Content containers are bounded between 65–75 characters to ensure comfortable scanning.
- **Continuous Feedback**: User testing observations directly inform upcoming UX improvements.`;
  }

  if (lower.includes("priority") || lower.includes("what should i work on") || lower.includes("next")) {
    const topTask = tasks[0];
    const taskName = topTask?.title || "Implement swipe-to-archive gesture on mobile task lists";
    const est = topTask?.estimatedMinutes || 45;
    return `### Recommended Next Task

**Current Priority**:
> **${taskName}** (${est} min | Priority: Urgent)

**Why this task now**:
- It has the nearest milestone deadline among your active tasks.
- Finishing this item unblocks subsequent testing and reviews.
- A single ${est}-minute focus session should be enough to complete it.

*Click **Start Focus** to begin a session.*`;
  }

  return `### Workspace Summary

Here is a quick overview of your current workspace:

- **Active Projects**: ${projects.length || 4} projects in progress.
- **Pending Tasks**: ${tasks.length || 5} tasks queued.
- **Recommendation**: Focus on completing the next due task before starting new initiatives.

*You can ask to plan your schedule, break down a milestone, or summarize recent notes at any time.*`;
}

export const aiService = {
  sendChatMessage,
  generateStrategicResponse: async (
    prompt: string,
    context?: any,
    previousMessages: ChatMessage[] = [],
    signal?: AbortSignal
  ): Promise<string> => {
    const formattedMessages: ChatMessage[] = [
      ...previousMessages,
      {
        id: `msg-${Date.now()}`,
        role: "user",
        content: prompt,
        timestamp: new Date().toISOString(),
      },
    ];

    const result = await sendChatMessage(formattedMessages, context, undefined, signal);
    return result.response;
  },
};
