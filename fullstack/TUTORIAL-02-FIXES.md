# Tutorial 02 — Assignment: the bugs in the tutorial code

The tutorial ends by asking to find the 10+ mistakes introduced in its code and to
propose a cleaner version **without adding libraries or third-party modules**.

Below is every problem I found, and what this repository does instead.

| #  | Problem in the tutorial code | Why it is wrong | Fix applied here |
| -- | ---------------------------- | --------------- | ---------------- |
| 1  | The file is created as `src/data/Books.ts` but imported as `../data/books.js` | Case mismatch. Works on Windows/macOS, breaks on Linux and in CI | File named `src/data/books.ts`, imported as `../data/books.js` |
| 2  | The model property is `Category` (capitalized) | Breaks the naming convention of every other field (`id`, `title`, `price`, `stock`) | Renamed to `category` |
| 3  | `books.ejs` prints `book.category` but the model defines `Category` | Prints `undefined` in the list, while `show.ejs` prints `book.Category` and works — inconsistent | Single lowercase `category` everywhere |
| 4  | `Main_Point` renders with `res.render('home/books', viewData)` while `about` renders with `{ viewData: viewData }` | Two different shapes for the same layout. The books page has no `viewData`, so the layout title crashes | Every action renders `{ viewData }` |
| 5  | The layout is patched with `<% if (typeof viewData !== 'undefined') { %>` | A workaround that hides bug #4 instead of fixing it | Patch not needed; the layout keeps `<%= viewData.title %>` |
| 6  | The list route is `/main-point` | The URL does not describe the resource it returns | Route is `/books`; `/main-point` still works as a redirect for backwards compatibility |
| 7  | The controller method is named `Main_Point` | Mixes PascalCase and snake_case; the rest of the class uses camelCase | Renamed to `books` |
| 8  | `static Main_Point(req: Request, res: any)` and `static show(req: any, res: any)` | `any` throws away the type safety TypeScript is there to provide | Both typed `(req: Request, res: Response): void` |
| 9  | `Book.findById` throws `new Error(...)` when the id does not exist | An unhandled throw returns a 500 with a stack trace for what is a normal 404 | Returns `Book \| undefined`; the controller answers 404 with a `notFound` view |
| 10 | `parseInt(req.params.id)` with no radix and no validation | `/books/abc` produces `NaN` and reaches the model as a valid argument | `Number.parseInt(String(req.params.id), 10)` plus the not-found branch |
| 11 | The first version of `books.ejs` shows "More info" as plain text, with no link | Dead UI: the card looks clickable but nothing happens | The card links to `/books/<id>` from the start |
| 12 | `book.price.toLocaleString()` | Drops the cents: `45.0` renders as `45` instead of `45.00` | `book.price.toFixed(2)` |
| 13 | The books and show pages never set a page title | The header of the layout renders empty on those pages | `viewData.title` set in both actions (`"Books"` / the book title) |
| 14 | `Book.findById(books, id)` takes the array as an argument | The caller has to know where the data lives, so the model is not really the owner of the lookup | Kept the tutorial signature, but the controller is the only place that passes the collection, so swapping the data source later touches one file |
| 15 | No page for a book that does not exist | The user gets a stack trace | `home/notFound.ejs` rendered with status 404 |

## Result

Same feature set as the tutorial, but:

- one consistent shape for the data passed to the views (`{ viewData }`),
- one consistent naming convention (camelCase, lowercase `category`),
- typed controllers,
- REST-ish URLs (`/books`, `/books/:id`),
- a real 404 instead of a crash.

No libraries were added — only reorganized code.
