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

type RenderDocument = typeof renderFoldkitDocument;

export const renderDocument: RenderDocument = (
  application,
  assets,
  options
) => {
  const path = application.canonical?.slice(siteOrigin.length) ?? "/";
  const page = pageHeads.get(path);
  const head = page === undefined ? "" : buildHead(path, page);

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
  const redirect = legacyAnswer(pathname);

  if (redirect.kind === "redirect") {
    return Responded(redirectResponse(redirect.location, redirect.status));
  }

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

  const knownUseCase = useCaseViewFor(pathname);
  const view = pathname === "/" ? homeView : (knownUseCase ?? homeView);

  if (request.method !== "GET" && request.method !== "HEAD") {
    return Responded(
      new Response("Unsupported method", {
        headers: { Allow: "GET, HEAD" },
        status: 405,
      })
    );
  }

  const application = yield* renderToString(
    {
      init: () => ({ model: initialModel }),
      view,
    },
    { isHydratable: false }
  );

  const isPrerenderedKnownPage =
    (pathname === "/" || knownUseCase !== undefined) &&
    prerenderPaths.includes(pathname);

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
            new Response("The page could not be rendered", {
              status: 500,
              statusText: cause.toString(),
            })
          )
        )
      )
    )
  );
