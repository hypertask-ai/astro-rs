const campaignParameterNames = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export const appLinkHostname = "app.hypertask.ai";

export interface CampaignLink {
  readonly getAttribute: (name: string) => string | null;
  readonly setAttribute: (name: string, value: string) => void;
}

export interface CampaignLinkDocument {
  readonly querySelectorAll: (selectors: string) => Iterable<CampaignLink>;
}

const parseUrl = (value: string): URL | undefined => {
  try {
    return new URL(value);
  } catch {
    return undefined;
  }
};

export const campaignAppLink = (
  href: string,
  pageSearch: string
): string | undefined => {
  const target = parseUrl(href);

  if (target === undefined || target.hostname !== appLinkHostname) {
    return undefined;
  }

  const campaign = new URLSearchParams(pageSearch);

  for (const name of campaignParameterNames) {
    const value = campaign.get(name);

    if (value !== null && !target.searchParams.has(name)) {
      target.searchParams.set(name, value);
    }
  }

  return target.href;
};

export const forwardCampaignTags = (
  target: CampaignLinkDocument,
  pageSearch: string
): void => {
  for (const link of target.querySelectorAll("a[href]")) {
    const next = campaignAppLink(link.getAttribute("href") ?? "", pageSearch);

    if (next !== undefined) {
      link.setAttribute("href", next);
    }
  }
};
