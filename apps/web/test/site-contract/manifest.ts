export const blogSlugs: readonly string[] = [
  "ai-agent-task-management",
  "ai-agents-project-management-guide",
  "ai-project-management-software",
  "ai-task-manager",
  "ai-work-attribution-what-did-your-agents-do",
  "akiflow-alternative",
  "asana-alternative",
  "async-communication-remote-teams-playbook",
  "async-project-management-without-notification-overload",
  "best-ai-kanban-tool",
  "best-kanban-tool-for-ci-cd",
  "best-kanban-tool-for-mcp",
  "best-kanban-tool-with-api",
  "best-notion-alternatives",
  "claude-code-project-board",
  "cli-vs-mcp-ai-agent-project-data-access",
  "clickup-alternative",
  "clickup-vs-notion",
  "from-200-notifications-to-inbox-zero-case-study",
  "height-alternative",
  "how-to-reach-inbox-zero-every-day",
  "jira-alternative",
  "linear-alternative",
  "linear-vs-jira",
  "mcp-server-project-management",
  "monday-alternative",
  "motion-alternative",
  "multi-agent-team-one-board",
  "notion-vs-hypertask",
  "real-cost-of-notification-overload",
  "reclaim-ai-alternative",
  "stop-manually-updating-your-task-board",
  "sunsama-alternative",
  "todoist-alternative",
  "trello-alternative",
  "why-agents-build-whole-boards",
  "why-ai-agents-need-a-real-project-board",
  "why-your-team-stopped-replying-in-slack-threads",
];

export interface OldRedirect {
  readonly from: string;
  readonly status: number;
  readonly to: string;
}

export const oldRedirects: readonly OldRedirect[] = [
  { from: "/install", status: 200, to: "/install.sh" },
  { from: "/home2.html", status: 301, to: "/" },
  { from: "/home2.html/", status: 301, to: "/" },
  { from: "/hallmark-1", status: 301, to: "/" },
  { from: "/new-home", status: 301, to: "/" },
  { from: "/v2", status: 301, to: "/" },
  { from: "/v3-cursor", status: 301, to: "/" },
  { from: "/v3-linear", status: 301, to: "/" },
  { from: "/v3-resend", status: 301, to: "/" },
  { from: "/v3-shell", status: 301, to: "/" },
  { from: "/v3-superhuman", status: 301, to: "/" },
  { from: "/v3-vercel", status: 301, to: "/" },
  { from: "/v4", status: 301, to: "/" },
  { from: "/versions", status: 301, to: "/" },
  { from: "/features", status: 301, to: "/" },
  { from: "/features/", status: 301, to: "/" },
  { from: "/agents", status: 301, to: "/" },
  { from: "/agents/", status: 301, to: "/" },
];

export const sitemapExclusions: readonly string[] = [
  "/v2",
  "/v3-",
  "/v4",
  "/versions",
  "/thank-you",
  "/blog/tags/",
];

export const fathomSiteId = "SSBYTYUQ";

export const fathomScriptSource = "https://cdn.usefathom.com/script.js";

export const signUpEvent = "Sign up click";

export const appOrigin = "https://app.hypertask.ai";
