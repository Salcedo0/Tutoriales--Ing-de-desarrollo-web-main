import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { Review } from './entities/review.entity.js';
import { ReviewsService } from './reviews.service.js';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  findAll(): Promise<Review[]> {
    return this.reviewsService.findAll();
  }

  // ParseIntPipe answers 400 for `/reviews/book/abc`, which otherwise reached
  // the repository as NaN and came back as an empty list.
  @Get('book/:bookId')
  findByBookId(
    @Param('bookId', ParseIntPipe) bookId: number,
  ): Promise<Review[]> {
    return this.reviewsService.findByBookId(bookId);
  }

  @Post()
  create(@Body() createReviewDto: CreateReviewDto): Promise<Review> {
    return this.reviewsService.create(createReviewDto);
  }
}
