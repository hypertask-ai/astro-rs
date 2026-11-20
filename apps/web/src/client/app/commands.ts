import { Effect, Schema } from "effect";
import { Command } from "foldkit";

import { runConsentMachine } from "../../consent/index.js";
import type { ConsentState } from "../../consent/index.js";
import { loginUrl } from "../../features/frame/copy.js";
import { mountHelpChat } from "../../features/help-chat/index.js";
import { copyResetMillis } from "../../features/home/copy.js";
import { testimonialsViewportId } from "../../features/testimonials/copy.js";
import { installSignUpClicks } from "../analytics/sign-up-click.js";
import { BrowserConsentStore } from "./browser-consent-store.js";
import { Message } from "./message.js";

const toResolved = (state: ConsentState) => Message.ConsentResolved(state);

const consentCommand = (choose?: "all" | "essential") =>
  runConsentMachine(choose).pipe(
    Effect.provide(BrowserConsentStore.layer),
    Effect.map(toResolved)
  );

export const LoadConsent = Command.define("LoadConsent", {
  execute: consentCommand(),
  messages: [Message.ConsentResolved],
});

export const AcceptAllCookies = Command.define("AcceptAllCookies", {
  execute: consentCommand("all"),
  messages: [Message.ConsentResolved],
});

export const RejectOptionalCookies = Command.define("RejectOptionalCookies", {
  execute: consentCommand("essential"),
  messages: [Message.ConsentResolved],
});

export const OpenLogin = Command.define("OpenLogin", {
  execute: Effect.sync(() => {
    window.location.assign(loginUrl);
  }).pipe(Effect.as(Message.Ready())),
  messages: [Message.Ready],
});

export const CopyInstallCommand = Command.define("CopyInstallCommand", {
  args: { command: Schema.String },
  execute: ({ command }) =>
    Effect.tryPromise(() => navigator.clipboard.writeText(command)).pipe(
      Effect.match({
        onFailure: () => Message.FailedCopyInstallCommand(),
        onSuccess: () => Message.CompletedCopyInstallCommand(),
      })
    ),
  messages: [
    Message.CompletedCopyInstallCommand,
    Message.FailedCopyInstallCommand,
  ],
});

export const ResetCopyLabel = Command.define("ResetCopyLabel", {
  execute: Effect.sleep(copyResetMillis).pipe(
    Effect.as(Message.ResetCopyLabel())
  ),
  messages: [Message.ResetCopyLabel],
});

export const LoadHelpChat = Command.define("LoadHelpChat", {
  execute: Effect.sync(() => {
    mountHelpChat(document);
  }).pipe(Effect.as(Message.Ready())),
  messages: [Message.Ready],
});

<<<<<<< HEAD
export const TrackSignUpClicks = Command.define("TrackSignUpClicks", {
  execute: Effect.sync(() => {
    installSignUpClicks(document, (event) => {
      window.fathom?.trackEvent(event);
    });
  }).pipe(Effect.as(Message.Ready())),
  messages: [Message.Ready],
=======
const scrollTestimonial = (index: number): void => {
  const viewport = document.querySelector(`#${testimonialsViewportId}`);

  if (!(viewport instanceof HTMLElement)) {
    return;
  }

  const slide = viewport.children[index];

  if (!(slide instanceof HTMLElement)) {
    return;
  }

  viewport.scrollTo({
    left:
      slide.getBoundingClientRect().left -
      viewport.getBoundingClientRect().left +
      viewport.scrollLeft,
  });
};

export const ScrollTestimonials = Command.define("ScrollTestimonials", {
  args: { index: Schema.Number },
  execute: ({ index }) =>
    Effect.sync(() => {
      scrollTestimonial(index);
    }).pipe(Effect.as(Message.SelectedTestimonialSlide({ index }))),
  messages: [Message.SelectedTestimonialSlide],
>>>>>>> origin/site
});
