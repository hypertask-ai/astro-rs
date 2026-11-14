import * as Cloudflare from "@alchemy.run/cloudflare";
import * as Alchemy from "alchemy";
import { adopt } from "alchemy/AdoptPolicy";
import { retain } from "alchemy/RemovalPolicy";
import * as Effect from "effect/Effect";

import {
  liveDomains,
  livePagesTarget,
  liveProjectBranch,
  liveProjectName,
  liveZoneName,
} from "./src/live-items.js";

export const liveProgram = Effect.gen(function* liveStack() {
  const zone = yield* Cloudflare.Zone.Zone("HypertaskAiZone", {
    name: liveZoneName,
    paused: false,
    type: "full",
  }).pipe(adopt(true), retain());

  const project = yield* Cloudflare.Pages.Project("HypertaskWebsiteProject", {
    name: liveProjectName,
    productionBranch: liveProjectBranch,
  }).pipe(adopt(true), retain());

  yield* Cloudflare.Pages.Domain("ApexDomain", {
    name: liveDomains[0],
    projectName: project.name,
  }).pipe(adopt(true), retain());

  yield* Cloudflare.Pages.Domain("WwwDomain", {
    name: liveDomains[1],
    projectName: project.name,
  }).pipe(adopt(true), retain());

  yield* Cloudflare.DNS.Record("ApexRecord", {
    content: livePagesTarget,
    name: liveZoneName,
    proxied: true,
    ttl: 1,
    type: "CNAME",
    zoneId: zone.zoneId,
  }).pipe(adopt(true), retain());

  yield* Cloudflare.DNS.Record("WwwRecord", {
    comment: "Cloudflare Pages custom domain for homepage",
    content: livePagesTarget,
    name: `www.${liveZoneName}`,
    proxied: true,
    ttl: 1,
    type: "CNAME",
    zoneId: zone.zoneId,
  }).pipe(adopt(true), retain());

  return { zone: liveZoneName };
});

export default Alchemy.Stack(
  "AstroRsLive",
  { providers: Cloudflare.providers(), state: Alchemy.inMemoryState() },
  liveProgram
);
