export type UseCaseLink = Readonly<{ href: string; label: string }>;

export type UseCaseModule = Readonly<{
  body: readonly string[];
  bullets: readonly string[];
  bulletsTitle: string;
  eyebrow: string;
  headline: string;
  id: string;
  imageUrl: string;
}>;

export type UseCasePage = Readonly<{
  bottomBody: string;
  bottomTitle: string;
  heroSubtitle: string;
  heroTitle: string;
  modules: readonly UseCaseModule[];
  path: string;
  secondaryCta: UseCaseLink;
}>;

export const loginCta: UseCaseLink = {
  href: "https://app.hypertask.ai/login",
  label: "Get Hypertask Free",
};

const demoHref = "https://cal.com/valentin-hypertask/hypertask-demo";

export const useCasePages: readonly UseCasePage[] = [
  {
    bottomBody:
      "See how leading agencies use Hypertask to manage complex client portfolios with perfect organization. From pitch to delivery – all with better margins and happier clients than ever before.",
    bottomTitle: "Ready to Scale Your Agency?",
    heroSubtitle: "Manage Multiple Clients Without Losing Your Mind",
    heroTitle: "Hypertask for Agencies",
    modules: [
      {
        body: [
          "TaskWriter revolutionizes how agencies scope and plan client projects. Generate comprehensive project briefs, timelines, and resource plans with AI that understands your agency's processes and client industries.",
          "Our RAG system learns from your successful projects to accurately estimate timelines while custom instructions ensure every brief includes deliverables, milestones, and budget considerations. Web research integration lets you incorporate industry benchmarks and competitive insights directly into proposals.",
        ],
        bullets: [
          "Multi-client project templates",
          "Automatic timeline and resource estimation",
          "Industry-specific brief generation",
          "SOW and proposal creation",
        ],
        bulletsTitle: "Key capabilities:",
        eyebrow: "Module 1: AI-Powered Project Scoping and Briefing",
        headline: "From Client Call to Project Plan in Minutes",
        id: "ai-project-scoping",
        imageUrl: "/images/features/task_subcard_writewithai.avif",
      },
      {
        body: [
          "Agencies manage dozens of concurrent projects across different industries, timelines, and team members. Hypertask gives you instant visibility into every client's status while maintaining complete separation for confidentiality.",
          "Smart filters surface projects by client, deadline, or team member. Auto-splits automatically organize client feedback, revision requests, and approvals by account. See resource allocation, project profitability, and delivery status across your entire client portfolio.",
        ],
        bullets: [
          "Manage 20+ concurrent client projects",
          "Resource allocation across accounts",
          "Client-separated boards with team access",
          "Deadline tracking across all projects",
        ],
        bulletsTitle: "Built for agency chaos:",
        eyebrow: "Module 2: Juggle 20+ Client Projects with Zero Drops",
        headline: "Perfect Visibility Across Every Client Account",
        id: "multiple-client-projects",
        imageUrl: "/images/features/boards_mainimage.avif",
      },
      {
        body: [
          "Stop losing client feedback between email chains, Slack messages, and comment threads. Hypertask's premium inbox keeps all client communication, revision requests, and approvals directly within each project's context.",
          "AI-assisted responses help account managers address client concerns professionally. Quick revision logging with keyboard shortcuts. Every feedback round, scope change, and final approval stays permanently documented for each client project.",
        ],
        bullets: [
          "Centralized client feedback system",
          "Revision round tracking",
          "Approval workflows with audit trails",
          "Client portal access options",
        ],
        bulletsTitle: "Client collaboration excellence:",
        eyebrow: "Module 3: Client Communication That Builds Trust",
        headline: "End the Revision Request Email Nightmare",
        id: "client-communication",
        imageUrl: "/images/features/inbox_main_image.avif",
      },
      {
        body: [
          "Agencies using Hypertask report 50% faster project delivery with 70% less internal communication overhead. By unifying project management across all clients, your team focuses on creative work instead of status updates.",
        ],
        bullets: [
          "50% faster project turnaround",
          "70% reduction in internal emails",
          "3x more concurrent projects per PM",
          "Complete project history for case studies",
        ],
        bulletsTitle: "Proven results:",
        eyebrow: "Module 4: Transform Your Agency Operations",
        headline: "From Firefighting to Predictable Delivery",
        id: "agency-operations",
        imageUrl: "/images/features/keyboard_subcard_2.avif",
      },
    ],
    path: "/use-cases/agency/",
    secondaryCta: {
      href: demoHref,
      label: "Book an Agency Demo",
    },
  },
  {
    bottomBody:
      "Leading CRO teams use Hypertask to run 50+ concurrent experiments with better documentation and communication than ever before.",
    bottomTitle: "Ready to Scale Your Testing?",
    heroSubtitle:
      "Scale Your A/B Testing from 10 to 100+ Concurrent Experiments",
    heroTitle: "Hypertask for CRO",
    modules: [
      {
        body: [
          "TaskWriter transforms how CRO teams create A/B tests. With project-aware AI that understands your testing methodology, generate comprehensive test specifications 95% faster than traditional methods.",
        ],
        bullets: [
          "Custom CRO instructions for your methodology",
          "Web research for competitive insights",
          "Automatic ICE rating and hypothesis generation",
          "Complete test specs from minimal prompts",
        ],
        bulletsTitle: "Key capabilities:",
        eyebrow: "Module 1: AI-Powered Test Creation at Scale",
        headline: "Generate Complete Test Specifications in 2 Minutes",
        id: "ai-task-writer",
        imageUrl: "/images/features/task_subcard_writewithai.avif",
      },
      {
        body: [
          "Traditional project tools break down when managing dozens of overlapping tests. Hypertask thrives on complexity. Our lightning-fast interface handles hundreds of concurrent tickets while AI-powered organization keeps every test trackable.",
        ],
        bullets: [
          "Handle 40-50+ concurrent A/B tests",
          "Aggressive overlapping test strategies",
          "Instant filtering by test parameters",
          "AI that learns your testing patterns",
        ],
        bulletsTitle: "Built for scale:",
        eyebrow: "Module 2: Manage 50+ Concurrent Tests Without Chaos",
        headline: "Purpose-Built for High-Volume Testing Operations",
        id: "manage-concurrent-tests",
        imageUrl: "/images/features/boards_mainimage.avif",
      },
      {
        body: [
          "Stop losing critical test insights between Slack threads and email chains. Hypertask's premium inbox consolidates all test-related communication directly within each experiment's context.",
        ],
        bullets: [
          "Premium email-style project inbox",
          "AI comment writer for technical clarity",
          "Voice dictation with AI enhancement",
          "Zero context switching between tools",
        ],
        bulletsTitle: "Communication excellence:",
        eyebrow: "Module 3: Unified Communication That Moves at Testing Speed",
        headline: "Every Test Discussion in Perfect Context",
        id: "unified-communication",
        imageUrl: "/images/features/tasks_RTE.avif",
      },
      {
        body: [
          "CRO teams using Hypertask report 10x increases in testing volume with the same team size. By eliminating the friction of test creation and communication, your team focuses on what matters: finding winning variants and implementing results.",
        ],
        bullets: [
          "10x increase in concurrent test capacity",
          "85% reduction in test creation time",
          "100% of communication consolidated",
          "Complete institutional knowledge capture",
        ],
        bulletsTitle: "Proven results:",
        eyebrow: "Module 4: Transform Your CRO Workflow",
        headline: "From Manual Coordination to AI-Powered Optimization",
        id: "transform-workflow",
        imageUrl: "/images/features/keyboard_subcard_2.avif",
      },
    ],
    path: "/use-cases/cro/",
    secondaryCta: {
      href: demoHref,
      label: "Book Demo",
    },
  },
  {
    bottomBody:
      "See how leading marketing teams use Hypertask to run sophisticated multi-channel campaigns with perfect coordination. From blog posts to product launches – all with better collaboration and clearer communication than ever before.",
    bottomTitle: "Ready to Streamline Your Marketing Operations?",
    heroSubtitle: "Run Complex Campaigns Without the Chaos",
    heroTitle: "Hypertask for Marketing",
    modules: [
      {
        body: [
          "TaskWriter revolutionizes how marketing teams plan campaigns. Generate comprehensive campaign briefs, content calendars, and channel strategies with AI that understands your brand voice and marketing objectives.",
          "Our RAG system analyzes your successful past campaigns to maintain brand consistency while custom instructions ensure every campaign follows your messaging framework, target personas, and KPI requirements. Web research integration lets you analyze competitor campaigns and trending topics directly within task creation.",
        ],
        bullets: [
          "Custom brand voice and tone instructions",
          "Competitor campaign analysis built-in",
          "Automatic content calendar generation",
          "Complete campaign specs from basic ideas",
        ],
        bulletsTitle: "Key capabilities:",
        eyebrow: "Module 1: AI-Powered Campaign Planning",
        headline: "From Campaign Brief to Execution Plan in Minutes",
        id: "ai-campaign-planning",
        imageUrl: "/images/features/task_subcard_writewithai.avif",
      },
      {
        body: [
          "Marketing teams juggle social media, email, content, paid ads, and events simultaneously. Hypertask's boards give you instant visibility across all channels while maintaining the flexibility each channel needs.",
          "Smart filters surface tasks by campaign, channel, or deadline. Auto-splits automatically organize incoming performance data and stakeholder feedback by channel. See exactly what's launching when, who's responsible, and how each piece connects to your larger campaign goals.",
        ],
        bullets: [
          "Manage 10+ campaigns simultaneously",
          "Track assets across all channels",
          "Instant filtering by campaign or channel",
          "Unified view of all marketing activities",
        ],
        bulletsTitle: "Built for marketing complexity:",
        eyebrow: "Module 2: Coordinate Multi-Channel Campaigns Seamlessly",
        headline: "One Source of Truth for Every Marketing Channel",
        id: "multi-channel-coordination",
        imageUrl: "/images/features/boards_mainimage.avif",
      },
      {
        body: [
          "Stop losing feedback between email threads, Slack messages, and Google Docs comments. Hypertask's premium inbox keeps all creative feedback, copy revisions, and approval discussions directly within each asset's context.",
          "AI-assisted comment writing helps stakeholders articulate design feedback clearly. Quick approvals happen with keyboard shortcuts. Every revision request, creative note, and final approval stays permanently linked to its asset and campaign.",
        ],
        bullets: [
          "Centralized creative feedback system",
          "AI-powered copy suggestions",
          "Clear approval workflows",
          "Asset version tracking",
        ],
        bulletsTitle: "Collaboration excellence:",
        eyebrow: "Module 3: Content Collaboration That Actually Works",
        headline: "End the Endless Revision Email Chains",
        id: "content-collaboration",
        imageUrl: "/images/features/inbox_main_image.avif",
      },
      {
        body: [
          "Marketing teams using Hypertask report 60% faster campaign launches with 80% less communication overhead. By eliminating tool-switching and consolidating all marketing work, your team focuses on creativity and strategy instead of project management.",
        ],
        bullets: [
          "60% faster campaign time-to-market",
          "80% reduction in status meetings",
          "100% of feedback consolidated",
          "Complete campaign history preserved",
        ],
        bulletsTitle: "Proven results:",
        eyebrow: "Module 4: Transform Your Marketing Operations",
        headline: "From Scattered Coordination to Unified Execution",
        id: "marketing-operations",
        imageUrl: "/images/features/keyboard_subcard_2.avif",
      },
    ],
    path: "/use-cases/marketing/",
    secondaryCta: {
      href: demoHref,
      label: "Book a Marketing Demo",
    },
  },
  {
    bottomBody:
      "See how leading product teams use Hypertask to ship features faster with better alignment. From MVPs to major releases – all with clearer specs and smoother coordination than ever before.",
    bottomTitle: "Ready to Accelerate Your Product Development?",
    heroSubtitle: "Ship Features Faster with AI-Powered Product Management",
    heroTitle: "Hypertask for Product Development",
    modules: [
      {
        body: [
          "TaskWriter transforms how product teams create feature specifications. Generate comprehensive PRDs, user stories, and acceptance criteria with AI that understands your product architecture and technical constraints.",
          "Our RAG system learns from your existing features to maintain product consistency while custom instructions ensure every spec includes edge cases, performance requirements, and API considerations. Web research integration lets you analyze competitor features and industry standards directly within spec creation.",
        ],
        bullets: [
          "Technical requirement generation",
          "User story decomposition with acceptance criteria",
          "Automatic edge case identification",
          "API and integration specifications",
        ],
        bulletsTitle: "Key capabilities:",
        eyebrow: "Module 1: AI-Generated Product Specs That Engineers Love",
        headline: "From User Story to Technical Specification in Minutes",
        id: "ai-product-specs",
        imageUrl: "/images/features/task_subcard_writewithai.avif",
      },
      {
        body: [
          "Product development requires orchestrating design, engineering, QA, and stakeholder feedback across multiple sprints. Hypertask gives you instant visibility into feature progress while maintaining agility for rapid iteration.",
          "Smart filters surface features by release, priority, or engineering team. Auto-splits automatically organize incoming bug reports, user feedback, and stakeholder requests. Track dependencies, blockers, and launch readiness across your entire product portfolio.",
        ],
        bullets: [
          "Manage multiple release tracks simultaneously",
          "Visualize feature dependencies",
          "Sprint planning with drag-and-drop",
          "Real-time progress across all teams",
        ],
        bulletsTitle: "Built for product complexity:",
        eyebrow: "Module 2: Manage Complex Roadmaps with Perfect Clarity",
        headline: "See Every Feature's Journey from Idea to Launch",
        id: "complex-roadmaps",
        imageUrl: "/images/features/boards_mainimage.avif",
      },
      {
        body: [
          "Stop repeating the same updates in standups, stakeholder meetings, and Slack threads. Hypertask's premium inbox consolidates all product discussions, decisions, and feedback directly within each feature's context.",
          "AI-powered summaries help stakeholders quickly understand technical discussions. Voice dictation captures product decisions instantly. Every design review, engineering clarification, and go-to-market discussion stays permanently linked to its feature.",
        ],
        bullets: [
          "Automated stakeholder updates",
          "AI summaries of technical discussions",
          "Decision logging with context",
          "Async collaboration across time zones",
        ],
        bulletsTitle: "Communication excellence:",
        eyebrow:
          "Module 3: Stakeholder Communication Without the Meeting Overload",
        headline: "Keep Everyone Aligned Without Endless Status Updates",
        id: "stakeholder-communication",
        imageUrl: "/images/features/inbox_main_image.avif",
      },
      {
        body: [
          "Product teams using Hypertask report 40% faster feature delivery with 50% fewer alignment meetings. By unifying specs, tasks, and communication, your team focuses on building the right features instead of managing the process.",
        ],
        bullets: [
          "40% faster feature delivery",
          "50% reduction in status meetings",
          "75% less context switching",
          "Complete feature history and decisions",
        ],
        bulletsTitle: "Proven results:",
        eyebrow: "Module 4: Transform Your Product Velocity",
        headline: "From Feature Factories to Strategic Product Development",
        id: "product-velocity",
        imageUrl: "/images/features/keyboard_subcard_2.avif",
      },
    ],
    path: "/use-cases/product/",
    secondaryCta: {
      href: demoHref,
      label: "Book a Product Demo",
    },
  },
];
