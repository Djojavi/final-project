import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import express, { Request, Response, Application } from 'express';
import prisma from '../../lib/prisma.ts';
import { validateEmail, validateFieldsUser, validatePassword, hashPassword } from "../utils/user.utils.ts";

export const userRouter = express.Router();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

userRouter.get('/api/v1.0/users', async (req: Request, res: Response) => {
  const users = await prisma.user.findMany();

  res.json(users);
});

userRouter.post('/api/v1.0/users', async (req: Request, res: Response) => {
  const email = req.body.email;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const password = req.body.password;

  if (!validateFieldsUser({ email, firstName, lastName, password })) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  const passwordError = validatePassword(password);
  if (passwordError !== "") {
    return res.status(400).json({ message: passwordError });
  }
  const hashedPassword = await hashPassword(password);

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ message: "Email already in use" });
  }

  const newUser = await prisma.user.create({
    data: {
      email,
      firstName,
      lastName,
      password: hashedPassword,
    }
  });

  res.status(201).json(newUser);
});


