# Numpic

Memorise the **00–99 number associations** (number → picture → word) the way you'd learn a language: short levels, quizzes and spaced review. Built from the `00–99 association library` Anki deck.

## How it works
- **10 units × 3 levels** – two lessons of 5 new pictures each, then a unit test (with weak cards from earlier units mixed in). Each unit follows the Major System sound: unit 1 = S/Z, unit 2 = T/D, …
- **Lesson flow** – meet the picture → number→picture → match pairs → picture→number → type the number. Wrong answers come back at the end of the lesson.
- **Smart review** – the weakest cards are drilled first; per-card strength (0–5) is stored on-device.
- **Library** – all 100 cards with search, per-decade filters and a *Cover mode* for self-testing.
- XP, daily goal, streak, stars (3 = no mistakes), sound/haptics, works offline (PWA).

## Run it
No build step, no dependencies:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

Deploy by uploading the folder to any static host (GitHub Pages, Netlify, Vercel). Open it on a phone and use *Add to Home Screen* to install.

## Files
`index.html` · `styles.css` · `app.js` (all logic) · `data.js` (the 100 cards) · `sw.js` + `manifest.webmanifest` (offline/install) · `icon*.png`

To change a picture or word, edit `data.js`.
