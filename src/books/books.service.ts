import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ICreateBook, IEditBook } from './dto';

@Injectable()
export class BooksService {
  constructor(private _prismaService: PrismaService) {}

  getAllBooks(isDeleted: boolean = false) {
    return this._prismaService.book.findMany({
      where: {
        isDeleted,
      },
    });
  }

  async getBookById(id: string) {
    const book = await this._prismaService.book.findUnique({
      where: {
        id,
      },
    });
    if (!book)
      throw new NotFoundException('No book found with the provided id.');
    return book;
  }

  createBook(book: ICreateBook) {
    const bookNeedtoBeSaved = {
      title: book.title,
      description: book.description || '',
      quantity: book.quantity,
      created_by: book.created_by,
    };
    return this._prismaService.book.create({ data: bookNeedtoBeSaved });
  }

  editBook(bookId: string, book: IEditBook) {
    return this._prismaService.book.update({
      where: {
        id: bookId,
      },
      data: {
        ...book,
      },
    });
  }
}
