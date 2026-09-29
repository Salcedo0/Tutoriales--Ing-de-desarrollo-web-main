import type { Relation } from 'typeorm';
import { Review } from '../../reviews/entities/review.entity.js';
export declare class Book {
    id: number;
    title: string;
    category: string;
    price: number;
    stock: number;
    reviews: Relation<Review[]>;
}
