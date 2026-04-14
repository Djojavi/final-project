import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import type { Request, Response } from 'express'  
import express from 'express';
import prisma from '../../lib/prisma.ts';
import { validatePostFields } from "../utils/posts.utils.ts";
import { authMiddleware } from "../middleware/auth.ts";

export const postRouter = express.Router();


postRouter.get('/api/v1.0/posts', authMiddleware, async (req, res) => {
  const posts = await prisma.post.findMany({
    where: {
      authorId: req.userId, 
    },
  });

  res.json(posts);
});

postRouter.post('/api/v1.0/posts',authMiddleware ,async (req: Request, res: Response) => {
  const title = req.body.title;
  const content = req.body.content;
  const authorId= req.userId ?? 0; 

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

postRouter.put('/api/v1.0/posts/:id', authMiddleware, async (req: Request, res: Response) => {
  const postId = parseInt(req.params.id as string);
  const title = req.body.title;
  const content = req.body.content;
  const authorId = req.userId ?? 0; 
  
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

postRouter.delete('/api/v1.0/posts/:id', authMiddleware, async (req: Request, res: Response) => {
  const postId = parseInt(req.params.id as string);
  
  const existingPost = await prisma.post.findUnique({
    where: { id: postId }
  });

  if (!existingPost) {
    return res.status(404).json({ message: 'Post not found' });
  }
  
  await prisma.post.delete({
    where: { id: postId }
  });

  res.status(201).json({ message: 'Post deleted successfully' });
});
