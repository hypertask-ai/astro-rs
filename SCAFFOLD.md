# hypertask.ai migration scaffold

Ticket: https://app.hypertask.ai/detail/project-15/9130 Parent: https://app.hypertask.ai/detail/project-15/9124 Source template: https://github.com/joelhooks/rat-stack/tree/10152920820e717f889628d4c4793fd38967dbd5

This private repository is the replacement site's workspace. Nothing here changes the existing hypertask.ai domain, Cloudflare Pages deployment, or visitor experience. Domain adoption, publishing and cutover belong to later tickets.

## Keep or cut

| Cut | Reason |
| --- | --- |
| `apps/cli` and npm publishing | This marketing site has no command-line product. |
| `apps/site` and its content-generation pipeline | Rat Stack's teaching site, agent sandbox and workshop are not the marketing site. The Foldkit entry now renders independently, without importing that backend or its reader. |
| Cafe, tube, motion and docs demos | None are marketing pages. A minimal private home scaffold replaces their routes and clients. |
| Auth and database cartridges | The parent inventory has no owned accounts or database. |
| Flags, events and Basin cartridges | These are Rat Stack's own infrastructure, not this site's existing Fathom integration. Analytics has its own migration ticket. |
| Crash, devtools, motion, learn and lore cartridges | These serve removed demo interfaces, not the marketing site. |
| Intake and subscriber delivery cartridges | The site links to the existing app for signup; it does not operate Rat Stack's mailing list. |
| Code snippets and teaching cards | The teaching content pipeline is removed. Its executable database examples would otherwise import deleted packages. |
| Turbo cache, deploy and check-harness cartridges | The template's cloud cache and release operator are not this site's release configuration. The later publishing slice owns deployment automation. |

Fence tests for cut packages are cut with them, one reason each. The lint rules themselves stay unchanged.

| Cut test | Reason |
| --- | --- |
| Code-snippets and Shiki build-only, shared Basin independence, events seam (3 boundary tests) | They resolve `@rat-stack/code-snippets`, `events` and `basin` through package folders that no longer exist. |
| Devtools in production, devtools distribution paths, dev client browser code (3 boundary tests) | They import the removed `devtools` and `auth` packages. |
| Learn card snippets test | The `.brain/data/learn-cards` folder is cut. |
| Content task cache test | It checks cache keys of the removed `apps/site` content reader. |

Keep `apps/web`, `apps/infra`, `packages/core` and `packages/capability`. Keep exact retained pins, strict compiler settings, lint rules, formatter configuration, anti-slop rules, hooks and the complete CI check/test/build command. The lint plugin imports its audited regex policy from the retained scripts folder.

Project-law and package-scope replacement belongs to HTPR-9140. Infrastructure adoption is HTPR-9131. Do not run deployment commands before those steps.

## Verification

Build and test only on GitHub-hosted runners. CI runs `pnpm turbo run check test build --concurrency=2` after a frozen install. No checks are disabled for this cut.

The build measurement counts every JavaScript module under `apps/web/dist/server`, not browser assets or only the largest module. It reports aggregate raw bytes and the sum of individually gzipped modules for reference. This is a conservative server-output measurement, not a live Alchemy upload receipt. Public images and videos are static assets and are not counted as Worker code.

Cloudflare's limit page, read on 2026-11-13, specifies 64 MiB uncompressed for both Free and Paid and no compressed-size limit: https://developers.cloudflare.com/workers/platform/limits/#worker-size. CI refuses an empty server output and a server total above 67,108,864 bytes. Deployment-time CPU and startup limits must still be verified during the later preview/cutover steps.
