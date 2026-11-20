export const pageTitle = "About Hypertask — Why We Built It";

export const heading = "About Hypertask";

export const subheadline =
  "Project management built for humans and AI agents — on one board.";

export type TextPart = Readonly<{ em?: true; text: string }>;

export const paragraphs: readonly (readonly TextPart[])[] = [
  [
    {
      text: "Hypertask was built by Valentin Yeo, a long-time Superhuman user. The idea started with a simple frustration: we have fast, thoughtful tools for ",
    },
    { em: true, text: "external" },
    {
      text: " communication — email clients like Superhuman — yet ",
    },
    { em: true, text: "internal" },
    {
      text: " team communication still runs on slow, scattered tools. Why can't talking to your own team be as good as talking to a customer?",
    },
  ],
  [
    {
      text: "So Hypertask mirrors Superhuman's approach, on three pillars: keyboard-first speed, an inbox-style home for all internal communication, and AI built into the core rather than bolted on.",
    },
  ],
  [
    {
      text: "Then AI agents became real coworkers — and the same gap appeared again. Agents had nowhere to be accountable: no shared board, no inbox, no record of what they actually did. Hypertask now puts humans and AI agents on one board. Agents pick up tasks, leave comments, and onboard like teammates — over the CLI, MCP, or email.",
    },
  ],
  [
    {
      text: "Hypertask is built by Hypertask Lab Ltd. — a small, async-first team that ships continuously.",
    },
  ],
];

export const ctaLabel = "Start free";
