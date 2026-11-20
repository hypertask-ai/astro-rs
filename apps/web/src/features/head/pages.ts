import { postHeads } from "../blog/head.js";
import type { PageHead } from "./build-head.js";

const pages = {
  "/": {
    description:
      "AI project boards, agent native. AI chat, a Kanban board, and Superhuman-style keyboard controls in one place. Your AI agents work the same board via CLI, MCP, and API.",
    title: "The fastest project board — Hypertask",
  },
  "/about/": {
    description:
      "Hypertask is project management built for humans and AI agents on one board. Founded by Valentin Yeo, inspired by Superhuman's keyboard-first philosophy.",
    title: "About Hypertask — Why We Built It",
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
  "/hallmark/": {
    description:
      "The best project management app for AI-powered productivity. Turn voice into tasks, get smart summaries, and eliminate project chaos with Hypertask.",
    noindex: true,
    title: "Humans and Agents, One Board - Hypertask",
  },
  "/hypertask-vs-linear/": {
    description:
      "Linear is a great issue tracker for human teams. Hypertask is built for boards where AI agents create, work, and close tasks alongside people. Honest feature-by-feature comparison.",
    title: "Hypertask vs Linear: an honest comparison",
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
  "/testimonial-ida/": {
    description:
      "Case study: How IDA scaled their CRO operations 10x with Hypertask's AI-powered project management platform.",
    title: "How IDA went from 5 Tests to 50 Tests Monthly - Hypertask",
  },
  "/thank-you/": {
    description: "Your demo has been scheduled successfully.",
    noindex: true,
    title: "Thank You - Hypertask",
  },
  "/use-cases/agency/": {
    description:
      "Manage multiple clients without losing your mind. Streamline project scoping, client communication, and agency operations with Hypertask's AI-powered project management platform.",
    title: "Hypertask for Agencies — Multi-Client Project Management",
  },
  "/use-cases/cro/": {
    description:
      "Scale your A/B testing with AI-powered project management. Transform CRO workflows with Hypertask's AI Task Writer, Superhuman-style inbox, and experiment boards.",
    title: "Hypertask for CRO — AI-Powered Project Management",
  },
  "/use-cases/marketing/": {
    description:
      "Run complex multi-channel marketing campaigns without the chaos. Streamline campaign planning, content collaboration, and marketing operations with Hypertask's AI-powered project management platform.",
    title: "Hypertask for Marketing — AI-Powered Campaign Management",
  },
  "/use-cases/product/": {
    description:
      "Ship features faster with AI-powered product management. Streamline PRD creation, roadmap planning, and stakeholder communication with Hypertask's intelligent project management platform.",
    title: "Hypertask for Product Development — AI-Powered Feature Management",
  },
} satisfies Record<string, PageHead>;

export const pageHeads: ReadonlyMap<string, PageHead> = new Map<
  string,
  PageHead
>([...Object.entries(pages), ...postHeads]);
