# Vision

This repository is the new home of hypertask.ai, the marketing site for Hypertask. It replaces the Astro site on Pages with a Foldkit site on a Cloudflare Worker, built from Rat Stack. Visitors should notice nothing.

## What the site is for

Visitors learn what Hypertask does, compare it with other tools, read the blog, and click Sign up. Sign up leads to app.hypertask.ai. The site holds no accounts, no database and no jobs.

## What must not change

- Same address for every page and every one of the 38 blog posts.
- Same sitemap, feed, search data, redirects and install scripts.
- Same look. This site keeps the old site's colours, sizes, fonts and corners. It does not take Rat Stack's look.
- Fathom and the Sign up click keep counting.

## What changes

- Publishing runs from GitHub on every merge. Nothing is built on our servers.
- Every page is a Foldkit screen with StyleX styles. Blog posts are prerendered markdown.
- The strict Rat Stack checks run on every push: types, lint, format, tests and build. No rule is loosened to make a change pass.
- Cookie choices become one tested machine. Analytics that Rat Stack cannot carry is rebuilt small or cut, by decision of the analytics step.

## How the move runs

22 small steps on https://app.hypertask.ai/detail/project-15/9124. The old site serves hypertask.ai until the new one matches it on a preview. Step 22 archives the old project; no live data is deleted. Undo any step by reverting it. Undo the cutover by pointing hypertask.ai back at the old site.

## Who it is for

Agents and the engineers who check their work. The fence makes the easy path the right one. `AGENTS.md` holds the rules, `AGENT-FILES.md` records what the old site's agent files became, and `SCAFFOLD.md` records what was cut from the template and why.

Rat Stack's own vision is in the upstream repository: https://github.com/joelhooks/rat-stack
