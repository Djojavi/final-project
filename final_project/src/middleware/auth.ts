import express, { Request, Response  } from 'express';
import type { Express, NextFunction } from 'express'  // type-only import
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "No token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };

    req.userId = decoded.userId;

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};