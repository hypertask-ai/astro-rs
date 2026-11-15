import { Runtime } from "foldkit";

import { view } from "../features/home/index.js";
import {
  initialModel,
  LoadConsent,
  LoadHelpChat,
  Message,
  Model,
  subscriptions,
  TrackSignUpClicks,
  update,
} from "./app/index.js";

import "./fonts.css";
import "./site.css";

const application = Runtime.makeApplication({
  Model,
  container: document.querySelector("#root"),
  devTools: import.meta.env.DEV ? { Message } : false,
  init: () => ({
    commands: [LoadConsent(), LoadHelpChat(), TrackSignUpClicks()],
    model: initialModel,
  }),
  subscriptions,
  update,
  view,
});

Runtime.hydrate(application);
