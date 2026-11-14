import { implement } from "@rat-stack/capability/implement";
import { relayPostHogContract } from "@rat-stack/core/contracts";
import { RelayPostHogError } from "@rat-stack/core/relay-posthog-error";
import { Effect, Schema } from "effect";
import { HttpClient, HttpClientRequest } from "effect/http";

const API_HOST = "https://eu.i.posthog.com";

const ASSET_HOST = "https://eu-assets.i.posthog.com";

const HOP_HEADERS = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "keep-alive",
  "transfer-encoding",
  "upgrade",
]);

const requestHeaders = (
  headers: Readonly<Record<string, string>>
): Readonly<Record<string, string>> =>
  Object.fromEntries(
    Object.entries(headers).filter(
      ([name]) => name.toLowerCase() !== "host" && !name.startsWith("cf-")
    )
  );

const responseHeaders = (
  headers: Readonly<Record<string, string>>
): Readonly<Record<string, string>> =>
  Object.fromEntries(
    Object.entries(headers).filter(
      ([name]) => !HOP_HEADERS.has(name.toLowerCase())
    )
  );

const targetHost = (path: string): string =>
  path.startsWith("static/") || path.startsWith("array/")
    ? ASSET_HOST
    : API_HOST;

export const relayPostHog = implement(relayPostHogContract, (input) =>
  Effect.gen(function* relayOneRequest() {
    const client = yield* HttpClient.HttpClient;

    const url = `${targetHost(input.path)}/${input.path}${input.search}`;

    const withBody =
      input.body === undefined
        ? HttpClientRequest.make(input.method)(url)
        : HttpClientRequest.bodyUint8Array(input.body)(
            HttpClientRequest.make(input.method)(url)
          );

    const request = HttpClientRequest.setHeaders(
      withBody,
      requestHeaders(input.headers)
    );

    const response = yield* client
      .execute(request)
      .pipe(
        Effect.mapError(
          (cause) => new RelayPostHogError({ cause, reason: "request" })
        )
      );

    const body = yield* response.arrayBuffer.pipe(
      Effect.mapError(
        (cause) => new RelayPostHogError({ cause, reason: "response" })
      )
    );

    return {
      body: new Uint8Array(body),
      headers: responseHeaders(response.headers),
      status: response.status,
    };
  })
);

export const relayPostHogFromRequest = (request: Request) =>
  Effect.gen(function* relayFromRequest() {
    const { pathname, search } = new URL(request.url);

    const method = request.method.toUpperCase();

    const body =
      method === "GET" || method === "HEAD"
        ? undefined
        : new Uint8Array(yield* Effect.promise(() => request.arrayBuffer()));

    const input = yield* Schema.decodeUnknownEffect(relayPostHogContract.input)(
      {
        body,
        headers: Object.fromEntries(request.headers.entries()),
        method,
        path: pathname.slice("/relay-8ddg/".length),
        search,
      }
    ).pipe(Effect.orDie);

    return yield* relayPostHog.handler(input);
  });
