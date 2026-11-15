import { Effect } from "effect";
import {
  Rendered,
  Responded,
  renderToString,
} from "foldkit/experimental/server";

import { initialModel } from "./client/app/model.js";
import { view } from "./features/home/index.js";
import {
  homeAnswerHeaders,
  legacyAnswer,
  redirectResponse,
} from "./hypertask/site-rules.js";

export { renderDocument } from "foldkit/experimental/server";

export const prerenderPaths = ["/"];

const renderRoute = Effect.fn("site.renderRoute")(function* renderRoute(
  request: Request
) {
  const { pathname } = new URL(request.url);
  const redirect = legacyAnswer(pathname);

  if (redirect.kind === "redirect") {
    return Responded(redirectResponse(redirect.location, redirect.status));
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

  return prerenderPaths.includes(pathname)
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
