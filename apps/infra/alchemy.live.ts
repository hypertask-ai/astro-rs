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
  }).pipe(
    adopt(true),
    // oxlint-disable-next-line rat-stack-patterns/retain-needs-stage-policy -- The hypertask.ai zone is live production DNS for every stage, so no stage may delete it.
    retain()
  );

  const project = yield* Cloudflare.Pages.Project("HypertaskWebsiteProject", {
    name: liveProjectName,
    productionBranch: liveProjectBranch,
  }).pipe(
    adopt(true),
    // oxlint-disable-next-line rat-stack-patterns/retain-needs-stage-policy -- The hypertask-website Pages project serves the live site and is shared by every stage, so no stage owns it.
    retain()
  );

  yield* Cloudflare.Pages.Domain("ApexDomain", {
    name: liveDomains[0],
    projectName: project.name,
  }).pipe(
    adopt(true),
    // oxlint-disable-next-line rat-stack-patterns/retain-needs-stage-policy -- The apex custom domain binding belongs to the live hypertask.ai site in every stage.
    retain()
  );

  yield* Cloudflare.Pages.Domain("WwwDomain", {
    name: liveDomains[1],
    projectName: project.name,
  }).pipe(
    adopt(true),
    // oxlint-disable-next-line rat-stack-patterns/retain-needs-stage-policy -- The www custom domain binding belongs to the live hypertask.ai site in every stage.
    retain()
  );

  yield* Cloudflare.DNS.Record("ApexRecord", {
    content: livePagesTarget,
    name: liveZoneName,
    proxied: true,
    ttl: 1,
    type: "CNAME",
    zoneId: zone.zoneId,
  }).pipe(
    adopt(true),
    // oxlint-disable-next-line rat-stack-patterns/retain-needs-stage-policy -- The apex CNAME points the live domain at the existing Pages project in every stage.
    retain()
  );

  yield* Cloudflare.DNS.Record("WwwRecord", {
    comment: "Cloudflare Pages custom domain for homepage",
    content: livePagesTarget,
    name: `www.${liveZoneName}`,
    proxied: true,
    ttl: 1,
    type: "CNAME",
    zoneId: zone.zoneId,
  }).pipe(
    adopt(true),
    // oxlint-disable-next-line rat-stack-patterns/retain-needs-stage-policy -- The www CNAME points the live domain at the existing Pages project in every stage.
    retain()
  );

  return { zone: liveZoneName };
});

export default Alchemy.Stack(
  "AstroRsLive",
  { providers: Cloudflare.providers(), state: Alchemy.inMemoryState() },
  liveProgram
);
