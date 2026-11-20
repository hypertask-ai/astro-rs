import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { renderToString } from "foldkit/experimental/server";

import { initialModel, Message, update } from "../src/client/app/index.js";
import { renderDocument } from "../src/entry.server.js";
import { installCommandFor, pageTitle } from "../src/features/home/copy.js";
import { view } from "../src/features/home/index.js";
import liveHome from "./fixtures/home-live.json" with { type: "json" };
import {
  headTags,
  headings,
  images,
  linkTargets,
  visibleText,
} from "./page-facts.js";

const assets = {
  entryScript: "/assets/entry.js",
  modulePreloads: [],
  stylesheets: ["/assets/entry.css"],
};

const renderHome = Effect.fn("test.renderHome")(function* renderHome() {
  const application = yield* renderToString(
    {
      init: () => ({ model: initialModel }),
      view,
    },
    { isHydratable: false }
  );

  return renderDocument(application, assets);
});

describe("home shell", () => {
  it("names the page Hypertask", () => {
    expect(pageTitle).toBe("Hypertask");
  });

  it("stays ready", () => {
    expect(initialModel.ready).toBe(true);
    expect(update(initialModel, Message.Ready()).model.ready).toBe(true);
  });
});

describe("install tabs", () => {
  it("starts on MCP", () => {
    expect(initialModel.installTab).toBe("mcp");
  });

  it("carries one command per tab", () => {
    expect(installCommandFor("mcp")).toBe("https://mcp.hypertask.ai/mcp");
    expect(installCommandFor("cli-unix")).toBe(
      "curl -fsSL https://hypertask.ai/install | sh"
    );
    expect(installCommandFor("cli-windows")).toBe(
      "irm https://hypertask.ai/install.ps1 | iex"
    );
  });

  it("copies the command for the selected tab", () => {
    const selected = update(
      initialModel,
      Message.SelectedInstallTab({ tab: "cli-windows" })
    ).model;

    const result = update(selected, Message.PressedCopyInstallCommand());

    expect((result.commands ?? []).map((command) => command.name)).toEqual([
      "CopyInstallCommand",
      "ResetCopyLabel",
    ]);
    expect(result.commands?.[0]?.args).toEqual({
      command: "irm https://hypertask.ai/install.ps1 | iex",
    });
  });

  it("shows the copy outcome and returns to Copy", () => {
    const copied = update(
      initialModel,
      Message.CompletedCopyInstallCommand()
    ).model;

    expect(copied.copyLabel).toBe("Copied");
    expect(
      update(initialModel, Message.FailedCopyInstallCommand()).model.copyLabel
    ).toBe("Copy failed");
    expect(update(copied, Message.ResetCopyLabel()).model.copyLabel).toBe(
      "Copy"
    );
    expect(
      update(copied, Message.SelectedInstallTab({ tab: "cli-unix" })).model
        .copyLabel
    ).toBe("Copy");
  });
});

describe("billing period", () => {
  it("starts on yearly", () => {
    expect(initialModel.billingPeriod).toBe("yearly");
  });

  it("switches between monthly and yearly", () => {
    const monthly = update(
      initialModel,
      Message.SelectedBillingPeriod({ period: "monthly" })
    ).model;

    expect(monthly.billingPeriod).toBe("monthly");
    expect(
      update(monthly, Message.SelectedBillingPeriod({ period: "yearly" })).model
        .billingPeriod
    ).toBe("yearly");
  });
});

describe("rendered home page against the live page", () => {
  it.effect("keeps every heading in the old order", () =>
    Effect.gen(function* checkHeadings() {
      const html = yield* renderHome();

      expect(headings(html)).toEqual(liveHome.headings);
    })
  );

  it.effect("keeps the old words", () =>
    Effect.gen(function* checkText() {
      const html = yield* renderHome();

      expect(visibleText(html)).toEqual(liveHome.visibleText);
    })
  );

  it.effect("keeps every link target in the old order", () =>
    Effect.gen(function* checkLinks() {
      const html = yield* renderHome();

      expect(linkTargets(html)).toEqual(liveHome.linkTargets);
    })
  );

  it.effect("keeps every image with its alt text and loading hints", () =>
    Effect.gen(function* checkImages() {
      const html = yield* renderHome();

      expect(images(html)).toEqual(liveHome.images);
    })
  );

  it.effect("keeps the old head tags", () =>
    Effect.gen(function* checkHead() {
      const html = yield* renderHome();

      expect(headTags(html)).toEqual(liveHome.headTags);
    })
  );

  it.effect("sends a signed-in visitor to the app", () =>
    Effect.gen(function* checkRedirect() {
      const html = yield* renderHome();

      expect(html).toContain("ht_in=1");
      expect(html).toContain(
        'location.replace("https://app.hypertask.ai/login")'
      );
      expect(html).toContain('location.search.includes("stay")');
    })
  );
});
