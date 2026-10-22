# Image de production : frontend React compilé + backend Spring Boot, un seul
# conteneur. Le backend sert l'API (/api), les photos (/uploads) et le site (/).
#
#   docker build -t serge-immobilier .
#   docker run -p 8080:8080 --env-file backend/.env -v ssi-uploads:/app/uploads \
#     -v ssi-frontend:/app/frontend serge-immobilier
#
# Les variables d'environnement attendues sont décrites dans .env.example.

# ---------- 1. Compilation du frontend ----------
FROM node:22-alpine AS frontend
WORKDIR /build
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL=""
ARG VITE_SITE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_SITE_URL=$VITE_SITE_URL
RUN npm run build && rm -rf dist/assets/*.map

# ---------- 2. Compilation du backend ----------
FROM maven:3.9-eclipse-temurin-21 AS backend
WORKDIR /build
COPY backend/pom.xml .
RUN mvn -q -B dependency:go-offline
COPY backend/src ./src
RUN mvn -q -B -DskipTests package

# ---------- 3. Image finale ----------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app \
    && mkdir -p /app/uploads /app/frontend /app/bin \
    && chown -R app:app /app

COPY --from=backend /build/target/serge-immobilier-backend-*.jar /app/app.jar
COPY --from=frontend /build/dist /app/frontend

# Les photos sont sur un volume : redéployer le conteneur ne les efface pas.
# Le site compilé reste dans l'image (il est remplacé à chaque nouveau build).
VOLUME ["/app/uploads"]

ENV UPLOAD_DIR=/app/uploads \
    FRONTEND_DIR=/app/frontend \
    PORT=8080

USER app
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD wget -qO- http://127.0.0.1:8080/actuator/health | grep -q UP || exit 1

ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "/app/app.jar"]
