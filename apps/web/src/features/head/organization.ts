export const organizationGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@id": "https://hypertask.ai/#organization",
      "@type": "Organization",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        url: "https://hypertask.ai/contact/",
      },
      description:
        "Hypertask is a project management platform where humans and AI agents share one board. Native MCP server and CLI access let autonomous agents read tasks, claim work, post progress, and update tickets without a human relaying every step.",
      founder: {
        "@id": "https://hypertask.ai/#founder",
        "@type": "Person",
        jobTitle: "Founder",
        name: "Valentin Yeo",
      },
      knowsAbout: [
        "AI agents",
        "project management",
        "Model Context Protocol",
        "task management",
        "AI work attribution",
        "asynchronous collaboration",
      ],
      legalName: "Hypertask Lab Ltd.",
      logo: {
        "@type": "ImageObject",
        url: "https://hypertask.ai/hypertasklogo.avif",
      },
      name: "Hypertask",
      sameAs: ["https://www.npmjs.com/package/@hypertask/hypertask_cli"],
      url: "https://hypertask.ai",
    },
    {
      "@id": "https://hypertask.ai/#website",
      "@type": "WebSite",
      name: "Hypertask",
      publisher: {
        "@id": "https://hypertask.ai/#organization",
      },
      url: "https://hypertask.ai",
    },
    {
      "@id": "https://hypertask.ai/#software",
      "@type": "SoftwareApplication",
      applicationCategory: "BusinessApplication",
      description:
        "AI-powered project management where humans and AI agents share one board. Voice-to-task, smart summaries, keyboard-first navigation, native MCP integration.",
      featureList: [
        "Shared board for humans and AI agents",
        "Native MCP server (15 tools)",
        "Agent-optimized CLI",
        "Voice-to-task capture",
        "Smart task summaries",
        "Keyboard-first navigation",
        "Inbox and approval gates for agent work",
      ],
      name: "Hypertask",
      offers: {
        "@type": "AggregateOffer",
        highPrice: "25",
        lowPrice: "0",
        offerCount: "3",
        priceCurrency: "USD",
      },
      operatingSystem: "Web",
      publisher: {
        "@id": "https://hypertask.ai/#organization",
      },
      screenshot: "https://hypertask.ai/mainscreen.avif",
      url: "https://hypertask.ai",
    },
  ],
} as const;
