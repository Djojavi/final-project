import request from "supertest";
import express from 'express';
import { expect, describe, jest, it, test } from '@jest/globals';
import jwt from "jsonwebtoken";

process.env.JWT_SECRET = 'test-secret';
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
      it("should return a list of users", async () => {
        mockFindMany.mockResolvedValue([
          { id: 1, email: "test@test.com", password: "123456", firstName: "Daniel", lastName: "Jaramillo", posts: [] },
          { id: 2, email: "test1@test.com", password: "abcdefg", firstName: "Joaquin", lastName: "Sanchez", posts: [] },
          { id: 3, email: "test2@test.com", password: "xyzwv", firstName: "Pamela", lastName: "Lopez", posts: [] },
          { id: 4, email: "test3@test.com", password: "loremipsum", firstName: "Ariel", lastName: "Herrera", posts: [] },
        ]);
        const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET!);
        const res = await request(app).get("/api/v1.0/users").set("Authorization", `Bearer ${token}`);

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

        const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET!);
        const res = await request(app).get("/api/v1.0/users").set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
      });
    });


    describe("when there are users with missing attributes", () => {
      it("should return a list of users", async () => {
        mockFindMany.mockResolvedValue([
          { id: 1, password: "123456", firstName: "Daniel", lastName: "Jaramillo", posts: [] },
          { id: 2, email: "test1@test.com", password: "abcdefg", lastName: "Sanchez", posts: [] },
          { id: 3, email: "test2@test.com", password: "xyzwv", firstName: "Pamela", lastName: "Lopez" },
          { id: 4, email: "test3@test.com", password: "loremipsum", firstName: "Ariel", lastName: "Herrera", posts: [] },
        ]);

        const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET!);
        const res = await request(app).get("/api/v1.0/users").set("Authorization", `Bearer ${token}`);

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
      it('should successfully register a new user with valid credentials', async () => {
        mockFindUnique.mockResolvedValue(null);
        mockCreate.mockResolvedValue({ id: 1, email: "testCreate@gmail.com", firstName: "Test", lastName: "User", password: "testPassword1" });
        const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET!);

        const response = await request(app).post('/api/v1.0/users')
          .send({ email: "testCreate@gmail.com", firstName: "Test", lastName: "User", password: "testPassword1" })
          .set("Authorization", `Bearer ${token}`)
          .set('Accept', 'application/json');

        expect(response.statusCode).toBe(200);

      });
    });

    describe("when creating a new user with invalid inputs", () => {
      it("should reject registration when the email format is malformed", async () => {
        const response = await request(app).post('/api/v1.0/users')
          .send({ email: "invalid-email", firstName: "Test", lastName: "User", password: "testPassword1" })
          .set('Accept', 'application/json');

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Invalid email format');
      });

      describe("Password validation rules", () => {
        test.each([
          ["too short", "123", "at least 6 digits"],
          ["no uppercase", "abcdef", "at least one uppercase letter"],
          ["no lowercase", "ABCDEF", "at least one lowercase letter"],
          ["no number", "abcdefG", "at least one number"],
        ])("should reject if password is %s", async (condition, password, errorMsg) => {
          const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET!);

          const response = await request(app)
            .post('/api/v1.0/users')
            .send({ email: "test@test.com", firstName: "T", lastName: "U", password })
            .set("Authorization", `Bearer ${token}`);

          expect(response.statusCode).toBe(400);
          expect(response.body.message).toContain(errorMsg);
        });
      });

      it("should reject registration when there are missing required fields", async () => {
        const response = await request(app).post('/api/v1.0/users')
          .send({ email: "missingfields@gmail.com" })
          .set('Accept', 'application/json');

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Missing required fields');
      });

      it("should reject registration when the email is already in use", async () => {
        mockFindUnique.mockResolvedValue({ id: 1, email: "duplicate@gmail.com", firstName: "Test", lastName: "User", password: "testPassword1" });

        const response = await request(app).post('/api/v1.0/users')
          .send({ email: "duplicate@gmail.com", firstName: "Test", lastName: "User", password: "testPassword1" })
          .set('Accept', 'application/json');

        expect(response.statusCode).toBe(409);
        expect(response.body.message).toBe('Email already in use');
      });
    });
  })

});