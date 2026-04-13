import request from "supertest";
import express from 'express';
import { expect, describe, jest, it } from '@jest/globals';

const mockFindMany: jest.Mock<any> = jest.fn();

jest.unstable_mockModule('../../lib/prisma', () => ({
    default: {
        post: {
            findMany: mockFindMany
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
            it("should return posts", async () => {
                mockFindMany.mockResolvedValue([
                    { id: 1, title: "First Post", content: "This is the first post", authorId: 1, createdAt: "2026-04-09T15:42:31.398Z" },
                    { id: 2, title: "Second Post", content: "This is the second post", authorId: 1, createdAt: "2026-04-09T15:42:31.398Z" },
                    { id: 3, title: "Third Post", content: "This is the third post", authorId: 1, createdAt: "2026-04-09T15:42:31.398Z" },
                    { id: 4, title: "Fourth Post", content: "This is the fourth post", authorId: 1, createdAt: "2026-04-09T15:42:31.398Z" },
                ]);

                const res = await request(app).get("/api/v1.0/posts");

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

                const res = await request(app).get("/api/v1.0/posts");
                expect(res.status).toBe(200);
                expect(res.body).toEqual([]);
            });
        });


        describe("when there are posts with missing attributes", () => {
            it("should return posts", async () => {
                mockFindMany.mockResolvedValue([
                    { id: 1, title: "First Post", content: "This is the first post", authorId: 1, createdAt: "2026-04-09T15:42:31.398Z" },
                    { id: 2, title: "Second Post", content: "This is the second post", authorId: 1 },
                    { id: 3, title: "Third Post", authorId: 1, createdAt: "2026-04-09T15:42:31.398Z" },
                    { id: 4, title: "Fourth Post", content: "This is the fourth post", authorId: 1, createdAt: "2026-04-09T15:42:31.398Z" },
                ]);

                const res = await request(app).get("/api/v1.0/posts");

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
            it('should return a code 201', async () => {
                const response = await request(app).post('/api/v1.0/posts')
                    .send({ title: "Test Post", content: "This is a test post", authorId: 1 })
                    .set('Accept', 'application/json');

                expect(response.statusCode).toBe(201);
                expect(response.body.message).toBe('Post created successfully');
            });
        });

        describe("when creating a invalid new post without an authorId", () => {
            it('should return a code 400', async () => {
                const response = await request(app).post('/api/v1.0/posts')
                    .send({ title: "Test Post", content: "This is a test post" })
                    .set('Accept', 'application/json');

                expect(response.statusCode).toBe(400);
                expect(response.body.message).toBe('Invalid post data');
            });
        });

        describe("when creating a invalid new post without a title", () => {
            it('should return a code 400', async () => {
                const response = await request(app).post('/api/v1.0/posts')
                    .send({ content: "This is a test post", authorId: 1 })
                    .set('Accept', 'application/json');

                expect(response.statusCode).toBe(400);
                expect(response.body.message).toBe('Invalid post data');
            });
        });
    });


    describe('PUT /api/v1.0/posts', () => {
        describe("when updating a valid post", () => {
            it('should return a code 201', async () => {
                const response = await request(app).put('/api/v1.0/posts')
                    .send({ id: 1, title: "Test Post", content: "This is an updated test post", authorId: 1 })
                    .set('Accept', 'application/json');

                expect(response.statusCode).toBe(201);
                expect(response.body.message).toBe('Post updated successfully');
            });
        });

        describe("when updating a invalid post without an authorId", () => {
            it('should return a code 400', async () => {
                const response = await request(app).put('/api/v1.0/posts')
                    .send({ id: 1, title: "Test Post", content: "This is an updated test post" })
                    .set('Accept', 'application/json');

                expect(response.statusCode).toBe(400);
                expect(response.body.message).toBe('Invalid post data');
            });
        });

        describe("when updating a invalid post without a title", () => {
            it('should return a code 400', async () => {
                const response = await request(app).put('/api/v1.0/posts')
                    .send({ id: 1, content: "This is an updated test post", authorId: 1 })
                    .set('Accept', 'application/json');

                expect(response.statusCode).toBe(400);
                expect(response.body.message).toBe('Invalid post data');
            });
        });

        describe("when updating a post which id doesnt exist", () => {
            it('should return a code 404', async () => {
                const response = await request(app).put('/api/v1.0/posts')
                    .send({ id: 500, content: "This is an updated test post", authorId: 1 })
                    .set('Accept', 'application/json');

                expect(response.statusCode).toBe(404);
                expect(response.body.message).toBe('Post not found');
            });
        });
    });

    describe('DELETE /api/v1.0/posts', () => {
        describe("when deleting a valid post", () => {
            it('should return a code 201', async () => {
                const response = await request(app).delete('/api/v1.0/posts')
                    .send({ id: 1 })
                    .set('Accept', 'application/json');

                expect(response.statusCode).toBe(201);
                expect(response.body.message).toBe('Post deleted successfully');
            });
        });

        describe("when deleting a post which id doesnt exist", () => {
            it('should return a code 404', async () => {
                const response = await request(app).delete('/api/v1.0/posts')
                    .send({ id: 500 })
                    .set('Accept', 'application/json');

                expect(response.statusCode).toBe(404);
                expect(response.body.message).toBe('Post not found');
            });
        });
    });


});


