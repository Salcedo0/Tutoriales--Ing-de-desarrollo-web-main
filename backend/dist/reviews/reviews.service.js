var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Book } from '../books/entities/book.entity.js';
import { Review } from './entities/review.entity.js';
const FOREIGN_KEY_VIOLATION = 'SQLITE_CONSTRAINT_FOREIGNKEY';
function isForeignKeyViolation(error) {
    return (error instanceof QueryFailedError &&
        error.driverError?.code ===
            FOREIGN_KEY_VIOLATION);
}
let ReviewsService = class ReviewsService {
    reviewsRepository;
    booksRepository;
    constructor(reviewsRepository, booksRepository) {
        this.reviewsRepository = reviewsRepository;
        this.booksRepository = booksRepository;
    }
    findAll() {
        return this.reviewsRepository.find({
            order: { createdAt: 'DESC', id: 'DESC' },
        });
    }
    async findByBookId(bookId) {
        await this.ensureBookExists(bookId);
        return this.reviewsRepository.find({
            where: { bookId },
            order: { createdAt: 'DESC', id: 'DESC' },
        });
    }
    async create(createReviewDto) {
        await this.ensureBookExists(createReviewDto.bookId);
        const review = this.reviewsRepository.create({
            bookId: createReviewDto.bookId,
            rating: createReviewDto.rating,
            comment: createReviewDto.comment,
            author: createReviewDto.author ?? null,
        });
        try {
            return await this.reviewsRepository.save(review);
        }
        catch (error) {
            if (isForeignKeyViolation(error)) {
                throw new NotFoundException(`Book ${createReviewDto.bookId} not found`);
            }
            throw error;
        }
    }
    async ensureBookExists(bookId) {
        const exists = await this.booksRepository.existsBy({ id: bookId });
        if (!exists) {
            throw new NotFoundException(`Book ${bookId} not found`);
        }
    }
};
ReviewsService = __decorate([
    Injectable(),
    __param(0, InjectRepository(Review)),
    __param(1, InjectRepository(Book)),
    __metadata("design:paramtypes", [Repository,
        Repository])
], ReviewsService);
export { ReviewsService };
//# sourceMappingURL=reviews.service.js.map