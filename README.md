# Tee Dev

First iteration of a dark, sleek T-shirt website.

## What is included

- Owner-created design category.
- Community-submitted design preview category.
- Two community placement options: large chest image or small top-right image.
- Browser-based design ledger with JSONL export.
- Script logs in `logs/` for local serving and validation.

## Commands

```powershell
npm run serve
npm run validate
```

Both scripts append logs under `logs/`.

## GitHub

The intended remote is:

```text
git@github.com:joshspeariett/Tee-Dev.git
```

For SSH pushes without repeated prompts, add your SSH key to GitHub and make sure an SSH agent is running locally. Codex cannot safely collect private SSH keys in chat, but it can use an already configured key or help verify the remote.

## Logging note

This first iteration is static. User-submitted designs are logged in browser `localStorage` and can be exported as JSONL from the page. A backend or serverless function should be added later when you want shared, permanent design logging across visitors.
