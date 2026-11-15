# Old site agent files and design skills

Ticket: https://app.hypertask.ai/detail/project-15/9140 Parent: https://app.hypertask.ai/detail/project-15/9124

Source: the old site, https://github.com/hypertask-ai/astro on its default branch, read on 2026-11-14. Nothing in the old site changes.

The old site has no `AGENTS.md`, no `CLAUDE.md` and no `.claude/settings.json`. Its agent files are 21 skill folders under `.claude/skills` (the parent ticket says 22; the count in the tree is 21), one review workflow and one leak-scan setup. Every item below is cut or kept, with a reason. Rat Stack's own `AGENTS.md`, `skills/` and fence replace all of it.

## Agent files

| Old file | Verdict | Reason |
| --- | --- | --- |
| `.github/workflows/claude-review.yml` | Cut | The shared Hypertask reviewer reviews every repo's pull requests. A second per-repo reviewer duplicates it and spends a Claude token. |
| Leak scan: `.github/workflows/gitleaks.yml` and its config file | Kept, port owned by HTPR-9147 | House rule: push scanning on every repo from creation. The port changes CI, so it belongs to the checks step, not this one. |

## Design skills

All 21 are the generic Impeccable set, copied into the repo. The house rules already install Impeccable for every session, so a repo copy only goes stale. The site also keeps its own look from the old site, so no skill here may restyle it.

| Old skill | Verdict | Reason |
| --- | --- | --- |
| `adapt` | Cut | Covered by the shared Impeccable `adapt`. |
| `animate` | Cut | Covered by the shared `animate` skill. The site's motion is fixed by step 13. |
| `arrange` | Cut | Covered by the shared Impeccable `layout`. |
| `audit` | Cut | Covered by the shared Impeccable `audit`. Link, search and stats checks are CI steps (HTPR-9147). |
| `bolder` | Cut | Restyles the look. Needs a ticket that asks for it, and the site keeps its look. |
| `clarify` | Cut | Covered by the shared Impeccable `clarify`. |
| `colorize` | Cut | Restyles the look. Needs a ticket that asks for it. |
| `critique` | Cut | Covered by the shared Impeccable `critique`. Its three reference files go with it. |
| `delight` | Cut | Restyles the look. Needs a ticket that asks for it. |
| `distill` | Cut | Covered by the shared Impeccable `distill`. |
| `extract` | Cut | Assumes a component library and design tokens in React or Astro. Tokens are StyleX in step 11. |
| `frontend-design` | Cut | Assumes React and Tailwind choices Rat Stack forbids. Its seven reference files go with it. |
| `harden` | Cut | Covered by the shared Impeccable `harden`. |
| `normalize` | Cut | Covered by the shared Impeccable skill. The StyleX tokens in step 11 are the one design system. |
| `onboard` | Cut | The site has no onboarding flow. Sign up happens in app.hypertask.ai. |
| `optimize` | Cut | Covered by the shared Impeccable `optimize`. The size gate lives in CI. |
| `overdrive` | Cut | Restyles the look. Needs a ticket that asks for it. |
| `polish` | Cut | Covered by the shared Impeccable `polish`. |
| `quieter` | Cut | Restyles the look. Needs a ticket that asks for it. |
| `teach-impeccable` | Cut | One-time setup that writes into an AI config file. `AGENTS.md` and `VISION.md` now hold that context. |
| `typeset` | Cut | Covered by the shared Impeccable `typeset`. Type sizes arrive as tokens in step 11. |

## Rat Stack agent files kept

`AGENTS.md`, `CLAUDE.md`, `.claude/settings.json`, `.cursor`, `.pi`, `lefthook.yml`, `scripts/vcs-command-policy.js` and the template skills under `skills/` stay: they are the fence. Template skills that point at cut packages are cut with those packages by the step that owns them.
