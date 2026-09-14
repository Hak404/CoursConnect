# =============================================================================
# CoursConnect Backend — Production Dockerfile (Render / any Docker host)
# WildFly 33.0.1.Final + Java 21 + MySQL (Aiven in production)
# =============================================================================
# Build (repo root):  docker build -t coursconnect-backend .
# Run:                 docker run -p 8081:8080 -e MYSQL_HOST=... -e MYSQL_PASSWORD=... coursconnect-backend
# Render: sets PORT env var automatically; the entrypoint binds WildFly to it.
# No secrets in this file — all credentials come from environment variables.
# =============================================================================

# ---- Stage 1: Build WAR with Maven + Java 21 ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY backend/pom.xml .
COPY backend/src ./src
# Runs unit tests (no external service needed) — fails the build on regression.
RUN mvn -q clean package

# ---- Stage 2: WildFly 33.0.1.Final runtime (Java 21) ----
FROM quay.io/wildfly/wildfly:33.0.1.Final-jdk21

# Staging WAR (deployed via jboss-cli by the entrypoint — NOT dropped in the
# scanned standalone/deployments dir, which caused redeploy loops on this host).
COPY --from=build /app/target/coursconnect-api.war /opt/jboss/wildfly/coursconnect-api.war

# MySQL JDBC driver module (consumed by provision-datasource.sh).
COPY wildfly/modules/com/mysql/main /opt/jboss/wildfly/modules/custom/com/mysql/main

# Scripts: provision-datasource.sh + entrypoint.sh.
# Invoked via bash (no exec bit needed) because the WildFly image runs as a
# non-root USER, so chmod inside the build would fail (EPERM).
COPY wildfly/scripts /opt/jboss/wildfly/scripts

EXPOSE 8080

ENTRYPOINT ["/bin/bash", "/opt/jboss/wildfly/scripts/entrypoint.sh"]