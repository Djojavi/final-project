import request from "supertest";
import express from 'express';
import { expect, describe, jest, it } from '@jest/globals';
import jwt from "jsonwebtoken";

process.env.JWT_SECRET = 'test-secret';
const mockFindMany: jest.Mock<any> = jest.fn();
const mockCreate: jest.Mock<any> = jest.fn();
const mockUpdate: jest.Mock<any> = jest.fn();
const mockDelete: jest.Mock<any> = jest.fn();
const mockFindUnique: jest.Mock<any> = jest.fn();

jest.unstable_mockModule('../../lib/prisma', () => ({
    default: {
        post: {
            findMany: mockFindMany,
            create: mockCreate,
            delete: mockCreate,
            update: mockUpdate,
            findUnique: mockFindUnique
        },
        user: {
            findUnique: mockFindUnique,
        }
    }
}));

const { postRouter } = await import('../routes/posts');

describe("Post operations", () => {
    const app = express();
    app.use(express.json());
    app.use('/', postRouter);

    describe("GET /api/v1.0/posts", () => {
        describe("when there are posts", () => {
            it("should return a list of posts", async () => {
                mockFindMany.mockResolvedValue([
                    { id: 1, title: "First Post", content: "This is the first post", authorId: 1, createdAt: "2026-04-09T15:42:31.398Z" },
                    { id: 2, title: "Second Post", content: "This is the second post", authorId: 1, createdAt: "2026-04-09T15:42:31.398Z" },
                    { id: 3, title: "Third Post", content: "This is the third post", authorId: 1, createdAt: "2026-04-09T15:42:31.398Z" },
                    { id: 4, title: "Fourth Post", content: "This is the fourth post", authorId: 1, createdAt: "2026-04-09T15:42:31.398Z" },
                ]);
                const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET!);
                const res = await request(app)
                    .get("/api/v1.0/posts")
                    .set("Authorization", `Bearer ${token}`);

                expect(res.status).toBe(200);
                expect(res.body).toEqual([
                    { id: 1, title: "First Post", content: "This is the first post", authorId: 1, createdAt: "2026-04-09T15:42:31.398Z" },
                    { id: 2, title: "Second Post", content: "This is the second post", authorId: 1, createdAt: "2026-04-09T15:42:31.398Z" },
                    { id: 3, title: "Third Post", content: "This is the third post", authorId: 1, createdAt: "2026-04-09T15:42:31.398Z" },
                    { id: 4, title: "Fourth Post", content: "This is the fourth post", authorId: 1, createdAt: "2026-04-09T15:42:31.398Z" },
                ]);
            });
        });

        describe("when there are no posts", () => {
            it("should return an empty list", async () => {
                mockFindMany.mockResolvedValue([]);

                const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET!);
                const res = await request(app)
                    .get("/api/v1.0/posts")
                    .set("Authorization", `Bearer ${token}`);

                expect(res.status).toBe(200);
                expect(res.body).toEqual([]);
            });
        });


        describe("when there are posts with missing attributes", () => {
            it("should return a list of posts", async () => {
                mockFindMany.mockResolvedValue([
                    { id: 1, title: "First Post", content: "This is the first post", authorId: 1, createdAt: "2026-04-09T15:42:31.398Z" },
                    { id: 2, title: "Second Post", content: "This is the second post", authorId: 1 },
                    { id: 3, title: "Third Post", authorId: 1, createdAt: "2026-04-09T15:42:31.398Z" },
                    { id: 4, title: "Fourth Post", content: "This is the fourth post", authorId: 1, createdAt: "2026-04-09T15:42:31.398Z" },
                ]);

                const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET!);
                const res = await request(app)
                    .get("/api/v1.0/posts")
                    .set("Authorization", `Bearer ${token}`);

                expect(res.status).toBe(200);
                expect(res.body).toEqual([
                    { id: 1, title: "First Post", content: "This is the first post", authorId: 1, createdAt: "2026-04-09T15:42:31.398Z" },
                    { id: 2, title: "Second Post", content: "This is the second post", authorId: 1 },
                    { id: 3, title: "Third Post", authorId: 1, createdAt: "2026-04-09T15:42:31.398Z" },
                    { id: 4, title: "Fourth Post", content: "This is the fourth post", authorId: 1, createdAt: "2026-04-09T15:42:31.398Z" },
                ]);
            });
        });
    });

    describe('POST /api/v1.0/posts', () => {
        describe("when creating a valid new post", () => {
            it('should successfully create a new post with valid data', async () => {
                mockFindUnique.mockResolvedValue({ id: 1, name: "Test User" });
                mockCreate.mockResolvedValue({ title: "Test Post", content: "This is a test post", authorId: 1 });

                const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET!);
                const response = await request(app)
                    .post('/api/v1.0/posts')
                    .send({ title: "Test Post", content: "This is a test post", authorId: 1 })
                    .set("Authorization", `Bearer ${token}`)
                    .set('Accept', 'application/json');

                expect(response.statusCode).toBe(201);
            });
        });

        describe("when creating a invalid new post without a title", () => {
            it('should reject the creation when the title is missing', async () => {
                const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET!);
                const response = await request(app)
                    .post('/api/v1.0/posts')
                    .send({ content: "This is a test post", authorId: 1 })
                    .set("Authorization", `Bearer ${token}`)
                    .set('Accept', 'application/json');

                expect(response.statusCode).toBe(400);
                expect(response.body.message).toBe('Invalid post data');
            });
        });
    });


    describe('PUT /api/v1.0/posts', () => {
        describe("when updating a valid post", () => {
            it('should successfully update an existing post with valid data', async () => {
                mockFindUnique.mockResolvedValue({ title: "Test Post", content: "This is a test post", authorId: 1 });
                mockUpdate.mockResolvedValue({ id: 1, title: "Test Post Updated", content: "This is an updated test post", authorId: 1 });

                const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET!);
                const response = await request(app).put('/api/v1.0/posts/1')
                    .send({ title: "Test Post Updated", content: "This is an updated test post" })
                    .set("Authorization", `Bearer ${token}`)
                    .set('Accept', 'application/json');

                expect(response.statusCode).toBe(201);
                expect(response.body.message).toBe('Post updated successfully');


            });
        });


        describe("when updating a invalid post without a title", () => {
            it('should reject the update when the title is missing', async () => {
                const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET!);
                const response = await request(app).put('/api/v1.0/posts/1')
                    .send({ id: 1, content: "This is an updated test post", authorId: 1 })
                    .set("Authorization", `Bearer ${token}`)
                    .set('Accept', 'application/json');

                expect(response.statusCode).toBe(400);
                expect(response.body.message).toBe('Invalid post data');
            });
        });

        describe("when updating a post which id doesnt exist", () => {
            it('should reject the update when the post does not exist', async () => {
                mockFindUnique.mockResolvedValue(null);

                const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET!);
                const response = await request(app).put('/api/v1.0/posts/500')
                    .send({ title: "Test Post", content: "This is an updated test post", authorId: 1 })
                    .set("Authorization", `Bearer ${token}`)
                    .set('Accept', 'application/json');

                expect(response.statusCode).toBe(404);
                expect(response.body.message).toBe('Post not found');
            });
        });
    });

    describe('DELETE /api/v1.0/posts', () => {
        describe("when deleting a valid post", () => {
            it('should successfully delete an existing post', async () => {
                mockFindUnique.mockResolvedValue({ id: 1, title: "Test Post", content: "This is a test post", authorId: 1 });
                mockDelete.mockResolvedValue({ id: 1 });

                const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET!);
                const response = await request(app).delete('/api/v1.0/posts/1')
                    .set("Authorization", `Bearer ${token}`)
                    .set('Accept', 'application/json');

                expect(response.statusCode).toBe(201);
                expect(response.body.message).toBe('Post deleted successfully');
            });
        });

        describe("when deleting a post which id doesnt exist", () => {
            it('should reject the deletion when the post does not exist', async () => {
                mockFindUnique.mockResolvedValue(null);

                const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET!);

                const response = await request(app).delete('/api/v1.0/posts/500')
                    .set("Authorization", `Bearer ${token}`)
                    .set('Accept', 'application/json');

                expect(response.statusCode).toBe(404);
                expect(response.body.message).toBe('Post not found');
            });
        });
    });


});


