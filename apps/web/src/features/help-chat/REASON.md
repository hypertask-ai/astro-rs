# Why the help chat widget stays an outside script

The help chat widget is the one thing hypertask.ai loads from another host: `https://help.hypertask.ai/widget/widget.js`.

- The widget is built and shipped by the Support team in its own repository (ai-chatbot). Its answers, its look and its fixes ship there. Copying the file into this site would freeze it, and visitors would get stale answers.
- The widget is not a library. It is a running service. It calls the help backend for every chat message, so a copy of the file would still need that host.
- The host is ours: `help.hypertask.ai` sits on the same Cloudflare account and domain as this site.
- The old site loaded it the same way: one classic script with `data-mode="floating"`, `data-nudge-delay="20"` and `data-cfasync="false"`. The Rat Stack site adds the same tag when the page starts, through `mountHelpChat`.

Every other file the page needs (fonts, images, videos, styles, scripts) is served from this site. `test/frame.test.ts` fails if a page references any other host, and it names this one as the only exception.
