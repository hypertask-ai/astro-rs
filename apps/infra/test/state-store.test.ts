import * as Cloudflare from "@alchemy.run/cloudflare";
import { expect, it } from "@effect/vitest";

import { siteState, stateStoreName } from "../src/state-store.js";

it("names a state store that is not the ratstack.sh store", () => {
  const requested: Parameters<typeof Cloudflare.state>[0][] = [];

  siteState((options) => {
    requested.push(options);

    return Cloudflare.state(options);
  });

  expect(requested).toEqual([{ workerName: stateStoreName }]);
  expect(stateStoreName).toBe("alchemy-state-store-astro-rs");
});
