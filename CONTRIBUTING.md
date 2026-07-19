# Contributing to three-governance

Thanks for considering a contribution. This skill is opinionated on purpose:
the goal is production-grade governance, not a grab-bag of techniques. Keep
contributions aligned with that intent.

## Scope

- **Bug fixes and errata** to existing rules or reference files are always
  welcome. Include the reproduction or source.
- **New rules / anti-patterns** must come with: a code-review tell (how you spot
  it), why it is wrong, and the fix. Ideally with a real-world failure mode.
- **New reference sections** should be in the same terse style: rules first,
  minimal prose, tables and code where they help.
- **Version updates** (SOTA stack, Three.js revision, browser matrix): open an
  issue first if the change is non-trivial; keep "July 2026" style dating clear
  about the verification date.

## Style

- English only.
- Markdown reference files. Code blocks are TypeScript / GLSL / Python / bash.
- No robotic boilerplate comments in code samples — only comments that explain
  a non-obvious decision.
- SOTA APIs as of the stated date. Note the Three.js revision where relevant.

## Attribution

This project reuses vendor API reference material under MIT, with errata
headers. If you add or modify such material, update `CREDITS.md`. If you find a
missing or incorrect attribution, open an issue or PR — corrections are
especially welcome.

## Committing

- Keep changes focused. One topic per PR.
- Do not commit secrets, `.env` files, or large binary assets.
- Do not edit the `.archive/` originals — they are the historical record of the
  Italian source; refactor the live files under `references/`, `scripts/`, and
  the root.

## License

By contributing you agree your contributions are licensed MIT, consistent with
the project license.
