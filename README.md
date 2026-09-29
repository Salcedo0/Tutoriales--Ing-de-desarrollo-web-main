# Course Projects

This repository holds the projects I build during the Web Development Engineering
course. The tutorials are cumulative, so each one keeps growing the same code base.

| Project | Tutorials | What it is |
| ------- | --------- | ---------- |
| [`fullstack/`](fullstack/) | 01, 02 | MPA / SSR application with Express, TypeScript and EJS |
| [`frontend/`](frontend/) | 03, 04, 05, 07, 08 | SPA / CSR application with Vue.js, TypeScript and Tailwind |
| [`backend/`](backend/) | 06, 07, 08 | REST API with Nest.js, TypeORM and SQLite |

From tutorial 07 on, `frontend/` and `backend/` are two halves of one app: the
Vue SPA reads and writes through the Nest API instead of keeping the data in the
browser, so both have to be running.

## Tutorial 01 — MPA / SSR with Express (`fullstack/`)

A multi-page application rendered on the server (MPA / SSR). It is built with Node.js
and Express, written in TypeScript, uses EJS for the views, a shared layout through
`express-ejs-layouts`, and Tailwind CSS for the styling. The app follows a simple
MVC structure: the routes point to controllers, and the controllers render views.

### Tech stack

| Layer        | Tool                                  |
| ------------ | ------------------------------------- |
| Runtime      | Node.js                               |
| Web server   | Express                               |
| Language     | TypeScript (ESM / NodeNext)           |
| Views        | EJS + express-ejs-layouts             |
| Styling      | Tailwind CSS                          |

### Requirements

- **Node.js 26** is the version the tutorial targets. Any recent LTS (24+) also works;
  I ran it on Node 24. Check your version with:

  ```bash
  node -v
  ```

### Project structure

```
fullstack/
├── package.json
├── tsconfig.json
└── src/
    ├── Index.ts                 # Application entry point
    ├── routes/
    │   └── Routes.ts            # Maps URLs to controller methods
    ├── controllers/
    │   └── HomeController.ts     # Prepares data and renders the views
    ├── views/
    │   ├── layouts/
    │   │   └── app.ejs           # Shared layout (sidebar + header)
    │   └── home/
    │       ├── index.ejs         # Home page
    │       ├── about.ejs         # About page
    │       └── contact.ejs       # Contact page
    ├── assets/
    │   └── css/
    │       └── input.css         # Tailwind source file
    └── public/
        └── css/
            └── style.css         # Tailwind output (generated)
```

### How it works

1. `Index.ts` starts Express, sets EJS as the view engine, serves the static files
   from `src/public`, and enables the shared layout `layouts/app`.
2. `Routes.ts` registers every URL (`/`, `/about`, `/contact`) and connects it to a
   method on the controller.
3. `HomeController.ts` builds a small `viewData` object (used for the page title) and
   renders the matching EJS view.
4. Each view fills the `content` block of `app.ejs`, so every page shares the same
   sidebar and header while only the main area changes.

### Running the app in development

The server and the Tailwind compiler run in **two separate terminals**, both from
inside the `fullstack/` folder.

Install the dependencies first:

```bash
cd fullstack
npm install
```

Terminal 1 — start the server (auto-reloads on changes):

```bash
npm run dev
```

Terminal 2 — compile Tailwind and watch for changes:

```bash
npm run dev:css
```

Then open the app in the browser:

- Home:    http://localhost:3000/
- About:   http://localhost:3000/about
- Contact: http://localhost:3000/contact

### Building for production

```bash
npm run build   # compiles Tailwind (minified) and TypeScript into dist/
npm start       # runs the compiled server from dist/
```

### Available scripts

| Script            | What it does                                             |
| ----------------- | ------------------------------------------------------- |
| `npm run dev`     | Starts the server with `tsx watch` (live reload).       |
| `npm run dev:css` | Compiles Tailwind and watches the source CSS.           |
| `npm run build`   | Builds the CSS (minified) and compiles TypeScript.      |
| `npm start`       | Runs the compiled app from `dist/`.                     |

### The Contact section (assignment)

The tutorial ends by asking to add a new `Contact` section. I added it end to end:

- a `contact` method in `HomeController.ts`,
- a `/contact` route in `Routes.ts`,
- a `contact.ejs` view with basic contact information,
- a `Contact` link in the sidebar of `app.ejs`.

## Tutorial 02 — Models and books (`fullstack/`)

Tutorial 02 completes the MVC of the same Express app by adding the model layer.

| Piece | File |
| ----- | ---- |
| Model | `src/models/Book.ts` |
| In-memory "database" | `src/data/books.ts` |
| List of books | `src/views/home/books.ejs` → `/books` |
| Single book | `src/views/home/show.ejs` → `/books/:id` |
| Book not found | `src/views/home/notFound.ejs` (404) |

`/main-point` (the URL used by the tutorial) redirects to `/books`.

### Assignment: the bugs of Tutorial 02

The tutorial asks to find the 10+ mistakes it introduces on purpose and to propose a
cleaner version without adding libraries. The full list — 15 issues and how each one
is solved here — is in [`fullstack/TUTORIAL-02-FIXES.md`](fullstack/TUTORIAL-02-FIXES.md).

