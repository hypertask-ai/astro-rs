import { Effect } from "effect";
import {
  Rendered,
  Responded,
  renderDocument as renderFoldkitDocument,
  renderToString,
} from "foldkit/experimental/server";

import { initialModel } from "./client/app/model.js";
import { buildHead, pageHeads, siteOrigin } from "./features/head/index.js";
import { view } from "./features/home/index.js";
import { removeSiteBasePath } from "./site-base-path.js";
import { siteBasePath, sitePreviewHeaders } from "./site-base.js";

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

export const prerenderPaths = ["/"];

const renderRoute = Effect.fn("site.renderRoute")(function* renderRoute(
  request: Request
) {
  const { pathname } = new URL(request.url);
  const path = removeSiteBasePath(siteBasePath, pathname);

  if (path !== "/") {
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

  const application = yield* renderToString({
    init: () => ({ model: initialModel }),
    view,
  });

  const headers = sitePreviewHeaders();

  return headers === undefined
    ? Rendered(application)
    : Rendered(application, { headers });
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
