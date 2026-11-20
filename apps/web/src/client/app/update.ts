import { Option } from "effect";
import type { Update } from "foldkit";

import {
  copiedLabel,
  copyFailedLabel,
  copyLabel,
  installCommandFor,
} from "../../features/home/copy.js";
import {
  AcceptAllCookies,
  CopyInstallCommand,
  FocusCookieChoices,
  FocusCookieSettings,
  LoadConsent,
  OpenLogin,
  RejectOptionalCookies,
  ResetCopyLabel,
} from "./commands.js";
import { Message } from "./message.js";
import type { AppMessage } from "./message.js";
import type { AppModel } from "./model.js";

type UpdateReturn = Update.Return<AppModel, AppMessage>;

export const update = (model: AppModel, message: AppMessage): UpdateReturn =>
  Message.match<UpdateReturn>(message, {
    ChoseAll: () => ({ commands: [AcceptAllCookies()], model }),
    ChoseEssential: () => ({ commands: [RejectOptionalCookies()], model }),
    ClosedMenu: () => ({ model: { ...model, menuOpen: false } }),
    CompletedCopyInstallCommand: () => ({
      model: { ...model, copyLabel: copiedLabel },
    }),
    ConsentRecheck: () => ({ commands: [LoadConsent()], model }),
    ConsentResolved: ({ analyticsAllowed, bannerVisible, choice }) => ({
      commands:
        model.bannerVisible && !bannerVisible ? [FocusCookieSettings()] : [],
      model: {
        ...model,
        analyticsAllowed,
        bannerVisible,
        choice: Option.fromUndefinedOr(choice),
      },
    }),
    FailedCopyInstallCommand: () => ({
      model: { ...model, copyLabel: copyFailedLabel },
    }),
    OpenedCookieSettings: () => ({
      commands: [FocusCookieChoices()],
      model: { ...model, bannerVisible: true },
    }),
    PressedCopyInstallCommand: () => ({
      commands: [
        CopyInstallCommand({ command: installCommandFor(model.installTab) }),
        ResetCopyLabel(),
      ],
      model,
    }),
    PressedLoginKey: () => ({ commands: [OpenLogin()], model }),
    Ready: () => ({ model: { ...model, ready: true } }),
    ResetCopyLabel: () => ({ model: { ...model, copyLabel } }),
    Scrolled: ({ scrolled }) => ({ model: { ...model, scrolled } }),
    SelectedBillingPeriod: ({ period }) => ({
      model: { ...model, billingPeriod: period },
    }),
    SelectedInstallTab: ({ tab }) => ({
      model: { ...model, copyLabel, installTab: tab },
    }),
    ToggledMenu: () => ({ model: { ...model, menuOpen: !model.menuOpen } }),
  });
