import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import express, { Request, Response, Application } from 'express';

export const userRouter = express.Router();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

userRouter.get('/api/v1.0/users', async (req: Request, res: Response) => {
  const users = await prisma.user.findMany();

  res.json(users);
});


