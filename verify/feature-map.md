# Feature map: hypertask.ai

One row per user-visible function of the marketing site, with the address to try and what to look for. Built from the parts list on HTPR-9124 and the 117 addresses the parity manifest checks: 52 sitemap pages, 59 blog tag pages and 6 plain files. The live old site is the look and content reference and is read with GET only.

A verifier run serves each side in up to two ways, and the `serve:` line of the verdict says which answered:

- static, the built files a deploy uploads: head `$SITE_URL` (default `http://127.0.0.1:4173`), parent `$BASE_URL` (default `http://127.0.0.1:4174`)
- the repo's own Worker preview, `pnpm --filter @rat-stack/infra dev` (`alchemy dev`), when that commit has the script and it answers: head `$SITE_WORKER_URL`, parent `$BASE_WORKER_URL`
- live, `https://hypertask.ai`, the reference for look and content of pages a pull request claims

Use the static files for pages, text, links and assets. Use the Worker preview for redirects, headers, trailing slashes and the status of an unknown address, because that is where the Website Worker rules run. If the preview did not answer, state that the rule could not be judged and read the checkout.

The driver opens every path at 1440 and 390 pixels wide, records the status, title, headings, links, fonts, visible text, console errors, page errors and failed requests, and writes screenshots plus a text file.

```sh
node verify/driver.mjs page --head "$SITE_URL" --base "$BASE_URL" --path / --path /pricing/ --path /blog/
node verify/driver.mjs compare --head "$SITE_URL" --base "$BASE_URL" --path /pricing/
node verify/driver.mjs probe --head "${SITE_WORKER_URL:-$SITE_URL}" --base "${BASE_WORKER_URL:-$BASE_URL}" --path /v2 --path /no-such-page
```

## Pages and shared parts

