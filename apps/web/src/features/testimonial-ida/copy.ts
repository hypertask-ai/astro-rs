import type { CtaLink } from "../cta/index.js";

export const testimonialIdaPath = "/testimonial-ida/";

export const pageTitle =
  "How IDA went from 5 Tests to 50 Tests Monthly - Hypertask";

export const heroTitle =
  "How IDA went from 5 Tests to 50 Tests Monthly in 30 Days";

export const heroSubtitle =
  "From 5 tests to 50 concurrent tests in 6 months - here's how we transformed our CRO operation";

export const primaryCta: CtaLink = {
  external: true,
  href: "https://app.hypertask.ai/login",
  id: "get-started-button",
  label: "Get Started",
};

export const secondaryCta: CtaLink = {
  external: true,
  href: "https://cal.com/valentin-hypertask/hypertask-demo",
  label: "Book Demo",
};

export interface Metric {
  readonly label: string;
  readonly value: string;
}

export const metrics: readonly Metric[] = [
  { label: "test volume increase", value: "10x" },
  { label: "faster test creation", value: "85%" },
  { label: "concurrent A/B tests", value: "40-50" },
];

export interface ChallengeItem {
  readonly detail: string;
  readonly title: string;
}

export interface ChallengeCard {
  readonly badge: string;
  readonly caption: string;
  readonly items: readonly ChallengeItem[];
  readonly title: string;
}

export const challengeBefore: ChallengeCard = {
  badge: "Before HyperTask",
  caption: "Scattered tools and workflows",
  items: [
    {
      detail: "5-10 concurrent A/B tests maximum",
      title: "Limited Scale",
    },
    {
      detail: "Between ClickUp and Slack",
      title: "Scattered Communication",
    },
    {
      detail: "Conversations and missing context",
      title: "Lost Context",
    },
    {
      detail: "15-20 minutes per test specification",
      title: "Slow Process",
    },
    {
      detail: "Slow, frustrating project management",
      title: "Frustrating Management",
    },
  ],
  title: "Current Struggles",
};

export const challengeAfter: ChallengeCard = {
  badge: "The Goal",
  caption: "Unified, streamlined interface",
  items: [
    {
      detail: "40-50 concurrent A/B tests",
      title: "Massive Scale",
    },
    {
      detail: "All-in-one communication system",
      title: "Unified Communication",
    },
    {
      detail: "Faster test creation and management",
      title: "Lightning Fast",
    },
    {
      detail: "Aggressive overlapping testing strategy",
      title: "Advanced Strategy",
    },
    {
      detail: "Intuitive project management",
      title: "Streamlined Workflow",
    },
  ],
  title: "HyperTask Solution",
};

export const challengeTitle = "The Challenge: Scaling CRO Operations";

export const challengeLede =
  "See the dramatic transformation HyperTask delivers";

export interface FeatureRow {
  readonly bullets?: readonly string[];
  readonly description?: string;
  readonly image: string;
  readonly imageFirst: boolean;
  readonly quote?: string;
  readonly title: string;
}

export const solutionTitle = "The Solution: Complete Migration to HyperTask";

export const solutions: readonly FeatureRow[] = [
  {
    description:
      "Moved entire CRO operation from ClickUp to HyperTask, bringing together product managers, developers, and analysts under one unified system.",
    image: "/images/features/boards_views.avif",
    imageFirst: true,
    title: "22-Person Team Migration",
  },
  {
    bullets: [
      "ICE rating frameworks",
      "Hypothesis structures",
      "Variation specifications",
      "Metrics tracking requirements",
    ],
    description:
      "Implemented HyperTask's TaskWriter with custom instructions specific to IDA's A/B testing methodology:",
    image: "/images/features/ai_subcard_task_writer.avif",
    imageFirst: false,
    title: "AI-Powered Test Creation",
  },
  {
    description:
      "TaskWriter's web research feature enables competitive analysis and inspiration gathering directly within the task creation process.",
    image: "/images/features/tasks_parse_all_links.avif",
    imageFirst: true,
    title: "Web Research Integration",
  },
];

export interface Result {
  readonly after: string;
  readonly before: string;
  readonly note: string;
  readonly title: string;
}

export const resultsTitle = "The Results: Dramatic Operational Improvements";

