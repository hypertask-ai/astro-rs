export interface HypertaskBlogPost {
  readonly date: string;
  readonly description: string;
  readonly draft: boolean;
  readonly slug: string;
  readonly tags: readonly string[];
  readonly title: string;
}

export const hypertaskBlogPosts: readonly HypertaskBlogPost[] = [
  {
    date: "2026-07-07",
    description:
      "A practical AI agent task management workflow for agents that claim work, post updates, report results, and close tasks through CLI and MCP.",
    draft: false,
    slug: "ai-agent-task-management",
    tags: ["ai-agents", "task-management", "mcp", "cli", "async-work"],
    title: "AI Agent Task Management: The Claim, Update, Report, Close Loop",
  },
  {
    date: "2026-05-14",
    description:
      "AI agents in project management need MCP or CLI access to a real task board. Learn why Notion, Jira, and Linear break for agents \u2014 and how to fix it.",
    draft: false,
    slug: "ai-agents-project-management-guide",
    tags: ["ai-agents", "project-management", "mcp", "cli", "async-work"],
    title: "AI Agents in Project Management: The Complete Guide",
  },
  {
    date: "2026-08-31",
    description:
      "Compare AI project management software by workflow, agent access, human review, planning depth, and setup cost before you choose a tool.",
    draft: false,
    slug: "ai-project-management-software",
    tags: [
      "ai-project-management-software",
      "ai-agents",
      "project-management",
      "tool-comparison",
      "agent-tools",
    ],
    title: "AI project management software for agents",
  },
  {
    date: "2026-08-17",
    description:
      "Compare AI task managers by the work they automate, then choose between scheduling tools, team suites, and agent-ready project boards.",
    draft: false,
    slug: "ai-task-manager",
    tags: [
      "ai-task-manager",
      "task-management",
      "ai-agents",
      "tool-comparison",
      "async-work",
    ],
    title: "AI Task Manager: What Actually Helps",
  },
  {
    date: "2026-05-14",
    description:
      "AI work attribution is the unsolved governance problem of agentic teams. Learn why agent work disappears and how to make every task owned and traceable.",
    draft: false,
    slug: "ai-work-attribution-what-did-your-agents-do",
    tags: [
      "ai-agents",
      "work-attribution",
      "accountability",
      "async-work",
      "project-management",
    ],
    title: "AI Work Attribution: Do You Know What Your Agents Actually Did?",
  },
  {
    date: "2026-08-31",
    description:
      "Compare Akiflow with Hypertask for time blocking, task capture, MCP access, team execution, pricing, and the workflow each tool fits.",
    draft: false,
    slug: "akiflow-alternative",
    tags: [
      "akiflow",
      "akiflow-alternative",
      "tool-comparison",
      "project-management",
      "ai-agents",
    ],
    title: "Akiflow alternative for shared agent work",
  },
  {
    date: "2026-07-13",
    description:
      "A fair Asana alternative comparison for teams choosing between mature work coordination and a focused task board built for external AI-agent execution.",
    draft: false,
    slug: "asana-alternative",
    tags: [
      "asana",
      "tool-comparison",
      "project-management",
      "ai-agents",
      "async-work",
    ],
    title: "Asana Alternative for Human-Agent Task Execution",
  },
  {
    date: "2026-05-14",
    description:
      "Cut notification chaos with a real async communication playbook: channel hierarchy, response windows, and where decisions actually get recorded.",
    draft: false,
    slug: "async-communication-remote-teams-playbook",
    tags: ["async-work", "remote-teams", "team-communication", "playbook"],
    title: "Async Communication for Remote Teams: A Practical Playbook",
  },
  {
    date: "2026-05-14",
    description:
      "Async project management means progress without waiting on real-time replies. Here's how to cut notification overload and keep work in the task.",
    draft: false,
    slug: "async-project-management-without-notification-overload",
    tags: [
      "async-work",
      "project-management",
      "inbox-zero",
      "remote-teams",
      "notifications",
    ],
    title: "Async Project Management Without Drowning in Notifications",
  },
  {
    date: "2026-10-06",
    description:
      "Compare six AI kanban tools for 2026, including Hypertask, Trello, Linear, ClickUp, Asana, and Notion, with pricing, honest limits, and a practical setup.",
    draft: false,
    slug: "best-ai-kanban-tool",
    tags: ["kanban", "tool-comparison", "project-management", "ai-agents"],
    title: "What Is the Best AI Kanban Tool in 2026?",
  },
  {
    date: "2026-10-06",
    description:
      "Compare Hypertask, GitHub Projects, Linear, Jira, Azure Boards, and Trello for continuous delivery, pull requests, agent workflows, and deployment handoffs.",
    draft: false,
    slug: "best-kanban-tool-for-ci-cd",
    tags: [
      "kanban",
      "ci-cd",
      "engineering",
      "github",
      "tool-comparison",
      "ai-agents",
    ],
    title: "Best Kanban Tool for CI/CD Teams: 6 Tools Compared",
  },
  {
    date: "2026-10-06",
    description:
      "Compare five kanban tools with official MCP access for AI agents, including Hypertask, Trello, Linear, Jira and Notion, with practical setup steps.",
    draft: false,
    slug: "best-kanban-tool-for-mcp",
    tags: [
      "mcp",
      "kanban",
      "tool-comparison",
      "ai-agents",
      "project-management",
    ],
    title: "Best Kanban Tool for MCP: 5 Options for AI Agents",
  },
  {
    date: "2026-10-06",
    description:
      "Compare five kanban tools with APIs in 2026, including Hypertask, Linear, Trello, GitHub Projects, and Jira, with pricing and a practical setup guide.",
    draft: false,
    slug: "best-kanban-tool-with-api",
    tags: ["kanban", "api", "tool-comparison", "automation", "ai-agents"],
    title: "Best Kanban Tool with an API for Developers and Automation",
  },
  {
    date: "2026-08-24",
    description:
      "Compare seven Notion alternatives for docs, private notes, team knowledge, task execution, and AI-agent work. Find the right fit for your team.",
    draft: false,
    slug: "best-notion-alternatives",
    tags: [
      "notion",
      "notion-alternatives",
      "tool-comparison",
      "knowledge-management",
      "task-management",
    ],
    title: "Best Notion alternatives by use case",
  },
  {
    date: "2026-08-17",
    description:
      "Connect Claude Code to a shared project board in two minutes, then use a safe task loop for claims, progress updates, review, and handoff.",
    draft: false,
    slug: "claude-code-project-board",
    tags: [
      "claude-code",
      "project-board",
      "mcp",
      "ai-agents",
      "task-management",
    ],
    title: "Claude Code Project Board: A 2-Minute Setup",
  },
  {
    date: "2026-05-14",
    description:
      "CLI vs MCP AI agent access: CLI wins for token-efficient autonomous loops; MCP wins for interactive Claude Desktop flows. Here's when to use each.",
    draft: false,
    slug: "cli-vs-mcp-ai-agent-project-data-access",
    tags: ["cli", "mcp", "ai-agents", "comparison", "token-cost"],
    title: "CLI vs MCP: Which Should Your AI Agent Use to Access Project Data?",
  },
  {
    date: "2026-07-13",
    description:
      "A fair ClickUp alternative comparison for teams choosing between an all-in-one work suite and a focused board built for external AI agents and async review.",
    draft: false,
    slug: "clickup-alternative",
    tags: [
      "clickup",
      "tool-comparison",
      "project-management",
      "ai-agents",
      "async-work",
    ],
    title: "ClickUp Alternative for AI-Agent Task Execution",
  },
  {
    date: "2026-09-15",
    description:
      "Compare ClickUp and Notion for tasks, docs, databases, automation, AI agents, MCP, and team fit. Choose the right source of truth for your work.",
    draft: false,
    slug: "clickup-vs-notion",
    tags: [
      "clickup",
      "notion",
      "tool-comparison",
      "project-management",
      "ai-agents",
    ],
    title: "ClickUp vs Notion in 2026: choose by workflow",
  },
  {
    date: "2026-05-14",
    description:
      "An inbox zero case study: how a 12-person creative agency escaped notification chaos by anchoring every message to a task instead of a chat thread.",
    draft: false,
    slug: "from-200-notifications-to-inbox-zero-case-study",
    tags: ["case-study", "inbox-zero", "async-work", "social-proof"],
    title: "From 200 Notifications a Day to Inbox Zero: A Team's Story",
  },
  {
    date: "2026-08-24",
    description:
      "Height shut down in September 2025. Compare Hypertask, Linear, Shortcut, and broader work tools before moving old tasks into a new system.",
    draft: false,
    slug: "height-alternative",
    tags: [
      "height",
      "height-alternative",
      "tool-comparison",
      "project-management",
      "ai-agents",
    ],
    title: "Height alternative after the 2025 shutdown",
  },
  {
    date: "2026-05-14",
    description:
      "Reach inbox zero daily with a practical 3-window routine, one-touch decisions, and AI triage. Works for email and the harder problem: internal project comms.",
    draft: false,
    slug: "how-to-reach-inbox-zero-every-day",
    tags: ["inbox-zero", "async-work", "productivity", "team-communication"],
    title: "How to Reach Inbox Zero Every Day (Even With a Busy Team)",
  },
  {
    date: "2026-07-20",
    description:
      "A fair Jira alternative comparison for small teams choosing between deep agile work management and a focused board for accountable AI-agent execution.",
    draft: false,
    slug: "jira-alternative",
    tags: [
      "jira",
      "tool-comparison",
      "project-management",
      "ai-agents",
      "async-work",
    ],
    title: "Jira Alternative for Small Human-Agent Teams",
  },
  {
    date: "2026-07-07",
    description:
      "A fair Linear alternative comparison for teams that need AI-agent operations, CLI plus MCP access, and a task-anchored inbox for async execution.",
    draft: false,
    slug: "linear-alternative",
    tags: [
      "linear",
      "tool-comparison",
      "project-management",
      "ai-agents",
      "async-work",
    ],
    title: "Linear Alternative: An Agent-Ready Task Board for Async Work",
  },
  {
    date: "2026-09-15",
    description:
      "Compare Linear and Jira on planning, workflows, AI agents, MCP, reporting, price, and team fit. Use this practical guide to choose the right system.",
    draft: false,
    slug: "linear-vs-jira",
    tags: [
      "linear",
      "jira",
      "tool-comparison",
      "project-management",
      "ai-agents",
    ],
    title: "Linear vs Jira in 2026: a practical decision guide",
  },
  {
    date: "2026-08-17",
    description:
      "Learn how a project management MCP server lets AI agents read and update live boards, with setup steps, tool checks, and safety rules.",
    draft: false,
    slug: "mcp-server-project-management",
    tags: [
      "mcp",
      "project-management",
      "ai-agents",
      "task-management",
      "agent-tools",
    ],
    title: "MCP Server for Project Management",
  },
  {
    date: "2026-07-27",
    description:
      "A fair monday.com alternative comparison for teams choosing between a customizable work platform and focused human-agent task execution.",
    draft: false,
    slug: "monday-alternative",
    tags: [
      "monday.com",
      "tool-comparison",
      "work-management",
      "ai-agents",
      "async-work",
    ],
    title: "Monday.com Alternative for Human-Agent Work Management",
  },
  {
    date: "2026-07-07",
    description:
      "A fair Motion alternative comparison for teams that need AI agents, task-anchored communication, and async execution more than automatic calendar scheduling.",
    draft: false,
    slug: "motion-alternative",
    tags: [
      "motion",
      "tool-comparison",
      "project-management",
      "ai-agents",
      "async-work",
    ],
    title: "Motion Alternative: When You Need an Agent-Ready Task Board",
  },
  {
    date: "2026-08-24",
    description:
      "Run several AI agents on one shared project board with clear roles, atomic claims, task-based updates, review gates, and failure recovery.",
    draft: false,
    slug: "multi-agent-team-one-board",
    tags: [
      "multi-agent",
      "ai-agents",
      "project-board",
      "orchestration",
      "async-work",
    ],
    title: "Multi-agent team on one board: field guide",
  },
  {
    date: "2026-06-16",
    description:
      "A fair Notion alternative for project management: Notion is a flexible workspace, Hypertask is a keyboard-fast, agent-native task board. Here's which to pick.",
    draft: false,
    slug: "notion-vs-hypertask",
    tags: ["notion", "tool-comparison", "project-management", "ai-agents"],
    title: "Notion vs Hypertask: Which Gets Out of Your Way?",
  },
  {
    date: "2026-05-14",
    description:
      "Notification overload costs workers 4+ hours a week and 23 minutes of focus per interruption. Here's what the research says \u2014 and how to actually fix it.",
    draft: false,
    slug: "real-cost-of-notification-overload",
    tags: ["notifications", "context-switching", "async-work", "productivity"],
    title: "The Real Cost of Notification Overload (and How to Cut It)",
  },
  {
    date: "2026-09-15",
    description:
      "Compare six Reclaim AI alternatives for auto-scheduling, time blocking, task capture, team calendars, and AI-agent project work. Pick your best fit.",
    draft: false,
    slug: "reclaim-ai-alternative",
    tags: [
      "reclaim-ai",
      "reclaim-ai-alternative",
      "tool-comparison",
      "calendar",
      "ai-agents",
    ],
    title: "Reclaim AI alternative: six options by workflow",
  },
  {
    date: "2026-05-14",
    description:
      "Task board automation, done right: Hypertask's AI Triage button reads your inbox, classifies what's safe to archive, and clears it in one pass.",
    draft: false,
    slug: "stop-manually-updating-your-task-board",
    tags: ["automation", "ai-triage", "inbox-zero", "project-management"],
    title: "Stop Manually Updating Your Task Board: Let AI Triage It",
  },
  {
    date: "2026-08-31",
    description:
      "Compare Sunsama with Hypertask for daily planning, shared task execution, AI-agent access, pricing, and the right fit for your workflow.",
    draft: false,
    slug: "sunsama-alternative",
    tags: [
      "sunsama",
      "sunsama-alternative",
      "tool-comparison",
      "project-management",
      "ai-agents",
    ],
    title: "Sunsama alternative for shared agent work",
  },
  {
    date: "2026-07-20",
    description:
      "A fair Todoist alternative comparison for teams choosing between fast personal productivity and a shared task board built for human-agent execution.",
    draft: false,
    slug: "todoist-alternative",
    tags: [
      "todoist",
      "tool-comparison",
      "task-management",
      "ai-agents",
      "async-work",
    ],
    title: "Todoist Alternative for AI-Agent Task Management",
  },
  {
    date: "2026-07-27",
    description:
      "A fair Trello alternative comparison for teams choosing between simple visual boards and accountable task execution by humans and AI agents.",
    draft: false,
    slug: "trello-alternative",
    tags: [
      "trello",
      "tool-comparison",
      "project-management",
      "ai-agents",
      "async-work",
    ],
    title: "Trello Alternative for AI-Agent Project Management",
  },
  {
    date: "2026-05-14",
    description:
      "Most PM tools let AI agents tick a task. Hypertask lets agents scaffold the whole board. Here's why that distinction matters, and what it means for handing a project to an agent.",
    draft: false,
    slug: "why-agents-build-whole-boards",
    tags: [
      "ai-agents",
      "mcp",
      "project-management",
      "board-generation",
      "agent-autonomy",
    ],
    title: "Why We Let AI Agents Build Entire Boards, Not Just Tasks",
  },
  {
    date: "2026-05-14",
    description:
      "Pasting tasks into a chat is the default way to brief an AI agent. It's also broken. Here's why agents need live, read-write board access, not a stale text dump.",
    draft: false,
    slug: "why-ai-agents-need-a-real-project-board",
    tags: [
      "ai-agents",
      "project-management",
      "mcp",
      "agent-workflows",
      "async-work",
    ],
    title:
      "Why Your AI Agent Needs a Real Project Board (Not a Pasted Task List)",
  },
  {
    date: "2026-05-14",
    description:
      "Slack threads get lost even on disciplined teams \u2014 because a thread has no owner, no due date, no state. Here's the structural fix that actually works.",
    draft: false,
    slug: "why-your-team-stopped-replying-in-slack-threads",
    tags: ["slack", "team-communication", "async-work", "project-management"],
    title: "Why Your Team Stopped Replying in Slack Threads",
  },
];

export const publishedBlogPosts = (): readonly HypertaskBlogPost[] =>
  hypertaskBlogPosts
    .filter((post) => !post.draft)
    .toSorted((left, right) => right.date.localeCompare(left.date));
