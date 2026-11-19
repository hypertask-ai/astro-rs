import { Runtime } from "foldkit";

import { view as homeView } from "../features/home/index.js";
import { useCaseViewFor } from "../features/use-cases/index.js";
import { removeSiteBasePath } from "../site-base-path.js";
import { siteBasePath } from "../site-base.js";
import { startAnalytics } from "./analytics/index.js";
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

const appPath = removeSiteBasePath(siteBasePath, window.location.pathname);

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
  view: useCaseViewFor(appPath) ?? homeView,
});

Runtime.hydrate(application);

startAnalytics();
