import { DateTime, Option, Schema } from "effect";

import { ConsentChoiceSchema } from "../../consent/index.js";

export const Model = Schema.Struct({
  analyticsAllowed: Schema.Boolean,
  bannerVisible: Schema.Boolean,
  choice: Schema.Option(ConsentChoiceSchema),
  menuOpen: Schema.Boolean,
  ready: Schema.Boolean,
  scrolled: Schema.Boolean,
  year: Schema.Number,
});

export type AppModel = typeof Model.Type;

export const initialModel: AppModel = {
  analyticsAllowed: false,
  bannerVisible: true,
  choice: Option.none(),
  menuOpen: false,
  ready: true,
  scrolled: false,
  year: DateTime.toPartsUtc(DateTime.nowUnsafe()).year,
};
