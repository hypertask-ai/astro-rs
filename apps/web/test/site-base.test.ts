import { NodeServices } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import { Effect, FileSystem, Path } from "effect";
import { renderToString } from "foldkit/experimental/server";

import { finalizeSiteRules } from "../scripts/site-rules.js";
import { initialModel } from "../src/client/app/model.js";
import {
  prerenderPaths,
  renderDocument,
  renderDocumentAt,
  renderRouteAt,
} from "../src/entry.server.js";
import { view, viewAt } from "../src/features/home/index.js";
import { headersFile, redirectsFile } from "../src/hypertask/site-rules.js";
import {
  addSiteBasePath,
  normalizeSiteBasePath,
  removeSiteBasePath,
} from "../src/site-base-path.js";
import { externalAddresses, headTags, internalAddresses } from "./home-page.js";

const assets = {
  entryScript: "/assets/entry.js",
  modulePreloads: [],
  stylesheets: ["/assets/entry.css"],
};

const mounted = "/ratstack";

const renderHome = (basePath: string) =>
  Effect.gen(function* renderHomePage() {
    const application = yield* renderToString(
      {
        init: () => ({ model: initialModel }),
        view: viewAt(basePath),
      },
      { isHydratable: false }
    );

    return renderDocumentAt(basePath)(application, assets);
  });

const renderShippedHome = () =>
  Effect.gen(function* renderShippedHomePage() {
    const application = yield* renderToString(
      {
        init: () => ({ model: initialModel }),
        view,
      },
      { isHydratable: false }
    );

    return renderDocument(application, assets);
  });

const completeAnswer = (answer: { readonly response?: Response }): Response => {
  if (answer.response === undefined) {
    throw new Error("Expected one complete answer");
  }

  return answer.response;
};

describe("the base path setting", () => {
  it("reads one root-relative path and treats an empty setting as the origin root", () => {
    expect(normalizeSiteBasePath("")).toBe("");
    expect(normalizeSiteBasePath("/")).toBe("");
    expect(normalizeSiteBasePath("/ratstack")).toBe("/ratstack");
    expect(normalizeSiteBasePath("/ratstack/")).toBe("/ratstack");
    expect(() => normalizeSiteBasePath("ratstack")).toThrow();
    expect(() => normalizeSiteBasePath("//evil.example/ratstack")).toThrow();
    expect(() =>
      normalizeSiteBasePath("https://hypertask.ai/ratstack")
    ).toThrow();
  });

  it("adds the prefix to the site's own paths only", () => {
    expect(addSiteBasePath(mounted, "/")).toBe("/ratstack/");
    expect(addSiteBasePath(mounted, "/pricing/")).toBe("/ratstack/pricing/");
    expect(addSiteBasePath(mounted, "/ratstack/pricing/")).toBe(
      "/ratstack/pricing/"
    );
    expect(addSiteBasePath(mounted, "https://app.hypertask.ai/login")).toBe(
      "https://app.hypertask.ai/login"
    );
    expect(addSiteBasePath(mounted, "//cdn.example/logo.svg")).toBe(
      "//cdn.example/logo.svg"
    );
    expect(addSiteBasePath(mounted, "#main")).toBe("#main");
    expect(addSiteBasePath("", "/pricing/")).toBe("/pricing/");
  });

  it("removes the prefix the same way it adds it", () => {
    for (const basePath of ["", mounted]) {
      for (const path of ["/", "/pricing/", "/blog/a-post/"]) {
        expect(
          removeSiteBasePath(basePath, addSiteBasePath(basePath, path))
        ).toBe(path);
      }
    }
  });
});

describe("a site without the setting", () => {
  it.effect("renders the shipped home page byte for byte", () =>
    Effect.gen(function* checkIdentity() {
      expect(yield* renderHome("")).toBe(yield* renderShippedHome());
    })
  );

  it.effect("keeps no address inside the prefix", () =>
    Effect.gen(function* checkAddresses() {
      const html = yield* renderHome("");

      expect(internalAddresses(html).length).toBeGreaterThan(0);
      expect(
        internalAddresses(html).some((address) => address.startsWith(mounted))
      ).toBe(false);
      expect(html.includes(mounted)).toBe(false);
    })
  );

  it.effect("keeps the page indexable on its real address", () =>
    Effect.gen(function* checkHead() {
      const head = headTags(yield* renderHome(""));

      expect(head.meta.robots).toBe("index, follow");
      expect(head.canonical).toBe("https://hypertask.ai/");
    })
  );
});

