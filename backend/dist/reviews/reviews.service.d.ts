import { Repository } from 'typeorm';
import { Book } from '../books/entities/book.entity.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { Review } from './entities/review.entity.js';
export declare class ReviewsService {
    private readonly reviewsRepository;
    private readonly booksRepository;
    constructor(reviewsRepository: Repository<Review>, booksRepository: Repository<Book>);
    findAll(): Promise<Review[]>;
    findByBookId(bookId: number): Promise<Review[]>;
    create(createReviewDto: CreateReviewDto): Promise<Review>;
    private ensureBookExists;
}
