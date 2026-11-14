import { Runtime } from "foldkit";

import { view } from "../features/home/index.js";
import {
  initialModel,
  LoadConsent,
  Message,
  Model,
  subscriptions,
  update,
} from "./app/index.js";

import "./site.css";

const application = Runtime.makeApplication({
  Model,
  container: document.querySelector("#root"),
  devTools: import.meta.env.DEV ? { Message } : false,
  init: () => ({ commands: [LoadConsent()], model: initialModel }),
  subscriptions,
  update,
  view,
});

Runtime.hydrate(application);
