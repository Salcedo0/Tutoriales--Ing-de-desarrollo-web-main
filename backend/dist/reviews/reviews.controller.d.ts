import { CreateReviewDto } from './dto/create-review.dto.js';
import { Review } from './entities/review.entity.js';
import { ReviewsService } from './reviews.service.js';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    findAll(): Promise<Review[]>;
    findByBookId(bookId: number): Promise<Review[]>;
    create(createReviewDto: CreateReviewDto): Promise<Review>;
}
