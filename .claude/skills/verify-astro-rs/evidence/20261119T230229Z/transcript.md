# verify-astro-rs proof run

Run folder: /home/valentin/.local/state/verify-astro-rs/20261119T230229Z Stamp: 2026-11-19T23:03:37Z

## Commands

- `node .claude/skills/verify-astro-rs/scripts/doctor.mjs > $RUN/doctor.txt`
- `SCREENS_DIR="$RUN" node verify/driver.mjs page --head "$PREVIEW" --base "$REFERENCE" --path /`
- `SCREENS_DIR="$RUN" node verify/driver.mjs compare --head "$PREVIEW" --base "$REFERENCE" --path /`
- `SCREENS_DIR="$RUN/act-plans" node verify/driver.mjs act --head "$PREVIEW" --base "$REFERENCE" --path / --click "role=button[name=\"Pay monthly\"]"`
- `SCREENS_DIR="$RUN/act-login" node verify/driver.mjs act --head "$PREVIEW" --base "$REFERENCE" --path / --press l`

Exit codes: doctor 1, page 0, compare 0, act-plans 0, act-login 0.

## Doctor

```
{
  "checks": [
    {
      "detail": "https://hypertask.ai/ answered 200 with title \"The fastest project board — Hypertask\"",
      "name": "reference host answers",
      "ok": true
    },
    {
      "detail": "https://hypertask.ai/ratstack/ answered 200 at https://hypertask.ai/ratstack/",
      "name": "preview host answers",
      "ok": true
    },
    {
      "detail": "robots meta \"index, follow\"",
      "name": "preview carries noindex",
      "ok": false
    },
    {
      "detail": "no /ratstack/assets/ script or style in the preview, so it is not this build",
      "name": "preview is the rebuilt site",
      "ok": false
    },
    {
      "detail": "nothing under /ratstack/assets/ to fetch",
      "name": "preview serves its own build files",
      "ok": false
    },
    {
      "detail": "no successful publish-ratstack.yml run on site, so nothing has published the preview",
      "name": "preview matches the latest publish",
      "ok": false
    }
  ],
  "previewUrl": "https://hypertask.ai/ratstack/",
  "referenceUrl": "https://hypertask.ai/"
}
ok reference host answers: https://hypertask.ai/ answered 200 with title "The fastest project board — Hypertask"
ok preview host answers: https://hypertask.ai/ratstack/ answered 200 at https://hypertask.ai/ratstack/
FAIL preview carries noindex: robots meta "index, follow"
FAIL preview is the rebuilt site: no /ratstack/assets/ script or style in the preview, so it is not this build
FAIL preview serves its own build files: nothing under /ratstack/assets/ to fetch
FAIL preview matches the latest publish: no successful publish-ratstack.yml run on site, so nothing has published the preview
doctor: 4 check(s) failed
```

## Home hero, page

- head status 200, base status 200
- head title The fastest project board — Hypertask
- head canonical https://hypertask.ai/
- head robots index, follow, base robots index, follow
- head text lines 84, base text lines 84
- head console errors [], page errors [], failed requests []
- head images 11, head links 24

## Home hero, compare

- addedInHead: 0
- missingFromHead: 0
- addedLinksInHead: 0
- missingLinksFromHead: 0
- addedImagesInHead: 0
- missingImagesInHead: 0
- linksOutsideHeadBase: 10
- imagesOutsideHeadBase: 11

## Acts, to exercise the action path

- click role=button[name="Pay monthly"] at 1440: head 200 base 200, addedInHead 0, missingFromHead 0
- head price lines after the click: ['$0', '$10', 'billed monthly', '$20', 'billed monthly']
- press l at 1440: head https://app.hypertask.ai/login 200, base https://app.hypertask.ai/login 200, addedInHead 0, missingFromHead 0

## Verdict

FAIL. The doctor reports four failed checks and none of them is a difference between the two sides: the preview at https://hypertask.ai/ratstack/ is not the rebuilt site yet. It answers with the old site's home page, carries `robots` `index, follow` instead of `noindex, follow`, has no `/ratstack/assets/` script or style, and no `publish-ratstack.yml` run has published the branch `site`.

The visible difference is that both sides of every pair are the same old page: the two screenshots are byte for byte the same file. That is what an unpublished preview looks like, and the empty text diff above is not a pass.

The same missing publish also leaves `linksOutsideHeadBase` with 10 links and `imagesOutsideHeadBase` with 11 images, all of them site root addresses like `/pricing/` and `/images/landing/hero-1-board.png` that load the old site instead of the preview.

Cleanup: the driver closed the browser it started in each run, and nothing else was started. This folder is the evidence and it is still here.
