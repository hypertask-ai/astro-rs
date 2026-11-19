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
import { view as homeView } from "./features/home/index.js";
import { useCaseViewFor, useCaseViews } from "./features/use-cases/index.js";
import {
  homeAnswerHeaders,
  legacyAnswer,
  redirectResponse,
} from "./hypertask/site-rules.js";
import { relayPostHogFromRequest } from "./relay-posthog.js";
import { removeSiteBasePath } from "./site-base-path.js";
import { siteBasePath, sitePreviewResponse } from "./site-base.js";

type RenderDocument = typeof renderFoldkitDocument;

export const renderDocument: RenderDocument = (
  application,
  assets,
  options
) => {
  const path = application.canonical?.slice(siteOrigin.length) ?? "/";
  const page = pageHeads.get(path);
  const head = page === undefined ? "" : buildHead(path, page, siteBasePath);

  return renderFoldkitDocument(application, assets, {
    ...options,
    head: `${options?.head ?? ""}${head}`,
  });
};

export const prerenderPaths = ["/", ...useCaseViews.keys()];

const renderRoute = Effect.fn("site.renderRoute")(function* renderRoute(
  request: Request
) {
  const { pathname } = new URL(request.url);
  const path = removeSiteBasePath(siteBasePath, pathname);
  const redirect = legacyAnswer(path);

  if (redirect.kind === "redirect") {
    return Responded(
      sitePreviewResponse(redirectResponse(redirect.location, redirect.status))
    );
  }

  if (path.startsWith("/relay-8ddg/")) {
    const relayed = yield* relayPostHogFromRequest(request).pipe(
      Effect.provide(FetchHttpClient.layer)
    );

    const body = new Uint8Array(relayed.body);

    return Responded(
      sitePreviewResponse(
        new Response(body.buffer, {
          headers: relayed.headers,
          status: relayed.status,
        })
      )
    );
  }

  const knownUseCase = useCaseViewFor(path);
  const view = path === "/" ? homeView : (knownUseCase ?? homeView);

  if (request.method !== "GET" && request.method !== "HEAD") {
    return Responded(
      sitePreviewResponse(
        new Response("Unsupported method", {
          headers: { Allow: "GET, HEAD" },
          status: 405,
        })
      )
    );
  }

  const application = yield* renderToString({
    init: () => ({ model: initialModel }),
    view,
  });

  const isPrerenderedKnownPage =
    (path === "/" || knownUseCase !== undefined) &&
    prerenderPaths.includes(path);

  return isPrerenderedKnownPage
    ? Rendered(application)
    : Rendered(application, { headers: homeAnswerHeaders });
});

export const renderPage = (request: Request) =>
  Effect.runPromise(
    renderRoute(request).pipe(
      Effect.catchCause((cause) =>
        Effect.succeed(
          Responded(
            sitePreviewResponse(
              new Response("The page could not be rendered", {
                status: 500,
                statusText: cause.toString(),
              })
            )
          )
        )
      )
    )
  );
