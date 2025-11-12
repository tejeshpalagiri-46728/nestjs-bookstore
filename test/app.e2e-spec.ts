import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import pactum from 'pactum';
import { IRegister } from 'src/auth/validators/types';
import { UserStatus } from '@prisma/client';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = await moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    app.listen(3333);

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
          .inspect()
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
          let user = {
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

  describe('Book', () => {});
});
