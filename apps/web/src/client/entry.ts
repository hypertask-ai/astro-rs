import { Runtime } from "foldkit";

import { homeView, viewForPath } from "../routes.js";
import {
  initialModel,
  LoadConsent,
  LoadHelpChat,
  Message,
  Model,
  subscriptions,
  update,
} from "./app/index.js";

import "./fonts.css";
import "./site.css";

const application = Runtime.makeApplication({
  Model,
  container: document.querySelector("#root"),
  devTools: import.meta.env.DEV ? { Message } : false,
  init: () => ({
    commands: [LoadConsent(), LoadHelpChat()],
    model: initialModel,
  }),
  subscriptions,
  update,
  view: viewForPath(window.location.pathname) ?? homeView,
});

Runtime.hydrate(application);
