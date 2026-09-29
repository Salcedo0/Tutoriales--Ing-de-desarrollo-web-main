# Tutorial 07 — what the tutorial ships, and what this project does instead

Tutorial 07 connects the Nest.js backend to the Vue frontend and ends with
"congratulations". Like tutorial 06 it sets no bug-hunting assignment, and like
tutorial 06 the code it hands out has real defects. This file lists them.

Every claim below was **checked by running it**. Where a probe contradicted the
expectation, the expectation is what changed.

This file lives in the repository root because the tutorial changes both
projects at once: some defects are on the backend, some on the frontend, and
three of them only exist in the seam between the two.

The delivered app behaves as the tutorial describes: the books list, the book
detail and the review form all read and write through `http://localhost:3000/api`,
and Pinia no longer holds any data.

---

## A. Defects that stop the code from running

### 1. `BooksShowView.vue` declares `book` twice and does not compile

The tutorial dictates this script block:

```ts
const route = useRoute();
const bookId = Number(route.params.id);
const book = BookService.getBookById(bookId);

const book = ref<BookInterface | null>(null);
```

Two `const book` in the same scope. `vue-tsc` stops with
`Cannot redeclare block-scoped variable 'book'`, and Vite refuses to serve the
page. It is not a subtle bug — pasted as printed, the detail view never renders.

The first line is also wrong on its own: `getBookById` is now `async`, so `book`
would be a `Promise`, and the template would print `[object Promise]`.

**Fix:** one declaration, a `ref`, filled inside `onMounted`.

### 2. The same file calls `useRoute()` inside `onMounted`

```ts
onMounted(async () => {
  const route = useRoute();
  const bookId = Number(route.params.id);
  book.value = await BookService.getBookById(bookId);
});
```

`useRoute` is a composable. Outside of `setup()` there is no active component
instance to read the injection from, so Vue warns and the call returns
`undefined` — `route.params` then throws.

**Fix:** read the route once at the top of `<script setup>`, where the component
instance exists, and use the already-computed `bookId` inside `onMounted`.

### 3. `CreateReviewDto` has no decorators, which makes `POST /reviews` reject everything

The tutorial's DTO:

```ts
export class CreateReviewDto {
  bookId: number;
  rating: number;
  comment: string;
  author?: string;
}
```

This project configured a global `ValidationPipe` with
`whitelist: true, forbidNonWhitelisted: true` in tutorial 06. `whitelist` keeps
only the properties that declare a validation rule; `forbidNonWhitelisted` then
rejects the ones it stripped. With no decorators at all, *every* field is
"not whitelisted". Probed directly against the pipe:

```
400 {"message":["property bookId should not exist",
               "property rating should not exist",
               "property comment should not exist",
               "property author should not exist"]}
```

Not "the review saves with empty fields" — the endpoint cannot accept a single
review. Without the pipe the same DTO fails the other way: it validates nothing,
so `rating: 99` or a 10 MB comment would go straight into the table.

**Fix:** `@IsInt`, `@Min`, `@Max`, `@IsString`, `@Length`, `@IsOptional`.

---

## B. Boundary rules the tutorial leaves open

### 4. `rating` has no upper bound anywhere

The tutorial constrains the rating in the browser — a `<select>` with five
options — and in `submitReview` with `Math.min(5, Math.max(1, ...))`. The API
enforces nothing. A rating of `9` is a `curl` away, and the stars render as
`'★'.repeat(9)`.

Clamping in the component is also the wrong place: it silently rewrites a value
instead of rejecting it, and it protects only the one caller that happens to go
through that form.

**Fix:** `@Min(1) @Max(5)` in the DTO, plus `CHECK ("rating" BETWEEN 1 AND 5)`
on the table. Verified: `rating: 9` now answers
`400 rating must not be greater than 5`.

### 5. `comment` is `text` with no maximum length

```ts
@Column({ type: 'text' })
comment: string;
```

Anything that arrives from outside needs a ceiling. Nothing stopped a
multi-megabyte comment from being stored and then shipped to every client that
opens the book.

**Fix:** `@Length(1, 2000)` in the DTO and
`CHECK (length("comment") BETWEEN 1 AND 2000)` on the table. An empty comment is
now a 400 as well, which the tutorial only prevented with a disabled button.

### 6. A review can be written for a book that does not exist

`reviewsService.create` in the tutorial saves whatever `bookId` arrives:

```ts
const review = this.reviewsRepository.create({ ...rest, book: { id: bookId } });
return this.reviewsRepository.save(review);
```

SQLite has `PRAGMA foreign_keys = 1` under TypeORM — confirmed against the real
database file — so the insert does not create an orphan row. It fails instead,
and the client reads a `500` with a driver error in it.

**Fix:** the service checks the book exists and answers `404 Book 999 not found`.
Because the check and the insert are two statements, a book deleted in between
would still break the foreign key, so that specific failure is caught and turned
into the same 404 rather than a 500.

### 7. `GET /reviews/book/:bookId` reads the id without checking it

```ts
findByBookId(@Param('bookId') bookId: string) {
  return this.reviewsService.findByBookId(Number(bookId));
}
```

`/reviews/book/abc` becomes `Number('abc')` → `NaN` → an empty list, which reads
as "this book has no reviews yet". `BooksController` already used `ParseIntPipe`
since tutorial 06; the new controller drops back to the older, worse pattern.

**Fix:** `ParseIntPipe`. `/reviews/book/abc` now answers 400, and
`/reviews/book/999` answers 404 instead of `[]` — a book that does not exist is
a different answer from a book nobody has reviewed.

### 8. CORS is opened with a hard-coded origin

