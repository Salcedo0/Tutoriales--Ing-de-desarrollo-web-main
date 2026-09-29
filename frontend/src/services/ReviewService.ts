import type { CreateReviewDTO } from '@/dtos/CreateReviewDTO.js';
import type { ReviewInterface } from '@/interfaces/ReviewInterface.js';
import { http } from '@/services/http.js';

const RESOURCE = '/reviews';

export class ReviewService {
  static async getReviewsByBookId(bookId: number): Promise<ReviewInterface[]> {
    const { data } = await http.get<ReviewInterface[]>(`${RESOURCE}/book/${bookId}`);
    return data;
  }

  static async createReview(review: CreateReviewDTO): Promise<ReviewInterface> {
    const { data } = await http.post<ReviewInterface>(RESOURCE, review);
    return data;
  }
}