| id | feature | try | look for | owner |
| --- | --- | --- | --- | --- |
| F01 | Home hero | `/` | H1 `The fastest way to clear your board.`, the line `Boards for people and AI agents. Work every ticket in the app, the CLI or over MCP.`, `Get started now` and `Demo board` buttons, both linked to `https://app.hypertask.ai` | 13 |
| F02 | Home install block | `/` | `Connect in one line`, tabs `MCP`, `CLI · Mac, Linux`, `Windows`; the MCP command `https://mcp.hypertask.ai/mcp`; `Copy` copies it and the block says `Paste into your agent. Sign in once.` | 13 |
| F03 | Agent logos | `/` | `Bring your own agent.` and the eight marks Claude, ChatGPT, Codex, Grok, Hermes, OpenClaw, Pi and Dots | 13 |
| F04 | Testimonials on the home page | `/` | The testimonial carousel and the scrolling columns move at the same pace as live, arrows and dots work, reduced motion stops the movement | 13 |
| F05 | Plans on the home page | `/` | Free, BYOK and Pro, the monthly and yearly buttons with yearly selected and the `−20%` marker, the yearly prices change when the period changes | 14 |
| F06 | Header | every page | Skip link `Skip to content`; glyph and `Hypertask`; Pricing, Blog, Docs, Help; `Login` with the `Press L to log in` tooltip; `Start free`; on the home page a full-width 72 pixel bar with a bottom hairline, elsewhere a floating rounded bar with a shadow | 11 |
| F07 | Mobile menu | any page at 390 pixels wide | Header keeps `Start free` and the menu button; the menu opens and closes, and every desktop link is inside it | 11 |
| F08 | Keyboard login | any page | Pressing `L` outside a text field opens `https://app.hypertask.ai/login`; a modifier key or a repeat press does nothing | 13 |
| F09 | Footer | every page | Home, Pricing, Blog, Privacy, Cookie settings, Contact, Terms, Docs, Help; `© 2026 Hypertask Lab Ltd.`; the home page uses the flat black footer, other pages the bordered one | 11 |
| F10 | Look and type | every page | The site's own dark look: `#000` page, `#a1a1aa` secondary text, `#222226` hairlines, white primary text; IBM Plex Sans body, IBM Plex Mono wordmark, Newsreader display headings; the same sizes, spacing and rounded corners as live. No Rat Stack or Foldkit look | 11 |
| F11 | Pricing page | `/pricing/` | H1 `Free forever. Upgrade when your team needs more.`, the monthly and yearly toggle, Free, BYOK and Pro plans, the same feature bullets, `Start for free` and `Get started` links | 14 |
| F12 | About page | `/about/` | H1 `About Hypertask`, the same story sections and founder words as live | 14 |
| F13 | Contact page | `/contact/` | H1 `Contact Us`, the same contact methods and links | 14 |
| F14 | Thank-you page | `/thank-you/` | H1 `Thank You!`, `noindex, follow`, the page stays out of the sitemap | 14 |
| F15 | Privacy page | `/privacy/` | H1 `Hypertask Lab Ltd. Privacy Policy`, the same sections and wording | 17 |
| F16 | Terms page | `/terms/` | H1 `Terms of Service`, the same sections and wording | 17 |
| F17 | Hallmark page | `/hallmark/` | H1 `Humans and agents, one board.`, the same long visual page, images and videos | 16 |
| F18 | IDA testimonial page | `/testimonial-ida/` | H1 `How IDA went from 5 Tests to 50 Tests Monthly in 30 Days`, the 10x, 85% and 40-50 stats, the before and after table | 16 |
| F19 | Linear comparison page | `/hypertask-vs-linear/` | H1 `Hypertask vs Linear`, the desktop and mobile comparison tables, the same rows and cells | 16 |
| F20 | Four use-case pages | `/use-cases/product/`, `/use-cases/marketing/`, `/use-cases/cro/`, `/use-cases/agency/` | Each H1 names the role, the hero, feature modules and bottom call to action match live | 15 |
| F21 | Blog list | `/blog/` | H1, post cards in the same order, covers, dates and tag chips, all 59 tag links | 10 |
| F22 | Thirty-eight blog posts | `/blog/<slug>/` for each of the 38 slugs below | Title, description, date, author, cover, body word for word, contents list, related posts at the end | 9 |
| F23 | Fifty-nine blog tag pages | `/blog/tags/<tag>/` for each tag below | Tag name as the heading, the same posts in the same order, the same header and footer | 10 |
| F24 | Page head and social cards | every page | The title shape live uses, the home page ending ` — Hypertask` and the other pages ending ` \| Hypertask`, the description, a canonical with the trailing slash, `robots`, Open Graph title, description, image, url, type and site name, Twitter summary card with large image, the RSS alternate link | 11 |
| F25 | JSON-LD | every page | One `application/ld+json` block with Organization, WebSite and SoftwareApplication as live; blog posts add Article | 11 |
| F26 | Fathom visits | every page | The Fathom script `https://cdn.usefathom.com/script.js` with site id `SSBYTYUQ`, once, deferred | 12 |
| F27 | Sign up click event | any page | A click on a link whose address starts `https://app.hypertask.ai` sends `Sign up click` to Fathom; other clicks do not | 12 |
| F28 | PostHog page counting | every page | Pageview and pageleave are captured, autocapture and replay only after `Accept`, memory only before a choice | 4 |
| F29 | PostHog relay | `/relay-8ddg/*` | The same address accepts the PostHog capture request and forwards it; no PostHog host is called from the page | 4 |
| F30 | Help chat widget | every page | The launcher bottom right, 56 pixel circle 24 pixels from the corner, from `https://help.hypertask.ai/widget/widget.js` with `data-mode="floating"`; opening it shows the help chat, never a broken frame | 11 |
| F31 | Cookie banner | first visit | Fixed banner `Cookie preferences`, the sentence `We use PostHog analytics to understand visits and clicks. Optional cookies stay off unless you accept.`, `Privacy policy` link, `Accept` and `Reject`; a choice hides it, is remembered, and `Cookie settings` in the footer brings it back | 8 |
| F32 | Signed-in visitor redirect | `/` with the `ht_in=1` cookie | The page replaces itself with `https://app.hypertask.ai/login`; `?stay` keeps the marketing page | 13 |
| F33 | Install scripts | `/install`, `/install.sh`, `/install.ps1` | `200`, `text/plain; charset=utf-8`, byte for byte the same script as live | 5 |
| F34 | RSS feed | `/rss.xml` | `200 application/xml`, the same post count and fields as live | 6 |
| F35 | Sitemap | `/sitemap-index.xml`, `/sitemap-0.xml` | Valid XML, the same 52 page addresses as live, `/thank-you/`, the old variants and the tag pages left out | 6 |
| F36 | Crawler files | `/robots.txt`, `/llms.txt`, `/llms-full.txt` | `200 text/plain`, word for word as live | 6 |
| F37 | Old addresses | `/install`, `/home2.html`, `/home2.html/`, `/hallmark-1`, `/new-home`, `/v2`, `/v3-cursor`, `/v3-linear`, `/v3-resend`, `/v3-shell`, `/v3-superhuman`, `/v3-vercel`, `/v4`, `/versions`, `/features`, `/features/`, `/agents`, `/agents/` | `/install` answers `200` with the script; every other address answers `301` with `Location: /`; redirects are not followed by a probe | 7 |
| F38 | Security headers | any page and any asset | `Strict-Transport-Security: max-age=31536000`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`; the install files keep `Content-Type: text/plain; charset=utf-8` | 7 |
| F39 | Unknown address | `/no-such-page` | Today the old site answers the home page with `200`. The rebuild keeps today's answer until HTPR-9339 decides a real not-found page, so a `404` that the parent also returns is a known gap, and a page that worked in the parent returning `404` is a regression | 7 |
| F40 | Trailing slash | `/pricing` | `308` to `/pricing/`; every page address ends in a slash, and `/` stays `/` | 7 |
| F41 | Media host | home, hallmark, use cases | The same CloudFront video host `https://duv2gcpdgd578.cloudfront.net` and the same eight videos, with a preconnect; no dead media | 11 |
| F42 | Images and favicons | `/Favicon - Light.png`, `/Favicon - Dark.png`, `/hypertasklogo.avif`, `/images/gradients/gradient(13).avif`, blog covers | `200` with the right image type, the same two favicon links with their `prefers-color-scheme` media, the gradient preloaded | 11 |
| F43 | Fonts | every page | Self-hosted IBM Plex Sans, IBM Plex Mono, Newsreader and Inter, the same weights; no request to `fonts.googleapis.com` once the move brings the fonts in | 11 |

