import { Option } from "effect";
import type { Update } from "foldkit";

import {
  AcceptAllCookies,
  FocusCookieChoices,
  FocusCookieSettings,
  LoadConsent,
  OpenLogin,
  RejectOptionalCookies,
} from "./commands.js";
import { Message } from "./message.js";
import type { AppMessage } from "./message.js";
import type { AppModel } from "./model.js";

type UpdateReturn = Update.Return<AppModel, AppMessage>;

export const update = (model: AppModel, message: AppMessage): UpdateReturn =>
  Message.match<UpdateReturn>(message, {
    ChoseAll: () => ({ commands: [AcceptAllCookies()], model }),
    ChoseEssential: () => ({ commands: [RejectOptionalCookies()], model }),
    ClosedMenu: () => ({ model: { ...model, menuOpen: false } }),
    ConsentRecheck: () => ({ commands: [LoadConsent()], model }),
    ConsentResolved: ({ analyticsAllowed, bannerVisible, choice }) => ({
      commands:
        model.bannerVisible && !bannerVisible ? [FocusCookieSettings()] : [],
      model: {
        ...model,
        analyticsAllowed,
        bannerVisible,
        choice: Option.fromUndefinedOr(choice),
      },
    }),
    OpenedCookieSettings: () => ({
      commands: [FocusCookieChoices()],
      model: { ...model, bannerVisible: true },
    }),
    PressedLoginKey: () => ({ commands: [OpenLogin()], model }),
    Ready: () => ({ model: { ...model, ready: true } }),
    Scrolled: ({ scrolled }) => ({ model: { ...model, scrolled } }),
    ToggledMenu: () => ({ model: { ...model, menuOpen: !model.menuOpen } }),
  });