## Tutorial 03 — SPA / CSR with Vue.js (`frontend/`)

A single-page application rendered on the client (SPA / CSR), scaffolded with
`create-vue`: Vue 3, TypeScript, Vue Router, Pinia, ESLint + oxlint, Prettier, and
Tailwind CSS through the `@tailwindcss/vite` plugin.

The layout of the Express app was rebuilt as a Vue component: `App.vue` holds the
sidebar and the header, and `<RouterView />` swaps the page. The header title comes
from `meta.title` of each route.

> While installing, `npm install` failed because `oxlint` (`~1.74.0`) did not match the
> version required by `eslint-plugin-oxlint` (`~1.73.0`). As the tutorial anticipates,
> `oxlint` was pinned to `~1.73.0` in `package.json`.

### Assignment: the Contact section

`ContactView.vue`, a `/contact` route, and a `Contact` link in the sidebar.

### Running the app

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173/
```

| Script              | What it does                                  |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Vite dev server with HMR.                     |
| `npm run build`     | Type-check and build for production.          |
| `npm run type-check`| Runs `vue-tsc`.                               |
| `npm run lint`      | Runs oxlint and ESLint (with `--fix`).        |
| `npm run format`    | Formats `src/` with Prettier.                 |

## Tutorial 04 — Books, services and Pinia (`frontend/`)

Tutorial 04 grows the SPA with the layers a real application needs.

> The store, the seeder and `PiniaConfig` described below were removed in
> tutorial 07, when the data moved to the backend. The section is kept because
> it is what this tutorial asked for; the current code is in
> [Tutorial 07](#tutorial-07--connecting-the-two-projects-frontend--backend).

| Layer | File | Purpose |
| ----- | ---- | ------- |
| Interface | `src/interfaces/BookInterface.ts` | Shape of a book |
| DTO | `src/dtos/CreateBookDTO.ts` | Input of the creation form (`Omit<BookInterface, 'id'>`) |
| Store | `src/stores/bookstore.ts` | Pinia store holding the books |
| Seeder | `src/stores/bookseeder.ts` | Initial data of the "database" |
| Persistence | `src/PiniaConfig.ts` | Loads and saves the whole Pinia state in `localStorage` (key `piniaState`) |
| Service | `src/services/BookService.ts` | The only place the views touch the store |
| Views | `src/views/Books*.vue` | List, detail and creation pages |

Routes: `/books`, `/books/create` and `/books/:id` (the literal route is declared
before the dynamic one so `create` is never read as an id).

The views never import the store or the data directly — they only call
`BookService`. Swapping `localStorage` for a real API later means rewriting one file.

### Assignment: delete the last book

`BookService.deleteLastBook()` plus a `Delete last book` button in
`BooksIndexView.vue`. The button is disabled when the library is empty, and the
change is written to `localStorage` by the same watcher that persists everything else.

Because books can now be deleted, `createBook` no longer derives the new id from
`books.length + 1` (which repeats ids after a deletion): it uses the highest id in
use plus one.

## Tutorial 05 — Prices, filters and reviews (`frontend/`)

Tutorial 05 adds three features to the same SPA.

| Feature | Where |
| ------- | ----- |
| Price and date formatting | `src/utils/format.ts` |
| Filter by category | `src/views/BooksIndexView.vue` + `BookService.getCategories()` |
| Book reviews | `src/components/BookReviews.vue`, `src/stores/reviewstore.ts`, `src/services/ReviewService.ts` |

The reviews follow the same layering as the books: an interface, a DTO, a store,
a seeder and a service, with the component talking only to the service.

> The stores and seeders were removed in tutorial 07. The three features
> survived: the formatting and the filter are unchanged, and the reviews now
> live in the database behind `/api/reviews`.

### Assignment: clean up the code

The tutorial warns that it ships several bad practices and asks for a tidier
version. The full list — 17 issues, from a category filter that never refreshed
to a price formatter rebuilt once per book per render — is in
[`frontend/TUTORIAL-05-FIXES.md`](frontend/TUTORIAL-05-FIXES.md).

## Tutorial 06 — REST API with Nest.js (`backend/`)

Tutorial 06 moves the books out of memory and behind an HTTP API, built with
Nest.js and TypeORM over SQLite.

| Piece | File |
| ----- | ---- |
| Bootstrap (`api` prefix, validation) | `src/main.ts` |
| Database connection | `src/app.module.ts` |
| `GET /api/` | `src/home/home.controller.ts` |
| Books endpoints | `src/books/books.controller.ts` |
| Repository access | `src/books/books.service.ts` |
| Table and its constraints | `src/books/entities/book.entity.ts` |
| Request body | `src/books/dto/create-book.dto.ts` |

| Method | Route | Answers |
| ------ | ----- | ------- |
| `GET` | `/api/books` | The list of books |
| `GET` | `/api/books/:id` | One book, or `404` |
| `POST` | `/api/books` | The created book (`201`), or `400` |

Every rule is declared twice: `CreateBookDto` stops a bad request, and the table
stops everything else through `CHECK` constraints.

### Assignment: testing the API

The tutorial asks to exercise the endpoints with an API client. The defects
found in the code the tutorial dictates — and in the scaffold the Nest CLI
generates — are written up in
[`backend/TUTORIAL-06-FIXES.md`](backend/TUTORIAL-06-FIXES.md).

### Running the API

```bash
cd backend
npm install
npm run start     # http://localhost:3000/api/
```

## Tutorial 07 — Connecting the two projects (`frontend/` + `backend/`)

Tutorial 07 joins the two halves: the Vue SPA stops keeping books and reviews in
`localStorage` and starts reading and writing them through the Nest API.

### What changed on the backend

| Piece | File |
| ----- | ---- |
| CORS for the Vite dev server (origin from `CORS_ORIGIN`) | `src/main.ts` |
| Reviews endpoints | `src/reviews/reviews.controller.ts` |
| Repository access and book existence check | `src/reviews/reviews.service.ts` |
| Table and its constraints | `src/reviews/entities/review.entity.ts` |
| Request body | `src/reviews/dto/create-review.dto.ts` |
| Reverse side of the relation | `src/books/entities/book.entity.ts` |

| Method | Route | Answers |
| ------ | ----- | ------- |
| `GET` | `/api/reviews` | Every review, newest first |
| `GET` | `/api/reviews/book/:bookId` | The reviews of one book, or `404` |
| `POST` | `/api/reviews` | The created review (`201`), `400`, or `404` |
| `DELETE` | `/api/books/:id` | `204`, or `404` if it was already gone |

The tutorial puts the reviews inside `src/books/`; they are in `src/reviews/`
here, because `/api/reviews` is its own resource — the reasoning is in
[`TUTORIAL-07-FIXES.md`](TUTORIAL-07-FIXES.md).

`DELETE /api/books/:id` is not in the tutorial either. It exists so the "delete
the last book" button from tutorial 04 keeps working now that the list comes
from the database. Deleting a book deletes its reviews through
`ON DELETE CASCADE`.

### What changed on the frontend

| Piece | File |
| ----- | ---- |
| Single axios instance and error messages | `src/services/http.ts` |
| Books over HTTP | `src/services/BookService.ts` |
| Reviews over HTTP | `src/services/ReviewService.ts` |

Pinia is gone — `PiniaConfig.ts`, the stores and the seeders were deleted and the
dependency removed, since nothing reads them once the data lives in the API.
The base URL comes from `VITE_API_BASE_URL` (plus `/api`) and falls back to
`http://localhost:3000/api`.

