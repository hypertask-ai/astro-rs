import { defineMessageUnion } from "foldkit/message";

export const Message = defineMessageUnion({
  Ready: {},
});

export type AppMessage = typeof Message.Type;
