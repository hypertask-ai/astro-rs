# Install block

The install block lets a visitor pick how their agent connects, reads the exact command, and copies it in one action.

## Sub-features

- `install-tabs` switches between `MCP`, `CLI · Mac, Linux` and `CLI · Windows`.
- `install-command` shows the exact command for the chosen tab.
- `install-copy` copies the shown command and confirms with `Copied`.
- `install-note` keeps the sentence `Paste into your agent. Sign in once.`.

## How to get to it (user POV)

- Open the rebuilt home page at `https://hypertask.ai/ratstack/` and find `Connect in one line`.
- Open the old live home page at `https://hypertask.ai/` and find the same block.

## Driving it with the astro-rs driver

Preconditions:

- The doctor passed for this run, and `RUN` names the evidence folder that the skill's Evidence section creates.
- `PREVIEW=https://hypertask.ai/ratstack` and `REFERENCE=https://hypertask.ai`.
- The cookie banner has not been answered, so the page is in its first-visit state.

- **Default tab.** Load both hosts. Run `SCREENS_DIR="$RUN" node verify/driver.mjs page --head "$PREVIEW" --base "$REFERENCE" --path /`. Both text files contain `Connect in one line`, `Paste into your agent. Sign in once.` and `https://mcp.hypertask.ai/mcp`.
- **Unix tab.** Choose the CLI tab for Mac and Linux. Run `SCREENS_DIR="$RUN" node verify/driver.mjs act --head "$PREVIEW" --base "$REFERENCE" --path / --click 'role=tab[name="CLI · Mac, Linux"]'`. `report-act.json` shows `curl -fsSL https://hypertask.ai/install | sh` in both `head.textLines` and `base.textLines`.
- **Windows tab.** Run the same command with `--click 'role=tab[name="CLI · Windows"]'`. Both sides show `irm https://hypertask.ai/install.ps1 | iex`.
- **Copy.** Run the same command with `--click 'role=button[name="Copy"]'`. Both sides show the label `Copied` in `textLines`, and `head.clipboard` and `base.clipboard` both hold `https://mcp.hypertask.ai/mcp`.
- **Proof.** Keep `report-act.json` and both action screenshots for the Unix tab and for the copy action.

## Gotchas

- The accessible name of each tab carries the prefix, so the CLI tabs are named `CLI · Mac, Linux` and `CLI · Windows`, not `Mac, Linux` and `Windows`. A selector without the prefix matches nothing.
- The command keeps the public address `https://hypertask.ai/install`, never the preview path. The same goes for `https://mcp.hypertask.ai/mcp`. A command rewritten to `/ratstack/install` is a failure even though the file answers.
- The copy label returns to `Copy` after 1800 milliseconds, so read it from the same `act` run. The driver grants `clipboard-read` and `clipboard-write`, so `Copy failed` in the label means the copy itself broke, not a missing permission.
- Switching tabs changes the visible text, so run `page` again before comparing words after an `act`.
