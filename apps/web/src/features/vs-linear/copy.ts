import type { CtaLink } from "../cta/index.js";

export const comparisonPath = "/hypertask-vs-linear/";

export const pageTitle = "Hypertask vs Linear: an honest comparison";

export const eyebrow = "Hypertask · Linear";

export const heroTitle = "Hypertask vs Linear";

export const heroSubtitle =
  "An honest comparison. Linear is a great issue tracker for human teams. Hypertask is what you pick when agents do half the work.";

export const introParagraphs = [
  "Linear is the most polished issue tracker of its generation. If your team is all humans and you want opinionated software workflows, cycles, triage, roadmaps, you should probably buy Linear. This page is not going to pretend otherwise.",
  "Hypertask makes a different bet: soon, most tasks on your board will not be created, worked, or closed by a person. They will be done by agents you direct. Hypertask is built for that board.",
];

export const agentsParagraphs = [
  "Hypertask ships a native MCP server. Claude, Cursor, ChatGPT, and any MCP-compatible agent can create tasks, post comments, attach files, and move cards on the same Kanban board your team uses. You review their work the way you review a colleague's: comment, approve, reassign.",
  "We run Hypertask on Hypertask. Around 50 Claude Code sessions ship roughly 30 pull requests a day against our own boards, and the marketing behind this page is run from one of them.",
];

export const mcpCodeComment = "# Point any MCP client at your board";

export const mcpCodeEndpoint = "https://mcp.hypertask.ai/mcp";

export const mcpCodeDocsComment =
  "# Docs: https://docs.hypertask.ai/mcp/overview/";

export interface ComparisonRow {
  readonly feature: string;
  readonly hypertask: string;
  readonly linear: string;
  readonly winner: "hypertask" | "linear" | "tie";
}

export const comparisonRows: readonly ComparisonRow[] = [
  {
    feature: "Agents on the board",
    hypertask:
      "Native MCP server: agents create, comment, move, and close tasks alongside humans",
    linear: "No native MCP server; agent access via third-party integrations",
    winner: "hypertask",
  },
  {
    feature: "Keyboard speed",
    hypertask:
      "Full coverage: J/K, Ctrl+K command center, Alt+1-9 board switching",
    linear: "Full coverage, same philosophy",
    winner: "tie",
  },
  {
    feature: "Inbox",
    hypertask: "Superhuman-style: auto-splits, snooze, bulk triage, inbox zero",
    linear: "Notifications inbox, different design philosophy",
    winner: "hypertask",
  },
  {
    feature: "AI in the app",
    hypertask:
      "Multiple premium models, inline AI with full project context, bring your own key",
    linear: "Built-in AI for triage and writing",
    winner: "hypertask",
  },
  {
    feature: "Voice",
    hypertask: "Dictation to structured tasks, multi-language, mobile",
    linear: "Not a core feature",
    winner: "hypertask",
  },
  {
    feature: "Cycles and roadmaps",
    hypertask: "Basic today",
    linear: "Excellent, years of refinement",
    winner: "linear",
  },
  {
    feature: "Integrations marketplace",
    hypertask: "Early: MCP, CLI, REST API",
    linear: "Broad, mature ecosystem",
    winner: "linear",
  },
  {
    feature: "Best fit",
    hypertask:
      "Founders and teams running human + agent workflows on one board",
    linear: "Software teams who want a focused, human-only tracker",
    winner: "tie",
  },
];

export const linearWins = [
  "Polish and maturity. Linear has refined the same product for years and it shows.",
  "Sprint rituals. Cycles, triage rotations, and roadmaps are deeper than ours.",
  "Marketplace breadth. More off-the-shelf integrations today.",
];

export const winsClosing =
  "If those three decide it for you, use Linear. If the next year of your work involves directing agents, the board they work on matters more.";

export const primaryCta: CtaLink = {
  external: true,
  href: "https://app.hypertask.ai/login",
  id: "get-started-button",
  label: "Start free",
};

export const secondaryCta: CtaLink = {
  external: true,
  href: "https://docs.hypertask.ai/mcp/overview/",
  label: "Point your agent at Hypertask",
};

export const comparisonNote =
  "Feature comparison reflects publicly documented functionality at the time of writing. Check linear.app for their current feature set.";
