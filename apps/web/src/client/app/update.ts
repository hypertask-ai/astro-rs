import { Option } from "effect";
import type { Update } from "foldkit";

import {
  AcceptAllCookies,
  LoadConsent,
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
    ConsentRecheck: () => ({ commands: [LoadConsent()], model }),
    ConsentResolved: ({ analyticsAllowed, bannerVisible, choice }) => ({
      model: {
        ...model,
        analyticsAllowed,
        bannerVisible,
        choice: Option.fromUndefinedOr(choice),
      },
    }),
    OpenedCookieSettings: () => ({ model: { ...model, bannerVisible: true } }),
    Ready: () => ({ model: { ...model, ready: true } }),
  });
