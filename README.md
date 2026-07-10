# Tee Dev

First iteration of a dark, sleek T-shirt website.

## What is included

- Owner-created design category.
- Community-submitted design preview category.
- Two community placement options: full-front print or left-chest print.
- Toggle between image URL or local image upload for T-shirt previews.
- Artwork dimension checks: full-front requires `2400 x 3000 px`; left-chest requires `1200 x 1200 px`.
- Session-only browser previews with private backend JSONL logging.
- Owner storefront sourced from top-level `full-front/` and `left-chest/` folders.
- Top-level start/stop batch files for the local site.
- Implementation files tucked under `_tee-dev/`.
- Script logs in top-level `logs/` for local serving and validation.

## Commands

```bat
Start-Site.bat
Stop-Site.bat
```

Advanced validation:

```powershell
cd _tee-dev
npm run validate
```

Scripts append logs under `logs/`. Submitted designs are written to the ignored private backend file `logs/submissions.jsonl` and are not loaded into other users' storefront views.

## GitHub

The intended remote is:

```text
git@github.com:joshspeariett/Tee-Dev.git
```

For SSH pushes without repeated prompts, add your SSH key to GitHub and make sure an SSH agent is running locally. Codex cannot safely collect private SSH keys in chat, but it can use an already configured key or help verify the remote.

## Logging note

This first iteration is static. User-submitted designs are logged in browser `localStorage` and can be exported as JSONL from the page. A backend or serverless function should be added later when you want shared, permanent design logging across visitors.
