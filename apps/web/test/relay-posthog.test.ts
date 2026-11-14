import { expect, it } from "@effect/vitest";
import { Effect, Predicate, Ref } from "effect";
import { HttpClient, HttpClientResponse } from "effect/http";

import { relayPostHog } from "../src/relay-posthog.js";

const worker = new Uint8Array([1, 2, 3]);

it.effect("forwards a capture request to the EU collector", () =>
  Effect.gen(function* relayCapture() {
    const seen = yield* Ref.make<
      readonly {
        readonly body: string | undefined;
        readonly headers: Readonly<Record<string, string>>;
        readonly method: string;
        readonly url: string;
      }[]
    >([]);

    const client = HttpClient.make((request) =>
      Effect.gen(function* answer() {
        const body = Predicate.isTagged(request.body, "Uint8Array")
          ? new TextDecoder().decode(request.body.body)
          : undefined;

        yield* Ref.update(seen, (all) => [
          ...all,
          {
            body,
            headers: { ...request.headers },
            method: request.method,
            url: request.url,
          },
        ]);

        return HttpClientResponse.fromWeb(
          request,
          new Response(worker, {
            headers: {
              "content-encoding": "gzip",
              "content-length": "3",
              "content-type": "text/plain",
            },
            status: 200,
          })
        );
      })
    );

    const result = yield* relayPostHog
      .handler({
        body: new Uint8Array([123, 125]),
        headers: {
          "cf-connecting-ip": "203.0.113.9",
          "content-type": "application/json",
          host: "hypertask.ai",
        },
        method: "POST",
        path: "e/",
        search: "?ip=1",
      })
      .pipe(Effect.provideService(HttpClient.HttpClient, client));

    expect(result.status).toBe(200);
    expect([...result.body]).toStrictEqual([1, 2, 3]);
    expect(result.headers).toStrictEqual({ "content-type": "text/plain" });

    const requests = yield* Ref.get(seen);
    expect(requests).toHaveLength(1);
    expect(requests[0]?.url).toBe("https://eu.i.posthog.com/e/?ip=1");
    expect(requests[0]?.method).toBe("POST");
    expect(requests[0]?.body).toBe("{}");
    expect(requests[0]?.headers).toStrictEqual({
      "content-type": "application/json",
    });
  })
);

it.effect("loads static SDK assets from the assets host", () =>
  Effect.gen(function* relayAsset() {
    const seen = yield* Ref.make<readonly string[]>([]);

    const client = HttpClient.make((request) =>
      Effect.gen(function* answer() {
        yield* Ref.update(seen, (all) => [...all, request.url]);

        return HttpClientResponse.fromWeb(
          request,
          new Response("sdk", {
            headers: { "content-type": "text/javascript" },
            status: 200,
          })
        );
      })
    );

    const result = yield* relayPostHog
      .handler({
        headers: { accept: "*/*" },
        method: "GET",
        path: "static/array.js",
        search: "",
      })
      .pipe(Effect.provideService(HttpClient.HttpClient, client));

    expect(result.status).toBe(200);
    expect(yield* Ref.get(seen)).toStrictEqual([
      "https://eu-assets.i.posthog.com/static/array.js",
    ]);
  })
);
