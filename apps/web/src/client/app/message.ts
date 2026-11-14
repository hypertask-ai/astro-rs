import { Schema } from "effect";
import { defineMessageUnion } from "foldkit/message";

import { ConsentChoiceSchema } from "../../consent/index.js";

export const Message = defineMessageUnion({
  ChoseAll: {},
  ChoseEssential: {},
  ConsentRecheck: {},
  ConsentResolved: {
    analyticsAllowed: Schema.Boolean,
    bannerVisible: Schema.Boolean,
    choice: Schema.UndefinedOr(ConsentChoiceSchema),
  },
  OpenedCookieSettings: {},
  Ready: {},
});

export type AppMessage = typeof Message.Type;
