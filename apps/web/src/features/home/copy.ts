import type { InstallTab } from "../../client/app/model.js";

export const pageTitle = "Hypertask";

export const heroMark = {
  height: "75",
  src: "/Favicon%20-%20Light.png",
  width: "64",
} as const;

export const heroTitle = "The fastest way to clear your board.";

export const heroLede =
  "Boards for people and AI agents. Work every ticket in the app, the CLI or over MCP.";

export const heroCtaLabel = "Get started now";

export const heroImage = {
  alt: "A Hypertask Kanban board in the AMOLED theme with Todo, Doing and Done columns",
  height: "900",
  src: "/images/landing/hero-1-board.png",
  width: "1440",
} as const;

export const demoLabel = "Demo board";

export const demoUrl = "https://app.hypertask.ai/demo";

export const agents: readonly Readonly<{ id: string; label: string }>[] = [
  { id: "claude", label: "Claude" },
  { id: "chatgpt", label: "ChatGPT" },
  { id: "codex", label: "Codex" },
  { id: "grok", label: "Grok" },
  { id: "hermes", label: "Hermes" },
  { id: "openclaw", label: "OpenClaw" },
  { id: "pi", label: "Pi" },
  { id: "dots-mark", label: "Dots" },
];

export const byoaTitle = "Bring your own agent.";

export const byoaLede =
  "Your Claude, ChatGPT and Codex on one board, working the same tickets. If it speaks MCP, it can join.";

export const agentLogoSize = "24";

export const panelTitle = "Connect in one line";

export type InstallTabContents = Readonly<{
  command: string;
  id: InstallTab;
  label: string;
  prefix: string;
}>;

export const installTabs: readonly InstallTabContents[] = [
  {
    command: "https://mcp.hypertask.ai/mcp",
    id: "mcp",
    label: "MCP",
    prefix: "",
  },
  {
    command: "curl -fsSL https://hypertask.ai/install | sh",
    id: "cli-unix",
    label: "Mac, Linux",
    prefix: "CLI · ",
  },
  {
    command: "irm https://hypertask.ai/install.ps1 | iex",
    id: "cli-windows",
    label: "Windows",
    prefix: "CLI · ",
  },
];

export const installCommandFor = (tab: InstallTab): string => {
  const contents = installTabs.find((candidate) => candidate.id === tab);

  if (contents === undefined) {
    throw new Error(`No install command for ${tab}`);
  }

  return contents.command;
};

export const copyLabel = "Copy";

export const copiedLabel = "Copied";

export const copyFailedLabel = "Copy failed";

export const copyResetMillis = "1800 millis";

export const installNote = "Paste into your agent. Sign in once.";
