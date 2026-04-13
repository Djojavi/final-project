import request from "supertest";
import express from 'express';
import { expect, describe, jest, it } from '@jest/globals';

const mockFindMany: jest.Mock<any> = jest.fn();
const mockCreate: jest.Mock<any> = jest.fn();
const mockFindUnique: jest.Mock<any> = jest.fn();

jest.unstable_mockModule('../../lib/prisma', () => ({
  default: {
    user: {
      findMany: mockFindMany,
      create: mockCreate,
      findUnique: mockFindUnique
    }
  }
}));

const { userRouter } = await import('../routes/user');

describe("User operations", () => {
  const app = express();
  app.use(express.json());
  app.use('/', userRouter);

  describe("GET /api/v1.0/users", () => {
    describe("when there are users", () => {
      it("should return users", async () => {
        mockFindMany.mockResolvedValue([
          { id: 1, email: "test@test.com", password: "123456", firstName: "Daniel", lastName: "Jaramillo", posts: [] },
          { id: 2, email: "test1@test.com", password: "abcdefg", firstName: "Joaquin", lastName: "Sanchez", posts: [] },
          { id: 3, email: "test2@test.com", password: "xyzwv", firstName: "Pamela", lastName: "Lopez", posts: [] },
          { id: 4, email: "test3@test.com", password: "loremipsum", firstName: "Ariel", lastName: "Herrera", posts: [] },
        ]);

        const res = await request(app).get("/api/v1.0/users");

        expect(res.status).toBe(200);
        expect(res.body).toEqual([
          { id: 1, email: "test@test.com", password: "123456", firstName: "Daniel", lastName: "Jaramillo", posts: [] },
          { id: 2, email: "test1@test.com", password: "abcdefg", firstName: "Joaquin", lastName: "Sanchez", posts: [] },
          { id: 3, email: "test2@test.com", password: "xyzwv", firstName: "Pamela", lastName: "Lopez", posts: [] },
          { id: 4, email: "test3@test.com", password: "loremipsum", firstName: "Ariel", lastName: "Herrera", posts: [] },
        ]);
      });
    });

    describe("when there are no users", () => {
      it("should return an empty list", async () => {
        mockFindMany.mockResolvedValue([]);

        const res = await request(app).get("/api/v1.0/users");
        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
      });
    });


    describe("when there are users with missing attributes", () => {
      it("should return users", async () => {
        mockFindMany.mockResolvedValue([
          { id: 1, password: "123456", firstName: "Daniel", lastName: "Jaramillo", posts: [] },
          { id: 2, email: "test1@test.com", password: "abcdefg", lastName: "Sanchez", posts: [] },
          { id: 3, email: "test2@test.com", password: "xyzwv", firstName: "Pamela", lastName: "Lopez" },
          { id: 4, email: "test3@test.com", password: "loremipsum", firstName: "Ariel", lastName: "Herrera", posts: [] },
        ]);

        const res = await request(app).get("/api/v1.0/users");

        expect(res.status).toBe(200);
        expect(res.body).toEqual([
          { id: 1, password: "123456", firstName: "Daniel", lastName: "Jaramillo", posts: [] },
          { id: 2, email: "test1@test.com", password: "abcdefg", lastName: "Sanchez", posts: [] },
          { id: 3, email: "test2@test.com", password: "xyzwv", firstName: "Pamela", lastName: "Lopez" },
          { id: 4, email: "test3@test.com", password: "loremipsum", firstName: "Ariel", lastName: "Herrera", posts: [] },
        ]);
      });
    });
  })

  describe("POST /api/v1.0/users", () => {
    describe("when creating a valid new user", () => {
      it('should return a code 201', async () => {
        mockFindUnique.mockResolvedValue(null);
        mockCreate.mockResolvedValue({ id: 1, email: "testCreate@gmail.com", firstName: "Test", lastName: "User", password: "testPassword1" });

        const response = await request(app).post('/api/v1.0/users')
          .send({ email: "testCreate@gmail.com", firstName: "Test", lastName: "User", password: "testPassword1" })
          .set('Accept', 'application/json');

        expect(response.statusCode).toBe(201);
        expect(response.body.email).toBe('testCreate@gmail.com');
        expect(response.body.firstName).toBe('Test');
      });
    });

    describe("when creating a new user with invalid inputs", () => {
      it("should return 400 when email is invalid", async () => {
        const response = await request(app).post('/api/v1.0/users')
          .send({ email: "invalid-email", firstName: "Test", lastName: "User", password: "testPassword1" })
          .set('Accept', 'application/json');

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Invalid email format');
      });

      describe("when creating a new user with invalid password format", () => {
        it("should return 400 when password has less than 6 digits ", async () => {
          const response = await request(app).post('/api/v1.0/users')
            .send({ email: "weakpass@gmail.com", firstName: "Test", lastName: "User", password: "123" })
            .set('Accept', 'application/json');

          expect(response.statusCode).toBe(400);
          expect(response.body.message).toBe('Password should have at least 6 digits');
        });

        it("should return 400 when password doesnt contain an uppercase letter ", async () => {
          const response = await request(app).post('/api/v1.0/users')
            .send({ email: "weakpass@gmail.com", firstName: "Test", lastName: "User", password: "abcdefgh" })
            .set('Accept', 'application/json');

          expect(response.statusCode).toBe(400);
          expect(response.body.message).toBe('Password should have at least one uppercase letter');
        });

        it("should return 400 when password doesnt contain a lowercase letter ", async () => {
          const response = await request(app).post('/api/v1.0/users')
            .send({ email: "weakpass@gmail.com", firstName: "Test", lastName: "User", password: "ABCDEFGHTIF" })
            .set('Accept', 'application/json');

          expect(response.statusCode).toBe(400);
          expect(response.body.message).toBe('Password should have at least one lowercase letter');
        });

        it("should return 400 when password doesnt contain a number ", async () => {
          const response = await request(app).post('/api/v1.0/users')
            .send({ email: "weakpass@gmail.com", firstName: "Test", lastName: "User", password: "abcdEFGHI" })
            .set('Accept', 'application/json');

          expect(response.statusCode).toBe(400);
          expect(response.body.message).toBe('Password should have at least one number');
        });
      })


      it("should return 400 when required attributes are missing", async () => {
        const response = await request(app).post('/api/v1.0/users')
          .send({ email: "missingfields@gmail.com" })
          .set('Accept', 'application/json');

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Missing required fields');
      });

      it("should return 409 when email is already in use", async () => {
        mockFindUnique.mockResolvedValue({id: 1, email: "duplicate@gmail.com", firstName: "Test", lastName: "User", password: "testPassword1"});

        const response = await request(app).post('/api/v1.0/users')
          .send({ email: "duplicate@gmail.com", firstName: "Test", lastName: "User", password: "testPassword1" })
          .set('Accept', 'application/json');

        expect(response.statusCode).toBe(409);
        expect(response.body.message).toBe('Email already in use');
      });
    });
  })

});