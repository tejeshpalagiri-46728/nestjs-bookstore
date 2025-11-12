import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { ICreateBook, IEditBook } from './dto';
import { Request } from 'express';
import { JwtGuard } from '../auth/guard';

@UseGuards(JwtGuard)
@Controller('books')
export class BooksController {
  constructor(private _bookServie: BooksService) {}

  @Get()
  async getAllBooks() {
    const books = await this._bookServie.getAllBooks();
    return {
      success: true,
      data: books,
    };
  }

  @Get(':id')
  async getBookById(@Param() param: { id: string }) {
    const book = await this._bookServie.getBookById(param.id);
    return {
      success: true,
      data: book,
    };
  }

  @Post()
  async createBook(@Body() body: ICreateBook, @Req() req: Request) {
    body.created_by = req.user?.['userId'];
    await this._bookServie.createBook(body);

    return {
      success: true,
      message: 'Book created successfully.',
    };
  }

  @Patch(':id')
  async editBook(@Body() body: IEditBook, @Param() param: { id: string }) {
    const updatedBook = await this._bookServie.editBook(param.id, body);

    return {
      success: true,
      data: updatedBook,
      message: 'Updated book successfully.',
    };
  }
}
