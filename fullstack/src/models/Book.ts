export class Book {
  constructor(
    public id: number,
    public title: string,
    public category: string,
    public price: number,
    public stock: number
  ) {}

  // Returns undefined when the book does not exist so the caller can answer
  // with a proper 404 instead of crashing the request.
  static findById(books: Book[], id: number): Book | undefined {
    return books.find((book) => book.id === id);
  }
}
