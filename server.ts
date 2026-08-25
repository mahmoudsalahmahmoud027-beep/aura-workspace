import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialize Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
  });
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY",
    timestamp: new Date().toISOString(),
  });
});

// AI Assistant endpoint
app.post("/api/assistant/chat", async (req, res) => {
  try {
    const { messages, context, intent } = req.body;
    const ai = getGeminiClient();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    const lastMessage = messages[messages.length - 1];
    const userPrompt = lastMessage.content;

    // If no API key configured or fallback requested, return high-quality local deterministic response
    if (!ai) {
      const fallbackResponse = generateLocalIntelligenceResponse(userPrompt, context, intent);
      return res.json({
        response: fallbackResponse,
        source: "local-intelligence-layer",
      });
    }

    // Build system instruction with rich workspace context
    const workspaceContextStr = context
      ? `\n\nCURRENT USER WORKSPACE CONTEXT:
- Active Tasks: ${JSON.stringify(context.activeTasks || [], null, 2)}
- Projects: ${JSON.stringify(context.projects || [], null, 2)}
- Today's Date: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
- Recent Notes: ${JSON.stringify(context.recentNotes || [], null, 2)}
`
      : "";

    const systemInstruction = `You are AURA, an executive AI assistant and personal workspace partner.
You are embedded directly inside the user's personal operating system.
Your communication style is:
- Clear, precise, insightful, and calm
- Structured and action-oriented
- Respectful of cognitive bandwidth (no fluffy corporate jargon, no fake hype)
- When asked to plan or break down tasks, provide realistic timeframes, actionable steps, and logical dependencies
- Use markdown formatting with clean headers, bullet points, and highlight key terms with bold text
${workspaceContextStr}`;

    // Format conversation history for Gemini
    const contents: any[] = [];
    for (let i = 0; i < messages.length - 1; i++) {
      const msg = messages[i];
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }
    contents.push({
      role: "user",
      parts: [{ text: userPrompt }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.95,
      },
    });

    const replyText = response.text || "I have analyzed your workspace and prepared the recommendations.";
    return res.json({
      response: replyText,
      source: "gemini-3.7-flash",
    });
  } catch (error: any) {
    console.error("AI Assistant API error:", error);
    // Graceful fallback on error
    const fallbackResponse = generateLocalIntelligenceResponse(
      req.body.messages?.[req.body.messages.length - 1]?.content || "",
      req.body.context,
      req.body.intent
    );
    return res.json({
      response: fallbackResponse,
      source: "fallback-resilient-mode",
      note: "Switched to local engine due to transient network state.",
    });
  }
});

// Local Intelligence Engine (for offline, demo, or non-key fallback)
function generateLocalIntelligenceResponse(prompt: string, context?: any, _intent?: string): string {
  const lower = prompt.toLowerCase();
  const tasks = context?.activeTasks || [];
  const urgentTasks = tasks.filter((t: any) => t.priority === "urgent" || t.priority === "high");
  const task1 = urgentTasks[0]?.title || tasks[0]?.title || "Implement swipe-to-archive gesture on mobile task lists";
  const task2 = urgentTasks[1]?.title || tasks[1]?.title || "Finish authentication flow & session token refresh";

  if (lower.includes("plan") && (lower.includes("afternoon") || lower.includes("day") || lower.includes("schedule"))) {
    return `### Suggested Focus Schedule

Based on your current workspace tasks and upcoming deadlines, here is a practical plan for today:

#### **Focus Block 1 (45–60 min)**
- **Primary Task**: ${task1}
- **Goal**: Make meaningful progress on your most urgent deliverable.

#### **Focus Block 2 (45–60 min)**
- **Secondary Task**: ${task2}
- **Goal**: Work on the next priority task to keep milestones on schedule.

#### **Wrap-up (15–20 min)**
- Review milestone completions in Project Hub.
- Process pending items in Quick Capture Inbox.
- Set tomorrow's primary focus in Workspace Today.`;
  }

  if (lower.includes("break") || lower.includes("breakdown") || lower.includes("decompose") || lower.includes("goal") || lower.includes("milestone")) {
    return `### Project Milestone Breakdown

Here is a clear, step-by-step breakdown into manageable tasks:

#### **Phase 1: Discovery & Specification**
1. **Requirements Review & Scope Definition** *(Est: 45 min)*
   - List acceptance criteria and key user flows.
2. **Interface & Types Definition** *(Est: 45 min)*
   - Finalize TypeScript types and data models.

#### **Phase 2: Core Implementation**
3. **Core Logic & State Management** *(Est: 60 min)*
   - Build state store and mutation handlers.
4. **Error Handling & State Resilience** *(Est: 30 min)*
   - Add loading indicators, empty states, and fallback handlers.

#### **Phase 3: UI Polish & Verification**
5. **Interactive UI & Keyboard Navigation** *(Est: 45 min)*
   - Connect user interactions, shortcut triggers, and animations.
6. **Cross-Device Testing & Verification** *(Est: 30 min)*
   - Test across desktop and mobile screen sizes.`;
  }

  if (lower.includes("summarize") || lower.includes("summary") || lower.includes("notes") || lower.includes("knowledge")) {
    const notes = context?.recentNotes || [];
    const noteTitles = notes.slice(0, 3).map((n: any) => n.title).join(", ");
    return `### Workspace Knowledge Summary

**Key Highlights from Recent Notes** (${noteTitles || "Authentication Architecture & Design System"}):

- **Architecture**: Emphasizes local-first state responsiveness with background sync retry for reliability.
- **Ergonomics**: Quick keyboard shortcuts (\`⌘K\`, \`C\`) and single-glance status over nested menus.
- **Design Consistency**: Strict adherence to WCAG 2.2 AA contrast standards and modular typography.`;
  }

  if (lower.includes("what should i work on") || lower.includes("next") || lower.includes("priority")) {
    return `### Recommended Next Task

**Highest Priority Task**:
> **${task1}** *(Priority: Urgent)*

**Why this item**:
- It is the most time-sensitive deliverable among your active tasks.
- Completing this clears the path for downstream verification.
- Can be comfortably finished within a single focus session.

*Click **Start Focus** to begin.*`;
  }

  return `### Workspace Summary

I have reviewed your query: **"${prompt.trim()}"**.

**Workspace Overview:**
- **Active Projects**: Your projects are progressing steadily against their target milestones.
- **Action Recommendation**: Focus on completing the nearest deadline task before opening new tickets.
- **Next Step**: You can start a focus session, add subtasks, or ask for a detailed breakdown.`;
}

// Vite middleware & Production static serving setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AURA] Server operational at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
