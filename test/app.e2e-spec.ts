import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import pactum from 'pactum';
import { IRegister } from 'src/auth/validators/types';
import { UserStatus } from '@prisma/client';
import { ICreateBook } from 'src/books/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDB();

    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    const registerPayload: IRegister = {
      email: 'tejesh.palagiri@thougjtworks.com',
      password: 'rgukt123',
      firstName: 'Tejesh',
      lastName: 'Palagiri',
    };
    describe('Register', () => {
      it('should fail signup if the user email is invalid', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody({ ...registerPayload, email: 'tejesh@tw' })
          .expectStatus(400);
      });

      it('should fail signup if the user details are not passed', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody({})
          .expectStatus(400);
      });

      it('should signup the user successfully', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody(registerPayload)
          .expectStatus(201);
      });

      it('should fail signup if the user already exists', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody(registerPayload)
          .expectStatus(403);
      });
    });
    describe('Login', () => {
      it('should fail login if the user details are not passed', () => {
        return pactum.spec().post('/auth/login').withBody({}).expectStatus(400);
      });

      it('should login and return the user a valid token on a succesffuly signin', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(registerPayload)
          .expectStatus(HttpStatus.OK)
          .stores('token', 'token');
      });
    });
    describe('Me', () => {
      it('should return the get the current user detais', () => {
        return pactum
          .spec()
          .get('/auth/me')
          .withHeaders({ Authorization: 'Bearer $S{token}' })
          .expectStatus(HttpStatus.OK);
      });
    });
  });

  describe('User', () => {
    describe('Get all users', () => {
      it('should return the users', () => {
        return pactum
          .spec()
          .get('/users')
          .withHeaders({ Authorization: 'Bearer $S{token}' })
          .stores('userid', 'data[0].id')
          .expectStatus(200);
      });

      describe('Get User by Id', () => {
        it('should return the user with some id', () => {
          return pactum
            .spec()
            .get('/users/$S{userid}')
            .withHeaders({ Authorization: 'Bearer $S{token}' })
            .expectStatus(200);
        });
      });
    });
    describe('Update User', () => {
      describe('Edit User', () => {
        it('should edit the user successfully', () => {
          const user = {
            first_name: 'TEJESH',
            last_name: 'P',
            status: UserStatus.ACTIVE,
          };

          return pactum
            .spec()
            .patch('/users/$S{userid}')
            .withHeaders({ Authorization: 'Bearer $S{token}' })
            .withBody(user)
            .expectStatus(200);
        });

        it('should fail updating the user if the status is not as expected', () => {
          return pactum
            .spec()
            .patch('/users/$S{userid}')
            .withHeaders({ Authorization: 'Bearer $S{token}' })
            .withBody({ status: 'ABCD' })
            .expectStatus(400);
        });
      });
    });
  });

  describe('Book', () => {
    const newBook: ICreateBook = {
      title: 'The art of not overthinking',
      description: 'This is a sample description of the book creation.',
      quantity: 4,
      created_by: '$S{userid}',
    };
    describe('Create a new Book', () => {
      it('should fail creating the book if no title is provided', () => {
        return pactum
          .spec()
          .post('/books')
          .withHeaders({ Authorization: 'Bearer $S{token}' })
          .withBody({})
          .expectStatus(400);
      });
      it('should fail creating the book if the quantity is not number', () => {
        return pactum
          .spec()
          .post('/books')
          .withHeaders({ Authorization: 'Bearer $S{token}' })
          .withBody({ ...newBook, quantity: 'abcd' })
          .expectStatus(400);
      });
      it('should create a book successfully on a valid', () => {
        return pactum
          .spec()
          .post('/books')
          .withHeaders({ Authorization: 'Bearer $S{token}' })
          .withBody(newBook)
          .expectStatus(201);
      });
    });

    describe('Get Books', () => {
      it('should fetch the all the books', () => {
        return pactum
          .spec()
          .get('/books')
          .withHeaders({ Authorization: 'Bearer $S{token}' })
          .expectStatus(200)
          .stores('bookId', 'data[0].id');
      });
      it('should fail in fetching the book if the provided id is not found', () => {
        return pactum
          .spec()
          .get('/books/unknown-id')
          .withHeaders({ Authorization: 'Bearer $S{token}' })
          .expectStatus(404);
      });
      it('should fetch the book details by id', () => {
        return pactum
          .spec()
          .get('/books/$S{bookId}')
          .withHeaders({ Authorization: 'Bearer $S{token}' })
          .expectStatus(200);
      });
    });

    describe('Edit a Book', () => {
      it('should fail creating the book if no title is provided', () => {
        return pactum
          .spec()
          .patch('/books/$S{bookId}')
          .withHeaders({ Authorization: 'Bearer $S{token}' })
          .withBody({ title: 'Jack & Jones' })
          .expectStatus(200);
      });
    });
  });
});
