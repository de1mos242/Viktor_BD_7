# Quest Wizard (offline)

Single-page offline quest for kids: steps, answers, hints, and a final win.

## Run locally

1. Open `index.html` by double-clicking it or dragging it into a browser.
2. Everything works without a server or build step.

## Publish online (GitHub Pages)

1. Rename `steps.example.json` to `steps.json` and fill it with your steps.
2. Commit the changes and push them to GitHub.
3. In the repository, open **Settings → Pages** and select **Source: GitHub Actions**.
4. Wait for the **Deploy to GitHub Pages** workflow to complete.
5. The published page URL will appear under **Pages** and in the workflow deployments list.

After that, the page will be available from the public URL anywhere.

> You can preview intermediate results without merging: just push changes to your branch —
> the workflow will run and publish the current version. The URL stays the same but serves
> the latest deployed version.

## Configure steps

1. Rename `steps.example.json` to `steps.json`.
2. Edit `steps.json` for your quest.
3. If you open the page as `file://`, browsers block reading `steps.json`.
   To load the file, run a simple local server or open the page over HTTP.

### `steps.json` format

```json
{
  "steps": [
    {
      "id": "unique-id",
      "title": "Шаг 1: ...",
      "subtitle": "...",
      "prompt": "Текст задания",
      "input": {
        "type": "text",
        "placeholder": "Напиши ответ",
        "inputMode": "text"
      },
      "answers": ["вариант1", "вариант2"],
      "allowRegex": false,
      "hint": "Подсказка",
      "hintAfterTries": 2,
      "successMessage": "Что делать дальше",
      "collectToken": "3",
      "isFinal": false
    }
  ]
}
```

- Answers are compared as `trim + lowerCase`.
- If `allowRegex: true`, answers are treated as regular expressions.
- If at least one step contains `collectToken`, the “Собрано” line is shown.

## Reset progress

- In the UI, click **«Сброс (для родителей)»** and enter the PIN.
- Automatic reset: add `?reset=1` to the page URL.

The default PIN is stored in `app.js` (`PARENT_PIN`).
