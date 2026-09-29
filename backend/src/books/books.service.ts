import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity.js';
import { CreateBookDto } from './dto/create-book.dto.js';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
  ) {}

  findAll(): Promise<Book[]> {
    return this.booksRepository.find();
  }

  // Returns null when the book does not exist, and lets the controller turn
  // that into a 404. The service stays free of HTTP.
  findOne(id: number): Promise<Book | null> {
    return this.booksRepository.findOneBy({ id });
  }

  create(createBookDto: CreateBookDto): Promise<Book> {
    const book = this.booksRepository.create(createBookDto);
    return this.booksRepository.save(book);
  }

  // Reports whether a row was actually removed, so deleting the same book twice
  // answers 404 the second time instead of pretending it worked. The reviews go
  // with it through the `ON DELETE CASCADE` on the foreign key.
  async remove(id: number): Promise<boolean> {
    const { affected } = await this.booksRepository.delete({ id });

    return affected === 1;
  }
}
