import type { Request, Response } from "express";
import { books } from "../data/books.js";
import { Book } from "../models/Book.js";

export class HomeController {
  static index(req: Request, res: Response): void {
    const viewData: { [key: string]: any } = {};
    viewData["title"] = "Home";

    res.render("home/index", { viewData });
  }

  static about(req: Request, res: Response): void {
    const viewData: { [key: string]: any } = {};
    viewData["title"] = "About";

    res.render("home/about", { viewData });
  }

  static contact(req: Request, res: Response): void {
    const viewData: { [key: string]: any } = {};
    viewData["title"] = "Contact";

    res.render("home/contact", { viewData });
  }

  static books(req: Request, res: Response): void {
    const viewData: { [key: string]: any } = {};
    viewData["title"] = "Books";
    viewData["books"] = books;

    res.render("home/books", { viewData });
  }

  static show(req: Request, res: Response): void {
    const id = Number.parseInt(String(req.params.id), 10);
    const book = Book.findById(books, id);

    if (!book) {
      const viewData: { [key: string]: any } = {};
      viewData["title"] = "Book not found";

      res.status(404).render("home/notFound", { viewData });
      return;
    }

    const viewData: { [key: string]: any } = {};
    viewData["title"] = book.title;
    viewData["book"] = book;

    res.render("home/show", { viewData });
  }

  // The tutorial exposed the book list at "/main-point"; keep that URL alive.
  static mainPoint(req: Request, res: Response): void {
    res.redirect("/books");
  }
}
