import { describe, expect, it } from "@effect/vitest";

import { initialModel, Message, update } from "../src/client/home/index.js";
import { pageTitle } from "../src/features/home/copy.js";

describe("home shell", () => {
  it("names the page Hypertask", () => {
    expect(pageTitle).toBe("Hypertask");
  });

  it("stays ready", () => {
    expect(initialModel.ready).toBe(true);
    expect(update(initialModel, Message.Ready()).model.ready).toBe(true);
  });
});
