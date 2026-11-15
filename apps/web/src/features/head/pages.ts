import type { PageHead } from "./build-head.js";

const pages = {
  "/": {
    description:
      "AI project boards, agent native. AI chat, a Kanban board, and Superhuman-style keyboard controls in one place. Your AI agents work the same board via CLI, MCP, and API.",
    title: "The fastest project board — Hypertask",
  },
  "/blog/": {
    description:
      "Field notes on running humans and AI agents on one board: async work, agent orchestration, and getting out of project-management chaos.",
    title: "The Hypertask Blog — AI Agents, Async Work & Project Management",
  },
  "/blog/ai-agent-task-management/": {
    article: {
      author: "https://hypertask.ai/about/",
      modified: "2026-07-07T00:00:00.000Z",
      published: "2026-07-07T00:00:00.000Z",
      section: "AI Agents in Project Management",
    },
    description:
      "A practical AI agent task management workflow for agents that claim work, post updates, report results, and close tasks through CLI and MCP.",
    extraStructuredData: [
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BlogPosting",
            author: {
              "@type": "Person",
              name: "Valentin Yeo",
              url: "https://hypertask.ai/about/",
            },
            dateModified: "2026-07-07T00:00:00.000Z",
            datePublished: "2026-07-07T00:00:00.000Z",
            description:
              "A practical AI agent task management workflow for agents that claim work, post updates, report results, and close tasks through CLI and MCP.",
            headline:
              "AI Agent Task Management: The Claim, Update, Report, Close Loop",
            image: "https://hypertask.ai/images/blog/demo-board.webp",
            keywords: "ai-agents, task-management, mcp, cli, async-work",
            mainEntityOfPage: {
              "@id": "https://hypertask.ai/blog/ai-agent-task-management/",
              "@type": "WebPage",
            },
            publisher: {
              "@id": "https://hypertask.ai/#organization",
            },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                item: "https://hypertask.ai/",
                name: "Home",
                position: 1,
              },
              {
                "@type": "ListItem",
                item: "https://hypertask.ai/blog/",
                name: "Blog",
                position: 2,
              },
              {
                "@type": "ListItem",
                item: "https://hypertask.ai/blog/ai-agent-task-management/",
                name: "AI Agent Task Management: The Claim, Update, Report, Close Loop",
                position: 3,
              },
            ],
          },
          {
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "AI agent task management is the workflow for letting AI agents operate real tasks on a shared board. The agent reads the task, claims it, posts progress, reports the result, and moves it to the next state. The goal is not just task generation. The goal is a reliable lifecycle where humans can see what agents are doing and review their output asynchronously.",
                },
                name: "What is AI agent task management?",
              },
              {
                "@type": "Question",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "AI project management is the broader system: planning, boards, workflows, agent access, attribution, reporting, and human approval. AI agent task management is the narrower execution loop inside that system. It focuses on how an individual agent handles one task from claim to close. For the broader guide, read AI agents in project management.",
                },
                name: "How is this different from AI project management?",
              },
              {
                "@type": "Question",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Use MCP when the agent is working inside an interactive AI environment such as Claude Code, Cursor, or Windsurf. Use the CLI when the agent is running as a script, cron job, CI step, or autonomous loop. Both can support the same lifecycle. The choice is about the agent runtime, not about which one is universally better.",
                },
                name: "Should agents use CLI or MCP to update tasks?",
              },
              {
                "@type": "Question",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Sometimes. For low-risk tasks with deterministic validation, direct close can be fine. For code, customer-facing copy, pricing, production changes, data changes, or anything ambiguous, the safer default is for agents to move work to Review and let a human close it. Define this by task type so the rule is predictable.",
                },
                name: "Should AI agents be allowed to close tasks themselves?",
              },
              {
                "@type": "Question",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Anchor every update to the task and route only attention-worthy items to the inbox. Claim comments and routine status notes can be low-noise. Blockers, review requests, and human mentions should surface clearly. The inbox should help humans batch-review agent work instead of forcing them to watch agent sessions live.",
                },
                name: "How do you keep agent updates from becoming notification overload?",
              },
            ],
          },
        ],
      },
    ],
    image: {
      alt: "A Hypertask board with Backlog, Todo, Doing, and Done columns shared by humans and AI agents",
      url: "https://hypertask.ai/images/blog/demo-board.webp",
    },
    ogType: "article",
    title:
      "AI Agent Task Management: The Claim, Update, Report, Close Loop — Hypertask Blog",
  },
  "/contact/": {
    description:
      "Get in touch with the Hypertask team for support, partnership, or press inquiries.",
    title: "Contact Us - Hypertask",
  },
  "/pricing/": {
    description:
      "Simple, transparent pricing for AI-powered project management. Get started free with Hypertask.",
    title: "Hypertask Pricing — Free & Paid AI Project Management Plans",
  },
  "/privacy/": {
    description:
      "Hypertask Lab Ltd. Privacy Policy. Learn how we collect, use, and protect your personal information.",
    title: "Privacy Policy - Hypertask",
  },
  "/terms/": {
    description:
      "Terms of Service for Hypertask Lab Ltd. Read our terms governing the use of hypertask.ai.",
    title: "Terms of Service - Hypertask",
  },
  "/thank-you/": {
    description: "Your demo has been scheduled successfully.",
    noindex: true,
    title: "Thank You - Hypertask",
  },
} satisfies Record<string, PageHead>;

export const pageHeads: ReadonlyMap<string, PageHead> = new Map(
  Object.entries(pages)
);
