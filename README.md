# 🌱 GreenThumb

A gardening planner. Manage one or more Gardens (indoor or outdoor), each holding Containers
(raised beds, pots, in-ground plots, window boxes, hanging baskets...), each holding planned or
actual Plants. Every Plant in the catalog carries a care guide — light, water, soil, feeding, and
pruning requirements — plus a harvest guide when it's edible.

Built as a solo/hobby project, deployed to AWS, optimized hard for near-$0 idle cost with a clear
path to scale if it ever needs to.

## Tech stack

| Layer | Choice |
|---|---|
| Backend | Java 25 + Spring Boot 4, package-by-domain modular monolith |
| Frontend | React 19 + TypeScript + Vite, Tailwind v4 + shadcn/ui |
| Database | PostgreSQL (Aurora Serverless in the cloud, plain Postgres locally) |
| Auth | Amazon Cognito (Hosted UI / PKCE) — not wired up yet, see [Status](#status) |
| Cloud | AWS: App Runner, Aurora, S3 + CloudFront, Terraform, GitHub Actions |

## Quick start

Prerequisites: JDK 25, Node 20+, Docker Desktop, and `make` (GNU Make).

```bash
make up      # starts Postgres, backend (:8080), and frontend (:5173)
make status  # check what's running
make down    # stop everything
```

`make help` lists every available task (build, test, lint, logs, database reset, etc.). Backend-
and frontend-specific tasks also work from inside their own directory (`cd backend && make help`).

## Project structure

```
backend/    Spring Boot REST API (package-by-domain; see backend/CLAUDE.md)
frontend/   React + Vite web app (feature folders; see frontend/CLAUDE.md)
infra/      Terraform for the AWS deployment (not built yet)
scripts/    Helper scripts shared by the Makefiles
```

## Documentation

- [`CLAUDE.md`](CLAUDE.md) — quick facts and conventions for AI-assisted development
- [`.claude/docs/architecture.md`](.claude/docs/architecture.md) — system design and data model
- [`.claude/docs/api-conventions.md`](.claude/docs/api-conventions.md) — REST API conventions
  (the live endpoint list is the generated OpenAPI spec at `/swagger-ui.html`)
- [`backend/CLAUDE.md`](backend/CLAUDE.md) / [`frontend/CLAUDE.md`](frontend/CLAUDE.md) —
  stack-specific conventimons and how to extend each one

## Status

The Phase 1 MVP is built and verified end-to-end: full CRUD for Gardens → Containers → Plantings,
a 26-plant seeded catalog with care guides, and ownership-scoped access control. Authentication is
currently a local dev stub (no Cognito pool exists yet — see `CLAUDE.md`), and nothing is deployed
to AWS yet.

Planned next: cloud deployment, photo uploads, calendar/reminders, and an AI garden-planning /
plant-diagnosis assistant (via Bedrock).
