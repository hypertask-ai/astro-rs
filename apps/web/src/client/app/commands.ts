import { Effect } from "effect";
import { Command } from "foldkit";

import { runConsentMachine } from "../../consent/index.js";
import type { ConsentState } from "../../consent/index.js";
import { loginUrl } from "../../features/frame/copy.js";
import { mountHelpChat } from "../../features/help-chat/index.js";
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

export const LoadHelpChat = Command.define("LoadHelpChat", {
  execute: Effect.sync(() => {
    mountHelpChat(document);
  }).pipe(Effect.as(Message.Ready())),
  messages: [Message.Ready],
});
