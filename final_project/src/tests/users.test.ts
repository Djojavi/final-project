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

  it("should return users", async () => {
    mockFindMany.mockResolvedValue([
      {
        id: 999,
        email: "test@test.com",
        password: "123456",
        firstName: "Daniel",
        lastName: "Jaramillo",
        posts: []
      }
    ]);

    const res = await request(app).get("/api/v1.0/users");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        id: 999,
        email: "test@test.com",
        password: "123456",
        firstName: "Daniel",
        lastName: "Jaramillo",
        posts: []
      }
    ]);
  });
});