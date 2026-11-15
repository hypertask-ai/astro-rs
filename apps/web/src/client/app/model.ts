import { Option, Schema } from "effect";

import { ConsentChoiceSchema } from "../../consent/index.js";

export const Model = Schema.Struct({
  analyticsAllowed: Schema.Boolean,
  bannerVisible: Schema.Boolean,
  choice: Schema.Option(ConsentChoiceSchema),
  ready: Schema.Boolean,
});

export type AppModel = typeof Model.Type;

export const initialModel: AppModel = {
  analyticsAllowed: false,
  bannerVisible: true,
  choice: Option.none(),
  ready: true,
};
