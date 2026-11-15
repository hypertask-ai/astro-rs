import { Effect } from "effect";
import { Command } from "foldkit";
import * as Dom from "foldkit/dom";

import { runConsentMachine } from "../../consent/index.js";
import type { ConsentState } from "../../consent/index.js";
import { forwardCampaignTags } from "../../features/consent/campaign.js";
import { acceptButtonId } from "../../features/consent/copy.js";
import { cookieSettingsId, loginUrl } from "../../features/frame/copy.js";
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

const focusCommand = (selector: string) =>
  Dom.focus(selector, { preventScroll: true }).pipe(
    Effect.catchCause(() => Effect.void),
    Effect.as(Message.Ready())
  );

export const FocusCookieChoices = Command.define("FocusCookieChoices", {
  execute: focusCommand(`#${acceptButtonId}`),
  messages: [Message.Ready],
});

export const FocusCookieSettings = Command.define("FocusCookieSettings", {
  execute: focusCommand(`#${cookieSettingsId}`),
  messages: [Message.Ready],
});

export const ForwardCampaignTags = Command.define("ForwardCampaignTags", {
  execute: Effect.sync(() => {
    forwardCampaignTags(document, location.search);
  }).pipe(Effect.as(Message.Ready())),
  messages: [Message.Ready],
});
