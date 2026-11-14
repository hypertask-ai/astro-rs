export const liveAccountId = "6031a7dff0d4a6469414cfa8a6dedddf";

export const liveZoneName = "hypertask.ai";

export const liveProjectName = "hypertask-website";

export const liveProjectBranch = "main";

export const livePagesTarget = "hypertask-website-c7j.pages.dev";

export const liveDomains = ["hypertask.ai", "www.hypertask.ai"] as const;

export const liveSecretNames = {
  githubActionsOldSite: ["CLOUDFLARE_API_TOKEN"],
  pagesProjectEnvVars: [],
  workerSecrets: [],
} as const;

export const liveAllowedTypes = [
  "Cloudflare.Zone.Zone",
  "Cloudflare.Pages.Project",
  "Cloudflare.Pages.Domain",
  "Cloudflare.DNS.Record",
] as const;

export const liveLogicalIds = [
  "HypertaskAiZone",
  "HypertaskWebsiteProject",
  "ApexDomain",
  "WwwDomain",
  "ApexRecord",
  "WwwRecord",
] as const;

export const secretNamePattern = /^[A-Z][A-Z0-9_]*$/u;

interface LiveResource {
  readonly Type: string;
  readonly LogicalId: string;
  readonly RemovalPolicy: string;
  readonly Adopt: boolean | undefined;
}

export const liveResourcesAdoptOnly = (
  resources: Readonly<Record<string, LiveResource>>
): boolean => {
  const entries = Object.values(resources);

  return (
    entries.length === liveLogicalIds.length &&
    entries.every(
      (resource) =>
        liveAllowedTypes.some((type) => type === resource.Type) &&
        liveLogicalIds.some((id) => id === resource.LogicalId) &&
        resource.RemovalPolicy === "retain" &&
        resource.Adopt === true
    )
  );
};
