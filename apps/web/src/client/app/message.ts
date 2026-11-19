import { Schema } from "effect";
import { defineMessageUnion } from "foldkit/message";

import { ConsentChoiceSchema } from "../../consent/index.js";
import { BillingPeriodSchema, InstallTabSchema } from "./model.js";

export const Message = defineMessageUnion({
  ChoseAll: {},
  ChoseEssential: {},
  ClosedMenu: {},
  CompletedCopyInstallCommand: {},
  ConsentRecheck: {},
  ConsentResolved: {
    analyticsAllowed: Schema.Boolean,
    bannerVisible: Schema.Boolean,
    choice: Schema.UndefinedOr(ConsentChoiceSchema),
  },
  FailedCopyInstallCommand: {},
  OpenedCookieSettings: {},
  PressedCopyInstallCommand: {},
  PressedLoginKey: {},
  Ready: {},
  ResetCopyLabel: {},
  Scrolled: { scrolled: Schema.Boolean },
  SelectedBillingPeriod: { period: BillingPeriodSchema },
  SelectedInstallTab: { tab: InstallTabSchema },
  ToggledMenu: {},
});

export type AppMessage = typeof Message.Type;
