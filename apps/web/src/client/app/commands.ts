import { Effect } from "effect";
import { Command } from "foldkit";

import { runConsentMachine } from "../../consent/index.js";
import type { ConsentState } from "../../consent/index.js";
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
