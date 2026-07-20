# Security Policy

## Supported versions

Only the latest `main` and the most recent release tag receive security fixes.

| Version | Supported |
|---|---|
| latest main | yes |
| latest tag  | yes |
| older tags  | no |

## Reporting a vulnerability

Email security issues to `ciroautuori@users.noreply.github.com` (or open a
*private* security advisory via the GitHub Security tab). Do not open a public
issue for a vulnerability. We will acknowledge within 72 hours, triage within
7 days, and coordinate a fix + advisory release.

## Scope

This repository is a documentation/skill repository (Markdown, Python helper
script, GitHub Actions). Scope of security issues: typosquatted install paths,
malicious code in `scripts/`, workflow secrets misuse, attribution/credential
leaks. Out of scope: generated 3D content produced by users of the skill.

## Attribution security

`scripts/export_glb.py` runs Blender headless via subprocess. It does not
execute remote code and does not download anything. Still: only feed it
`.blend` files you produced or fully trust.
