# Minecraft Birthday Quest (offline)

Single-page Minecraft-themed quest for a 7-year-old birthday game. The interface is image-first and the tasks follow `Tasks.md`.

## Run locally

1. Open `index.html` by double-clicking it or dragging it into a browser.
2. Everything works without a server or build step.

## Reset progress

- In the UI, click **«Сброс (для родителей)»** and enter the PIN.
- Automatic reset: add `?reset=1` to the page URL.

The default PIN is stored in `app.js` (`PARENT_PIN`).

## Edit steps

All steps are defined in `app.js` and mirror `Tasks.md`.

- Update the `TASKS` list to change locations, images, or answers.
- Intro/instruction/final screens live in the `STEPS` array.

## Assets

All images live in the `images/` folder. Keep filenames the same if you do not want to touch the code.
