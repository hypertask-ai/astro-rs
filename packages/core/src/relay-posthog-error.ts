import { Schema } from "effect";

export class RelayPostHogError extends Schema.TaggedError<
  RelayPostHogError,
  { readonly brand: unique symbol }
>()(
  "RelayPostHogError",
  {
    cause: Schema.Defect(),
    reason: Schema.Literals(["request", "response"]),
  },
  { httpApiStatus: 502 }
) {}
