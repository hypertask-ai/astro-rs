import * as Cloudflare from "@alchemy.run/cloudflare";

import {
  htmlHandling,
  notFoundHandling,
  workerFirstRedirectSources,
} from "./hypertask/site-rules.js";

export class Website extends Cloudflare.Website.Foldkit<Website>()("Website", {
  assets: {
    htmlHandling,
    notFoundHandling,
    runWorkerFirst: [...workerFirstRedirectSources],
  },
  rootDir: "../web",
}) {}
