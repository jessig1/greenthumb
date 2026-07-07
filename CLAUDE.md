# GreenThumb

Gardening planner app. Users manage Gardens (indoor or outdoor); each Garden holds Containers
(raised beds, pots, in-ground plots, etc.); each Container holds planned or actual Plants. Every
Plant carries a care guide (light, water, soil, feeding, pruning) and a harvest guide when
applicable.

Deployed to AWS as a solo/hobby project — optimized hard for near-$0 idle cost, with a clear path
to scale if needed later.

## Documentation map

This file has quick facts and cross-cutting conventions only. For anything deeper:

| Need | Read |
|---|---|
| Product overview, quick start | [`README.md`](README.md) |
| System design, data model, planned infra | [`.claude/docs/architecture.md`](.claude/docs/architecture.md) |
| REST conventions (the live endpoint list is `/swagger-ui.html`) | [`.claude/docs/api-conventions.md`](.claude/docs/api-conventions.md) |
| Backend patterns, module-adding playbook, testing gotchas | [`backend/CLAUDE.md`](backend/CLAUDE.md) (auto-loaded when working there) |
| Frontend patterns, feature-adding playbook | [`frontend/CLAUDE.md`](frontend/CLAUDE.md) (auto-loaded when working there) |
| How to run + verify the app end-to-end | `.claude/skills/run-app/` (auto-discovered by the `/run` skill) |

## Repo layout

- `backend/` — Spring Boot (Java 25) REST API (has its own `Makefile` + `CLAUDE.md`)
- `frontend/` — React + TypeScript + Vite web app (has its own `Makefile` + `CLAUDE.md`)
- `infra/` — Terraform (AWS) - not built yet
- `scripts/` — helper scripts shared by the Makefiles (e.g. `stop-process.ps1`)
- `docker-compose.yml` + `pg_hba.conf` — local Postgres for development
- `Makefile` — root orchestrator for the whole stack (`make help` to see everything)
- `package.json` (repo root) — **repo tooling only** (currently: `playwright-core`, for
  `.claude/skills/run-app`), not the app itself. The app's own dependencies are in
  `frontend/package.json`; the backend has no npm dependencies.

## Tech stack

| Layer | Choice |
|---|---|
| Backend | Java 25 + Spring Boot 4, package-by-domain modular monolith |
| Frontend | React 19 + TypeScript + Vite, Tailwind v4 + shadcn/ui |
| Auth | Amazon Cognito, Hosted UI / Managed Login + PKCE (planned - see below) |
| Database | Aurora PostgreSQL, Serverless scale-to-zero (planned); plain Postgres locally |
| Compute | AWS App Runner (container from ECR) (planned) |
| Static hosting | S3 + CloudFront (planned) |
| IaC | Terraform (planned) |
| CI/CD | GitHub Actions |

## Running locally

`make help` from the repo root lists everything (also `make -C backend help` / `make -C frontend
help` for stack-specific targets). The essentials:

- `make up` / `make down` — start or stop Postgres + backend + frontend together
- `make status` — check what's currently running
- `make backend-start` / `make backend-stop` — just the backend (`:8080`)
- `make frontend-start` / `make frontend-stop` — just the frontend (`:5173`)
- `make backend-test` — run backend tests (Testcontainers; needs Docker Desktop running, but not
  `make db-up` specifically - Testcontainers spins up its own Postgres)
- `make db-reset` — wipe the local Postgres volume and restart it clean
- `make clean` — remove build artifacts and dev logs

`backend-start`/`frontend-start` run in the background and log to `.dev-logs/` (see `make
backend-logs` / `frontend-logs`); stopping is done by matching on process command line
(`scripts/stop-process.ps1`), not PID files, since `mvnw`/`npm` wrap the actual `java.exe`/`node.exe`
process rather than being it.