```ts
app.enableCors({ origin: 'http://localhost:5173' });
```

Correct for the dev server and wrong for every other environment, with no way to
change it short of editing and recompiling.

**Fix:** read from `CORS_ORIGIN`, defaulting to the Vite dev server. Kept as an
explicit list rather than `origin: true`, which would let any site on the
internet call the API with the visitor's credentials.

---

## C. Frontend problems

### 9. A failed request shows nothing at all

The tutorial's views are

```ts
onMounted(async () => {
  books.value = await BookService.getBooks();
});
```

with no `try`. If the backend is not running, the promise rejects, `books` stays
`[]`, and the page renders "There are no books to show." The user is told the
library is empty when the truth is that nothing was reached.

**Fix:** `isLoading` / `errorMessage` on all four views, and a
`describeRequestError` helper that turns an axios failure into a sentence. With
the backend stopped the page now says *"No se pudo conectar con el servidor.
Revisa que el backend esté corriendo."*

While verifying this I found the same defect in my own first version: the error
banner and "There are no books to show." rendered **together**, which states two
contradictory things. Caught by stopping the backend and reading the screen, not
by reading the code. The `v-else-if` now also requires `!errorMessage`.

### 10. `BooksCreateView` reports failure to the console

```ts
} catch (error) {
  console.error(error);
}
```

A rejected book leaves the form looking like the button did nothing. An error
message is part of the interface, not of the developer tools.

**Fix:** the message reaches the screen, and it carries the API's own validation
text — `price must not be less than 0` rather than a generic "something failed".

### 11. The create form is emptied before the request is confirmed

The tutorial clears the four fields inside the `try`, right after `await`, but a
rejected request jumps to the `catch` *after* the user's text is already gone in
the browser — and on a slow connection there is no sign anything is happening.

**Fix:** the fields are cleared only once the API has answered, and the button
is disabled and reads "Creating…" while the request is in flight, which also
stops a double submit from creating the book twice.

### 12. Both services repeat the base URL

`BookService` and `ReviewService` each declare
`private static readonly API_URL = 'http://localhost:3000/...'`. Two files to
edit the day the backend moves, and two chances to edit only one.

**Fix:** one `src/services/http.ts` with a single axios instance, its `baseURL`
read from `VITE_API_BASE_URL`.

### 13. `PiniaConfig.ts` is left as a commented-out block

The tutorial says to comment the body of `init()` and delete the stores and
seeders, which leaves a file whose only job is to build an empty Pinia that
nothing reads, and fifteen lines of dead code inside it.

**Fix:** `PiniaConfig.ts`, the four stores and seeders, and the `pinia`
dependency are deleted, and `main.ts` no longer installs it. Git keeps the
history if a later tutorial wants it back.

### 14. `author` is stored as the string "Anonymous"

Tutorial 05 sent `author.value.trim() || 'Anonymous'`, so the database could not
tell an unsigned review from one actually signed "Anonymous". The entity added
in tutorial 07 makes the column nullable, which is the right shape — but only if
the frontend stops filling it in.

**Fix:** the field is omitted from the request body when empty, the column holds
`null`, and the component is the one that renders `'Anonymous'`. `ReviewInterface`
says `author: string | null` so the template cannot forget the null case.

---

## D. Work from earlier tutorials the tutorial 07 code would have thrown away

Tutorial 07 says to "replace all the code" of `BooksIndexView.vue`, and the
version it prints has no category filter, no delete button, and prints the price
as `${{ book.price }} COP`. Pasting it would silently undo the tutorial 04
assignment and two of the three tutorial 05 features. The tutorials are
cumulative, so all three were kept:

| Kept | From | How it works now |
| ---- | ---- | ---------------- |
| Price in COP | 05 | `formatPriceCOP` over the number the API returns |
| Category filter | 05 | `computed` over the loaded list |
| Delete last book | 04 | `DELETE /api/books/:id` |

The delete button is the one that needed backend work: it used to `pop()` an
array in memory, and there is no delete endpoint anywhere in tutorials 06 or 07.

- `DELETE /api/books/:id` answers `204`, or `404` if the book is already gone —
  it reports whether a row was actually removed instead of always claiming
  success, so a double click gets an honest answer the second time.
- Deleting a book deletes its reviews, through `ON DELETE CASCADE` on the
  foreign key. Verified: created a book, gave it a review, deleted the book, and
  the review was gone while every other review stayed.
- The view reloads the list from the server after a delete **even when the
  delete failed**, because the server is the one that knows what is left.

---

## E. One structural change

The tutorial puts `reviews.controller.ts`, `reviews.service.ts`,
`review.entity.ts` and `create-review.dto.ts` inside `src/books/`. They are in
`src/reviews/` here.

The search this shortens: *"where is the `/api/reviews` resource handled?"*
`/api/reviews` is its own REST resource with its own table, and `nest g resource
reviews` — the command the course itself uses to scaffold — would have generated
`src/reviews/`. Someone looking for it predicts that folder, not a subfolder
named after a different resource.

It is not a file-count argument: understanding "how a review is created" opens
the same four files either way. What changes is whether the first guess is
right. `BooksModule` also stops declaring two unrelated controllers.

`ReviewsModule` registers the `Book` repository as well, because creating a
review has to check the book exists first.

---

## Verification

- `npm run build`, `npm run lint`, `npm run format` — clean on both projects.
- Backend probed with `curl`: create/list/get/delete books, create and list
  reviews, and the failure cases in issues 3, 4, 5, 6 and 7.
- Frontend driven in a real browser: listed the books, opened a detail, posted a
  review through the form and confirmed it in the database, created a book,
  deleted one, and stopped the backend to read what the error state actually
  says.
