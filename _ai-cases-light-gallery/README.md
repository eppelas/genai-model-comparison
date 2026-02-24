# AI Cases Slide Deck (Light)

Slide-like comparison deck for generated image results across models.

## Run locally

Important: serve from parent folder so image paths resolve.

```bash
cd '/Users/viola/All/Yandex.Disk.localized/3 Process/5 Work/Leto School/AI Cases'
python3 -m http.server 4260
```

Open:

- http://127.0.0.1:4260/_ai-cases-light-gallery/index.html

## Controls

- Click image: open full viewer
- Left / Right arrows: previous / next image in current case
- Escape: close viewer
- "Open original": open original source image in new tab

## Data refresh

After adding/removing images:

```bash
cd '/Users/viola/All/Yandex.Disk.localized/3 Process/5 Work/Leto School/AI Cases/_ai-cases-light-gallery'
node ./generate-manifest.mjs
```

## Prompt mapping

Prompt texts are mapped in:

- `app.js` -> `casePromptsByName`

Add/update prompt strings there when you provide new prompts.
