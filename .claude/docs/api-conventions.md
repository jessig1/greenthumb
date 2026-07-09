# API conventions

This documents *conventions*, not an exhaustive endpoint list — that would go stale as the API
grows. The source of truth for the current, exact endpoint/schema list is the generated OpenAPI
spec: run the backend and open `http://localhost:8080/swagger-ui.html`.

## Base path and auth

All endpoints are under `/api/v1`. Every endpoint except `/api/v1/auth/register` and
`/api/v1/auth/login` requires `Authorization: Bearer <JWT>`, obtained by registering or logging in
(see root `CLAUDE.md`'s "Auth is real, but local" note). Missing/invalid tokens get a `401` in the
same flat error shape used elsewhere. When Cognito is wired up later, the token issuer changes but
this header contract doesn't.

## Resource routing

Nested resources use nested URLs for the collection, flat URLs for a specific item, mirroring the
ownership chain:

```
GET/POST     /api/v1/gardens
GET/PUT/DEL  /api/v1/gardens/{id}
GET/POST     /api/v1/gardens/{gardenId}/containers
GET/PUT/DEL  /api/v1/containers/{id}
GET/POST     /api/v1/containers/{containerId}/plantings
GET/PUT/DEL  /api/v1/plantings/{id}
GET          /api/v1/plants                (?category= filter; read-only catalog)
GET          /api/v1/plants/{id}
GET          /api/v1/me
POST         /api/v1/auth/register         (public - no token required)
POST         /api/v1/auth/login            (public - no token required)
```

New resources should follow this same pattern: list/create under the parent's path, get/update/
delete under the resource's own flat path. See `backend/CLAUDE.md` for the controller/service
pattern this maps to.

## Responses

- Success: the resource (or list of resources) as JSON, `201` on create, `204` on delete.
- Errors: a flat JSON body -
  ```json
  { "timestamp": "2026-07-05T20:44:38.814Z", "status": 400, "message": "..." }
  ```
  `404` means "doesn't exist or isn't yours" - the API deliberately does not distinguish the two,
  to avoid leaking existence of other users' data. `400` covers both request validation
  (`@Valid` field errors) and business-rule violations (e.g. `plantedDate` required once `status`
  isn't `PLANNED`).
- Request bodies are validated with Bean Validation (`@NotBlank`, `@NotNull`, `@Min`, etc.) on the
  request DTOs; validation failures are collected into one `400` message rather than a field-by-
  field error map.

## Versioning

`/api/v1` is the only version so far. If a breaking change is ever needed, add `/api/v2` alongside
rather than changing `/v1` in place.
