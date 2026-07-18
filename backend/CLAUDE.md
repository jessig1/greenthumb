# Backend (auto-loaded when working in `backend/`)

Spring Boot 4 / Java 25 REST API. See [`.claude/docs/architecture.md`](../.claude/docs/architecture.md)
for the data model and system overview, and [`.claude/docs/api-conventions.md`](../.claude/docs/api-conventions.md)
for REST conventions. This file is implementation-level: package layout, the patterns every module
follows, and the gotchas specific to this stack.

## Package layout

Package-by-domain, not package-by-layer: `user`, `auth`, `garden`, `container`, `plant`,
`planting`, `common`. Each domain package holds its own `Entity`, `EnumType`s, `Repository`,
`Service`, `Controller`, and a `dto/` subpackage of request/response records. `auth` holds the
register/login business logic (`AuthController`/`AuthService`); `common` holds cross-cutting
pieces: `SecurityConfig`, the JWT issuing/validation filter (`common/auth/`: `JwtService`,
`JwtAuthenticationFilter`, `CurrentUserContext`), and shared web infra (`common/web/`:
`NotFoundException`, `InvalidRequestException`, `UnauthorizedException`, `GlobalExceptionHandler`,
`ApiAuthenticationEntryPoint`).

## The standard module shape

Every domain module (see `garden/` for the clearest example) follows:

1. **Entity** - JPA entity. `@Id @GeneratedValue private UUID id`. Enums always
   `@Enumerated(EnumType.STRING)`, never `ORDINAL` - keeps adding a new enum value from shifting
   existing data. Timestamps via `@CreationTimestamp`/`@UpdateTimestamp` (Hibernate annotations),
   not manually set - the DB's `DEFAULT now()` is a backstop, not what actually populates the value
   (Hibernate sends an explicit value on insert either way).
2. **Repository** (`JpaRepository<Entity, UUID>`) - ownership is enforced *in the query itself*,
   not as a separate check after fetching:
   ```java
   Optional<Garden> findByIdAndOwner_Id(UUID id, UUID ownerId);
   ```
   For a resource nested two levels deep, the derived query traverses the whole chain:
   ```java
   Optional<Container> findByIdAndGarden_Owner_Id(UUID id, UUID ownerId);
   Optional<PlantedPlant> findByIdAndContainer_Garden_Owner_Id(UUID id, UUID ownerId);
   ```
   This is deliberate: it's structurally impossible to forget the ownership filter, because there's
   no code path that fetches by ID alone. A service method that needs "does this exist and do I own
   it" always calls one of these, never `repository.findById(id)` directly.
3. **Service** - `@Transactional(readOnly = true)` at the class level, `@Transactional` on
   individual write methods. Throws `NotFoundException` (→ 404) when an owned-lookup comes back
   empty - deliberately the same exception whether the row doesn't exist or belongs to someone else
   (see `api-conventions.md`). A create/update method that needs a parent resource (e.g. creating a
   `Container` needs its `Garden`) re-verifies ownership by calling the parent's own service method
   (`GardenService.getForOwner(...)`), not by duplicating the query.
4. **Controller** - thin. Pulls the current user via `CurrentUserContext.getAppUserId()`, delegates
   to the service, maps the entity to a response DTO. No business logic here.
5. **DTOs** (`dto/` subpackage) - Java records. `PlantResponse.from(Plant)` /
   `GardenResponse.from(Garden)` static factory methods do entity→DTO mapping.

## Adding a new domain module

Concrete order, mirroring how `garden` → `container` → `planting` were built:

1. Flyway migration (see "Migrations" below).
2. Entity + any new enums.
3. Repository with ownership-scoped derived queries.
4. Service (ownership checks, business-rule validation).
5. Request/response DTOs.
6. Controller.
7. Integration test (see "Testing" below) - at minimum: CRUD happy path, and a cross-user isolation
   test (create as one `X-Dev-User-Id`, confirm a different one gets 404 on get/update/delete).
8. Compile (`./mvnw compile`) before writing tests against it - catches typos immediately instead
   of at test time.
9. Corresponding frontend `api.ts` hooks + pages (see `frontend/CLAUDE.md`).
10. Manually verify against a real running instance (curl or browser) - see the `@Transactional`
    gotcha below for why the test suite passing isn't sufficient proof.

## Testing

