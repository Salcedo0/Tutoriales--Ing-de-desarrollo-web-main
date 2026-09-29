import { BooksService } from './books.service.js';
import { Book } from './entities/book.entity.js';
import { CreateBookDto } from './dto/create-book.dto.js';
export declare class BooksController {
    private readonly booksService;
    constructor(booksService: BooksService);
    findAll(): Promise<Book[]>;
    findOne(id: number): Promise<Book>;
    create(createBookDto: CreateBookDto): Promise<Book>;
    remove(id: number): Promise<void>;
}