Every view that now waits on the network shows its three states: loading, the
data, or what went wrong. Without that, a backend that is not running renders an
empty library, which reads as "there are no books" instead of "it failed".

### Kept from earlier tutorials

The tutorial's `BooksIndexView.vue` drops the category filter (05), the delete
button (04) and the COP formatting (05). All three were kept — the tutorials are
cumulative.

### Assignment

Tutorial 07 sets none, but the code it dictates does not compile: it declares
`const book` twice in `BooksShowView.vue` and calls `useRoute()` inside
`onMounted`. Those and eleven other defects are in
[`TUTORIAL-07-FIXES.md`](TUTORIAL-07-FIXES.md).

### Running the full stack

Two terminals:

```bash
cd backend
npm install
npm run start:dev   # http://localhost:3000/api/
```

```bash
cd frontend
npm install
npm run dev         # http://localhost:5173/books
```

## Tutorial 08 — Deploying with Docker (`docker-compose.yml`)

Tutorial 08 puts both projects on a Google Cloud VM. Each one gets a `Dockerfile`,
and `docker-compose.yml` starts them together: the API on port `3000`, the SPA
on port `80`.

| Piece | File |
| ----- | ---- |
| Both containers, the CORS origins and the database volume | `docker-compose.yml` |
| API image (Node 22, production dependencies, prebuilt `dist/`) | `backend/Dockerfile` |
| Database path from `SQLITE_PATH` | `backend/src/app.module.ts` |
| SPA image (nginx serving the prebuilt `dist/`) | `frontend/Dockerfile` |
| Fallback to `index.html` for the router's routes | `frontend/nginx.conf` |
| Where the SPA finds the API (`VITE_API_BASE_URL`) | `frontend/.env` |

The VM does not compile anything: both `dist/` folders are built locally and
committed, which is why `.gitignore` lets them through. Rebuild them after any
change — and after changing the VM's IP, since Vite bakes `VITE_API_BASE_URL`
into the bundle.

Two things the tutorial leaves out:

- It never gives the frontend's `Dockerfile`, though the compose file builds it.
  The one here copies `dist/` into nginx.
- nginx alone answers `404` when a route like `/books/create` is reloaded, because
  the router uses HTML5 history and no such file exists. `nginx.conf` falls back
  to `index.html`.

### Deploying

```bash
cd backend && npm run build && cd ..
cd frontend && npm run build && cd ..
git push
# on the VM, after opening port 3000 in the firewall:
git clone <repo> && cd <repo>
docker compose up -d
```
