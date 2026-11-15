import codeHighlightsJson from "./code-highlights.json" with { type: "json" };

export const codeHighlights: Readonly<Record<string, string>> =
  codeHighlightsJson;