To actually drive the app (not just start it) - create a garden, verify the plant catalog renders,
etc. - use the `run-app` skill (`.claude/skills/run-app/`), which scripts this with headless
Edge/Chrome via `playwright-core`. Prefer it over ad hoc verification: it already resolved several
environment-specific gotchas (see below) that would otherwise need rediscovering each time.

Without `make`: `docker compose up -d` for Postgres, `cd backend && ./mvnw spring-boot:run` for the
backend (needs `JAVA_HOME` pointing at a JDK 25 install), `cd frontend && npm run dev` for the
frontend. API docs at `http://localhost:8080/swagger-ui.html` once the backend is running.

## Conventions that span both stacks

- **Auth is currently a dev-only stub, not real Cognito.** `DevUserResolutionFilter`
  (`backend/.../common/auth/`) resolves the caller from an `X-Dev-User-Id` header (default
  `local-dev-user`), auto-provisioning an `AppUser` exactly like the future Cognito-JWT-based
  resolver will from a token's `sub`/`email` claims. `SecurityConfig` currently `permitAll()`s
  everything. The frontend's `api/client.ts` sends the same fixed header on every request — there's
  no login screen yet. To simulate a second user locally, send a different `X-Dev-User-Id`. When
  Cognito exists: replace the filter + `SecurityConfig` with real JWT validation and add the
  frontend Hosted-UI/PKCE flow; the service layer's ownership logic (`backend/CLAUDE.md`) doesn't
  need to change.
- **Cost guardrail**: never add a NAT Gateway to the Terraform without flagging it first — at
  ~$32/month it would roughly triple this project's AWS bill. App Runner's VPC Connector reaches
  Aurora privately without needing one.

## Local-tooling gotchas (this machine/environment specifically)

These aren't about the app's code - they're about the Windows dev environment itself. Worth
knowing before assuming a tool is misbehaving:

- **GNU Make on this machine (ezwinports build) skips the shell for "simple" recipe lines** - any
  line with no shell metacharacter (redirect, pipe, `&&`, parens, etc.) gets exec'd directly via
  Windows process creation instead of through `sh.exe`, which breaks `./` relative-path syntax
  (`./mvnw ...` fails with `'.' is not recognized...`). Every Makefile recipe that needs `./` either
  already has a redirect/parens/pipe, or ends in a deliberate no-op `;` to force real shell
  invocation - don't remove those semicolons thinking they're stray.
- **Local Postgres needs an explicit permissive `pg_hba.conf`** (mounted via `docker-compose.yml`,
  see `pg_hba.conf` at repo root). This Docker Desktop setup has been observed to present
  host→container connections under a bridge-gateway IP (e.g. `172.18.0.1`) rather than `127.0.0.1`,
  which the postgres image's default pg_hba.conf (exact loopback only) rejects with
  `FATAL: no pg_hba.conf entry for host ...`. If this error reappears after a `docker compose down
  -v` / volume wipe, confirm the mount and `command: -c hba_file=...` override in
  `docker-compose.yml` are still intact - the custom file only takes effect on a fresh volume init.
- Backend and frontend each have their own ecosystem-version gotchas (Spring Boot 4 / Jackson 3 /
  Java 25 for the backend, TypeScript `erasableSyntaxOnly` / React Router v8 / shadcn tsconfig
  aliasing for the frontend) - see their respective `CLAUDE.md` files rather than duplicating them
  here, since they only matter when you're actually touching that stack.

## Status / roadmap

Phase 1 MVP backend and frontend are built and verified end-to-end (migrations, all CRUD
endpoints with ownership enforcement, and the full garden → container → planting UI flow,
including the plant catalog/care-guide screens). Not yet done: any AWS deployment — no Cognito
pool, Aurora instance, or other cloud resources exist yet, and real auth isn't wired up (see the
dev-stub note above).

Planned next: cloud deployment → photo uploads → calendar/reminders + AI garden planning/diagnosis
(via Bedrock). The data model and infra choices were made so the calendar and AI features can be
added later without reworking the MVP schema.
