#!/usr/bin/env bash
set -euo pipefail

# ====== CONFIG (env-driven) ======
: "${RENDER_API_KEY:?Set RENDER_API_KEY}"
: "${RENDER_OWNER_ID:?Set RENDER_OWNER_ID (your user or team id)}"
: "${RENDER_SERVICE_NAME:=astradio-api}"
: "${RENDER_REGION:=oregon}"                          # adjust if needed
: "${RENDER_REPO:=$(git config --get remote.origin.url)}"
: "${RENDER_BRANCH:=main}"
: "${RENDER_ROOT_DIR:=apps/api}"
: "${RENDER_BUILD_COMMAND:=pnpm i --frozen-lockfile && pnpm -w build && pnpm -F @astradio/api build}"
: "${RENDER_START_COMMAND:=node dist/index.js}"
: "${RENDER_HEALTHCHECK_PATH:=/health}"               # your API health endpoint

# Optional: reuse an existing service by id/name to avoid creating a new one
: "${RENDER_SERVICE_ID:=}"                            # if empty, script will create
: "${RENDER_ENV_VARS_JSON:=[]}"                       # JSON array of {key,value,preview,production}

# Vercel CLI auth: token + scope/team recommended for non-interactive
: "${VERCEL_TOKEN:?Set VERCEL_TOKEN}"
: "${VERCEL_ORG_ID:?Set VERCEL_ORG_ID}"               # team or user id
: "${VERCEL_PROJECT_NAME:=astradio-web}"              # new or existing project name
: "${VERCEL_WEB_DIR:=apps/web}"                       # Next.js app path in monorepo
: "${VERCEL_NODE_ENV:=18}"                            # or 20/22 if needed

# ====== Helpers ======
jq() { command jq -r "$@"; } # require jq installed
api() { curl -sfSL -H "Authorization: Bearer ${RENDER_API_KEY}" -H "Content-Type: application/json" "$@"; }

# ====== 1) Ensure/CREATE Render service ======
if [[ -z "${RENDER_SERVICE_ID}" ]]; then
  echo "Creating Render service '${RENDER_SERVICE_NAME}'..."
  # Build request body
  read -r -d '' BODY <<JSON
{
  "autoDeploy": true,
  "name": "${RENDER_SERVICE_NAME}",
  "ownerId": "${RENDER_OWNER_ID}",
  "serviceDetails": {
    "env": "node",
    "region": "${RENDER_REGION}",
    "plan": "starter",
    "repo": "${RENDER_REPO}",
    "branch": "${RENDER_BRANCH}",
    "buildCommand": "${RENDER_BUILD_COMMAND}",
    "startCommand": "${RENDER_START_COMMAND}",
    "rootDir": "${RENDER_ROOT_DIR}",
    "healthCheckPath": "${RENDER_HEALTHCHECK_PATH}"
  },
  "type": "web_service"
}
JSON

  RESP="$(api -X POST https://api.render.com/v1/services -d "${BODY}")" # create service
  RENDER_SERVICE_ID="$(echo "${RESP}" | jq '.id')"
  echo "Render service id: ${RENDER_SERVICE_ID}"
else
  echo "Using existing Render service id: ${RENDER_SERVICE_ID}"
fi

# ====== 2) Set Render env vars (idempotent) ======
if [[ "${RENDER_ENV_VARS_JSON}" != "[]" ]]; then
  echo "Upserting Render env vars..."
  api -X PUT "https://api.render.com/v1/services/${RENDER_SERVICE_ID}/env-vars" \
      -d "{\"envVars\": ${RENDER_ENV_VARS_JSON}}" >/dev/null
fi

# ====== 3) Trigger a Render deploy and read URL ======
echo "Triggering Render deploy..."
DEPLOY="$(api -X POST "https://api.render.com/v1/services/${RENDER_SERVICE_ID}/deploys")"  # fire & forget
# Poll for service details to get hostname/url
sleep 5
SERVICE="$(api "https://api.render.com/v1/services/${RENDER_SERVICE_ID}")"
# Prefer custom url if present; fall back to onrender host
RENDER_URL="$(echo "${SERVICE}" | jq '.service.details.url // .service.service.hostnames[0] // empty')"
if [[ -z "${RENDER_URL}" ]]; then
  echo "Waiting for Render URL..."
  for _ in {1..30}; do
    sleep 5
    SERVICE="$(api "https://api.render.com/v1/services/${RENDER_SERVICE_ID}")"
    RENDER_URL="$(echo "${SERVICE}" | jq '.service.details.url // .service.service.hostnames[0] // empty')"
    [[ -n "${RENDER_URL}" ]] && break
  done
fi
echo "Render API URL: ${RENDER_URL}"

# ====== 4) Vercel: link project at monorepo root and set env ======
echo "Linking Vercel project (monorepo root)…"
export VERCEL_ORG_ID VERCEL_TOKEN
# Link (creates if missing). Vercel recommends invoking from monorepo root.
# This writes .vercel/project.json
vercel link --yes --project "${VERCEL_PROJECT_NAME}" --scope "${VERCEL_ORG_ID}" >/dev/null
# Ensure the Next.js app directory is linked too (writes nested .vercel if desired)
pushd "${VERCEL_WEB_DIR}" >/dev/null
vercel link --yes --project "${VERCEL_PROJECT_NAME}" --scope "${VERCEL_ORG_ID}" >/dev/null

echo "Setting Vercel env var NEXT_PUBLIC_API_URL for all envs…"
# Non-interactive env add: pipe value for each environment
printf "%s" "${RENDER_URL}" | vercel env add NEXT_PUBLIC_API_URL production --token "${VERCEL_TOKEN}" --scope "${VERCEL_ORG_ID}" || true
printf "%s" "${RENDER_URL}" | vercel env add NEXT_PUBLIC_API_URL preview    --token "${VERCEL_TOKEN}" --scope "${VERCEL_ORG_ID}" || true
printf "%s" "${RENDER_URL}" | vercel env add NEXT_PUBLIC_API_URL development --token "${VERCEL_TOKEN}" --scope "${VERCEL_ORG_ID}" || true

# Optional: Node version hint
printf "%s" "${VERCEL_NODE_ENV}" | vercel env add NODE_VERSION production --token "${VERCEL_TOKEN}" --scope "${VERCEL_ORG_ID}" || true
printf "%s" "${VERCEL_NODE_ENV}" | vercel env add NODE_VERSION preview    --token "${VERCEL_TOKEN}" --scope "${VERCEL_ORG_ID}" || true
printf "%s" "${VERCEL_NODE_ENV}" | vercel env add NODE_VERSION development --token "${VERCEL_TOKEN}" --scope "${VERCEL_ORG_ID}" || true

echo "Deploying Next.js (prebuilt -> prod)…"
# Build locally then deploy prebuilt output to Production (non-interactive)
pnpm i --frozen-lockfile
pnpm -w build
vercel build --token "${VERCEL_TOKEN}" --scope "${VERCEL_ORG_ID}"
vercel deploy --prebuilt --prod --yes --token "${VERCEL_TOKEN}" --scope "${VERCEL_ORG_ID}"

popd >/dev/null

echo "✅ Done. API: ${RENDER_URL}"
