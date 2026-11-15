export type LiveSettingSurface =
  | "github-secret"
  | "pages-variable"
  | "worker-secret";

export interface LiveSetting {
  readonly name: string;
  readonly purpose: string;
  readonly sensitive: boolean;
  readonly surface: LiveSettingSurface;
}

export interface LiveResource {
  readonly action: "adopt";
  readonly declareIn: string;
  readonly declaredInStack: false;
  readonly logicalId: string;
  readonly name: string;
  readonly purpose: string;
  readonly type: string;
}

export const liveSwitchTicket = "HTPR-9149";

export const liveZoneName = "hypertask.ai";

export const liveProjectName = "hypertask-website";

export const liveProjectBranch = "main";

export const livePagesTarget = "hypertask-website-c7j.pages.dev";

export const liveDomains = ["hypertask.ai", "www.hypertask.ai"] as const;

export const liveResourceTypes = [
  "Cloudflare.Zone.Zone",
  "Cloudflare.Pages.Project",
  "Cloudflare.Pages.Domain",
  "Cloudflare.DNS.Record",
] as const;

export const liveResources: readonly LiveResource[] = [
  {
    action: "adopt",
    declareIn: liveSwitchTicket,
    declaredInStack: false,
    logicalId: "HypertaskAiZone",
    name: liveZoneName,
    purpose: "The live DNS zone that serves hypertask.ai.",
    type: "Cloudflare.Zone.Zone",
  },
  {
    action: "adopt",
    declareIn: liveSwitchTicket,
    declaredInStack: false,
    logicalId: "HypertaskWebsiteProject",
    name: liveProjectName,
    purpose: `The live Pages project that serves the old site from branch ${liveProjectBranch}.`,
    type: "Cloudflare.Pages.Project",
  },
  {
    action: "adopt",
    declareIn: liveSwitchTicket,
    declaredInStack: false,
    logicalId: "ApexDomain",
    name: liveDomains[0],
    purpose:
      "The custom domain binding that serves the apex from the Pages project.",
    type: "Cloudflare.Pages.Domain",
  },
  {
    action: "adopt",
    declareIn: liveSwitchTicket,
    declaredInStack: false,
    logicalId: "WwwDomain",
    name: liveDomains[1],
    purpose:
      "The custom domain binding that serves the www host from the Pages project.",
    type: "Cloudflare.Pages.Domain",
  },
  {
    action: "adopt",
    declareIn: liveSwitchTicket,
    declaredInStack: false,
    logicalId: "ApexRecord",
    name: liveZoneName,
    purpose: `The proxied apex CNAME that points at ${livePagesTarget}.`,
    type: "Cloudflare.DNS.Record",
  },
  {
    action: "adopt",
    declareIn: liveSwitchTicket,
    declaredInStack: false,
    logicalId: "WwwRecord",
    name: `www.${liveZoneName}`,
    purpose: `The proxied www CNAME that points at ${livePagesTarget}.`,
    type: "Cloudflare.DNS.Record",
  },
];

export const liveSettings: readonly LiveSetting[] = [
  {
    name: "CLOUDFLARE_API_TOKEN",
    purpose:
      "The Cloudflare API token the old site deploy workflow uses to upload the build and purge the edge cache.",
    sensitive: true,
    surface: "github-secret",
  },
];
