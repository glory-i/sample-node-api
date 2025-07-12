import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';


dotenv.config();
const JWT_SECRET = process.env.SECRET_KEY; 


export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')){
    res.status(401).json({ error: 'Unauthorized: Token missing' });
    return
}

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as { userId: string };
    (req as any).user = decoded; 
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
