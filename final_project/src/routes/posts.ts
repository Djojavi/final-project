import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import express, { Request, Response, Application } from 'express';
import prisma from '../../lib/prisma.ts';
import { validatePostFields } from "../utils/posts.utils.ts";

export const postRouter = express.Router();


postRouter.get('/api/v1.0/posts', async (req: Request, res: Response) => {
  const posts = await prisma.post.findMany();

  res.json(posts);
});

postRouter.get('/api/v1.0/posts/:idAuthor', async (req: Request, res: Response) => {
  const posts = await prisma.post.findMany({where: { authorId: parseInt(req.params.idAuthor as string) }});

  res.json(posts);
});

postRouter.post('/api/v1.0/posts', async (req: Request, res: Response) => {
  const title = req.body.title;
  const content = req.body.content;
  const authorId = req.body.authorId;

  if (!validatePostFields(title, content, authorId)) {
    return res.status(400).json({ message: 'Invalid post data' });
  }

  const author = await prisma.user.findUnique({
    where: { id: authorId }
  });

  if (!author) {
    return res.status(400).json({ message: 'Author does not exist' });
  }

  const newPost = await prisma.post.create({
    data: {
      title,
      content,
      authorId,
    }
  });

  res.status(201).json(newPost);
});



postRouter.put('/api/v1.0/posts/:id', async (req: Request, res: Response) => {
  const postId = parseInt(req.params.id as string);
  const title = req.body.title;
  const content = req.body.content;
  const authorId = req.body.authorId;
  
  if (!validatePostFields(title, content, authorId)) {
    return res.status(400).json({ message: 'Invalid post data' });
  }

  const existingPost = await prisma.post.findUnique({
    where: { id: postId }
  });
  
  if (!existingPost) {
    return res.status(404).json({ message: 'Post not found' });
  }

  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: {
      title,
      content,
      authorId,
    }
  });
  
  res.status(201).json({ message: 'Post updated successfully', post: updatedPost });
});
