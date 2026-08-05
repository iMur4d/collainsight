#!/usr/bin/env bash
# Starts n8n + the Cloudflare Quick Tunnel and syncs the tunnel's freshly
# generated trycloudflare.com URL into .env, since Quick Tunnel URLs are
# not stable and change on every container restart. Run this instead of a
# plain `docker compose up -d` whenever you need Telegram's webhook working.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"
WORKFLOW_ID="Nm9U2yPuQV7jEsbq"

cd "$ROOT_DIR"

echo "==> Starting n8n and cloudflared..."
docker compose up -d n8n cloudflared

echo "==> Waiting for cloudflared to announce a tunnel URL..."
URL=""
for i in $(seq 1 30); do
  URL=$(docker logs collainsight-tunnel 2>&1 | grep -oE 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' | tail -1 || true)
  if [ -n "$URL" ]; then
    break
  fi
  sleep 2
done

if [ -z "$URL" ]; then
  echo "!! Could not detect a tunnel URL after 60s. Check: docker logs collainsight-tunnel"
  exit 1
fi

echo "==> Tunnel URL: $URL"

if grep -q '^N8N_WEBHOOK_URL=' "$ENV_FILE"; then
  sed -i "s|^N8N_WEBHOOK_URL=.*|N8N_WEBHOOK_URL=${URL}/|" "$ENV_FILE"
else
  echo "N8N_WEBHOOK_URL=${URL}/" >> "$ENV_FILE"
fi
echo "==> Updated .env"

echo "==> Restarting n8n to pick up the new webhook URL..."
docker compose restart n8n
sleep 8

echo "==> Re-publishing the workflow to force webhook re-registration..."
docker exec collainsight-n8n n8n publish:workflow --id="$WORKFLOW_ID" || true
docker compose restart n8n

echo "==> Done. Webhook URL: ${URL}/"
echo "==> Check activation succeeded: docker logs collainsight-n8n --tail 20"
