# Blog preview publish audit

## Failure record

Run [44762179060](https://github.com/hypertask-ai/astro-rs/actions/runs/44762179060) failed at commit `1ac978100c2f2c6271dcfc9df0efe0fbc3607d9e` on 2026-11-20.

`gh run view 44762179060 -R hypertask-ai/astro-rs --log-failed` returned no output. The job log was available through `gh api repos/hypertask-ai/astro-rs/actions/jobs/136377288219/logs`.

The log names 39 files and 800 file/link pairs. Every pair is listed below, in log order. No audit exceptions are needed. Each root-relative address would leave the preview and request the old site instead.

## Cause and reproduction

The blog view passes Foldkit's raw builder to the markdown renderer and the shared page frame. Every other page uses `siteBuilder`, which prefixes `Href`, `Src` and `Srcset` at the rendering boundary. Blog content, images, breadcrumbs, tags, related posts and frame links all miss that boundary.

`apps/web/test/blog-preview.test.ts` renders every published blog view with `BASE_URL=/ratstack/`. It checks the complete document with the publish audit's `escapingUrls`, compares every link and image against the existing live fixtures with the mount added once, preserves external and fragment links, and checks the canonical address and visible words. Existing blog tests cover the origin-root build.

The remaining stylesheet failure is the thank-you card's `/gradient1.avif`. The pinned StyleX Vite plugin appends its CSS in `generateBundle`, after Vite has processed CSS asset paths. Its root-relative URL therefore misses Vite's base rewriting. Using `../gradient1.avif` makes the browser resolve the existing public image relative to the emitted stylesheet in `assets/`, both at the origin root and under the preview mount. The image bytes and styling stay the same.

Some posts also author absolute `https://hypertask.ai/...` links. The existing audit only inspects root-relative addresses, so those are not in its failure list. `sitePath` now parses absolute URLs and compares their exact origin with the existing `siteOrigin`. It mounts only that origin and leaves app, docs, external URLs and fragment links alone. Canonical and structured-data URLs do not pass through the builder and stay public. Tests compare preview links with independently resolved live-fixture URLs and cover default ports, lookalike hosts, userinfo, other ports and protocol-relative URLs.

Nothing is built or tested on the worker server. The fix passes `siteBuilder(builder)` into the existing blog renderer and makes the decorative image URL stylesheet-relative. Blog content and the audit stay unchanged. The new pull-request workflow builds with `SITE_BASE_PATH=/ratstack` and runs the same audit as publish, without deploying.

## GitHub reproduction receipts

At `85942408d125cd73c5b70165931cdeca23ca7c26`, before either source fix:

- [CI run 45075763624](https://github.com/hypertask-ai/astro-rs/actions/runs/45075763624) passed lint and typechecks, then failed all 38 new preview tests. The web test output reports 38 failed and 674 passed tests. Each failure names root-relative blog links and images outside the mount.
- [Preview run 45075763588](https://github.com/hypertask-ai/astro-rs/actions/runs/45075763588) builds the site and fails the publish audit. The first reproduction, [45075472888](https://github.com/hypertask-ai/astro-rs/actions/runs/45075472888), names the same 800 file/link pairs across the same 39 files as the original publish log.

Rules that changed the implementation:

- Find the cause first. Reuse the existing builder instead of editing 38 markdown files or weakening the audit.
- Make tests detect broken behavior. Render every post under the preview mount and record the failing GitHub run before fixing it.
- Check the actual artifact. Build and audit the preview in a new GitHub-hosted check, separate from the origin-root CI build.

## Every flagged file and link

### `assets/app-0sxZfQUX.css`

- `/gradient1.avif`

### `blog/ai-agent-task-management/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/demo-board.webp`
- `/blog/ai-agents-project-management-guide/`
- `/blog/ai-task-manager/`
- `/blog/why-ai-agents-need-a-real-project-board/`
- `/blog/cli-vs-mcp-ai-agent-project-data-access/`
- `/blog/ai-work-attribution-what-did-your-agents-do/`
- `/blog/async-project-management-without-notification-overload/`
- `/blog/tags/ai-agents/`
- `/blog/tags/task-management/`
- `/blog/tags/mcp/`
- `/blog/tags/cli/`
- `/blog/tags/async-work/`
- `/about/`
- `/blog/claude-code-project-board/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/ai-agents-project-management-guide/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/pillar-cover.webp`
- `/blog/mcp-server-project-management/`
- `/blog/cli-vs-mcp-ai-agent-project-data-access/`
- `/images/blog/demo-board.webp`
- `/blog/why-your-team-stopped-replying-in-slack-threads/`
- `/blog/linear-vs-jira/`
- `/blog/clickup-vs-notion/`
- `/blog/reclaim-ai-alternative/`
- `/images/blog/pillar-multi-agent.webp`
- `/blog/why-ai-agents-need-a-real-project-board/`
- `/blog/multi-agent-team-one-board/`
- `/blog/ai-work-attribution-what-did-your-agents-do/`
- `/blog/notion-vs-hypertask/`
- `/blog/clickup-alternative/`
- `/blog/asana-alternative/`
- `/blog/linear-alternative/`
- `/blog/ai-agent-task-management/`
- `/blog/ai-task-manager/`
- `/blog/ai-project-management-software/`
- `/blog/sunsama-alternative/`
- `/blog/akiflow-alternative/`
- `/blog/jira-alternative/`
- `/blog/why-agents-build-whole-boards/`
- `/blog/todoist-alternative/`
- `/blog/trello-alternative/`
- `/blog/monday-alternative/`
- `/blog/tags/ai-agents/`
- `/blog/tags/project-management/`
- `/blog/tags/mcp/`
- `/blog/tags/cli/`
- `/blog/tags/async-work/`
- `/about/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/ai-project-management-software/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/pillar-cover.webp`
- `/blog/ai-agents-project-management-guide/`
- `/blog/multi-agent-team-one-board/`
- `/blog/clickup-alternative/`
- `/blog/motion-alternative/`
- `/blog/sunsama-alternative/`
- `/blog/mcp-server-project-management/`
- `/blog/tags/ai-project-management-software/`
- `/blog/tags/ai-agents/`
- `/blog/tags/project-management/`
- `/blog/tags/tool-comparison/`
- `/blog/tags/agent-tools/`
- `/about/`
- `/blog/ai-task-manager/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/ai-task-manager/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/demo-board.webp`
- `/blog/ai-agents-project-management-guide/`
- `/blog/clickup-alternative/`
- `/blog/todoist-alternative/`
- `/blog/ai-agent-task-management/`
- `/blog/cli-vs-mcp-ai-agent-project-data-access/`
- `/blog/async-project-management-without-notification-overload/`
- `/blog/tags/ai-task-manager/`
- `/blog/tags/task-management/`
- `/blog/tags/ai-agents/`
- `/blog/tags/tool-comparison/`
- `/blog/tags/async-work/`
- `/about/`
- `/blog/ai-project-management-software/`
- `/blog/multi-agent-team-one-board/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/ai-work-attribution-what-did-your-agents-do/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/attribution-cover.webp`
- `/blog/real-cost-of-notification-overload/`
- `/blog/how-to-reach-inbox-zero-every-day/`
- `/blog/ai-agents-project-management-guide/`
- `/images/blog/attribution-timeline.webp`
- `/blog/cli-vs-mcp-ai-agent-project-data-access/`
- `/blog/tags/ai-agents/`
- `/blog/tags/work-attribution/`
- `/blog/tags/accountability/`
- `/blog/tags/async-work/`
- `/blog/tags/project-management/`
- `/about/`
- `/blog/why-ai-agents-need-a-real-project-board/`
- `/blog/ai-project-management-software/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/akiflow-alternative/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/comparison-split.webp`
- `/blog/multi-agent-team-one-board/`
- `/blog/cli-vs-mcp-ai-agent-project-data-access/`
- `/blog/ai-agents-project-management-guide/`
- `/blog/mcp-server-project-management/`
- `/blog/tags/akiflow/`
- `/blog/tags/akiflow-alternative/`
- `/blog/tags/tool-comparison/`
- `/blog/tags/project-management/`
- `/blog/tags/ai-agents/`
- `/about/`
- `/blog/best-ai-kanban-tool/`
- `/blog/best-kanban-tool-for-mcp/`
- `/blog/clickup-vs-notion/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/asana-alternative/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/comparison-cover.webp`
- `/blog/ai-agent-task-management/`
- `/blog/async-communication-remote-teams-playbook/`
- `/blog/ai-agents-project-management-guide/`
- `/blog/clickup-alternative/`
- `/blog/notion-vs-hypertask/`
- `/blog/todoist-alternative/`
- `/blog/tags/asana/`
- `/blog/tags/tool-comparison/`
- `/blog/tags/project-management/`
- `/blog/tags/ai-agents/`
- `/blog/tags/async-work/`
- `/about/`
- `/blog/trello-alternative/`
- `/blog/jira-alternative/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/async-communication-remote-teams-playbook/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/async-playbook-cover.webp`
- `/blog/async-project-management-without-notification-overload/`
- `/blog/real-cost-of-notification-overload/`
- `/blog/how-to-reach-inbox-zero-every-day/`
- `/blog/stop-manually-updating-your-task-board/`
- `/blog/ai-agents-project-management-guide/`
- `/blog/tags/async-work/`
- `/blog/tags/remote-teams/`
- `/blog/tags/team-communication/`
- `/blog/tags/playbook/`
- `/about/`
- `/blog/why-your-team-stopped-replying-in-slack-threads/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/async-project-management-without-notification-overload/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/async-pillar-cover.webp`
- `/blog/real-cost-of-notification-overload/`
- `/blog/why-your-team-stopped-replying-in-slack-threads/`
- `/blog/async-communication-remote-teams-playbook/`
- `/blog/how-to-reach-inbox-zero-every-day/`
- `/blog/motion-alternative/`
- `/blog/from-200-notifications-to-inbox-zero-case-study/`
- `/blog/stop-manually-updating-your-task-board/`
- `/blog/ai-agents-project-management-guide/`
- `/blog/tags/async-work/`
- `/blog/tags/project-management/`
- `/blog/tags/inbox-zero/`
- `/blog/tags/remote-teams/`
- `/blog/tags/notifications/`
- `/about/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/best-ai-kanban-tool/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/best-ai-kanban-tool-cover.webp`
- `/blog/ai-agent-task-management/`
- `/blog/trello-alternative/`
- `/blog/tags/kanban/`
- `/blog/tags/tool-comparison/`
- `/blog/tags/project-management/`
- `/blog/tags/ai-agents/`
- `/about/`
- `/blog/best-kanban-tool-for-mcp/`
- `/blog/best-kanban-tool-for-ci-cd/`
- `/blog/best-kanban-tool-with-api/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/best-kanban-tool-for-ci-cd/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/best-kanban-tool-for-ci-cd-cover.webp`
- `/blog/ai-agent-task-management/`
- `/blog/cli-vs-mcp-ai-agent-project-data-access/`
- `/blog/tags/kanban/`
- `/blog/tags/ci-cd/`
- `/blog/tags/engineering/`
- `/blog/tags/github/`
- `/blog/tags/tool-comparison/`
- `/blog/tags/ai-agents/`
- `/about/`
- `/blog/best-ai-kanban-tool/`
- `/blog/best-kanban-tool-for-mcp/`
- `/blog/best-kanban-tool-with-api/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/best-kanban-tool-for-mcp/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/best-kanban-tool-for-mcp-cover.webp`
- `/blog/ai-agent-task-management/`
- `/blog/cli-vs-mcp-ai-agent-project-data-access/`
- `/blog/tags/mcp/`
- `/blog/tags/kanban/`
- `/blog/tags/tool-comparison/`
- `/blog/tags/ai-agents/`
- `/blog/tags/project-management/`
- `/about/`
- `/blog/best-ai-kanban-tool/`
- `/blog/best-kanban-tool-for-ci-cd/`
- `/blog/best-kanban-tool-with-api/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/best-kanban-tool-with-api/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/best-kanban-tool-with-api-cover.webp`
- `/blog/trello-alternative/`
- `/blog/cli-vs-mcp-ai-agent-project-data-access/`
- `/blog/tags/kanban/`
- `/blog/tags/api/`
- `/blog/tags/tool-comparison/`
- `/blog/tags/automation/`
- `/blog/tags/ai-agents/`
- `/about/`
- `/blog/best-ai-kanban-tool/`
- `/blog/best-kanban-tool-for-ci-cd/`
- `/blog/best-kanban-tool-for-mcp/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/best-notion-alternatives/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/comparison-cover.webp`
- `/blog/notion-vs-hypertask/`
- `/blog/clickup-alternative/`
- `/blog/tags/notion/`
- `/blog/tags/notion-alternatives/`
- `/blog/tags/tool-comparison/`
- `/blog/tags/knowledge-management/`
- `/blog/tags/task-management/`
- `/about/`
- `/blog/clickup-vs-notion/`
- `/blog/todoist-alternative/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/claude-code-project-board/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/tutorial-cover.webp`
- `/blog/ai-agent-task-management/`
- `/blog/cli-vs-mcp-ai-agent-project-data-access/`
- `/blog/multi-agent-team-one-board/`
- `/blog/tags/claude-code/`
- `/blog/tags/project-board/`
- `/blog/tags/mcp/`
- `/blog/tags/ai-agents/`
- `/blog/tags/task-management/`
- `/about/`
- `/blog/mcp-server-project-management/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/cli-vs-mcp-ai-agent-project-data-access/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/comparison-cover.webp`
- `/blog/ai-agents-project-management-guide/`
- `/images/blog/comparison-split.webp`
- `/blog/real-cost-of-notification-overload/`
- `/blog/why-ai-agents-need-a-real-project-board/`
- `/blog/claude-code-project-board/`
- `/blog/ai-work-attribution-what-did-your-agents-do/`
- `/blog/tags/cli/`
- `/blog/tags/mcp/`
- `/blog/tags/ai-agents/`
- `/blog/tags/comparison/`
- `/blog/tags/token-cost/`
- `/about/`
- `/blog/ai-agent-task-management/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/clickup-alternative/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/comparison-cover.webp`
- `/blog/cli-vs-mcp-ai-agent-project-data-access/`
- `/blog/async-project-management-without-notification-overload/`
- `/blog/ai-agent-task-management/`
- `/blog/ai-agents-project-management-guide/`
- `/blog/asana-alternative/`
- `/blog/linear-alternative/`
- `/blog/tags/clickup/`
- `/blog/tags/tool-comparison/`
- `/blog/tags/project-management/`
- `/blog/tags/ai-agents/`
- `/blog/tags/async-work/`
- `/about/`
- `/blog/clickup-vs-notion/`
- `/blog/trello-alternative/`
- `/blog/jira-alternative/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/clickup-vs-notion/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/comparison-cover.webp`
- `/blog/clickup-alternative/`
- `/blog/best-notion-alternatives/`
- `/blog/ai-agents-project-management-guide/`
- `/blog/tags/clickup/`
- `/blog/tags/notion/`
- `/blog/tags/tool-comparison/`
- `/blog/tags/project-management/`
- `/blog/tags/ai-agents/`
- `/about/`
- `/blog/notion-vs-hypertask/`
- `/blog/best-ai-kanban-tool/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/from-200-notifications-to-inbox-zero-case-study/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/case-study-cover.webp`
- `/blog/async-project-management-without-notification-overload/`
- `/blog/real-cost-of-notification-overload/`
- `/blog/why-your-team-stopped-replying-in-slack-threads/`
- `/blog/how-to-reach-inbox-zero-every-day/`
- `/blog/async-communication-remote-teams-playbook/`
- `/blog/ai-agents-project-management-guide/`
- `/blog/tags/case-study/`
- `/blog/tags/inbox-zero/`
- `/blog/tags/async-work/`
- `/blog/tags/social-proof/`
- `/about/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/height-alternative/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/comparison-split.webp`
- `/blog/ai-agent-task-management/`
- `/blog/linear-alternative/`
- `/blog/clickup-alternative/`
- `/blog/best-notion-alternatives/`
- `/blog/notion-vs-hypertask/`
- `/blog/cli-vs-mcp-ai-agent-project-data-access/`
- `/blog/tags/height/`
- `/blog/tags/height-alternative/`
- `/blog/tags/tool-comparison/`
- `/blog/tags/project-management/`
- `/blog/tags/ai-agents/`
- `/about/`
- `/blog/best-ai-kanban-tool/`
- `/blog/best-kanban-tool-for-mcp/`
- `/blog/clickup-vs-notion/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/how-to-reach-inbox-zero-every-day/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/inbox-zero-cover.webp`
- `/blog/real-cost-of-notification-overload/`
- `/blog/async-project-management-without-notification-overload/`
- `/blog/why-your-team-stopped-replying-in-slack-threads/`
- `/blog/stop-manually-updating-your-task-board/`
- `/blog/ai-agents-project-management-guide/`
- `/blog/from-200-notifications-to-inbox-zero-case-study/`
- `/blog/tags/inbox-zero/`
- `/blog/tags/async-work/`
- `/blog/tags/productivity/`
- `/blog/tags/team-communication/`
- `/about/`
- `/blog/async-communication-remote-teams-playbook/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/jira-alternative/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/comparison-cover.webp`
- `/blog/ai-agent-task-management/`
- `/blog/cli-vs-mcp-ai-agent-project-data-access/`
- `/blog/async-project-management-without-notification-overload/`
- `/blog/ai-agents-project-management-guide/`
- `/blog/linear-alternative/`
- `/blog/asana-alternative/`
- `/blog/tags/jira/`
- `/blog/tags/tool-comparison/`
- `/blog/tags/project-management/`
- `/blog/tags/ai-agents/`
- `/blog/tags/async-work/`
- `/about/`
- `/blog/linear-vs-jira/`
- `/blog/trello-alternative/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/linear-alternative/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/comparison-cover.webp`
- `/blog/cli-vs-mcp-ai-agent-project-data-access/`
- `/blog/ai-agent-task-management/`
- `/blog/ai-agents-project-management-guide/`
- `/blog/jira-alternative/`
- `/blog/height-alternative/`
- `/blog/tags/linear/`
- `/blog/tags/tool-comparison/`
- `/blog/tags/project-management/`
- `/blog/tags/ai-agents/`
- `/blog/tags/async-work/`
- `/about/`
- `/blog/linear-vs-jira/`
- `/blog/trello-alternative/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/linear-vs-jira/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/comparison-cover.webp`
- `/blog/linear-alternative/`
- `/blog/jira-alternative/`
- `/blog/mcp-server-project-management/`
- `/blog/cli-vs-mcp-ai-agent-project-data-access/`
- `/blog/tags/linear/`
- `/blog/tags/jira/`
- `/blog/tags/tool-comparison/`
- `/blog/tags/project-management/`
- `/blog/tags/ai-agents/`
- `/about/`
- `/blog/best-ai-kanban-tool/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/mcp-server-project-management/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/pillar-cover.webp`
- `/blog/ai-agent-task-management/`
- `/blog/ai-agents-project-management-guide/`
- `/blog/cli-vs-mcp-ai-agent-project-data-access/`
- `/blog/tags/mcp/`
- `/blog/tags/project-management/`
- `/blog/tags/ai-agents/`
- `/blog/tags/task-management/`
- `/blog/tags/agent-tools/`
- `/about/`
- `/blog/ai-project-management-software/`
- `/blog/claude-code-project-board/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/monday-alternative/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/comparison-cover.webp`
- `/blog/ai-agent-task-management/`
- `/blog/cli-vs-mcp-ai-agent-project-data-access/`
- `/blog/clickup-alternative/`
- `/blog/async-communication-remote-teams-playbook/`
- `/blog/ai-agents-project-management-guide/`
- `/blog/trello-alternative/`
- `/blog/asana-alternative/`
- `/blog/tags/mondaycom/`
- `/blog/tags/tool-comparison/`
- `/blog/tags/work-management/`
- `/blog/tags/ai-agents/`
- `/blog/tags/async-work/`
- `/about/`
- `/blog/jira-alternative/`
- `/blog/todoist-alternative/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/motion-alternative/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/comparison-cover.webp`
- `/blog/ai-agents-project-management-guide/`
- `/blog/async-project-management-without-notification-overload/`
- `/blog/ai-agent-task-management/`
- `/blog/tags/motion/`
- `/blog/tags/tool-comparison/`
- `/blog/tags/project-management/`
- `/blog/tags/ai-agents/`
- `/blog/tags/async-work/`
- `/about/`
- `/blog/trello-alternative/`
- `/blog/jira-alternative/`
- `/blog/asana-alternative/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/multi-agent-team-one-board/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/pillar-multi-agent.webp`
- `/blog/ai-agents-project-management-guide/`
- `/blog/cli-vs-mcp-ai-agent-project-data-access/`
- `/blog/tags/multi-agent/`
- `/blog/tags/ai-agents/`
- `/blog/tags/project-board/`
- `/blog/tags/orchestration/`
- `/blog/tags/async-work/`
- `/about/`
- `/blog/ai-task-manager/`
- `/blog/claude-code-project-board/`
- `/blog/ai-agent-task-management/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/notion-vs-hypertask/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/notion-vs-hypertask-cover.webp`
- `/blog/stop-manually-updating-your-task-board/`
- `/blog/how-to-reach-inbox-zero-every-day/`
- `/blog/cli-vs-mcp-ai-agent-project-data-access/`
- `/blog/ai-agents-project-management-guide/`
- `/blog/clickup-alternative/`
- `/blog/asana-alternative/`
- `/blog/best-notion-alternatives/`
- `/blog/tags/notion/`
- `/blog/tags/tool-comparison/`
- `/blog/tags/project-management/`
- `/blog/tags/ai-agents/`
- `/about/`
- `/blog/clickup-vs-notion/`
- `/blog/best-ai-kanban-tool/`
- `/blog/best-kanban-tool-for-mcp/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/real-cost-of-notification-overload/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/notification-cost-cover.webp`
- `/blog/async-communication-remote-teams-playbook/`
- `/blog/why-your-team-stopped-replying-in-slack-threads/`
- `/blog/async-project-management-without-notification-overload/`
- `/blog/how-to-reach-inbox-zero-every-day/`
- `/blog/stop-manually-updating-your-task-board/`
- `/blog/ai-agents-project-management-guide/`
- `/blog/tags/notifications/`
- `/blog/tags/context-switching/`
- `/blog/tags/async-work/`
- `/blog/tags/productivity/`
- `/about/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/reclaim-ai-alternative/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/comparison-split.webp`
- `/blog/motion-alternative/`
- `/blog/sunsama-alternative/`
- `/blog/akiflow-alternative/`
- `/blog/multi-agent-team-one-board/`
- `/blog/ai-agents-project-management-guide/`
- `/blog/tags/reclaim-ai/`
- `/blog/tags/reclaim-ai-alternative/`
- `/blog/tags/tool-comparison/`
- `/blog/tags/calendar/`
- `/blog/tags/ai-agents/`
- `/about/`
- `/blog/best-ai-kanban-tool/`
- `/blog/best-kanban-tool-for-ci-cd/`
- `/blog/best-kanban-tool-for-mcp/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/stop-manually-updating-your-task-board/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/ai-triage-cover.webp`
- `/blog/why-your-team-stopped-replying-in-slack-threads/`
- `/blog/real-cost-of-notification-overload/`
- `/blog/async-project-management-without-notification-overload/`
- `/blog/how-to-reach-inbox-zero-every-day/`
- `/blog/ai-agents-project-management-guide/`
- `/blog/ai-work-attribution-what-did-your-agents-do/`
- `/blog/cli-vs-mcp-ai-agent-project-data-access/`
- `/blog/from-200-notifications-to-inbox-zero-case-study/`
- `/blog/async-communication-remote-teams-playbook/`
- `/blog/tags/automation/`
- `/blog/tags/ai-triage/`
- `/blog/tags/inbox-zero/`
- `/blog/tags/project-management/`
- `/about/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/sunsama-alternative/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/comparison-cover.webp`
- `/blog/ai-agent-task-management/`
- `/blog/ai-agents-project-management-guide/`
- `/blog/mcp-server-project-management/`
- `/blog/tags/sunsama/`
- `/blog/tags/sunsama-alternative/`
- `/blog/tags/tool-comparison/`
- `/blog/tags/project-management/`
- `/blog/tags/ai-agents/`
- `/about/`
- `/blog/best-ai-kanban-tool/`
- `/blog/best-kanban-tool-for-mcp/`
- `/blog/clickup-vs-notion/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/todoist-alternative/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/comparison-cover.webp`
- `/blog/ai-agent-task-management/`
- `/blog/cli-vs-mcp-ai-agent-project-data-access/`
- `/blog/async-communication-remote-teams-playbook/`
- `/blog/ai-agents-project-management-guide/`
- `/blog/asana-alternative/`
- `/blog/jira-alternative/`
- `/blog/tags/todoist/`
- `/blog/tags/tool-comparison/`
- `/blog/tags/task-management/`
- `/blog/tags/ai-agents/`
- `/blog/tags/async-work/`
- `/about/`
- `/blog/monday-alternative/`
- `/blog/trello-alternative/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/trello-alternative/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/comparison-cover.webp`
- `/blog/ai-agent-task-management/`
- `/blog/cli-vs-mcp-ai-agent-project-data-access/`
- `/blog/async-project-management-without-notification-overload/`
- `/blog/ai-agents-project-management-guide/`
- `/blog/monday-alternative/`
- `/blog/todoist-alternative/`
- `/blog/tags/trello/`
- `/blog/tags/tool-comparison/`
- `/blog/tags/project-management/`
- `/blog/tags/ai-agents/`
- `/blog/tags/async-work/`
- `/about/`
- `/blog/jira-alternative/`
- `/blog/asana-alternative/`
- `/blog/clickup-alternative/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/why-agents-build-whole-boards/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/feature-create-board.webp`
- `/blog/ai-work-attribution-what-did-your-agents-do/`
- `/blog/ai-agents-project-management-guide/`
- `/blog/cli-vs-mcp-ai-agent-project-data-access/`
- `/blog/why-ai-agents-need-a-real-project-board/`
- `/blog/tags/ai-agents/`
- `/blog/tags/mcp/`
- `/blog/tags/project-management/`
- `/blog/tags/board-generation/`
- `/blog/tags/agent-autonomy/`
- `/about/`
- `/blog/mcp-server-project-management/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/why-ai-agents-need-a-real-project-board/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/tutorial-cover.webp`
- `/blog/why-your-team-stopped-replying-in-slack-threads/`
- `/images/blog/demo-task-comments.webp`
- `/blog/ai-agents-project-management-guide/`
- `/blog/real-cost-of-notification-overload/`
- `/blog/cli-vs-mcp-ai-agent-project-data-access/`
- `/blog/ai-work-attribution-what-did-your-agents-do/`
- `/blog/why-agents-build-whole-boards/`
- `/blog/tags/ai-agents/`
- `/blog/tags/project-management/`
- `/blog/tags/mcp/`
- `/blog/tags/agent-workflows/`
- `/blog/tags/async-work/`
- `/about/`
- `/blog/mcp-server-project-management/`
- `/blog/ai-agent-task-management/`
- `/privacy/`
- `/contact/`
- `/terms/`

### `blog/why-your-team-stopped-replying-in-slack-threads/index.html`

- `/`
- `/Favicon%20-%20Light.png`
- `/pricing/`
- `/blog/`
- `/images/blog/slack-threads-cover.webp`
- `/blog/async-communication-remote-teams-playbook/`
- `/blog/real-cost-of-notification-overload/`
- `/blog/async-project-management-without-notification-overload/`
- `/blog/ai-agents-project-management-guide/`
- `/blog/how-to-reach-inbox-zero-every-day/`
- `/blog/tags/slack/`
- `/blog/tags/team-communication/`
- `/blog/tags/async-work/`
- `/blog/tags/project-management/`
- `/about/`
- `/privacy/`
- `/contact/`
- `/terms/`
