import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Book } from '../books/entities/book.entity.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { Review } from './entities/review.entity.js';

// SQLite reports a broken foreign key with this code. TypeORM wraps it, so the
// real driver error has to be read through `driverError`.
const FOREIGN_KEY_VIOLATION = 'SQLITE_CONSTRAINT_FOREIGNKEY';

function isForeignKeyViolation(error: unknown): boolean {
  return (
    error instanceof QueryFailedError &&
    (error.driverError as { code?: string } | undefined)?.code ===
      FOREIGN_KEY_VIOLATION
  );
}

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,
  ) {}

  findAll(): Promise<Review[]> {
    return this.reviewsRepository.find({
      order: { createdAt: 'DESC', id: 'DESC' },
    });
  }

  // An unknown book is a 404 rather than an empty list: asking for the reviews
  // of a book that does not exist is a different answer from a book nobody has
  // reviewed yet, and the frontend renders them differently.
  async findByBookId(bookId: number): Promise<Review[]> {
    await this.ensureBookExists(bookId);

    return this.reviewsRepository.find({
      where: { bookId },
      order: { createdAt: 'DESC', id: 'DESC' },
    });
  }

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    await this.ensureBookExists(createReviewDto.bookId);

    // Spelled out field by field instead of spreading the DTO: what reaches the
    // table is then readable here, and `author` turns an absent name into an
    // explicit null rather than leaving the column undefined.
    const review = this.reviewsRepository.create({
      bookId: createReviewDto.bookId,
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
      author: createReviewDto.author ?? null,
    });

    try {
      return await this.reviewsRepository.save(review);
    } catch (error) {
      // The check above and this insert are two statements, so the book can be
      // deleted in between. The foreign key catches that race; without this the
      // client would read a 500 for what is still a missing book.
      if (isForeignKeyViolation(error)) {
        throw new NotFoundException(`Book ${createReviewDto.bookId} not found`);
      }

      throw error;
    }
  }

  private async ensureBookExists(bookId: number): Promise<void> {
    const exists = await this.booksRepository.existsBy({ id: bookId });

    if (!exists) {
      throw new NotFoundException(`Book ${bookId} not found`);
    }
  }
}
