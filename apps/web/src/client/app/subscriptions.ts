import { Schema, Stream } from "effect";
import { Subscription } from "foldkit";

import type { AppMessage } from "./message.js";
import { Message } from "./message.js";
import type { AppModel } from "./model.js";

const editableTags = new Set(["INPUT", "SELECT", "TEXTAREA"]);

const isEditable = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (editableTags.has(target.tagName) || target.isContentEditable);

const isLoginKey = (event: KeyboardEvent): boolean =>
  event.key.toLowerCase() === "l" &&
  !event.ctrlKey &&
  !event.metaKey &&
  !event.altKey &&
  !event.repeat &&
  !isEditable(event.target);

const recheckConsent = (): Stream.Stream<AppMessage> =>
  Stream.merge(
    Stream.fromEventListener(window, "focus"),
    Stream.fromEventListener(document, "visibilitychange")
  ).pipe(Stream.map(() => Message.ConsentRecheck()));

const loginShortcut = (): Stream.Stream<AppMessage> =>
  Stream.fromEventListener<KeyboardEvent>(document, "keydown").pipe(
    Stream.filter(isLoginKey),
    Stream.map(() => Message.PressedLoginKey())
  );

const scrollPosition = (): Stream.Stream<AppMessage> =>
  Stream.fromEventListener(window, "scroll", { passive: true }).pipe(
    Stream.map(() => window.scrollY > 0),
    Stream.changes,
    Stream.map((scrolled) => Message.Scrolled({ scrolled }))
  );

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
    loginShortcut: entry(
      { ready: Schema.Boolean },
      {
        dependenciesToStream: ({ ready }) =>
          ready ? loginShortcut() : Stream.empty,
        modelToDependencies: (model) => ({ ready: model.ready }),
      }
    ),
    scroll: entry(
      { ready: Schema.Boolean },
      {
        dependenciesToStream: ({ ready }) =>
          ready ? scrollPosition() : Stream.empty,
        modelToDependencies: (model) => ({ ready: model.ready }),
      }
    ),
  })
);
