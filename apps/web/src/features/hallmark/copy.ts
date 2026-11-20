export const hallmarkPath = "/hallmark/";

export const pageTitle = "Humans and Agents, One Board - Hypertask";

export const loginUrl = "https://app.hypertask.ai/login";

export const demoUrl = "https://cal.com/valentin-hypertask/hypertask-demo";

export const docsUrl = "https://docs.hypertask.ai/";

export const humanVideo =
  "https://duv2gcpdgd578.cloudfront.net/tasks/attachments/1757351057687board-inbox-task%20%281%29.mp4";

export const cliCommand = "npm install -g @hypertask/hypertask_cli";

export const heroTitleLead = "Humans and agents,";

export const heroTitleTail = "one board.";

export const heroLede =
  "Your AI agents create tasks, post updates, and ship work right next to your team. One Kanban board. Full visibility. You stay in control.";

export const startLabel = "Start free";

export const demoLabel = "Book demo";

export const noteLead = "Also available as an";

export const noteLinkLabel = "MCP server";

export const noteTail = "for Claude Desktop & Cursor.";

export interface BrandLogo {
  readonly alt: string;
  readonly src: string;
}

export const logos: readonly BrandLogo[] = [
  { alt: "International Drivers Association", src: "/images/logos/IDA.avif" },
  { alt: "66LOOP", src: "/images/logos/66looplogo.avif" },
  { alt: "vetsak", src: "/images/logos/Vetsak.avif" },
  { alt: "inne", src: "/images/logos/inne.avif" },
];

export const logosLabel = "Teams shipping with humans + agents";

export interface DiptychFeature {
  readonly detail: string;
  readonly title: string;
}

export const humansTitle = "Fast enough to actually enjoy.";

export const humansBody =
  "Hypertask brings an inbox-zero mindset to project boards. Keyboard-first, AI-assisted, and quick enough that clearing your board feels like a habit, not a chore.";

export const humanFeatures: readonly DiptychFeature[] = [
  {
    detail: "Clear your board, don't manage it. Inbox-zero for projects.",
    title: "World-class inbox",
  },
  {
    detail: "Navigate, create, assign, and move without touching your mouse.",
    title: "Keyboard shortcuts for everything",
  },
  {
    detail: "Voice-to-task, AI summaries, smart task splitting, built in.",
    title: "Industrial-strength AI tools",
  },
];

export const humansCaption = "The board an agent just updated — your view";

export const agentsTitle = "Give agents a seat at the board.";

export const agentsBody =
  "Agents get the same board your team does. They read context, claim work, post progress, and attach results over CLI or the native MCP server.";

export const agentFeatures: readonly DiptychFeature[] = [
  {
    detail:
      "Create tasks, comment, attach files, move cards. Full board control.",
    title: "Complete CLI access",
  },
  {
    detail: "Works with Claude Desktop, Cursor, and any MCP-compatible agent.",
    title: "Native MCP server",
  },
  {
    detail:
      "Agents query project history, task context, and attachments to stay informed.",
    title: "RAG-ready context",
  },
];

export const cliPrompt = "$";

export const terminalLines = [
  {
    command: 'hypertask tasks create --title "Ship auth fix"',
    output: "→ created HTPR-482 · assigned to you",
  },
  {
    command: "hypertask comment add 482 --attach ./diff.patch",
    output: "→ posted · awaiting your review",
  },
];

export const agentsCaption = "Full board control from the command line";

export const bandTitle = "If it runs a shell command or speaks MCP, it works.";

export const codingLabel = "Coding agents · via CLI";

export const codingAgents = [
  "Claude Code",
  "Cursor",
  "VSCode",
  "Cline",
  "OpenClaw",
];

export const chatLabel = "Assistants & chats · via MCP";

export const chatAgents = [
  "Claude.ai",
  "Claude Cowork",
  "Claude Connector",
  "ChatGPT",
  "Pi Agent",
];

export const bandFootLead = "Using a different agent?";

export const bandFootLinkLabel = "Read the docs";

export const bandFootTail = "— the board speaks CLI and MCP.";

export const stepsTitle = "Three steps to a board that runs itself.";

export interface Step {
  readonly body: string;
  readonly number: string;
  readonly title: string;
}

export const steps: readonly Step[] = [
  {
    body: "Install the CLI or MCP server. Agents start creating tasks and posting progress in under two minutes.",
    number: "1",
    title: "Give agents access",
  },
  {
    body: "Human tasks and agent tasks live on the same Kanban board. See who is doing what, human or machine, at a glance.",
    number: "2",
    title: "One board, both sides",
  },
  {
    body: "Review agent work, leave comments, approve or reassign. Nothing goes live without your sign-off.",
    number: "3",
    title: "You decide what ships",
  },
];

export const stepCommands = [
  "npm install -g @hypertask/hypertask_cli",
  "npx hypertask-mcp",
];

export const stepStatuses = [
  "Agent completed code review",
  "Waiting for human approval",
  "Deployed to staging",
];

export const finalTitle = "Put your agents on the board.";
