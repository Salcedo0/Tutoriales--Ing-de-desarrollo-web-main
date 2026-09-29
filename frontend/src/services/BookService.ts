import type { BookInterface } from '@/interfaces/BookInterface.js';
import type { CreateBookDTO } from '@/dtos/CreateBookDTO.js';
import { http } from '@/services/http.js';

const RESOURCE = '/books';

export class BookService {
  static async getBooks(): Promise<BookInterface[]> {
    const { data } = await http.get<BookInterface[]>(RESOURCE);
    return data;
  }

  static async getBookById(id: number): Promise<BookInterface> {
    const { data } = await http.get<BookInterface>(`${RESOURCE}/${id}`);
    return data;
  }

  static async createBook(book: CreateBookDTO): Promise<BookInterface> {
    const { data } = await http.post<BookInterface>(RESOURCE, book);
    return data;
  }

  static async deleteBook(id: number): Promise<void> {
    await http.delete(`${RESOURCE}/${id}`);
  }

  // Derived from the list the caller already holds instead of asking the API
  // again: the categories are exactly the ones in use, and a second request
  // would be one more chance for the filter and the grid to disagree.
  static getCategories(books: BookInterface[]): string[] {
    return [...new Set(books.map((book) => book.category))];
  }
}
