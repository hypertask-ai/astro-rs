import * as Cloudflare from "@alchemy.run/cloudflare";

import { htmlHandling } from "./hypertask/site-rules.js";

export class Website extends Cloudflare.Website.Foldkit<Website>()("Website", {
  assets: { htmlHandling },
  rootDir: "../web",
}) {}
