import { Effect } from "effect";
import { FetchHttpClient } from "effect/http";
import {
  Rendered,
  Responded,
  renderDocument as renderFoldkitDocument,
  renderToString,
} from "foldkit/experimental/server";

import { initialModel } from "./client/app/model.js";
import { buildHead, pageHeads, siteOrigin } from "./features/head/index.js";
import { viewAt } from "./features/home/index.js";
import { relayPostHogFromRequest } from "./relay-posthog.js";
import { removeSiteBasePath } from "./site-base-path.js";
import { siteBasePath } from "./site-base.js";

type RenderDocument = typeof renderFoldkitDocument;

const robotsBody = "User-agent: *\nDisallow: /\n";

const robotsAnswer = (method: string): Response =>
  new Response(method === "HEAD" ? null : robotsBody, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
    status: 200,
  });

export const renderDocumentAt =
  (basePath: string): RenderDocument =>
  (application, assets, options) => {
    const path = application.canonical?.slice(siteOrigin.length) ?? "/";
    const page = pageHeads.get(path);
    const head = page === undefined ? "" : buildHead(path, page, basePath);

    return renderFoldkitDocument(application, assets, {
      ...options,
      head: `${options?.head ?? ""}${head}`,
    });
  };

export const renderDocument: RenderDocument = renderDocumentAt(siteBasePath);

export const prerenderPaths = ["/"];

export const renderRouteAt = (basePath: string) => {
  const page = viewAt(basePath);

  return Effect.fn("site.renderRoute")(function* renderRoute(request: Request) {
    const { pathname } = new URL(request.url);

    if (pathname.startsWith("/relay-8ddg/")) {
      const relayed = yield* relayPostHogFromRequest(request).pipe(
        Effect.provide(FetchHttpClient.layer)
      );

      const body = new Uint8Array(relayed.body);

      return Responded(
        new Response(body.buffer, {
          headers: relayed.headers,
          status: relayed.status,
        })
      );
    }

    const route = removeSiteBasePath(basePath, pathname);
    const robots = basePath !== "" && route === "/robots.txt";

    if (route !== "/" && !robots) {
      return Responded(new Response("Not found", { status: 404 }));
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return Responded(
        new Response("Unsupported method", {
          headers: { Allow: "GET, HEAD" },
          status: 405,
        })
      );
    }

    if (robots) {
      return Responded(robotsAnswer(request.method));
    }

    const application = yield* renderToString({
      init: () => ({ model: initialModel }),
      view: page,
    });

    return Rendered(application);
  });
};

const renderPageAt = (basePath: string) => {
  const renderRoute = renderRouteAt(basePath);

  return (request: Request) =>
    Effect.runPromise(
      renderRoute(request).pipe(
        Effect.catchCause((cause) =>
          Effect.succeed(
            Responded(
              new Response("The page could not be rendered", {
                status: 500,
                statusText: cause.toString(),
              })
            )
          )
        )
      )
    );
};

export const renderPage = renderPageAt(siteBasePath);
