var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Check, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, } from 'typeorm';
import { Book } from '../../books/entities/book.entity.js';
let Review = class Review {
    id;
    book;
    bookId;
    rating;
    comment;
    author;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Review.prototype, "id", void 0);
__decorate([
    ManyToOne(() => Book, (book) => book.reviews, {
        onDelete: 'CASCADE',
        nullable: false,
    }),
    JoinColumn({ name: 'bookId' }),
    __metadata("design:type", Object)
], Review.prototype, "book", void 0);
__decorate([
    Column({ type: 'integer' }),
    __metadata("design:type", Number)
], Review.prototype, "bookId", void 0);
__decorate([
    Column({ type: 'integer' }),
    __metadata("design:type", Number)
], Review.prototype, "rating", void 0);
__decorate([
    Column({ type: 'varchar', length: 2000 }),
    __metadata("design:type", String)
], Review.prototype, "comment", void 0);
__decorate([
    Column({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], Review.prototype, "author", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Review.prototype, "createdAt", void 0);
Review = __decorate([
    Entity(),
    Check('"rating" BETWEEN 1 AND 5'),
    Check('length("comment") BETWEEN 1 AND 2000'),
    Check('"author" IS NULL OR length("author") BETWEEN 1 AND 100')
], Review);
export { Review };
//# sourceMappingURL=review.entity.js.map