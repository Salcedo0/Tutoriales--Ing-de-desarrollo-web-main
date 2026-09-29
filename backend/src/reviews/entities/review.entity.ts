import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Book } from '../../books/entities/book.entity.js';

// Same rule as the books table: every constraint is declared in the DTO and
// again here, so raw SQL cannot write a review the API would have rejected.
// `length()` is spelled as a CHECK because SQLite reads `varchar(2000)` as
// documentation rather than as a limit.
@Entity()
@Check('"rating" BETWEEN 1 AND 5')
@Check('length("comment") BETWEEN 1 AND 2000')
@Check('"author" IS NULL OR length("author") BETWEEN 1 AND 100')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  // `onDelete: 'CASCADE'` is what lets a book be deleted while it still has
  // reviews: the database removes them in the same statement.
  @ManyToOne(() => Book, (book) => book.reviews, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'bookId' })
  book: Relation<Book>;

  // The foreign key is its own writable column instead of TypeORM's read-only
  // `@RelationId`, so creating a review is `create({ bookId, ... })` and the
  // JSON the frontend receives already carries the id it needs to group by.
  @Column({ type: 'integer' })
  bookId: number;

  @Column({ type: 'integer' })
  rating: number;

  @Column({ type: 'varchar', length: 2000 })
  comment: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  author: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
