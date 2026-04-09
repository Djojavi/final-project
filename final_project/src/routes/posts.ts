import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import express, { Request, Response, Application } from 'express';
import prisma from '../../lib/prisma.ts';

export const postRouter = express.Router();


postRouter.get('/api/v1.0/posts', async (req: Request, res: Response) => {
  const posts = await prisma.post.findMany();

  res.json(posts);
});


