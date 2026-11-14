import { Schema } from "effect";

export const Model = Schema.Struct({ ready: Schema.Boolean });

export type AppModel = typeof Model.Type;

export const initialModel: AppModel = { ready: true };
