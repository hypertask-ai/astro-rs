import { Runtime } from "foldkit";

import { view } from "../features/home/index.js";
import { Message, initialModel, Model, update } from "./home/index.js";

import "./site.css";

const application = Runtime.makeApplication({
  Model,
  container: document.querySelector("#root"),
  devTools: import.meta.env.DEV ? { Message } : false,
  init: () => ({ model: initialModel }),
  update,
  view,
});

Runtime.hydrate(application);
