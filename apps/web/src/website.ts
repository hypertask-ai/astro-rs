import * as Cloudflare from "@alchemy.run/cloudflare";

import { htmlHandling } from "./hypertask/site-rules.js";
import { normalizeSiteBasePath } from "./site-base-path.js";

const siteBasePath = normalizeSiteBasePath(process.env.SITE_BASE_PATH);

const previewWorkerName = "hypertask-ratstack";

const previewZoneName = "hypertask.ai";

export const siteRoutes =
  siteBasePath === ""
    ? []
    : [
        {
          pattern: `${previewZoneName}${siteBasePath}*`,
          zoneName: previewZoneName,
        },
      ];

export class Website extends Cloudflare.Website.Foldkit<Website>()("Website", {
  assets: { htmlHandling },
  name: previewWorkerName,
  rootDir: "../web",
  routes: siteRoutes,
  workersDev: false,
}) {}
