var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Check, Column, Entity, OneToMany, PrimaryGeneratedColumn, } from 'typeorm';
import { Review } from '../../reviews/entities/review.entity.js';
let Book = class Book {
    id;
    title;
    category;
    price;
    stock;
    reviews;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Book.prototype, "id", void 0);
__decorate([
    Column({ type: 'varchar', length: 200 }),
    __metadata("design:type", String)
], Book.prototype, "title", void 0);
__decorate([
    Column({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Book.prototype, "category", void 0);
__decorate([
    Column({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Book.prototype, "price", void 0);
__decorate([
    Column({ type: 'integer' }),
    __metadata("design:type", Number)
], Book.prototype, "stock", void 0);
__decorate([
    OneToMany(() => Review, (review) => review.book),
    __metadata("design:type", Object)
], Book.prototype, "reviews", void 0);
Book = __decorate([
    Entity(),
    Check('length("title") <= 200'),
    Check('length("category") <= 100'),
    Check('"price" >= 0'),
    Check('"stock" >= 0')
], Book);
export { Book };
//# sourceMappingURL=book.entity.js.map