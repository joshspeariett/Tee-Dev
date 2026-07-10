# Tee Dev

First iteration of a dark, sleek design-your-own T-shirt website.

## What is included

- Live design-your-own T-shirt builder.
- Neck shape choices: crew neck, V-neck, scoop neck.
- T-shirt colour and trim colour pickers.
- Local image upload with size and placement controls.
- Custom text, text colour, and text position controls.
- Size selector with a future size-guide link placeholder.
- Customer review section.
- Session-local design state only; no customer design is saved or shared.
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

Scripts append local request and validation logs under `logs/`. Customer designs stay in the current browser session only.

## GitHub

The intended remote is:

```text
git@github.com:joshspeariett/Tee-Dev.git
```

For SSH pushes without repeated prompts, add your SSH key to GitHub and make sure an SSH agent is running locally. Codex cannot safely collect private SSH keys in chat, but it can use an already configured key or help verify the remote.

## Privacy note

This first iteration is static and local. Customer designs are not stored, uploaded, or shared by the app.
