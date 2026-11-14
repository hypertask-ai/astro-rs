export const helpChatOrigin = "https://help.hypertask.ai";

export const helpChatScriptUrl = `${helpChatOrigin}/widget/widget.js`;

export const helpChatScriptId = "help-chat-widget";

export const helpChatAttributes = {
  "data-cfasync": "false",
  "data-mode": "floating",
  "data-nudge-delay": "20",
} as const;

export const mountHelpChat = (target: Document): void => {
  if (target.querySelector(`#${helpChatScriptId}`) !== null) {
    return;
  }

  const script = target.createElement("script");
  script.id = helpChatScriptId;
  script.src = helpChatScriptUrl;

  for (const [name, value] of Object.entries(helpChatAttributes)) {
    script.setAttribute(name, value);
  }

  target.body.append(script);
};
