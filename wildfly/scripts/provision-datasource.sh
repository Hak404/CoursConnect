#!/usr/bin/env bash
# ============================================================
# CoursConnect - WildFly datasource provisioning (env-driven)
# ============================================================
# Runs INSIDE the WildFly container (docker exec) and (re)creates the
# JNDI datasource java:jboss/datasources/CoursConnectDS from environment
# variables. Safe to run repeatedly (removes then re-adds the datasource).
#
# Local Docker defaults keep the original dev connection working:
#   jdbc:mysql://coursconnect-db:3306/coursconnect
#
# Production (Aiven MySQL): provide MYSQL_HOST/MYSQL_PORT/MYSQL_DATABASE/
# MYSQL_USER/MYSQL_PASSWORD and set MYSQL_SSL_MODE=REQUIRED (or VERIFY_CA).
#
# Environment variables (all optional, local defaults shown):
#   MYSQL_HOST        coursconnect-db
#   MYSQL_PORT        3306
#   MYSQL_DATABASE    coursconnect
#   MYSQL_USER        root
#   MYSQL_PASSWORD    coursconnect   (local docker-compose password, dev only)
#   MYSQL_SSL_MODE    DISABLED | REQUIRED | VERIFY_CA | VERIFY_IDENTITY
set -euo pipefail

JBOSS_HOME="${JBOSS_HOME:-/opt/jboss/wildfly}"
CLI_FILE="$(mktemp)"

MYSQL_HOST="${MYSQL_HOST:-coursconnect-db}"
MYSQL_PORT="${MYSQL_PORT:-3306}"
MYSQL_DATABASE="${MYSQL_DATABASE:-coursconnect}"
MYSQL_USER="${MYSQL_USER:-root}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-coursconnect}"
MYSQL_SSL_MODE="${MYSQL_SSL_MODE:-DISABLED}"
MYSQL_VALIDATION_CHECKER="org.jboss.jca.adapters.jdbc.extensions.mysql.MySQLValidConnectionChecker"

CONN_PARAMS="serverTimezone=UTC&useUnicode=true&characterEncoding=UTF-8"
if [ "${MYSQL_SSL_MODE}" = "DISABLED" ] || [ -z "${MYSQL_SSL_MODE}" ]; then
    CONN_PARAMS="useSSL=false&${CONN_PARAMS}"
else
    CONN_PARAMS="useSSL=true&sslMode=${MYSQL_SSL_MODE}&${CONN_PARAMS}"
fi
CONNECTION_URL="jdbc:mysql://${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}?${CONN_PARAMS}"

# JDBC driver module (needed once per fresh container).
if [ ! -f "${JBOSS_HOME}/modules/com/mysql/main/module.xml" ]; then
    "${JBOSS_HOME}/bin/jboss-cli.sh" --connect \
        --command="module add --name=com.mysql --resources=${JBOSS_HOME}/modules/custom/com/mysql/main/mysql-connector-j-8.3.0.jar --dependencies=java.se,javax.api,jakarta.resource.api,jakarta.transaction.api" \
        || true
fi

cat > "${CLI_FILE}" <<EOF
if (outcome != success) of /subsystem=datasources/jdbc-driver=mysql:read-resource
    /subsystem=datasources/jdbc-driver=mysql:add(driver-name=mysql,driver-module-name=com.mysql,driver-class-name=com.mysql.cj.jdbc.Driver)
end-if
if (outcome == success) of /subsystem=datasources/data-source=CoursConnectDS:read-resource
    /subsystem=datasources/data-source=CoursConnectDS:remove()
end-if
data-source add --name=CoursConnectDS --jndi-name=java:jboss/datasources/CoursConnectDS --driver-name=mysql --connection-url="${CONNECTION_URL}" --user-name="${MYSQL_USER}" --password="${MYSQL_PASSWORD}" --min-pool-size=1 --max-pool-size=10 --validate-on-match=true --valid-connection-checker-class-name="${MYSQL_VALIDATION_CHECKER}"
EOF

"${JBOSS_HOME}/bin/jboss-cli.sh" --connect --file="${CLI_FILE}"
rm -f "${CLI_FILE}"

echo "CoursConnectDS datasource provisioned: ${CONNECTION_URL} (user=${MYSQL_USER}, sslMode=${MYSQL_SSL_MODE})"