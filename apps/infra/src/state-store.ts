import * as Cloudflare from "@alchemy.run/cloudflare";

export const stateStoreName = "alchemy-state-store-astro-rs";

export const siteState = (state = Cloudflare.state) =>
  state({ workerName: stateStoreName });
