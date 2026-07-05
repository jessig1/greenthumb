# GreenThumb

Gardening planner app. Users manage Gardens (indoor or outdoor); each Garden holds Containers
(raised beds, pots, in-ground plots, etc.); each Container holds planned or actual Plants. Every
Plant carries a care guide (light, water, soil, feeding, pruning) and a harvest guide when
applicable.

Deployed to AWS as a solo/hobby project — optimized hard for near-$0 idle cost, with a clear path
to scale if needed later.

## Repo layout

- `backend/` — Spring Boot (Java 25) REST API
- `frontend/` — React + TypeScript + Vite web app
- `infra/` — Terraform (AWS)
- `docker-compose.yml` — local Postgres for development

## Tech stack

| Layer | Choice |
|---|---|
| Backend | Java 25 + Spring Boot 4, package-by-domain modular monolith |
| Frontend | React 19 + TypeScript + Vite, Tailwind v4 + shadcn/ui |
| Auth | Amazon Cognito, Hosted UI / Managed Login + PKCE |
| Database | Aurora PostgreSQL, Serverless scale-to-zero |
| Compute | AWS App Runner (container from ECR) |
| Static hosting | S3 + CloudFront |
| IaC | Terraform |
| CI/CD | GitHub Actions |

## Running locally

- `docker compose up -d` — starts local Postgres on `localhost:5432` (db/user/pass all `greenthumb`)
- Backend: `cd backend && ./mvnw spring-boot:run` — starts on `:8080` (needs `JAVA_HOME` pointing
  at a JDK 25 install)
- Backend tests: `cd backend && ./mvnw test` — uses Testcontainers (spins up its own Postgres via
  Docker; independent of `docker compose`, so it works even without the compose stack running)
- Frontend: `cd frontend && npm run dev` — starts on `:5173`
- Frontend build: `cd frontend && npm run build`
- API docs: `http://localhost:8080/swagger-ui.html` once the backend is running (currently returns
  401 — see below)

## Conventions / invariants

- **Authorization**: every Garden/Container/PlantedPlant service method must filter by the
  authenticated user's `ownerId` (derived from the Cognito JWT `sub`). Nesting a route under a
  Garden's ID does not by itself enforce that the caller owns that Garden — this must be checked
  explicitly in the service layer.
- JPA enums are always mapped `STRING`, never `ORDINAL` — keeps future enum additions from
  shifting existing data.
- Flyway migrations are append-only: never edit a migration that's already been applied; add a new
  one instead.
- `PlantedPlant.status` is the source of truth; `plantedDate` is constrained by it via a DB check
  constraint, not independently trusted.
- Postgres version (17) is pinned consistently across `docker-compose.yml` and the backend's
  Testcontainers config — keep them in sync if this is ever bumped.
- **Cost guardrail**: never add a NAT Gateway to the Terraform without flagging it first — at
  ~$32/month it would roughly triple this project's AWS bill. App Runner's VPC Connector reaches
  Aurora privately without needing one.
- The backend currently returns 401 on every endpoint (including Swagger UI) — this is expected.
  `spring-boot-starter-security-oauth2-resource-server` is on the classpath but no Cognito
  issuer-uri or `SecurityConfig` exists yet; Spring Security's default-deny is active until real
  Cognito JWT validation is wired up.

## Status / roadmap

Currently scaffolded (tooling, empty Spring Boot + React apps, local Postgres). Not yet built:
domain entities/migrations, REST endpoints, frontend screens, or any AWS deployment — no Cognito
pool, Aurora instance, or other cloud resources exist yet.

Planned build order: MVP (entities → backend CRUD → frontend screens) → cloud deployment → photo
uploads → calendar/reminders + AI garden planning/diagnosis (via Bedrock). The data model and
infra choices were made so the calendar and AI features can be added later without reworking the
MVP schema.
