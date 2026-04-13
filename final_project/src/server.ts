import express, { Request, Response, Application } from 'express';
import { PrismaClient } from '../generated/prisma/client.ts';
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import path from 'path';
import { fileURLToPath } from 'url';
import { userRouter } from './routes/user.ts'
import { postRouter } from './routes/posts.ts'

export const app: Application = express();
const PORT = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

app.use(express.json());
app.use('/', userRouter);
app.use('/', postRouter);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/users', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'users.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
