# Plans

Plans show the three offers with their prices, let a visitor switch between monthly and yearly billing, and send them to sign up.

## Sub-features

- `plans-list` shows Free, BYOK and Pro with their feature bullets.
- `plans-period` switches the billing period between `Pay monthly` and `Pay yearly`.
- `plans-price` changes every price and note with the period.
- `plans-cta` offers `Start for free` and `Get started`, the featured plan carrying `Most popular`.
- `pricing-page` shows the same plans at `/pricing/`.

## How to get to it (user POV)

- Open the rebuilt home page at `https://hypertask.ai/ratstack/` and scroll to the plans.
- Open the rebuilt pricing page at `https://hypertask.ai/ratstack/pricing/`.
- Open the old live home page at `https://hypertask.ai/` and the old live pricing page at `https://hypertask.ai/pricing/`.

## Driving it with the astro-rs driver

Preconditions:

- The doctor passed for this run, and `RUN` names the evidence folder that the skill's Evidence section creates.
- `PREVIEW=https://hypertask.ai/ratstack` and `REFERENCE=https://hypertask.ai`.

- **Plans on the home page.** Load both hosts. Run `SCREENS_DIR="$RUN" node verify/driver.mjs page --head "$PREVIEW" --base "$REFERENCE" --path /`. Both text files contain `Free`, `BYOK`, `Pro`, `Most popular`, `Start for free` and `Get started`.
- **Yearly is the default.** Read the same text files. Both show the yearly prices `$0`, `$8` and `$16`, the notes `$96 billed yearly` and `$192 billed yearly`, and the marker `−20%`.
- **Switch to monthly.** Run `SCREENS_DIR="$RUN" node verify/driver.mjs act --head "$PREVIEW" --base "$REFERENCE" --path / --click 'role=button[name="Pay monthly"]'`. Both sides show `$0`, `$10`, `$20` and `billed monthly`, no `billed yearly` note is left, `addedInHead` and `missingFromHead` are both empty, and the screenshot shows the monthly buttons pressed.
- **Switch back to yearly.** Run the same command with `--click 'role=button[name="Pay yearly"]'`. Both sides show `$8`, `$16` and the yearly notes again.
- **Pricing page.** Run `SCREENS_DIR="$RUN" node verify/driver.mjs page --head "$PREVIEW" --base "$REFERENCE" --path /pricing/`. Both sides answer `200`, `canonical` is `https://hypertask.ai/pricing/`, the heading tree has exactly one level one and it is `Free forever. Upgrade when your team needs more.`, and the same plan names appear.
- **Proof.** Keep `report-act.json` for both periods, and both screenshots, so the price change is visible beside the old site.

## Gotchas

- The discount marker is `−20%` with a minus sign U+2212, not a hyphen. A grep for `-20%` finds nothing.
- The billing buttons are matched by their accessible names `Pay monthly` and `Pay yearly`. The old site also carries `data-period`, the rebuilt site does not, so do not select on it.
- Prices repeat across plans, so compare the whole text, not one number.
- The home page carries two level ones, the hero and the pricing section. The pricing page carries one. A preview that answers `/pricing/` with the home page still shows `Free forever. Upgrade when your team needs more.`, so the one level one and the canonical are what catch it.
- Until step 14 lands, `/pricing/` on the preview answers with the home page. The journey reports a failure with that reason; it never falls back to the home page plans.
