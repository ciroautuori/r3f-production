#!/usr/bin/env bash
# Idempotent installer for Forgejo + forgejo-runner + GitHub runner on one VPS.
# Run as a non-root user with sudo. Safe to re-run.
set -euo pipefail

FORGEJO_PORT="${FORGEJO_PORT:-3000}"
FORGEJO_SSH_PORT="${FORGEJO_SSH_PORT:-2222}"
RUNNER_USER="${RUNNER_USER:-runner}"

echo "==> Ensure Docker"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
sudo usermod -aG docker "$USER" || true

echo "==> Forgejo server (container)"
if ! docker ps --format {{.Names}} | grep -q ^forgejo; then
  docker run -d --name forgejo \
    -p "${FORGEJO_PORT}:3000" -p "${FORGEJO_SSH_PORT}:22" \
    -v forgejo-data:/data \
    --restart unless-stopped \
    codeberg.org/forgejo/forgejo:7
else
  echo "forgejo already running"
fi

echo "==> forgejo-runner (container, shares docker.sock for job isolation)"
if ! docker ps --format {{.Names}} | grep -q ^forgejo-runner; then
  echo "Register the runner from the Forgejo UI first (Site Admin -> Actions -> Runners)."
  echo "Then set FORGEJO_RUNNER_REGISTRATION_TOKEN and re-run this script."
  if [ -z "${FORGEJO_RUNNER_REGISTRATION_TOKEN:-}" ]; then
    echo "SKIP: FORGEJO_RUNNER_REGISTRATION_TOKEN not set. Get it from the Forgejo UI."
  else
    docker run -d --name forgejo-runner \
      -v /var/run/docker.sock:/var/run/docker.sock \
      -v forgejo-runner-data:/data \
      -e FORGEJO_INSTANCE_URL="http://127.0.0.1:${FORGEJO_PORT}" \
      -e FORGEJO_RUNNER_REGISTRATION_TOKEN="$FORGEJO_RUNNER_REGISTRATION_TOKEN" \
      --restart unless-stopped \
      codeberg.org/forgejo/runner:latest
  fi
else
  echo "forgejo-runner already running"
fi

echo "==> (optional) GitHub Actions self-hosted runner"
GH_RUNNER_DIR="${GH_RUNNER_DIR:-/srv/gh-runner}"
if [ ! -d "$GH_RUNNER_DIR" ]; then
  echo "To also pick up GitHub jobs, run:"
  echo "  sudo mkdir -p $GH_RUNNER_DIR && sudo chown $USER $GH_RUNNER_DIR"
  echo "  cd $GH_RUNNER_DIR"
  echo "  curl -o actions-runner.tar.gz -L https://github.com/actions/runner/releases/latest/download/actions-runner-linux-x64-2.319.0.tar.gz"
  echo "  tar xzf actions-runner.tar.gz"
  echo "  ./config.sh --url https://github.com/ciroautuori/r3f-production --token <REGISTRATION_TOKEN> --name soliso-gh --labels self-hosted,linux,x64,web,python,blender"
  echo "  sudo ./svc.sh install && sudo ./svc.sh start"
else
  echo "github runner already installed at $GH_RUNNER_DIR"
fi

echo "==> Done. Open http://localhost:${FORGEJO_PORT} to finish Forgejo setup."
