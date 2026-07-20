# Self-hosted CI on one VPS (Soliso-style) for every EROS app/skill

## Why

GitHub Actions minutes are not free for private repos, and for an operator who
already runs a VPS fleet (StudioCentOS, GerardoRusso, GaetanoBaratto, Soliso)
the cheapest, fastest, most private CI is a self-hosted runner on a VPS you
already own. One runner can serve every EROS app, the r3f-production skill, and
any future product.

This doc is the 2026-07 SOTA design. It covers three open-source engines and
picks one. It is written so the same VPS can run CI for *all* EROS repos
(monorepo, skill repos, web apps, the Django/FastAPI backends) from one
installation.

## SOTA engine shortlist (July 2026)

| Engine | Standalone? | Actions-compatible syntax? | State |
|---|---|---|---|
| GitHub Actions self-hosted runner (`actions/runner`) | no, needs a GitHub repo | yes, 100% | most mature, lowest friction |
| Gitea Actions (Gitea + `gitea-actions-runner`) | yes, self-contained server | yes, `runs-on:` + `uses:` | GA in Gitea 1.21+, mature |
| Forgejo Actions (Forgejo + `forgejo-runner`) | yes, self-contained server | yes, compatible with Gitea/Actions | newer fork, active |

All three use Docker-based job isolation and the same `.github/workflows/*.yml`
syntax, so a workflow file is portable across them.

## Recommendation: Forgejo Actions on one VPS

For an operator who wants CI that does NOT depend on GitHub at all:

- Install **Forgejo** (single Go binary, ships its own git server + web UI + Actions).
- Install **forgejo-runner** (the runner that executes jobs in Docker containers).
- Point it at one VPS. It serves *every* repo, public and private, with no
  minute billing and no GitHub lock-in.
- The same `.github/workflows/ci.yml` runs on Forgejo Actions unchanged.

If any repo also lives on GitHub (like `r3f-production`), you can additionally
install `actions/runner` on the *same* VPS to pick up GitHub Actions jobs. Two
runners on one VPS is fine.

## Target topology (one VPS, multi-tenant)

```
+--------------------------------------------------+
| VPS (Soliso or StudioCentOS)                     |
|                                                  |
|  Docker daemon                                   |
|   +- forgejo-runner container   (Forgejo Actions)|
|  Forgejo server (native binary or container)     |
|     +- repo: eros                                |
|     +- repo: r3f-production                       |
|     +- repo: archloq, markettina apps, ...       |
|                                                  |
|  (optional) actions/runner service -> github.com |
|     +- picks up jobs for ciroautuori/r3f-*       |
+--------------------------------------------------+
```

One host, two runners, many repos, zero per-minute billing. Secrets live in the
Forgejo admin (encrypted at rest), runner logs never leave the VPS.

## Labels: how one runner serves every repo

Runners advertise **labels**. Workflows pick runners by label. This is how one
VPS serves every EROS app without confusion:

```yaml
jobs:
  verify:
    runs-on: [self-hosted, linux, x64]   # any self-hosted runner
  web-smoke:
    runs-on: [self-hosted, linux, x64, web]   # the machine with Chromium + Node
  blender-glb:
    runs-on: [self-hosted, linux, x64, blender]  # the machine with Blender 5.x
```

Recommended label set for one VPS:

| Label | Meaning | Installed on the runner |
|---|---|---|
| `self-hosted` | any self-hosted runner | always |
| `linux` / `x64` | platform | always |
| `web` | has node + chromium + playwright | yes |
| `python` | has python3 + uv | yes |
| `blender` | has headless Blender 5.x for `export_glb.py` | yes |
| `glibc` | glibc-based (for Blender) | yes |

Repos declare which labels they need; the same VPS serves all of them.

## Secrets per repo, one runner

Don't put EROS-wide secrets on the runner. Each repo has its own encrypted
secrets in the Forgejo UI; the runner only receives them as env at job time.
One runner, zero shared secret sprawl.

## Install (Forgejo + runner, one VPS)

