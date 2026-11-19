# Home hero

The first screen of hypertask.ai states what the product is, offers one primary and one secondary call to action, and names the agents that already work the board.

## Sub-features

- `hero-headline` shows the H1, the lede sentence and the product mark.
- `hero-cta` offers `Get started now` to the login page and `Demo board` to the demo board.
- `hero-shot` shows the board screenshot with its alt text and its intrinsic size.
- `hero-agents` shows the eight agent marks under `Bring your own agent.`.

## How to get to it (user POV)

- Open `https://hypertask.ai/ratstack/` on the rebuilt site.
- Open `https://hypertask.ai/` on the old live site.

## Driving it with the astro-rs driver

Preconditions:

- `node .claude/skills/verify-astro-rs/scripts/doctor.mjs` passed for this run.
- `PREVIEW=https://hypertask.ai/ratstack` and `REFERENCE=https://hypertask.ai`.
- `RUN` names the evidence folder that the skill's Evidence section creates, outside the clone.

- **Load the first screen.** Fetch both hosts and pair the screenshots. Run `SCREENS_DIR="$RUN" node verify/driver.mjs page --head "$PREVIEW" --base "$REFERENCE" --path /`. `report-page.json` has `status` `200` on both sides, and `side-by-side.html` shows the old capture beside the new one at 1440 and at 390 pixels wide.
- **Compare the words.** Run `SCREENS_DIR="$RUN" node verify/driver.mjs compare --head "$PREVIEW" --base "$REFERENCE" --path /`. `addedInHead` and `missingFromHead` are both empty.
- **Compare the head tags.** Read `headHead` and `baseHead` in `report-compare.json`. `title`, `description` and `canonical` are equal, and `canonical` is `https://hypertask.ai/`. `robots` differs on purpose: `noindex, follow` on the preview and `index, follow` on the old site, so the preview stays out of search results.
- **Compare the addresses.** Read `addedLinksInHead`, `missingLinksFromHead`, `addedImagesInHead`, `missingImagesInHead`, `linksOutsideHeadBase` and `imagesOutsideHeadBase`. All six are empty, so every link and image keeps its target and stays under `/ratstack`.
- **Both calls to action.** Read `headReport` in `report-page.json`. The link list contains `https://app.hypertask.ai/login Get started now` and `https://app.hypertask.ai/demo Demo board`, exactly as on the old site.
- **The agent marks.** Read the new side's `headings` and `textFile` in `report-page.json`. The heading tree has a level two with `Bring your own agent.`, and the visible text has the same eight mark names as the old side.
- **Proof.** Keep `report-page.json`, `report-compare.json`, `side-by-side.html`, both viewport screenshots and both text files.

## Gotchas

- The preview lives under `/ratstack`, so an absolute source such as `/images/landing/hero-1-board.png` has to answer under `/ratstack/images/...` on the preview. `linksOutsideHeadBase` and `imagesOutsideHeadBase` name every one that does not, and a non-empty list is a failure even when the page looks right, because those addresses leave the preview and load the old site's file.
- The testimonial carousel and the scrolling columns move. Their text can enter and leave the capture between the two sides, so judge them with `page` and the screenshots, not with `compare`.
- A `200` from the preview is not proof. Until the publish workflow has run on `site`, `https://hypertask.ai/ratstack/` answers with the old site's home page: the title is right, the H1 is right and the words match, so the text diff is empty. The doctor's "preview is the rebuilt site" check is what fails then, and the run is a failure with that reason.
- A second `robots` value is not a regression. `noindex, follow` on the preview and `index, follow` on the old site are both correct.
- Opening a call to action leaves the marketing site. The link list is the proof, not a click.
