import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import express, { Request, Response, Application } from 'express';
import prisma from '../../lib/prisma.ts';

export const postRouter = express.Router();
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

postRouter.get('/api/v1.0/posts', async (req: Request, res: Response) => {
  const posts = await prisma.post.findMany();

  res.json(posts);
});