## The 117 addresses

Fifty-two sitemap pages:

```
/
/about/
/blog/
/contact/
/hallmark/
/hypertask-vs-linear/
/pricing/
/privacy/
/terms/
/testimonial-ida/
/use-cases/agency/
/use-cases/cro/
/use-cases/marketing/
/use-cases/product/
/blog/ai-agent-task-management/
/blog/ai-agents-project-management-guide/
/blog/ai-project-management-software/
/blog/ai-task-manager/
/blog/ai-work-attribution-what-did-your-agents-do/
/blog/akiflow-alternative/
/blog/asana-alternative/
/blog/async-communication-remote-teams-playbook/
/blog/async-project-management-without-notification-overload/
/blog/best-ai-kanban-tool/
/blog/best-kanban-tool-for-ci-cd/
/blog/best-kanban-tool-for-mcp/
/blog/best-kanban-tool-with-api/
/blog/best-notion-alternatives/
/blog/claude-code-project-board/
/blog/cli-vs-mcp-ai-agent-project-data-access/
/blog/clickup-alternative/
/blog/clickup-vs-notion/
/blog/from-200-notifications-to-inbox-zero-case-study/
/blog/height-alternative/
/blog/how-to-reach-inbox-zero-every-day/
/blog/jira-alternative/
/blog/linear-alternative/
/blog/linear-vs-jira/
/blog/mcp-server-project-management/
/blog/monday-alternative/
/blog/motion-alternative/
/blog/multi-agent-team-one-board/
/blog/notion-vs-hypertask/
/blog/real-cost-of-notification-overload/
/blog/reclaim-ai-alternative/
/blog/stop-manually-updating-your-task-board/
/blog/sunsama-alternative/
/blog/todoist-alternative/
/blog/trello-alternative/
/blog/why-agents-build-whole-boards/
/blog/why-ai-agents-need-a-real-project-board/
/blog/why-your-team-stopped-replying-in-slack-threads/
```

Fifty-nine blog tag pages:

```
/blog/tags/accountability/
/blog/tags/agent-autonomy/
/blog/tags/agent-tools/
/blog/tags/agent-workflows/
/blog/tags/ai-agents/
/blog/tags/ai-project-management-software/
/blog/tags/ai-task-manager/
/blog/tags/ai-triage/
/blog/tags/akiflow/
/blog/tags/akiflow-alternative/
/blog/tags/api/
/blog/tags/asana/
/blog/tags/async-work/
/blog/tags/automation/
/blog/tags/board-generation/
/blog/tags/calendar/
/blog/tags/case-study/
/blog/tags/ci-cd/
/blog/tags/claude-code/
/blog/tags/cli/
/blog/tags/clickup/
/blog/tags/comparison/
/blog/tags/context-switching/
/blog/tags/engineering/
/blog/tags/github/
/blog/tags/height/
/blog/tags/height-alternative/
/blog/tags/inbox-zero/
/blog/tags/jira/
/blog/tags/kanban/
/blog/tags/knowledge-management/
/blog/tags/linear/
/blog/tags/mcp/
/blog/tags/mondaycom/
/blog/tags/motion/
/blog/tags/multi-agent/
/blog/tags/notifications/
/blog/tags/notion/
/blog/tags/notion-alternatives/
/blog/tags/orchestration/
/blog/tags/playbook/
/blog/tags/productivity/
/blog/tags/project-board/
/blog/tags/project-management/
/blog/tags/reclaim-ai/
/blog/tags/reclaim-ai-alternative/
/blog/tags/remote-teams/
/blog/tags/slack/
/blog/tags/social-proof/
/blog/tags/sunsama/
/blog/tags/sunsama-alternative/
/blog/tags/task-management/
/blog/tags/team-communication/
/blog/tags/todoist/
/blog/tags/token-cost/
/blog/tags/tool-comparison/
/blog/tags/trello/
/blog/tags/work-attribution/
/blog/tags/work-management/
```

Six plain files:

```
/install
/install.ps1
/install.sh
/llms.txt
/robots.txt
/rss.xml
```

## Not judged here

No database, sign-in, timed job, MCP tool, CLI command or form post exists on this site. The help chat is another site's widget, judged by the launcher and the frame it opens. Cloudflare zone, Worker, route and secret settings are plan only in this repository and are never read or changed by the verifier. A page missing from both the parent and the head is a note for the step that owns it, never a finding against the pull request under review.