export const results: readonly Result[] = [
  {
    after: "40-50 concurrent tests",
    before: "5-10 concurrent tests",
    note: "Strategy: Aggressive overlapping A/B testing",
    title: "10x Test Volume Increase",
  },
  {
    after: "2-3 minutes with TaskWriter",
    before: "15-20 minutes per test",
    note: "100% of tasks now created with AI assistance",
    title: "95% Faster Test Creation",
  },
  {
    after: "Single platform",
    before: "Multiple platforms",
    note: "All task-related communication consolidated",
    title: "Unified Communication",
  },
];

export interface MetricRow {
  readonly after: string;
  readonly before: string;
  readonly improvement: string;
  readonly metric: string;
}

export const metricsTableTitle = "The Transformation in Numbers";

export const metricsTableHead = [
  "Metric",
  "Before HyperTask",
  "After HyperTask",
  "Improvement",
];

export const metricsTable: readonly MetricRow[] = [
  {
    after: "40-50",
    before: "5-10",
    improvement: "10x increase",
    metric: "Concurrent Tests",
  },
  {
    after: "2-3 minutes",
    before: "15-20 minutes",
    improvement: "85% reduction",
    metric: "Test Creation Time",
  },
  {
    after: "1 (HyperTask)",
    before: "2 (ClickUp + Slack)",
    improvement: "Unified",
    metric: "Communication Platforms",
  },
  {
    after: "22 people",
    before: "22 people",
    improvement: "Same team, 10x output",
    metric: "Team Size",
  },
  {
    after: "100%",
    before: "0%",
    improvement: "Complete adoption",
    metric: "AI Task Creation",
  },
];

export const keyFeaturesTitle = "Key Features That Made the Difference";

export const keyFeatures: readonly FeatureRow[] = [
  {
    image: "/images/features/boards_filtering.avif",
    imageFirst: true,
    quote: "ClickUp was notoriously slow. HyperTask is lightning fast.",
    title: "Speed & Performance",
  },
  {
    bullets: [
      "TaskWriter analyzes project context",
      "Incorporates custom CRO instructions",
      "Generates complete test specifications from minimal prompts",
      "Web research capability for competitive insights",
    ],
    description:
      "TaskWriter analyzes project context and incorporates custom CRO instructions to generate complete test specifications from minimal prompts.",
    image: "/images/features/ai_subcard_writewithai.avif",
    imageFirst: false,
    title: "Intelligent Task Creation",
  },
  {
    bullets: [
      "Project inbox designed like premium email clients",
      "AI comment writer for professional communication",
      "Dictation with AI improvement functionality",
      "All context preserved within tasks",
    ],
    description:
      "The project inbox is designed like premium email clients with AI-powered features.",
    image: "/images/features/inbox_main_image.avif",
    imageFirst: true,
    title: "Superior Communication System",
  },
  {
    bullets: [
      "Handles hundreds of concurrent tickets efficiently",
      "AI system learns from project history",
      "Better institutional knowledge than individual team members",
    ],
    description:
      "HyperTask handles hundreds of concurrent tickets efficiently while learning from project history.",
    image: "/images/features/boards_subtasks.avif",
    imageFirst: false,
    title: "Volume Management",
  },
];

export interface Reason {
  readonly description: string;
  readonly title: string;
}

export const whyItWorksTitle = "Why HyperTask Works for CRO Teams";

export const whyItWorks: readonly Reason[] = [
  {
    description:
      "Unlike traditional project tools, HyperTask excels when managing hundreds of concurrent tasks with complex interdependencies.",
    title: "Built for High-Volume Operations",
  },
  {
    description:
      "TaskWriter doesn't just help with writing - it understands your entire project context and methodology.",
    title: "AI-First Approach",
  },
  {
    description:
      "The project inbox isn't an afterthought - it's designed to rival the best email clients for professional communication.",
    title: "Communication Excellence",
  },
  {
    description:
      "With hundreds of test tickets, the AI system becomes smarter than any individual team member about your testing patterns and requirements.",
    title: "Institutional Knowledge",
  },
];

export const bottomTitle = "The Bottom Line";

export const bottomBody =
  "HyperTask didn't just replace our project management tool - it transformed how we think about and execute A/B testing at scale. We went from being limited by our tools to being empowered by them.";
