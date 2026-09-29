# Backend — REST API with Nest.js (Tutorial 06)

The REST API of the course project, built with Nest.js, TypeORM and SQLite. It
exposes the same books the Express app (`fullstack/`) and the Vue app
(`frontend/`) already work with, this time over HTTP and backed by a real
database instead of an in-memory array.

## Tech stack

| Layer      | Tool                          |
| ---------- | ----------------------------- |
| Framework  | Nest.js 12                    |
| Language   | TypeScript (ESM / NodeNext)   |
| ORM        | TypeORM                       |
| Database   | SQLite (`better-sqlite3`)     |
| Validation | class-validator               |
| Tooling    | Prettier + oxlint             |

## Endpoints

Every route is served under the `api` prefix, set in `src/main.ts`.

| Method | Route             | Answers                                    |
| ------ | ----------------- | ------------------------------------------ |
| `GET`  | `/api/`           | `API is running`                           |
| `GET`  | `/api/books`      | The list of books                          |
| `GET`  | `/api/books/:id`  | One book, or `404` when it does not exist  |
| `POST` | `/api/books`      | The created book (`201`), or `400`         |

### Creating a book

```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{"title":"Clean Code","category":"Programming","price":45.00,"stock":5}'
```

The body is validated at the boundary. A missing field, a wrong type, a negative
price or a field that is not part of the DTO all answer `400` with the list of
what went wrong:

```json
{
  "message": ["property titl should not exist", "title must be a string"],
  "error": "Bad Request",
  "statusCode": 400
}
```

## Project structure

```
backend/
├── package.json
├── tsconfig.json
├── database.sqlite            # Created on first run, not committed
└── src/
    ├── main.ts                # Bootstrap: `api` prefix + global ValidationPipe
    ├── app.module.ts          # TypeORM connection + feature modules
    ├── home/
    │   ├── home.module.ts
    │   └── home.controller.ts # GET /api/
    └── books/
        ├── books.module.ts
        ├── books.controller.ts # HTTP layer: pipes, 404
        ├── books.service.ts    # Repository access, no HTTP
        ├── entities/
        │   └── book.entity.ts  # Table definition and its CHECK constraints
        └── dto/
            └── create-book.dto.ts
```

The controller owns HTTP and the service owns the data: `findOne` returns `null`
and the controller is the one that turns that into a `404`.

## Rules live in two places on purpose

`CreateBookDto` rejects a bad request. The table rejects everything else — raw
SQL, a seeding script, a client written later:

```sql
CHECK ("price" >= 0)
CHECK ("stock" >= 0)
CHECK (length("title") <= 200)
CHECK (length("category") <= 100)
```

The lengths are written as `CHECK` and not left to `varchar(200)` because SQLite
treats the column length as documentation, not as a limit.

## Running the app

```bash
cd backend
npm install
npm run start        # http://localhost:3000/api/
npm run start:dev    # same, reloading on every change
```

If `better-sqlite3` reports that its install scripts were not run:

```bash
npm approve-scripts better-sqlite3
npm rebuild better-sqlite3
```

The database file is created on the first run and lives next to `package.json`,
resolved from the compiled module so it does not depend on the folder the
server was started from.

## Available scripts

| Script               | What it does                                 |
| -------------------- | -------------------------------------------- |
| `npm run start`      | Starts the server.                            |
| `npm run start:dev`  | Starts it watching for changes.               |
| `npm run build`      | Compiles TypeScript into `dist/`.             |
| `npm run start:prod` | Runs the compiled server from `dist/`.        |
| `npm run lint`       | Runs oxlint over `src/`.                      |
| `npm run format`     | Formats `src/` with Prettier.                 |

## Assignment: the code the tutorial ships

Tutorial 06 does not ask to look for mistakes, but the code it dictates has
several — a `format` script that exits with an error, an id read from the URL
without checking, a missing book answering `200 null`, and a POST body nobody
validates. The full list, what each one does and how it is fixed here, is in
[`TUTORIAL-06-FIXES.md`](TUTORIAL-06-FIXES.md).
