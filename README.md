# Tee Dev

First iteration of a dark, sleek T-shirt website.

## What is included

- Owner-created design category.
- Community-submitted design preview category.
- Two community placement options: full-front print or left-chest print.
- Toggle between image URL or local image upload for T-shirt previews.
- Artwork is auto-fitted for print previews: large designs become `2400 x 3000 px`; small designs become `1200 x 1200 px`.
- Product cards and the live preview show artwork on both black and white T-shirts.
- Session-only browser previews with private backend JSONL logging.
- Owner storefront sourced from top-level `large-designs/` and `small-designs/` folders.
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

## Loading Storefront Designs

Add image files directly into the matching top-level folder:

- `large-designs/` for large front designs.
- `small-designs/` for smaller left-chest designs.

Supported formats: `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.svg`, `.avif`.

Refresh the site after adding files. The storefront uses the filename as the design name, so `midnight-logo.png` appears as `Midnight Logo`.

## GitHub

The intended remote is:

```text
git@github.com:joshspeariett/Tee-Dev.git
```

For SSH pushes without repeated prompts, add your SSH key to GitHub and make sure an SSH agent is running locally. Codex cannot safely collect private SSH keys in chat, but it can use an already configured key or help verify the remote.

## Logging note

This first iteration is static. User-submitted designs are logged in browser `localStorage` and can be exported as JSONL from the page. A backend or serverless function should be added later when you want shared, permanent design logging across visitors.
