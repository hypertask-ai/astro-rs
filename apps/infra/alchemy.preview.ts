import * as Cloudflare from "@alchemy.run/cloudflare";
import * as Alchemy from "alchemy";
import { Stage } from "alchemy/Stage";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";

import { Website } from "../web/src/website.js";
import { PreviewStage, previewResourcesAllowed } from "./src/preview.js";
import { siteState } from "./src/state-store.js";

export const previewProgram = Effect.gen(function* previewStack() {
  yield* Schema.decodeEffect(PreviewStage)(yield* Stage).pipe(Effect.orDie);
  const website = yield* Website;
  const stack = yield* Alchemy.Stack;

  if (!previewResourcesAllowed(stack.resources)) {
    return yield* Effect.die(
      new Error("Preview may declare only the Website Worker")
    );
  }

  return { websiteUrl: website.url };
});

export default Alchemy.Stack(
  "AstroRsPreview",
  { providers: Cloudflare.providers(), state: siteState() },
  previewProgram
);
