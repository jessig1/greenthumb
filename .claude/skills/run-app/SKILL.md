---
name: run-app
description: Launch and drive the GreenThumb full stack (Postgres, Spring Boot backend, Vite frontend) to verify a change actually works. Use when asked to run, start, verify, or screenshot the app, or to confirm a change works end-to-end (not just tests/build passing).
---

GreenThumb is a browser-driven web app (React frontend + Spring Boot REST API). This skill starts
the whole stack and drives it with headless Edge/Chrome via `playwright-core` - no bundled browser
download needed, since Edge/Chrome are already installed on this machine and `chromium-cli` isn't.

## Start

From the repo root:

```bash
make up       # starts Postgres, backend (:8080), frontend (:5173); polls for readiness
```

`make status` shows what's currently running. `make down` stops everything. See the root
`Makefile`/`CLAUDE.md` for the rest of the available tasks.

## Auth

Real local email/password auth: `/register` and `/login` pages issue a JWT that the frontend
stores in `localStorage` (`greenthumb.authToken`) and sends as `Authorization: Bearer <token>`.
Every other route is gated behind `ProtectedRoute` and redirects to `/login` without a valid
token. `verify.mjs` registers a fresh random-email user via the UI at the start of its run and
reuses that account's token (read back out of `localStorage`) for its API cleanup calls. To test
cross-user isolation, register a second account (a fresh `page.context()` avoids sharing
`localStorage`) and confirm it sees an empty dashboard.

## Drive it

```bash
node .claude/skills/run-app/verify.mjs
```

This drives one representative flow: plant catalog renders → a plant's full care guide renders →
create a garden → add a container → plan a planting → confirm it shows up. It checks
`page.on('console')`/`pageerror` throughout and exits non-zero if anything errored, screenshots to
`.dev-logs/screenshots/` at each major step, and deletes the test garden it created on success (so
repeated runs don't accumulate junk data). Read the screenshots, don't just trust the exit code - a
page can render its shell while a data fetch silently 500s underneath.

Override the URLs if the stack isn't on the default ports: `GREENTHUMB_FRONTEND_URL`,
`GREENTHUMB_BACKEND_URL` env vars.

To check one specific thing rather than the whole flow, copy the relevant block out of
`verify.mjs` into a throwaway script rather than editing it in place - it's meant to stay a
reliable "does the golden path still work" check.

## Gotchas

- **A green run of `./mvnw test` is not sufficient evidence a change works** - controller tests use
  `@Transactional`, which can mask a real `LazyInitializationException` that only shows up under
  real per-request transaction boundaries. This is exactly why this driver script exists; see
  `backend/CLAUDE.md` for the full explanation. Always run this after touching anything that
  serializes a JPA entity association to JSON.
- If `verify.mjs` can't find a browser, it lists the paths it checked - install Edge/Chrome, or add
  `npx playwright install chromium` and switch `chromium.launch({ executablePath })` to
  `chromium.launch({})` to use Playwright's own bundled browser instead.
- `make up`'s readiness polling means the stack is already up by the time you'd run this - no need
  to add your own wait/sleep before driving it.