```sh
# 1. Docker on the VPS (if missing)
curl -fsSL https://get.docker.com | sh

# 2. Forgejo server (container, persistent volume)
docker run -d --name forgejo \
  -p 3000:3000 -p 2222:22 \
  -v forgejo-data:/data \
  --restart unless-stopped \
  codeberg.org/forgejo/forgejo:7

# 3. Register a runner from the web UI (Site Administration -> Actions -> Runners)
#    Copy the registration token, then:

# 4. forgejo-runner (container, shares /var/run/docker.sock so jobs run in Docker)
docker run -d --name forgejo-runner \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v forgejo-runner-data:/data \
  -e FORGEJO_INSTANCE_URL=http://127.0.0.1:3000 \
  -e FORGEJO_RUNNER_REGISTRATION_TOKEN=<token> \
  --restart unless-stopped \
  codeberg.org/forgejo/runner:latest

# 5. Configure labels per docs/scripts/forgejo-runner-config.yaml
docker exec -it forgejo-runner forgejo-runner generate-config > /data/config.yaml
# edit labels, then restart
docker restart forgejo-runner
```

A ready config lives at `docs/scripts/forgejo-runner-config.yaml` in this repo.

## Install (GitHub Actions runner, same VPS, optional)

```sh
# Run alongside Forgejo to also pick up ciroautuori/r3f-production jobs
mkdir -p /srv/gh-runner && cd /srv/gh-runner
curl -o actions-runner.tar.gz -L \
  https://github.com/actions/runner/releases/latest/download/actions-runner-linux-x64-2.319.0.tar.gz
tar xzf actions-runner.tar.gz
./config.sh --url https://github.com/ciroautuori/r3f-production \
            --token <REGISTRATION_TOKEN> \
            --name soliso-gh \
            --labels self-hosted,linux,x64,web,python,blender
./run.sh          # foreground, or:
sudo ./svc.sh install && sudo ./svc.sh start
```

The runner serves *all* your GitHub repos by default; labels route specific
jobs to it. Pin the runner version; rotate the token on schedule.

## Portability of this repo's CI

`/.github/workflows/ci.yml` already uses standard Actions syntax. To run the
same job twice — once on GitHub-hosted, once on Forgejo — only change:

```yaml
verify:
  runs-on: [self-hosted, linux, x64, python]
```

No other change is needed. The workflow file below is the portable version.

## Workflow that runs everywhere

See `docs/scripts/portable-ci.yml` — identical checks (py_compile + English-only
enforcement) targeted at `[self-hosted, linux, x64, python]`. Copy it as
`.github/workflows/ci.yml` in any Forgejo repo, or run both files in the same
repo (GitHub-hosted + self-hosted) by giving them different `name:` values.

## Runner hardening (apply on the VPS)

- Single user, no shell for others: `useradd -m -s /bin/bash runner`.
- Docker rootless or `docker` group scoped to the runner user.
- `ufw`: only 22, 3000 (forgejo), 2222 (forgejo ssh) open.
- Disable swap on the runner to avoid OOM thrash mid-job.
- Job timeout global cap (`timeout-minutes: 15`) so a stuck job never pins the VPS.
- Rotate the runner registration token every 90 days.
- Keep the runner binary updated; subscribe to actions/runner security advisories.

## Failure modes and mitigations

| Failure | Mitigation |
|---|---|
| VPS dies | Forgejo data is a Docker volume -> `docker volume` snapshot cron to object storage |
| Runner hijack through a PR | Run jobs in Docker containers, never `runs-on: self-hosted` without container isolation; never allow PRs to write runner files |
| Secret leak via logs | Forgejo masks registered secrets automatically; never `echo $SECRET` |
| One repo exhausts CPU | Per-repo concurrency group: `concurrency: { group: ${{ github.repository }}, cancel-in-progress: false }` |
| Big GLB job OOMs the VPS | Use the `blender` label on a *separate* VPS (StudioCentOS) for heavy jobs |

## Cost

- 0 EUR per minute.
- One VPS you already pay for.
- Docker, Forgejo, runners: all open source.
- Optional object-storage snapshots: cents/month.

## See also

- `docs/scripts/portable-ci.yml` — workflow that runs on GitHub or Forgejo unchanged.
- `docs/scripts/forgejo-runner-config.yaml` — runner label/timeout config.
- `docs/scripts/install-runner.sh` — idempotent installer for both runners.
