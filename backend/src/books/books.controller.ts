import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { BooksService } from './books.service.js';
import { Book } from './entities/book.entity.js';
import { CreateBookDto } from './dto/create-book.dto.js';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  findAll(): Promise<Book[]> {
    return this.booksService.findAll();
  }

  // ParseIntPipe answers 400 for an id that is not a number, so `/books/abc`
  // never reaches the repository as NaN.
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Book> {
    const book = await this.booksService.findOne(id);

    if (book === null) {
      throw new NotFoundException(`Book ${id} not found`);
    }

    return book;
  }

  @Post()
  create(@Body() createBookDto: CreateBookDto): Promise<Book> {
    return this.booksService.create(createBookDto);
  }

  // Not part of the tutorial: the "delete the last book" button from tutorial 04
  // needs a real endpoint now that the list comes from the database.
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const removed = await this.booksService.remove(id);

    if (!removed) {
      throw new NotFoundException(`Book ${id} not found`);
    }
  }
}
