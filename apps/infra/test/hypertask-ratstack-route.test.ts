import { expect, it } from "@effect/vitest";

import { hypertaskRatstackRoute } from "../src/hypertask-ratstack-route.js";

it("the planned hypertask.ai route names the same prefix the site build mounts at", () => {
  expect(hypertaskRatstackRoute.pattern).toStrictEqual(
    `${hypertaskRatstackRoute.zoneName}${hypertaskRatstackRoute.basePath}*`
  );
  expect(hypertaskRatstackRoute.basePath).toStrictEqual("/ratstack");
});

it("the planned route attaches the site Worker of the AstroRs stack and stays inactive", () => {
  expect(hypertaskRatstackRoute.stackName).toStrictEqual("AstroRs");
  expect(hypertaskRatstackRoute.workerId).toStrictEqual("Website");
  expect(hypertaskRatstackRoute.active).toBe(false);
});
