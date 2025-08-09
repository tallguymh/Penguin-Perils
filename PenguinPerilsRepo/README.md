
# Penguin Perils (Web)

This repository contains a Phaser 3 HTML5 port of *Penguin Perils* — an 8-bit style platformer with a level editor.

## How to run locally
1. Unzip the project folder.
2. Open `index.html` in a modern browser. (For some browsers you may need to serve via a local server due to audio/file restrictions.)
   ```bash
   # simple local server using Python 3
   python -m http.server 8000
   # then open http://localhost:8000
   ```

## Features
- Title screen: **Penguin Perils**
- Parallax background, animated penguin, enemies, coins, score
- Touch controls (on-screen) that hide when keyboard input is used
- Chiptune background music + SFX
- Level Editor:
  - Place/remove tiles on a grid
  - Save level to JSON (downloads `penguin_level.json`)
  - Load level from JSON (upload)
  - Levels also auto-save to `localStorage`
- Mobile-friendly scaling and performance tweaks

## Deploy to GitHub Pages
1. Create a new GitHub repository (public).
2. Upload all files from this project into the repo root.
3. Commit and push.
4. In repository **Settings → Pages**, enable Pages from `main` branch (root).
5. Visit `https://<your-username>.github.io/<repo-name>/` after a few minutes.

## Notes
- The repo includes generated placeholder art and chiptune audio. Replace assets in `/assets` with your own if desired.
- Editor saves to `localStorage` for quick iteration and supports export/import via JSON.
