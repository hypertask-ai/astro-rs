import { describe, expect, it } from "@effect/vitest";

import {
  campaignAppLink,
  forwardCampaignTags,
} from "../src/features/consent/campaign.js";

const search =
  "?utm_source=consent-test&utm_medium=qa&utm_campaign=mark164&utm_content=hero&utm_term=board";

const anchor = (href: string) => {
  let current = href;

  return {
    getAttribute: (name: string) => (name === "href" ? current : null),
    read: () => current,
    setAttribute: (name: string, value: string) => {
      if (name === "href") {
        current = value;
      }
    },
  };
};

describe("campaign tags on app links", () => {
  it("carries the five campaign tags from the page onto an app link", () => {
    expect(campaignAppLink("https://app.hypertask.ai/", search)).toBe(
      "https://app.hypertask.ai/?utm_source=consent-test&utm_medium=qa&utm_campaign=mark164&utm_content=hero&utm_term=board"
    );
  });

  it("keeps a tag the app link already had", () => {
    expect(
      campaignAppLink(
        "https://app.hypertask.ai/?utm_source=newsletter",
        "?utm_source=consent-test&utm_medium=qa"
      )
    ).toBe("https://app.hypertask.ai/?utm_source=newsletter&utm_medium=qa");
  });

  it("moves no parameter the old site did not move", () => {
    expect(
      campaignAppLink("https://app.hypertask.ai/login", "?ref=abc&gclid=xyz")
    ).toBe("https://app.hypertask.ai/login");
  });

  it("leaves every other link alone", () => {
    expect(campaignAppLink("/pricing/", search)).toBeUndefined();
    expect(campaignAppLink("https://hypertask.ai/", search)).toBeUndefined();
    expect(
      campaignAppLink("https://docs.hypertask.ai/", search)
    ).toBeUndefined();
    expect(
      campaignAppLink("https://app.hypertask.ai.example/", search)
    ).toBeUndefined();
  });

  it("rewrites the app links in the page and nothing else", () => {
    const app = anchor("https://app.hypertask.ai/login");
    const pricing = anchor("/pricing/");
    const docs = anchor("https://docs.hypertask.ai/");

    forwardCampaignTags(
      { querySelectorAll: () => [app, pricing, docs] },
      "?utm_source=consent-test&utm_medium=qa"
    );

    expect(app.read()).toBe(
      "https://app.hypertask.ai/login?utm_source=consent-test&utm_medium=qa"
    );
    expect(pricing.read()).toBe("/pricing/");
    expect(docs.read()).toBe("https://docs.hypertask.ai/");
  });
});
