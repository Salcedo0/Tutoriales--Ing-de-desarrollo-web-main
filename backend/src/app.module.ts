import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksModule } from './books/books.module.js';
import { HomeModule } from './home/home.module.js';
import { ReviewsModule } from './reviews/reviews.module.js';

// `SQLITE_PATH` lets the container keep the file on a volume that survives a
// rebuild. Locally it is resolved from the compiled module instead of the
// working directory, so the server opens the same file from any folder.
const databasePath =
  process.env.SQLITE_PATH ?? join(import.meta.dirname, '..', 'database.sqlite');

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: databasePath,
      autoLoadEntities: true,
      // The project has no migrations, so this is the only thing that creates
      // the tables — the deployed database starts empty. The cost: a column
      // removed from an entity is dropped, with its data, on the next boot.
      synchronize: true,
    }),
    HomeModule,
    BooksModule,
    ReviewsModule,
  ],
})
export class AppModule {}