describe("a site mounted at /ratstack", () => {
  it.effect("keeps every internal address inside the prefix", () =>
    Effect.gen(function* checkAddresses() {
      const addresses = internalAddresses(yield* renderHome(mounted));

      expect(addresses.length).toBeGreaterThan(0);

      for (const address of addresses) {
        expect(
          address === mounted || address.startsWith(`${mounted}/`),
          `${address} leaves ${mounted}`
        ).toBe(true);
      }
    })
  );

  it.effect("leaves every link to another site unchanged", () =>
    Effect.gen(function* checkExternalAddresses() {
      expect(externalAddresses(yield* renderHome(mounted))).toEqual(
        externalAddresses(yield* renderHome(""))
      );
    })
  );

  it.effect("carries do not index and keeps the real canonical address", () =>
    Effect.gen(function* checkHead() {
      const html = yield* renderHome(mounted);
      const head = headTags(html);

      expect(head.meta.robots).toBe("noindex, nofollow");
      expect(head.canonical).toBe("https://hypertask.ai/");
      expect(internalAddresses(html)).toContain("/ratstack/rss.xml");
      expect(internalAddresses(html)).toContain(
        "/ratstack/Favicon%20-%20Light.png"
      );
    })
  );

  it.effect("serves robots.txt under the prefix as a refusal", () =>
    Effect.gen(function* checkRobots() {
      const answer = completeAnswer(
        yield* renderRouteAt(mounted)(
          new Request("http://localhost/ratstack/robots.txt")
        )
      );

      expect(answer.status).toBe(200);
      expect(answer.headers.get("Content-Type")).toBe(
        "text/plain; charset=utf-8"
      );
      expect(yield* Effect.promise(() => answer.text())).toBe(
        "User-agent: *\nDisallow: /\n"
      );
    })
  );

  it.effect("keeps robots.txt absent without the setting", () =>
    Effect.gen(function* checkRobots() {
      const answer = completeAnswer(
        yield* renderRouteAt("")(new Request("http://localhost/robots.txt"))
      );

      expect(answer.status).toBe(404);
    })
  );

  it.effect("stops answering addresses the site does not have", () =>
    Effect.gen(function* checkUnknown() {
      const answer = completeAnswer(
        yield* renderRouteAt(mounted)(
          new Request("http://localhost/ratstack/there-is-no-page/")
        )
      );

      expect(answer.status).toBe(404);
    })
  );
});

describe("a crawl of the prerendered pages", () => {
  it.effect("finds no internal address outside the prefix", () =>
    Effect.gen(function* checkCrawl() {
      for (const path of prerenderPaths) {
        const html = yield* renderHome(mounted);

        expect(path.startsWith("/")).toBe(true);
        expect(
          internalAddresses(html).filter(
            (address) =>
              address !== mounted && !address.startsWith(`${mounted}/`)
          )
        ).toEqual([]);
        expect(headTags(html).meta.robots).toBe("noindex, nofollow");
      }
    })
  );

  it.effect(
    "finds no internal address inside the prefix without the setting",
    () =>
      Effect.gen(function* checkCrawl() {
        for (const path of prerenderPaths) {
          const html = yield* renderHome("");

          expect(
            internalAddresses(html).filter((address) =>
              address.startsWith(mounted)
            ),
            `${path} reaches into ${mounted}`
          ).toEqual([]);
          expect(headTags(html).meta.robots).toBe("index, follow");
        }
      })
  );
});

describe("the build rules under the prefix", () => {
  it("mounts every redirect target and source under the prefix", () => {
    const rules = redirectsFile(["/pricing/"], mounted)
      .trim()
      .split("\n")
      .map((line) => line.split(" "));

    const shipped = redirectsFile(["/pricing/"]).trim().split("\n");

    expect(shipped.length).toBe(rules.length);

    for (const [source, destination] of rules) {
      expect(source?.startsWith(`${mounted}/`)).toBe(true);
      expect(destination?.startsWith(`${mounted}/`)).toBe(true);
    }

    expect(redirectsFile(["/pricing/"])).toBe(redirectsFile(["/pricing/"], ""));
  });

  it("keeps do not index in the header file and mounts its rules", () => {
    const headers = headersFile("", mounted);
    const install = headersFile("/install\n  Content-Type: text/plain\n");

    const mountedInstall = headersFile(
      "/install\n  Content-Type: text/plain\n",
      mounted
    );

    expect(headers).toContain(`${mounted}/*`);
    expect(headers).toContain("X-Robots-Tag: noindex, nofollow");
    expect(headersFile(headers, mounted)).toBe(headers);
    expect(install).not.toContain("X-Robots-Tag");
    expect(mountedInstall).toContain(`${mounted}/install`);
    expect(mountedInstall).toContain("X-Robots-Tag: noindex, nofollow");
  });
});

it.layer(NodeServices.layer)("the rules the build writes", (test) => {
  test.effect(
    "mounts the install rules, the redirects and do not index under the prefix",
    () =>
      Effect.gen(function* checkArtifact() {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const directory = yield* fs.makeTempDirectory();

        yield* fs.writeFileString(
          path.join(directory, "_headers"),
          "/install\n  Content-Type: text/plain; charset=utf-8\n"
        );

        yield* finalizeSiteRules(directory, mounted);

        const headers = yield* fs.readFileString(
          path.join(directory, "_headers")
        );

        const redirects = yield* fs.readFileString(
          path.join(directory, "_redirects")
        );

        expect(headers).toContain(`${mounted}/install`);
        expect(headers).toContain(`${mounted}/*`);
        expect(headers).toContain("X-Robots-Tag: noindex, nofollow");
        expect(redirects).toContain(`${mounted}/home2.html ${mounted}/ 301`);
        expect(
          redirects
            .split("\n")
            .filter((line) => line !== "")
            .every((line) => line.startsWith(`${mounted}/`))
        ).toBe(true);

        yield* fs.remove(directory, { recursive: true });
      })
  );
});
