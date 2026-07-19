# Growth & launch plan — three-governance

Goal: ship a useful, well-attributed, MIT-licensed Codex/Claude skill for
production-grade React Three Fiber governance, and grow it organically from 0
to its first 100-500 stars. No astroturfing, no spam, no bought stars.

## 1. Positioning

- **One-liner**: "The first Codex/Claude skill that audits a 3D web experience
  against a real scorecard — budgets, anti-patterns, accessibility — not just
  demos."
- **Differentiator vs competitors** (scanned July 2026):
  - vs `pmndrs/react-three-next` (2858 stars): that is a starter template; this
    is a *governance layer* you drop on top of any R3F project.
  - vs `pmndrs/drei` (9749): drei is helpers; this is the rules + audit
    scorecard that decide *when* to reach for which drei API.
  - vs `14islands/r3f-scroll-rig` (955): scroll-rig solves one problem
    (scroll sync); this covers lighting, state, post chain, GLB pipeline,
    physics, WebGPU migration and the audit scorecard.
  - vs `darkroomengineering/satus` (968): satus is an App Router starter;
    this is engine-agnostic governance.
  - vs ad-hoc Italian/ES skills: most are personal notes; this is EN-only,
  MIT, audited, with vendor errata preserved.

## 2. Repo hygiene that earns trust (and stars)

- ✅ `README.md` with badges (license, skill, PRs welcome), one-liner, install,
  contents, the 13 hard rules, scorecard teaser.
- ✅ `LICENSE` MIT, dated 2026, author field filled.
- ✅ `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `CREDITS.md` with errata headers.
- ✅ `SKILL.md` frontmatter with `name`, `description` (trigger words), `license`.
- ✅ Topics on GitHub (see below).
- ✅ Originals preserved under `.archive/` for attribution transparency.
- Next: GitHub Discussions enabled (Q&A category + Showcase category).
- Next: an `examples/` folder with one minimal, working Next.js + R3F scene
  that passes the 88/100 scorecard (the concrete proof).

## 3. GitHub repo setup checklist

1. Create `ciroautuori/three-governance` on GitHub (public, MIT).
2. Topics (limit 20):
   `react-three-fiber`, `threejs`, `r3f`, `webgl`, `3d-web`, `codex-skill`,
   `claude-skill`, `agent-skill`, `skill`, `performance`, `accessibility`,
   `webgpu`, `zustand`, `nextjs`, `gltf`, `production`, `governance`,
   `awwwards`, `best-practices`, `frontmatter`
3. Enable: Issues, Discussions, Projects (optional), Wiki off, Pages off (README
   is the homepage).
4. Branch protection on `main`: require PR review, require status checks (once
   CI exists), require linear history.
5. Add a `CODEOWNERS` file (yourself for `references/`, `SKILL.md`).
6. Add a `FUNDING.yml` once there is traction (sponsors/ko-fi) — optional.

## 4. CI / quality gates (cheap, high credibility)

- GitHub Actions workflow:
  - lint markdown (`markdownlint`) on `*.md`.
  - `python3 -m py_compile scripts/export_glb.py` (proof the script runs).
  - a `verify-eng` check: scan `references/**/*.md` for Italian accent chars
    and fail if any are present (enforces the EN-only contract).
- These three checks publish green badges on the README — strong signal for
  drive-by stargazers that the repo is curated.

## 5. Launch sequence (one-week drumbeat)

**Day -3 (pre-launch)**
- Polish README hero, pin top issues with `good first issue` labels.
- Prepare 3 example GIF/video clips: (a) demo scene before/after polish chain,
  (b) the audit scorecard filling out, (c) `export_glb.py` producing a 95%
  smaller GLB.

**Day 0**
- Push, tag `v0.1.0`, write GitHub Release notes citing the scorecard + the 13
  hard rules.
- Post on `r/reactthreefiber`, `r/threejs`, `r/webdev` with the "before/after"
  angle (rule-of-thumb content, not "look at me").
- Cross-post to Hacker News (title: "A Codex skill that audits R3F scenes
  against a real scorecard") and `lobste.rs`.
- Post in the pmndrs Discord `#showcase` (one message, with the demo GIF).

**Day +1 to +7**
- One tweet/LinkedIn post per day, each on a single hard rule or a diagnostic
  table row (example: "Why `metalness > 0` without an envMap = black blob").
- Open 3 issues labeled `good first issue` (e.g. add an example scene, add a
  SvelteKit variant, add a Vue variant) so contributors have low-friction
  entry points.
- Reply to existing R3F questions (SO, Discord, Reddit) where this skill's
  rules answer the question — link back only when genuinely useful; never
  paste a bare repo link.

## 6. Ongoing growth loops

- **Showcase Discussions thread**: ask users to post their scene + scorecard
  result; pin the best ones. Each showcase is a reverse testimonial.
- **"Rule of the week"**: post one hard rule / anti-pattern per week on
  Twitter/LinkedIn with the WHY + the fix. Compounds into a content series.
- **Changelog discipline**: every breaking change in three.js (r184, r185)
  triggers an errata PR + a release. The "stays current with three.js" repo is
  the one people star and keep.
- **Reciprocity**: open issues on `pmndrs/drei`, `14islands/r3f-scroll-rig`
  with genuine findings from the audit — not asking for stars, contributing
  back. Some of those maintainers will look at the skill.
- **Translations**: keep EN-only as the source of truth, but welcome community
  translations under `i18n/<lang>/` — gives contributors ownership and grows
  the contributor graph.

## 7. Anti-patterns to avoid (what kills a launch)

- One-time "starring drive" via DMs. Stars decay; trust does not.
- A README that is a wall of text. Lead with the one-liner + a demo.
- Marketing before proof. Ship the `examples/` scorecard-passing scene before
  the big post.
- Reaching out to influencers cold asking them to star. Instead, ship useful
  replies in their threads and let them find it.

## 8. KPIs

- Week 1: 10-30 stars, 2-5 forks, 1-2 external contributors.
- Month 1: 50-150 stars, at least one external merged PR.
- Month 3: 200-500 stars if the "rule of the week" + showcase threads run
  consistently and three.js errata is kept current.
