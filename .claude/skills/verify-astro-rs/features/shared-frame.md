# Shared frame

Every page carries the same header, mobile menu, footer, cookie banner and the site's own dark look.

## Sub-features

- `frame-header` shows the skip link, the mark and wordmark, Pricing, Blog, Docs, Help, `Login` with its shortcut tooltip and `Start free`.
- `frame-menu` opens and closes the mobile menu at 390 pixels wide.
- `frame-keyboard-login` opens the login page when `L` is pressed outside a text field.
- `frame-footer` shows the footer links, `Cookie settings` and the copyright line.
- `frame-consent` shows the cookie banner on a first visit and hides it after a choice.
- `frame-look` keeps the old site's colours, fonts, sizes and corners.

## How to get to it (user POV)

- Open any page on the rebuilt site, starting with `https://hypertask.ai/ratstack/`.
- Open the same page on the old live site, `https://hypertask.ai/`.
- Narrow the window to a phone width, or press `L` on a page.

## Driving it with the astro-rs driver

Preconditions:

- The doctor passed for this run, and `RUN` names the evidence folder that the skill's Evidence section creates.
- `PREVIEW=https://hypertask.ai/ratstack` and `REFERENCE=https://hypertask.ai`.
- No cookie is set, so the banner is in its first-visit state.

- **Header and footer.** Load both hosts. Run `SCREENS_DIR="$RUN" node verify/driver.mjs page --head "$PREVIEW" --base "$REFERENCE" --path /`. The 1440 `textFile` of each side contains `Skip to content`, `Hypertask`, `Pricing`, `Blog`, `Docs`, `Help`, `Login`, `Start free`, `Changelog`, `Cookie settings` and `© 2026 Hypertask Lab Ltd.`. The login link is `#login-button` and its address in both link lists is `https://app.hypertask.ai/login`.
- **Cookie banner.** Read the same text files. Both show `Cookie preferences`, `We use PostHog analytics to understand visits and clicks. Optional cookies stay off unless you accept.`, `Privacy policy`, `Accept` and `Reject`.
- **Accept the banner.** Run `SCREENS_DIR="$RUN" node verify/driver.mjs act --head "$PREVIEW" --base "$REFERENCE" --path / --click 'role=button[name="Accept"]'`. Neither side's `textLines` carries the banner sentence any more, `addedInHead` and `missingFromHead` are both empty, and the rest of the page is unchanged.
- **Mobile menu.** Run `SCREENS_DIR="$RUN" node verify/driver.mjs act --head "$PREVIEW" --base "$REFERENCE" --path / --viewport 390 --click 'button[aria-label="Toggle menu"]'`. Both sides' `textLines` contain `Pricing`, `Blog`, `Docs`, `Help`, `Login` and `Get Started`, the menu button reads `✕` instead of `☰`, `addedInHead` and `missingFromHead` are both empty, and the screenshots show the panel.
- **Keyboard login.** Run `SCREENS_DIR="$RUN" node verify/driver.mjs act --head "$PREVIEW" --base "$REFERENCE" --path / --press l`. `head.url` and `base.url` both equal `https://app.hypertask.ai/login`, the status is `200` on both, and the text diff is empty.
- **Look.** Read `fonts` for both sides in `report-page.json`. The same families and weights are loaded, and no request goes to `fonts.googleapis.com`. Judge colour, size and corners from the paired screenshots in `side-by-side.html`.
- **Proof.** Keep `report-page.json`, the three `act` reports and the paired screenshots at 1440 and at 390.

## Gotchas

- Every browser context starts with no cookie, so the banner is visible on each run. That is the first-visit state, not a bug.
- The menu button is hidden at 1440 pixels. Driving it without `--viewport 390` clicks an element that is not visible and fails.
- Pressing `l` inside a text field types a letter. Start the journey from the page body, as the driver does after a fresh load.
- A choice is remembered in the `ht_cookie_consent` cookie. To prove the remembered state you need a second visit in the same context, which the driver does not keep; the banner disappearing is the proof it records.
- The home page uses the flat full-width header and footer, other pages use the floating bordered ones. Compare the same page on both sides, not the home page against `/pricing/`.
- The login tooltip is three text nodes, so the visible text file carries `Press`, `L` and `to log in` on three lines. Grep for `Login`, or read `#login-button` in the link list, never for the tooltip sentence.
