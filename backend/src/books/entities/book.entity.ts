import {
  Check,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Review } from '../../reviews/entities/review.entity.js';

// Every rule is declared twice on purpose: CreateBookDto rejects a bad request,
// and the table rejects everything else — raw SQL, a seeding script, a second
// client written later. The lengths are spelled as CHECKs because SQLite reads
// `varchar(200)` as documentation, not as a limit, and would store a 300
// character title without complaining.
@Entity()
@Check('length("title") <= 200')
@Check('length("category") <= 100')
@Check('"price" >= 0')
@Check('"stock" >= 0')
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  // `decimal(10,2)` rather than a bare `@Column()`: TypeORM would infer INTEGER
  // from the TypeScript `number`, and SQLite would then store 12.99 in it
  // anyway through type affinity — leaving a schema that claims integers while
  // holding cents. That lie only turns into truncation on a stricter engine,
  // which is the worst moment to discover it.
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'integer' })
  stock: number;

  // Declared only so the relation reads from both sides; the reviews are served
  // by `/api/reviews/book/:bookId`, not embedded in the book payload.
  @OneToMany(() => Review, (review) => review.book)
  reviews: Relation<Review[]>;
}
