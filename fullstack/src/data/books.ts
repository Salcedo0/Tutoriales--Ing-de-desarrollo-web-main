import { Book } from "../models/Book.js";

// In-memory "database" used by the controllers.
export const books: Book[] = [
  new Book(1, "The Great Gatsby", "Fiction", 12.99, 3),
  new Book(2, "Clean Code", "Programming", 45.0, 5),
  new Book(3, "Sapiens", "History", 18.5, 2),
];
