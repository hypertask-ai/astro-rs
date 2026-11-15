# Agent instructions

For a non-trivial task, start with `skills/rat-stack-mode`.

This file is the repo law for agents and contributors. It holds commands, validation rules, architecture constraints, and project stop rules. Read `VISION.md` for intent before planning substantial work. `VISION.md` does not override this file. Pi sessions also load `.pi/APPEND_SYSTEM.md` and the repo-local extension `.pi/extensions/project.ts`.

## Stack contract

Workspace `package.json` files declare the pinned stack. [README.md](./README.md#what-is-in-the-stack) summarizes it. Keep dependencies exact. Repo-local config wins. Record drift instead of silently migrating the project.

- pnpm workspaces + Turborepo (`apps/*`, `packages/*`)
- Node `>=24.18.0` and pnpm `11.3.0`; do not replace pnpm with Bun or npm for installs
- Effect `4.1.2` and `@effect/platform-node` `4.1.2`. Foldkit `0.170.0` peers on `effect ~4.1.0`, so no peer allowances or patches remain. Every Effect package resolves to one runtime. Crypto lives in `effect/crypto/*`: `SecureRandom` and `Digest` replace the removed `effect/Crypto`, and `NodeServices` no longer provides them.
- XState `6.0.0-beta.1` for finite lifecycles, retries, cancellation, and resumability
- `@xstate/effect` `1.0.0-beta.0` bridges the two: machines run as scoped Effects via `createEffectActor`, side effects are declared `createEffectLogic` actors. `vendor/README.md` keeps the rules for the next unpublished pin
- Foldkit `0.170.0` with `@foldkit/ui` and `@foldkit/devtools` `0.170.0`, `@foldkit/markdown` `0.15.0`, and `@foldkit/vite-plugin` `0.29.0` for the web UI, server-rendered and prerendered by default
- Alchemy `2.0.0-beta.85` with the `@alchemy.run/cloudflare`, `@alchemy.run/drizzle`, and `@alchemy.run/sql` providers (Infrastructure as Effects) for every cloud resource; declared in `apps/infra/alchemy.run.ts`, authenticated through Alchemy profiles, never through env vars in this repo. `@alchemy.run/test` `2.0.0-beta.85` runs the Worker runtime tests
- TypeScript `7.0.2` in strict mode, patched by `@effect/tsgo` `0.67.5` in `prepare` so the Effect language service diagnostics in `tsconfig.base.json` fail `tsc`, not just the editor. Escape hatch for a real boundary: `// @effect-diagnostics-next-line <rule>:off` with a reason
- `@yielded/effect-tsrs` `0.2.3` runs `typecheck` and `check` with `diagnostics --project tsconfig.json --strict --type-check`. `--type-check` includes ordinary TypeScript diagnostics; `--strict` makes Effect warnings fail. It bundles tsrs revision `8f135f106a63`, contained in plain tsrs `0.20.0`. Keep `ignoreEffectWarningsInTscExitCode` false. Patched TypeScript `7.0.2` with `@effect/tsgo` `0.67.5` runs through `typecheck:tsc` and `typecheck:parity` at the switch and on checker bumps (`pnpm bump:checkers`), not on every CI run. Report any checker disagreement.
- Plain tsrs `0.23.0-ts7.1.0-beta` stays in `typecheck:fast`, targeting TypeScript `7.1.0-beta`. It still has no Effect diagnostics; use `typecheck` or `check` for those.
- `@effect/vitest` `4.1.2` for every Effect test: `it.effect` and `it.layer(layer)`; `Effect.run*` and `ManagedRuntime.make` in test files are a lint error
- `@oxlint/plugins` `1.92.0` for the two typed lint rules in `scripts/oxlint-plugin-*.ts` and the vendored [anti-slop](https://github.com/dmmulroy/anti-slop) rules in `tools/oxlint/anti-slop/` (all generic rules plus the Effect group, at `error`). The copy is ours; `UPSTREAM.md` there says where it came from and how to take upstream fixes
- Oxlint `1.92.0` with Ultracite `8.1.1`, Oxfmt `0.77.0`, and Turborepo `2.11.10`
- varlock `1.24.0`: declare every env var in `.env.schema`, never read `.env.local` directly, run `pnpm env:check` after schema edits

The base Effect plugin owns diagnostic severity. Child configs may add exact `allowedUnstableApis` only for modules warned about in that scope. Do not use subtree prefixes, copy severity maps, or set `ignoreEffectWarningsInTscExitCode` to true.

## Packages

- **`@hypertask-site/capability`**:
  - Path: `packages/capability`
  - Role: `defineContract`, `implement`, and the `toCommand`, `toHttpApi`, `toToolkit`, `toRpc`, and `toCodeMode` projections
- **`@hypertask-site/core`**:
  - Path: `packages/core`
  - Role: Shared contracts, handlers, and lifecycle machines kept for the marketing site
- **`@hypertask-site/web`**:
  - Path: `apps/web`
  - Role: Foldkit site on Vite, deployed through Alchemy's `Cloudflare.Website.Foldkit` as `Website` (`apps/web/src/website.ts`). One home shell until the real pages move. Include it with `const website = yield* Website;`
- **`@hypertask-site/infra`**:
  - Path: `apps/infra`
  - Role: Alchemy Stack for this site. It declares the Website Worker and its own state store. It does not adopt ratstack.sh

Cut from the template, each because this site does not use it: `apps/cli` (no CLI), `apps/site` (Joel's content worker; the marketing site is `apps/web`), `packages/auth`, `packages/database`, `packages/flags`, `packages/events`, `packages/basin`, `packages/crash`, `packages/devtools`, `packages/motion`, `packages/learn`, `packages/lore`, `packages/intake-live`, `packages/subscriber-delivery`, `packages/code-snippets`, `packages/turbo-cache`, `packages/deploy`, and `packages/check-harness`. Demo screens `cafe`, `tube`, `motion`, and `docs` went with `apps/web`’s old reader.

## Nouns

- **Contract**:
  - Home: `packages/core/src/contracts.ts`
  - Runtime job: Shared name, schemas, failure, annotations, and approval setting.
- **Capability**:
  - Home: `packages/core/src/inspect-file.ts`
  - Runtime job: Binds one contract to its server-side handler with `implement`.
- **Projection**:
  - Home: `packages/capability/src/to-<surface>.ts`
  - Runtime job: Expose implemented capabilities on one runtime surface.
- **Cartridge**:
  - Home: `packages/<name>/src/`
  - Runtime job: One Layer with its own infrastructure; it must pass the cartridge test in `VISION.md`.
- **Machine**:
  - Home: `packages/core/src/<name>-machine.ts`
  - Runtime job: Own one finite domain lifecycle.
- **Feature**:
  - Home: `apps/web/src/features/<name>/`
  - Runtime job: Thin route and view that read the Model and send Messages.
- **System page**:
  - Home: `.brain/areas/<name>.svx`
  - Runtime job: Public page at `/systems/<name>` for one system rat-stack ships: what it does, the standard it keeps, and how to check it. The content build rejects a system page without those three sections or outside `.brain/areas/`.
- **Client**:
  - Home: `apps/web/src/client/<name>/`
  - Runtime job: Own the Foldkit program's Model, Messages, update, and named Commands; Commands call an `RpcClient` over the contract group.

## Commands

- **`pnpm install`**: Install workspace dependencies
- **`pnpm sources:fetch`**: No teaching excerpts remain, so this prints that and exits. The CI step stays.
- **`pnpm dev`**: Run `apps/web` under `vite dev` through portless at `http://hypertask-site.localhost:1355` (worktrees get their own prefix); `portless list` shows the route
- **`pnpm check`**: Typecheck, verify formatting, and run type-aware linting
- **`pnpm lint`**: Type-aware lint plus format check only; `turbo run check` runs this once at the root as `//#lint`
- **`pnpm fix`**: Apply Oxfmt and safe Oxlint fixes
- **`pnpm test`**: Build and run the Vitest suite once
- **`pnpm build`**: Compile package outputs
- **`pnpm typecheck`**: Strict effect-tsrs checks for workspaces and root scripts
- **`pnpm typecheck:tsc`**: Patched `tsc` for workspaces and root scripts; runs at checker bumps, not in CI
- **`pnpm typecheck:fast`**: Fast feedback in seconds; no Effect diagnostics; `pnpm check` is still the gate
- **`pnpm typecheck:parity`**: Compare effect-tsrs and patched `tsc` errors and exit verdicts, including `TS377xxx`; also compare plain tsrs with Effect-only codes excluded
- **`pnpm bump:checkers`**: Bump both checker pins to npm latest, install without scripts, report bundled revision alignment, and run both parity pairs; never commit or push
- **`pnpm vendor:agent-sources`**: Shallow-clone Effect, effect-solutions, xstate, alchemy, better-auth, and Foldkit mirrors
- **`pnpm infra:plan`**: Preview the Alchemy Stack diff without applying
- **`pnpm infra:deploy` / `pnpm infra:destroy`**: Apply or tear down the Stack (asks for approval)
- **`pnpm exec lefthook install`**: Install git hooks (also via `prepare`)
- **`pnpm turbo run check test build`**: Required validation before claiming a change is ready

Run `pnpm fix` only when you intend to rewrite files. Finish with `pnpm turbo run check test build`.

## Deploy

Follow [ship](/skills/ship) and `skills/ship/references/project.md` for deployment commands, approval, checks, and recovery.

## Fence (cheating is uncomfortable)

Why lives in `AGENTS.md` / `VISION.md`. The stack and hooks are the enforceable fence. Fence wins over prose.

- Lefthook pre-commit runs `pnpm check` and `pnpm test`. `check` runs strict effect-tsrs; floating Effects and warning-level Effect diagnostics fail. CI type-checks through `check` only.
- Agents must not use `git … --no-verify` (or equivalent hook bypass)
- Blocked by: Pi `.pi/extensions/git-interceptor`, Cursor `.cursor/hooks.json`, Claude Code `.claude/settings.json`
- Policy source: `scripts/vcs-command-policy.js`

If a hook fails, fix the failure. Do not disable the fence.

## Source-first Effect / XState work

Before writing, reviewing, or refactoring Effect or XState code, read the installed Effect package's `AGENTS.md` first, for example `packages/core/node_modules/effect/AGENTS.md`. It ships with the installed version, so it is never stale. Then inspect vendored source for the pinned versions. Populate mirrors:

```sh
pnpm vendor:agent-sources
# or
./scripts/vendor-agent-sources.sh --refresh
```

Inventory: `.agent_sources/README.md` is generated in the local source mirror and is not part of this repository.

- **Effect Schema, Context.Service, CLI**: `.agent_sources/github.com/Effect-TS/effect/`
- **Idiomatic Effect**: `.agent_sources/github.com/kitlangton/effect-solutions/`
- **XState**: `.agent_sources/github.com/statelyai/xstate/`
- **`@xstate/effect` (v6 Effect bridge)**: `.agent_sources/github.com/statelyai/xstate/packages/xstate-effect/` (`README.md`, `docs/`, `src/*.test.ts`)
- **Alchemy resources, Cloudflare, AWS**: `.agent_sources/github.com/alchemy-run/alchemy/` and https://alchemy.run/llms.txt

Refs are derived from the workspace pins, so bumping a package and re-running the script keeps them matched. The `pi-effect` tool reads the Effect mirror in place; it needs no link.

Mirrors are reference material, not runtime dependencies. Exclude them from typecheck, test, lint, and format. Do not vendor product-specific corpora in this template.

## Source control

Preserve existing work. Inspect status before editing, stage only files changed for the current task, and do not commit generated output, secrets, or populated `.agent_sources/github.com/` trees. Use the repository's existing source-control tool; do not initialize or migrate one without approval. Never pass `--no-verify` to git.

`.shitrat/public-allow.json` tells the ShitRat public-push guard that `.brain/` is public content. It holds the template's reference notes, not site content, and this repository is private. Narrow or delete the file the day `.brain` holds anything that isn't meant to be public.

## Project law

Product rules for the hypertask.ai marketing site. The fence rules below are enforced by lint and hooks and stay exactly as the template ships them. Product intent lives in `VISION.md`.

- Same address, same pages, same links, same look. The 38 blog addresses, the sitemap, the feed, the redirects and the install scripts are a public contract with search engines and installers. A change that moves or drops one is a bug, not a cleanup.
- The site keeps its own look. Colours, sizes, fonts and corners come from the old site and arrive in the page-frame step (HTPR-9139). Never copy Rat Stack's look, and never invent a value. The 2px and 4px corner rule belongs to app.hypertask.ai, not to this site.
- No database, no sign-in, no timed jobs, no visitor accounts. If a change needs one, stop and ask at rung 3.
- Screens are Foldkit with StyleX styles. No React, no Tailwind, no UI kit, no chart library. Anything Rat Stack does not use stays out.
- Blog posts are Foldkit markdown, prerendered. A post's address is its file path and never changes after publishing.
- Feed, sitemap and crawler files are capabilities on contracts, never hand-written routes. Redirects and security headers live in the Website Worker's server rules.
- Install scripts are static files served byte for byte. Never rewrite, reformat or re-encode them.
- Cookie choices are an XState machine started under `createEffectActor`. No analytics tag loads before its choice is stored.
- Fathom and the Sign up click are a Foldkit command. Analytics relays are an Effect HTTP client behind a capability.
- Fonts and media are self-hosted files. No outside font or script tag without a written owner and reason in the ticket that adds it. The help chat script is the one kept outside script, with its reason on HTPR-9124.
- Nothing is built or tested on our servers. Build, check, test and publish run only in GitHub-hosted Actions. Publishing happens on every merge to `main`.
- One contract, every surface. Define schemas and metadata with `defineContract`; bind a server-side handler with `implement` and add the capability to `capabilities`. Do not add a route or tool handler that bypasses a capability.
- Schemas are the contract. Input, output and failure are Effect `Schema`; derived documents are never hand-written.
- Lifecycles are machines. Finite modes, retries and cancellation live in XState machines started with `createEffectActor`; side effects live in declared `createEffectLogic` actors, never inline.
- Gardener rule: add a lint rule before cleaning up a bad pattern; lint baselines only shrink. Before replacing a design, run `skills/uncomplect`.
- Tautological tests considered harmful.
- Change-detector tests considered harmful.
- Do not create regression tests for bug fixes without a genuine gap in behavior testing.
- Prefer property and model tests over example tests. A domain rule is an `it.prop` over Effect `Arbitrary` inputs; anything with history is a model checked over generated command sequences. Keep example tests for seams. Plant a bug before trusting a new property: it must fail.
- Errors are part of the interface. Name the failure, keep its source context, say how to fix it, and fail at the boundary. Fence messages read `<what>. <why>. Fix: <step>`, and the step names a command, file, or replacement in a code span; `packages/core/test/fixtures/fence-message.ts` is the grammar the fence-message tests check.
- No comments in code. `no-comments/no-comments` (`scripts/oxlint-plugin-no-comments.ts`) bans them, after Lauren Tan's Dune rule: agents copy comments, and a comment that explains a workaround spreads the workaround. Say it in a name, a type, a test, a commit message, or the Brain. Two kinds survive: tool directives, with the reason inline after `--`, and a one-line `SAFETY:` invariant above a type assertion. TypeScript's `@ts-expect-error`, `@ts-ignore`, and `@ts-nocheck` count as directives here; `typescript/ban-ts-comment` decides which may stay, so write `// @ts-expect-error -- <reason>`. `--fix` deletes prose, so move anything a comment knows into a name, a test, the commit, or the Brain before running it. Plain JS files keep JSDoc blocks made only of type tags. Credit for borrowed code lives in `PROVENANCE.md`.
- Diagnostic overrides are targeted and explained: `// @effect-diagnostics-next-line <rule>:off -- <reason>`. File-level overrides exist only at projection boundaries (`packages/capability/src/to-toolkit.ts`, `packages/capability/src/to-code-mode.ts`, `packages/capability/src/to-rpc.ts`) and in process-spawning test files.
- Lint overrides follow the same rule: `// oxlint-disable-next-line <rule> -- <reason>`. Every type assertion carries a one-line `SAFETY:` comment naming the invariant it relies on. `no-comments/directive-reason` fails any `oxlint-disable*` or `eslint-disable*` comment without text after `--`.
- Pins stay exact. A vendored dependency carries a matching `minimumReleaseAgeExclude` entry and a removal rule in `vendor/README.md`.

## Architecture

A child project replaces this section on day one with its own architecture. Record module boundaries, dependency direction, data ownership, and state-machine seams here. Link deeper docs instead of duplicating them.

- `rat-stack-boundaries/no-core-adapters` keeps provider adapters out of core. Core owns job-shaped ports; adapter packages implement them, and apps provide them at composition. `packages/subscriber-delivery` implements subscriber intake and confirmation; `packages/core/test/boundaries-rule.test.ts` checks the boundary.
- `rat-stack-boundaries/no-cross-layer-imports` enforces dependency direction: `apps/cli` → `packages/core` → `packages/capability` → Effect/XState. Packages do not import apps; `packages/capability` does not import domain code; `apps/infra` owns its Stack wiring. `core` owns shared contracts and the `inspectFile` handler; each capability's owner keeps its handler beside its data or infrastructure. Core depends on `capability` for `defineContract` and `implement`.
- `rat-stack-boundaries/no-browser-server-imports` applies to `apps/*/src/features/**` and `apps/*/src/client/**`. Browser modules may import only `@hypertask-site/core/contracts` and `@hypertask-site/capability/rpc-group` from these packages; they cannot import handler modules. `rat-stack-boundaries/no-feature-transport` applies to `apps/*/src/features/**`.
- `rat-stack-boundaries/no-hand-rolled-surface` keeps `Rpc.make`, `RpcGroup.make`, `HttpApi*`, `Tool.make`, and `Toolkit.make` inside `packages/capability`; everything else projects contracts. `rat-stack-boundaries/no-browser-globals-on-server` keeps `window`, `document`, `navigator`, and web storage in `apps/*/src/client/**` and `apps/*/src/features/**`.
- `rat-stack-patterns` (`scripts/oxlint-plugin-patterns.ts`): `contract-binding-matches-name` (`const searchContract = defineContract("search", …)`), `no-module-level-mutable-state` (module `let`/`var` in `apps/*/src` and `packages/*/src` leaks across Worker requests), and `acquire-release-constructs-in-acquire-body` (build pools inside acquire, not before).
- `packages/core/src/file-inspector.ts` is the reference service shape: a `Context.Service` class whose `make` captures its dependencies so its methods carry no requirements, with `static layer` beside it. `packages/core/src/config-service.ts` derives a service from Effect `Config` (production `layer` reads the ConfigProvider, `configLayer` takes parsed values for tests); `AppConfig` is the instance and mirrors `.env.schema`.
- `packages/core/src/inspect-machine.ts` is the reference shape for a lifecycle: the machine owns states, declared `createEffectLogic` actors own side effects and typed failures, `join` plus `Effect.orDie` hands the outcome back to Effect. `packages/core/src/contracts.ts` owns `inspectFileContract`; `packages/core/src/inspect-file.ts` implements it and registers the capability.
- Effect-backed machines start only under `createEffectActor`, never `createActor`. Only actions and actors declared in `setupEffect` contribute to the actor's requirements; the `xstate-effect/no-inline-effect` lint rule enforces the inline cases.
- `packages/capability/src`: `contract.ts` defines shared contracts; `implement.ts` binds typed handlers and adds approval requirements; `to-command.ts`, `to-http-api.ts`, `to-toolkit.ts`, `to-rpc.ts`, and `to-code-mode.ts` project implemented capabilities. `to-rpc-group.ts` builds the contract-only client group; `to-rpc.ts` derives the server group from those same contracts. `catalog.ts`, `sandbox-service.ts`, and `sandbox-subprocess.ts` support code mode. `to-code-mode.ts` imports from `to-toolkit.ts`, so MCP is a prerequisite for code mode.
- Devtools are capabilities: `devtools(capabilities)` adds the `rat_*` capabilities, and a dev composition provides the recording layer from `devtoolsLayer()` through `CallWatch` (`@hypertask-site/capability/call-watch`). `implement` reads that ambient reference once per call and surrounds the approval-gated handler, so denied calls are recorded too; the default is a no-op. `CallWatch` observes calls across projections without changing their capability lists. `aroundHandlers` stays as the explicit wrapper over one capability list: drovr uses it for `writeGate` to serialize and audit approval-gated writes. Both compose because `implement` reads `CallWatch` inside the handler that `aroundHandlers` wraps; the gate runs outside the recorder. `rat_call` dispatches through `invokerFor`, the same path code mode uses. Machines report through `watchActor` (`@hypertask-site/capability/actor-watch`), a no-op `ActorWatch` reference that the recorder overrides; `rat-stack-patterns/watch-effect-actors` requires the call. `devtools(capabilities, { runAs })` records each call's identity and lets `rat_call` take `as`; the composition root passes `runAsPerson` from `@hypertask-site/auth/devtools`, so devtools never imports auth. `rat-stack-boundaries/no-devtools-in-production` keeps `@hypertask-site/devtools` and `@hypertask-site/auth/devtools` in `apps/*/src/dev/**`, `apps/cli`, and tests, and keeps everything outside an app's `dev/` folder from importing it, so a deployed entry cannot reach `rat_call` or test people. `--devtools` binds `127.0.0.1` only. Plan and tool list: `.brain/archives/projects/rat-devtools.svx`.
- `apps/cli/src/surfaces.ts` and `apps/cli/src/learn-surfaces.ts` are the only places projections are instantiated; `learn-surfaces.ts` stays devtools-free because the published `ratstack` bin imports it. `apps/cli/src/command.ts` maps them to subcommands; `apps/cli/src/cli.ts` is the composition root that provides `FileInspector` and `NodeServices`, and `apps/cli/src/ratstack.ts` is the composition root for the `ratstack` bin. Both share `learn-layer.ts`.
- The [README's Keep or cut section](./README.md#keep-or-cut) lists what to delete per surface.

## Wiki writing

Follow [write-a-wiki-page](/skills/write-a-wiki-page) for prose, visuals, code excerpts, and content-build diagnostics.

## Web feature blueprint

`apps/web/src/features/<name>/` holds a thin route and view. It reads the Model and sends Messages; components never handle transport, retries, or process startup. `apps/web/src/client/<name>/` owns the Foldkit program: Model, Messages, `update`, and named `Command.define` definitions. Remote state lives in the Model, as Foldkit `AsyncData` or a `foldkit/experimental` `Query`. The capability in `packages/core` is the shared typed edge, imported by both sides. A cartridge owns durable behavior.

One send follows one path: feature → Message → `update` → named Command → `RpcClient` over the contract's `toRpcGroup` → shared capability → server-side Durable Object or database cartridge. The server stays authoritative. The Command returns a result Message, and `update` folds it into the Model.

## Worker autonomy ladder

A worker acts at the lowest rung that applies. Climb only when the rung below does not cover the step.

- **0 — Do it**: Fix your own red CI, failing hook, or stale git snapshot. Arm a wait watch. Read, edit, and test inside your write scope.
- **1 — Do it and report**: Commit on your branch. Tighten a test. Edit docs or the Brain. Report what changed and which checks ran.
- **2 — Ask the desk or owner**: A choice that changes scope, a guarantee, or the design, where the repo does not decide.
- **3 — Owner sign-off**: Everything in "Needs owner sign-off" below.
- **Never — Do not do this**: `--no-verify` or any hook bypass. Merging or deploying as a worker. Force-pushing. Secrets or customer data in a PR.

At rung 2 or 3, ask one question with a recommendation. Keep doing independent work while you wait. Red CI is work, not a question: reproduce it, fix it, and push.

Never end a turn "waiting" without a wake. Procedure: `skills/rat-stack-mode/principles/own-your-wait.md`.

## Boundaries and sign-off

- Safe by default: new or tightened tests; a targeted diagnostic override with a written reason; README, AGENTS.md, VISION.md and `.brain/` edits; tightening a lint rule; a new page or blog post under the existing address rules; any change under `apps/infra` that only plans (`pnpm infra:plan`).
- Needs owner sign-off: adding or changing a dependency version (pins are exact and CI installs cold); any edit to `oxlint.config.ts`, the diagnostics map in `tsconfig.base.json`, `lefthook.yml`, or `scripts/vcs-command-policy.js` that loosens the fence; `pnpm infra:deploy` or `pnpm infra:destroy`, and any plan that replaces or deletes a resource; pointing the hypertask.ai domain at this site; moving, renaming or dropping a public address, redirect, sitemap entry or install script; adding a script, font or tracking tag from outside; deleting `.agent_sources/` or `vendor/`; any change that costs money.