JUnit 5 + Testcontainers (real Postgres in Docker, via `@Import(TestcontainersConfiguration.class)`
+ `@SpringBootTest`) + MockMvc. Controller tests use `@Transactional` for automatic per-test
rollback/isolation.

**Cross-user isolation pattern**: register two distinct users via `AuthTestSupport.registerAndLogin`
and attach each one's JWT with `AuthTestSupport.bearerToken(token)` to simulate distinct users in
the same test class (see `GardenControllerTest.oneUserCannotReadAnotherUsersGarden` for the
pattern).

**External-provider fakes (`StorageService`, `AiClient`)**: `MinioStorageService` and
`OpenAiClient` are annotated `@Profile("!test")`; `FakeStorageService`
(`photo/storage/FakeStorageService.java`, in-memory) and `FakeAiClient` (`ai/FakeAiClient.java`,
canned responses) are `@Profile("test")` and live under `src/test/java` in the same package
structure so Spring's component scan picks them up automatically. The `test` profile is activated
globally for every test via a `spring.profiles.active` system property on the `maven-surefire-plugin`
in `pom.xml` — **not** a `src/test/resources/application.properties` file, since only one
classpath `application.properties` is ever loaded and a test-resources copy would silently shadow
(not merge with) the real one in `src/main/resources`, breaking every other property (this
happened once and broke the entire suite — `Could not resolve placeholder 'app.jwt.secret'`). If a
new module needs its own external-provider fake, follow this same pattern rather than reaching for
a test resources file.

**Known gap in this testing setup - `@Transactional` can mask `LazyInitializationException`.**
`@Transactional` on the test class keeps one Hibernate session open for the *entire* test method,
including every MockMvc call inside it. Real request handling doesn't work that way (see below) -
each HTTP request gets its own transaction/session, and `spring.jpa.open-in-view=false` closes the
session as soon as the controller method returns. A DTO mapper that lazily touches an association
after that point throws in production but **not** in a `@Transactional` test, because the session
never actually closed during the test. Concretely: this already happened once
(`PlantedPlantResponse` reaching into `plantedPlant.getPlant()`) and every test was green while the
real endpoint 500'd. **Always manually verify list/get endpoints against a real running instance**
(curl, or the `run-app` skill) before considering a change involving associations done - green tests
alone are not sufficient evidence.

The fix, when a DTO needs a related entity's non-ID fields: fetch it eagerly in the repository
query, don't rely on lazy-loading it later.
```java
@EntityGraph(attributePaths = "plant")
List<PlantedPlant> findByContainer_IdAndContainer_Garden_Owner_IdOrderByCreatedAtDesc(...);
```
Accessing just an association's *ID* (`container.getGarden().getId()`) is always safe on a lazy
proxy and never needs this - Hibernate resolves it from the FK column without touching the DB.

## Migrations

Flyway, `src/main/resources/db/migration/`, append-only - never edit a migration that's already
been applied; add a new one instead. Postgres version (17) is pinned consistently between
`docker-compose.yml` (root) and `TestcontainersConfiguration` here - keep them in sync if this is
ever bumped.

## Ecosystem specifics (Spring Boot 4 / Java 25)

This project is on Spring Boot 4 / Spring Framework 7, new enough that some APIs moved from where
training data expects them:

- `@AutoConfigureMockMvc` lives at `org.springframework.boot.webmvc.test.autoconfigure`, not
  `org.springframework.boot.test.autoconfigure.web.servlet`.
- Jackson's 3.x line renamed its groupId/packages to `tools.jackson.*`. The auto-configured
  `ObjectMapper` bean is `tools.jackson.databind.ObjectMapper`, not the classic
  `com.fasterxml.jackson.databind.ObjectMapper` - importing the wrong one gives a confusing
  "no qualifying bean" error, not a compile error, since both classes exist on the classpath.
  JSON support needed an explicit `spring-boot-starter-json` dependency; it's not automatically
  pulled in by `spring-boot-starter-webmvc`.
- Many starters split further than Spring Boot 3.x: `spring-boot-starter-webmvc` (not `-web`),
  `spring-boot-starter-flyway`, `spring-boot-starter-security-oauth2-resource-server`, each with a
  parallel `-test` starter. If a dependency seems missing, check for a same-named `-test` variant
  or a renamed starter before assuming it needs to be added from scratch - `./mvnw dependency:tree`
  is the fastest way to check what's actually resolving.
