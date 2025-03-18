# GATHERSS

A simple, free, privacy-friendly RSS aggregator, as Firefox addon. No bells, no
whistles. Just links to cool posts.

## Getting started

For local development, not much is needed; there is no build process, so the
extension can be added by navigating to about:debugging and clicking "Load
Temporary Add-on", then selecting the `manifest.json` file.

For the exported ZIP, hidden files must be excluded (most importantly the `.git`
directory) and likewise this `README.md` should be excluded.

```bash
zip -rFS -x=".*" -x="*.md" -x="*.zip" gatherss.zip ./
```

## About the codebase

Things are kept as simple as possible. There are three main parts to any addon;

- The background script (this is `background.js`)
- Content scripts (this is `content.js`)
- The browser action (this is everything under `action/`)

The browser action is a popup, so the files under `action/` are the different
pages. The initial page, i.e. the one you see when clicking the action button,
is `action/index.html`. All the pages share the `action/action.css` stylesheet,
but also have their own `index.css`.

The bulk of the actual logic happens in separate files in `-/`; functions are
split over different files to make things a bit clearer.

There are some SVG icons under `icons/`; these are referenced through `<img>` or
by path in case of the browser action button.

The `.thumbnail.*` files are used for the listing on
[addons.mozilla.org](https://addons.mozilla.org) - they are kept for version
control, but should not be included in the submitted ZIP (which is why they are
hidden files).
