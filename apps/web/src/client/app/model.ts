import { DateTime, Option, Schema } from "effect";

import { ConsentChoiceSchema } from "../../consent/index.js";
import { copyLabel } from "../../features/home/copy.js";

export const InstallTabSchema = Schema.Literals([
  "mcp",
  "cli-unix",
  "cli-windows",
]);

export const BillingPeriodSchema = Schema.Literals(["monthly", "yearly"]);

export type InstallTab = Schema.Schema.Type<typeof InstallTabSchema>;

export type BillingPeriod = Schema.Schema.Type<typeof BillingPeriodSchema>;

export const Model = Schema.Struct({
  analyticsAllowed: Schema.Boolean,
  bannerVisible: Schema.Boolean,
  billingPeriod: BillingPeriodSchema,
  choice: Schema.Option(ConsentChoiceSchema),
  copyLabel: Schema.String,
  installTab: InstallTabSchema,
  menuOpen: Schema.Boolean,
  ready: Schema.Boolean,
  scrolled: Schema.Boolean,
  year: Schema.Number,
});

export type AppModel = typeof Model.Type;

export const initialModel: AppModel = {
  analyticsAllowed: false,
  bannerVisible: false,
  billingPeriod: "yearly",
  choice: Option.none(),
  copyLabel,
  installTab: "mcp",
  menuOpen: false,
  ready: true,
  scrolled: false,
  year: DateTime.toPartsUtc(DateTime.nowUnsafe()).year,
};
