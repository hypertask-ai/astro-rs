# Blog

The blog lists every post in the same order, opens a post at its permanent address, and groups posts by tag.

## Sub-features

- `blog-list` shows the H1, the post cards in order, covers, dates and tag chips.
- `blog-post` opens one post at `/blog/<slug>/` with its title, date, author, cover, body, contents list and related posts.
- `blog-tag` lists the posts behind one tag at `/blog/tags/<tag>/`.
- `blog-head` keeps each page's own title, description, canonical and Article structured data.

## How to get to it (user POV)

- Choose `Blog` in the header or footer.
- Open a post card from the blog list.
- Choose a tag chip on a post card.

## Driving it with the astro-rs driver

Preconditions:

- The doctor passed for this run, and `RUN` names the evidence folder that the skill's Evidence section creates.
- `PREVIEW=https://hypertask.ai/ratstack` and `REFERENCE=https://hypertask.ai`.
- Step 10 on HTPR-9124, the blog list and tag pages, has landed on the preview.

- **Blog list.** Run `SCREENS_DIR="$RUN" node verify/driver.mjs page --head "$PREVIEW" --base "$REFERENCE" --path /blog/`. Both sides answer `200` with the one level one `The Hypertask Blog`, the title `The Hypertask Blog — AI Agents, Async Work & Project Management`, and the canonical `https://hypertask.ai/blog/`.
- **Compare the list words.** Run `SCREENS_DIR="$RUN" node verify/driver.mjs compare --head "$PREVIEW" --base "$REFERENCE" --path /blog/`. `addedInHead`, `missingFromHead`, `addedLinksInHead`, `missingLinksFromHead`, `addedImagesInHead`, `missingImagesInHead`, `linksOutsideHeadBase` and `imagesOutsideHeadBase` are all empty, so every post and tag link and every cover survives.
- **One post.** Run the same `page` command with `--path /blog/ai-agent-task-management/`. Both sides answer `200` with the same title and `description`, the canonical `https://hypertask.ai/blog/ai-agent-task-management/`, and the same body text.
- **One tag page.** Run the same `page` command with `--path /blog/tags/ai-agents/`. Both sides answer `200` with the level one `ai-agents` and the same posts in the same order.
- **Proof.** Keep `report-page.json`, `report-compare.json` and the screenshots for the list, the post and the tag page.

## Gotchas

- Until step 10 lands, the preview answers `/blog/` with the old site's home page under `/ratstack/blog/` and reports `200`. A `200` is not proof: the home page has two level ones and the canonical `https://hypertask.ai/`, while the blog list has one level one and the canonical `https://hypertask.ai/blog/`.
- The canonical address stays `https://hypertask.ai/blog/...` even on the preview, because the preview is not the public address. A canonical rewritten to `/ratstack/...` is a failure.
- Post order is data. Compare the link list order from `report-page.json`, not the set of links.
- Covers are remote CloudFront or local images. A cover that 404s shows up in `failedRequests`, not in the text diff.
- `/blog/tags/<tag>/` keeps the tag slug as the visible heading, not a prettified name. `ai-agents` is the heading, `ai agents` is not.
