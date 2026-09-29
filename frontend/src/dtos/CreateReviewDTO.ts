import type { ReviewInterface } from '@/interfaces/ReviewInterface.js';

// `author` is left out of the body when nobody signed the review, instead of
// sent as `null`: that is what `CreateReviewDto` on the backend declares as
// optional, and an absent field and an explicit null are not the same request.
export type CreateReviewDTO = Omit<ReviewInterface, 'id' | 'createdAt' | 'author'> & {
  author?: string;
};
