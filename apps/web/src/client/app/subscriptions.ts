import { Schema, Stream } from "effect";
import { Subscription } from "foldkit";

import type { AppMessage } from "./message.js";
import { Message } from "./message.js";
import type { AppModel } from "./model.js";

const recheckConsent = (): Stream.Stream<AppMessage> =>
  Stream.merge(
    Stream.fromEventListener(window, "focus"),
    Stream.fromEventListener(document, "visibilitychange")
  ).pipe(Stream.map(() => Message.ConsentRecheck()));

export const subscriptions = Subscription.make<AppModel, AppMessage>()(
  (entry) => ({
    consent: entry(
      { ready: Schema.Boolean },
      {
        dependenciesToStream: ({ ready }) =>
          ready ? recheckConsent() : Stream.empty,
        modelToDependencies: (model) => ({ ready: model.ready }),
      }
    ),
  })
);
