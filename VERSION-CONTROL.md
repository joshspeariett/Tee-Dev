# Version Control Policy

This project should stay tracked in GitHub at:

```text
git@github.com:joshspeariett/Tee-Dev.git
```

## Logging expectations

- Runtime scripts append log files in `logs/`.
- Keep `logs/.gitkeep` tracked so the directory exists in fresh clones.
- Commit source changes and meaningful log-policy changes.
- Avoid committing private keys, tokens, generated secrets, or customer payment data.

## SSH keys

Do not paste private SSH keys into Codex or any chat. Configure SSH keys locally and add the public key to GitHub. Once configured, this repo can use the SSH remote above for normal `git push` operations.
