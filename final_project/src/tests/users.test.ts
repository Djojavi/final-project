import request from "supertest";
import express from 'express';
import { expect, describe, jest, it } from '@jest/globals';

const mockFindMany: jest.Mock<any> = jest.fn();

jest.unstable_mockModule('../../lib/prisma', () => ({
  default: {  // <-- must be "default" to match "export default prisma"
    user: {
      findMany: mockFindMany
    }
  }
}));

const { userRouter } = await import('../routes/user');

describe("GET /api/v1.0/users", () => {
  const app = express();
  app.use(express.json());
  app.use('/', userRouter);

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

});