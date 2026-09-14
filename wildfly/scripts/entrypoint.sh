#!/usr/bin/env bash
# =============================================================================
# CoursConnect — WildFly entrypoint for production (Render / Docker)
# Handles: PORT binding, datasource provisioning, WAR deployment, SIGTERM
# =============================================================================
# Render provides a PORT env var (mandatory). WildFly's HTTP listener binds to
# it via the jboss.http.port system property. The management interface stays on
# 9990 (localhost) for the CLI steps below.
# =============================================================================
set -euo pipefail

JBOSS_HOME="${JBOSS_HOME:-/opt/jboss/wildfly}"
PORT="${PORT:-8080}"
STAGING_WAR="${JBOSS_HOME}/coursconnect-api.war"
WILDFLY_PID=""

cleanup() {
    echo "[entrypoint] Shutting down..."
    if [ -n "${WILDFLY_PID}" ]; then
        kill "${WILDFLY_PID}" 2>/dev/null || true
        wait "${WILDFLY_PID}" 2>/dev/null || true
    fi
}
trap cleanup SIGTERM SIGINT

# --- 1. Start WildFly in background, HTTP bound to $PORT ---
echo "[entrypoint] Starting WildFly on port ${PORT}..."
"${JBOSS_HOME}/bin/standalone.sh" -b 0.0.0.0 -Djboss.http.port="${PORT}" &
WILDFLY_PID=$!

# --- 2. Wait for management interface to be ready ---
echo "[entrypoint] Waiting for WildFly management interface..."
for i in $(seq 1 90); do
    if "${JBOSS_HOME}/bin/jboss-cli.sh" --connect \
        --command=":read-resource" >/dev/null 2>&1; then
        echo "[entrypoint] WildFly is ready."
        break
    fi
    if [ "$i" -eq 90 ]; then
        echo "[entrypoint] ERROR: WildFly did not start within 180s."
        exit 1
    fi
    sleep 2
done

# --- 3. Provision MySQL datasource (MYSQL_* env vars) ---
echo "[entrypoint] Provisioning MySQL datasource..."
bash "${JBOSS_HOME}/scripts/provision-datasource.sh"

# --- 4. Deploy WAR via jboss-cli (staging, outside the scanned dir to avoid
#        redeploy loops — see AGENTS.md) ---
if [ -f "${STAGING_WAR}" ]; then
    echo "[entrypoint] Deploying coursconnect-api.war..."
    "${JBOSS_HOME}/bin/jboss-cli.sh" --connect \
        --command="deploy ${STAGING_WAR} --force"
    echo "[entrypoint] WAR deployed."
else
    echo "[entrypoint] WARNING: WAR not found at ${STAGING_WAR}"
fi

rm -f "${STAGING_WAR}"

echo "[entrypoint] CoursConnect backend is running on port ${PORT}"

# --- 5. Keep running — wait for WildFly process ---
wait "${WILDFLY_PID}"