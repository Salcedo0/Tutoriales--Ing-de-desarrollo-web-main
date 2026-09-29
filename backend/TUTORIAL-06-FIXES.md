# Tutorial 06 — what the tutorial ships, and what this project does instead

Tutorial 06 does not ask to hunt for bugs the way 02 and 05 did. It ends with
"congratulations". This file exists anyway, because the code the tutorial hands
out has a handful of real defects, and the course project follows a written
code quality standard.

Every claim below was **checked by running it**, not assumed. Where a probe
contradicted the expectation, the expectation is the thing that changed — see
issue 9.

The delivered API behaves exactly as the tutorial describes: `GET /api/`,
`POST /api/books`, `GET /api/books` and `GET /api/books/:id`, with the same
modules, controllers, services, entities and DTOs. Nothing was renamed or moved.

---

## A. Defects in the generated scaffold

### 1. `npm run format` fails outright

The scaffold writes:

```json
"format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\""
```

The tutorial then tells you to delete `test/`. Prettier treats a glob that
matches nothing as an error:

```
[error] No files matching the pattern were found: "test/**/*.ts".
exit code 2
```

So the command the tutorial asks you to run is broken from the moment you
follow its own instructions.

**Fix:** `"format": "prettier --write \"src/**/*.ts\""` — exit code 0.

### 2. `npm run lint` points at a folder that no longer exists

```json
"lint": "oxlint --type-aware src/ test/"
```

This one does *not* fail (measured: exit 0), so it is not urgent — but it names
a path that is gone.

**Fix:** `"lint": "oxlint --type-aware src/"`.

### 3. Dead end-to-end test configuration

`vitest.config.e2e.ts` includes `**/*.e2e-spec.ts`, and by Nest convention
those files only ever live in `test/` — the folder the tutorial deletes. The
config and its `test:e2e` script can never match anything again.

**Fix:** both removed. `vitest.config.ts` is kept: it scans `**/*.spec.ts`, so
it still works for tests placed next to the source.

---

## B. Defects in the code the tutorial dictates

### 4. The id is read from the URL without checking it

```ts
findOne(@Param('id') id: string) {
  return this.booksService.findOne(Number(id));
}
```

`Number('abc')` is `NaN`, and `NaN` was handed straight to the repository.

**Fix:** `@Param('id', ParseIntPipe)`. Measured:

```
GET /api/books/abc
400 {"message":"Validation failed (numeric string is expected)"}
```

### 5. A book that does not exist answered `200 null`

The service returns `Book | null` and the tutorial's controller returns it
unchanged, so a missing book looked like a successful request with an empty
body. A client cannot tell that apart from a bug on its own side.

**Fix:** the controller raises `NotFoundException`. The service still returns
`null` and stays free of HTTP. Measured:

```
GET /api/books/999
404 {"message":"Book 999 not found"}
```

### 6. The POST body was never validated

`CreateBookDto` is four bare fields. Nothing checked types, nothing checked
required fields, nothing checked ranges.

**Fix:** `class-validator` decorators on the DTO plus a global `ValidationPipe`
in `main.ts`. This is the one place a library was added, because the request
body is the boundary of the application and validating it by hand in the
controller would spread the rule instead of concentrating it. Measured:

```
POST /api/books  {}
400 ["title must be longer than or equal to 1 characters",
     "title must be a string", ... , "stock must be an integer number"]
```

### 7. A misspelled field was accepted and silently dropped

Sending `titl` instead of `title` produced a request that looked fine to the
client and a row missing its title.

**Fix:** `forbidNonWhitelisted: true`. Measured:

```
POST /api/books  {"titl":"X", ...}
400 ["property titl should not exist", ...]
```

### 8. Every rule lived only in the application, none in the database

The tutorial's entity declares no constraints. Reproduced with a probe that
built the tutorial's exact mapping and then wrote straight to the table:

```
INSERT INTO book_tutorial (...) VALUES ('Hack','X',-1,-5)
ACEPTADO -> la base guarda precio y stock negativos
```

Raw SQL, a seeding script or a second client would sail past the DTO.

**Fix:** four `@Check` constraints on the entity. Verified against the real
schema file, not against the model:

```sql
CONSTRAINT "CHK_..." CHECK ("stock" >= 0),
CONSTRAINT "CHK_..." CHECK ("price" >= 0),
CONSTRAINT "CHK_..." CHECK (length("category") <= 100),
CONSTRAINT "CHK_..." CHECK (length("title") <= 200)
```

and the same raw insert now answers `CHECK constraint failed`.

### 9. `varchar(200)` does not limit anything in SQLite

This one corrected me, not the tutorial.

The first version of the entity used `@Column({ length: 200 })` and a comment
claiming the table would stop an over-long title. It does not: SQLite reads
`varchar(200)` as type affinity, not as a constraint. A 300 character title was
accepted and stored at full length.

**Fix:** the length limits are expressed as `CHECK (length(...) <= n)`, which
SQLite does enforce, and the comment now says what the code actually does. The
`length:` on the column stays as schema documentation for a future engine.

### 10. The price column was declared as an integer

`@Column()` with a TypeScript `number` makes TypeORM emit `integer`:

```sql
"price" integer NOT NULL   -- schema produced by the tutorial's entity
```

The probe showed SQLite still stores `12.99` in it through type affinity, so
nothing is lost *today* — the earlier assumption that it truncated to `12` was
wrong. What remains is a schema that claims integers while holding cents, and
that lie becomes truncation the moment the project moves to PostgreSQL or
MySQL, where types are enforced.

The seed data in `frontend/` and `fullstack/` uses `12.99`, `45.0` and `18.5`,
so decimals are part of the domain.

**Fix:** `@Column({ type: 'decimal', precision: 10, scale: 2 })`. The JSON
response still carries a number, not a string — checked: `"price":12.99`.

### 11. The database path depended on the working directory

`database: 'database.sqlite'` resolves against `process.cwd()`, so starting the
server from the repository root instead of from `backend/` would silently open
a different, empty database.

**Fix:** resolved from the compiled module —
`join(import.meta.dirname, '..', 'database.sqlite')` — which lands on
`backend/database.sqlite` for both `npm run start` and `npm run start:prod`.

### 12. `synchronize: true` with no condition

TypeORM rewrites the schema to match the entities on every boot. That is what
makes the tutorial work without migrations, and it is also what would drop a
column, and its data, on a real deployment.

**Fix:** `synchronize: !isProduction`. The tutorial's behaviour is unchanged
during the course; the destructive case is closed.

**Reverted in tutorial 08.** The fix was wrong: with no migrations, nothing else
creates the tables, so the first production boot — the Docker image sets
`NODE_ENV=production` — served an empty database with no schema at all. Back to
`synchronize: true`; the real fix is migrations, which the course does not cover.

### 13. The generated database would have been committed

`.gitignore` covered `node_modules/` and `dist/` but not `database.sqlite`.

**Fix:** `**/*.sqlite` and `**/*.tsbuildinfo` added.

---

## What was deliberately left alone

- `BooksService` is untouched. The tutorial's version is correct.
- `HomeController` returns the same `'API is running'` string.
- Route names, module names, file layout and method names are the tutorial's.
- `deploy`, `start:debug` and the remaining `vitest` scripts were kept: they are
  unused today but neither broken nor pointing at deleted paths.

## How to check any of this again

```bash
cd backend
npm run build     # exit 0
npm run lint      # exit 0
npm run format    # exit 0
npm run start     # http://localhost:3000/api/
```
