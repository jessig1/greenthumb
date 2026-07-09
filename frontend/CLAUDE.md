# Frontend (auto-loaded when working in `frontend/`)

React 19 + TypeScript + Vite, Tailwind v4 + shadcn/ui (Nova preset). See
[`.claude/docs/architecture.md`](../.claude/docs/architecture.md) for the system overview and
[`.claude/docs/api-conventions.md`](../.claude/docs/api-conventions.md) for the API this talks to.
This file is implementation-level: folder layout, the patterns every feature follows, and gotchas
specific to this stack.

## Layout

```
src/
  api/          client.ts (fetch wrapper + bearer-token auth), types.ts (mirrors backend DTOs)
  components/   shared UI - components/ui/ is shadcn-generated, components/layout/ is app-specific
  features/     one folder per domain: auth/ gardens/ containers/ plants/ plantings/
  lib/          utils.ts (shadcn's cn()), labels.ts (enum → display-label helpers)
  routes/       React Router route tree
```

Each `features/<name>/` folder holds `api.ts` (React Query hooks for that resource) plus its page
and dialog components (e.g. `GardensListPage.tsx`, `GardenDetailPage.tsx`, `GardenFormDialog.tsx`).
`features/auth/` is the exception to the React-Query-hooks pattern for reads: `AuthContext.tsx`
holds auth state in a plain context (token persisted to `localStorage`, current user fetched once
via `GET /api/v1/me` on mount) rather than a query hook, since routing (`ProtectedRoute.tsx`) needs
synchronous access to "are we authenticated" before any query would normally fire.

## API client pattern

`api/client.ts` exports a tiny `api.get/post/put/delete` wrapper around `fetch` that attaches
`Content-Type` and, once logged in, `Authorization: Bearer <token>` (set via `setAuthToken`, called
by `features/auth/AuthContext.tsx`) to every request, and throws a typed `ApiError` on a non-OK
response. A `setUnauthorizedHandler` callback fires on any `401`, letting `AuthContext` log the user
out if a token expires mid-session. Every feature's `api.ts` builds React Query hooks on top of
this - one `useQuery` per read, one `useMutation` (invalidating the relevant query keys `onSuccess`)
per write. Don't call `fetch` directly from a component; go through `api.ts`.

`api/types.ts` hand-mirrors the backend's response/request DTOs. There's no codegen from the
OpenAPI spec yet - if a backend DTO's shape changes, update this file to match (and check
`/swagger-ui.html` if unsure what changed).

## Forms

React Hook Form directly against the shadcn primitives (`Input`, `Select`, `Textarea`, `Label`) -
**there is no shadcn `<Form>` wrapper in this preset** (the "Nova" style's `form` registry entry is
an empty placeholder). Use `register()` for plain inputs, `Controller` for anything with its own
value/onChange shape (`Select`). See `GardenFormDialog.tsx` for the reference pattern: one
`useForm`, a single dialog component that handles both create and edit (an optional `entity` prop
switches the mode), `sonner` toasts on success/error.

When a business rule needs to be reflected in the form (not just the backend), mirror it explicitly
rather than only relying on the API's `400` - e.g. `PlantingFormDialog` watches the `status` field
and marks `plantedDate` as conditionally required in the UI, matching the backend's check
constraint, so the user gets an inline hint instead of a round-trip error.

## Adding a new feature

Mirroring how `gardens` → `containers` → `plantings` were built:

1. Add any new types to `api/types.ts`.
2. Add `features/<name>/api.ts` (React Query hooks) - list/get/create/update/delete as needed.
3. Add the list page (or a section within a parent's detail page, e.g. containers render inside
   `GardenDetailPage`).
4. Add a form dialog component for create/edit if the resource is mutable.
5. Add a detail page if the resource has enough of its own content to warrant one.
6. Wire routes into `routes/index.tsx`.
7. `npm run build` (type-checks and builds) before considering it done.
8. Manually verify in a browser (or via the `run-app` skill) - a successful build proves it
   compiles, not that the UI actually works.

## Ecosystem specifics

- **TypeScript's `erasableSyntaxOnly`** (on in this project's `tsconfig`) disallows constructor
  parameter-property shorthand (`constructor(public status: number) {}`) - declare the field and
  assign it in the constructor body instead (see `api/client.ts`'s `ApiError`).
- **React Router is v8**, not `react-router-dom` - import from `react-router` (and `react-router/dom`
  for `RouterProvider` specifically, as in `main.tsx`). Don't add `react-router-dom` as a dependency;
  it's a deprecated compatibility shim in this version.
- **The `shadcn` CLI needs the `@/*` path alias declared in the *root* `tsconfig.json`**, not just
  `tsconfig.app.json` - without it, `npx shadcn add <component>` silently resolves the alias wrong
  and writes files to a literal `./@/` directory instead of `src/`. Both tsconfig files already have
  it; if `shadcn add` ever creates a stray `@/` folder, this is why.
