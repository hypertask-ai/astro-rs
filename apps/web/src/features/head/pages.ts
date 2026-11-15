import { postHeads } from "../blog/head.js";
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
  "/thank-you/": {
    description: "Your demo has been scheduled successfully.",
    noindex: true,
    title: "Thank You - Hypertask",
  },
} satisfies Record<string, PageHead>;

export const pageHeads: ReadonlyMap<string, PageHead> = new Map<
  string,
  PageHead
>([...Object.entries(pages), ...postHeads]);
