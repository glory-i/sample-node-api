import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';

import dotenv from 'dotenv';


interface UserRequestBody {
  name: string;
  email: string;
  age: number;
}

// export const createUser = (req: Request<{}, {}, UserRequestBody>, res: Response) => {
  
//     const { name, email, age } = req.body;

//     //longer alternative
//     // const name = req.body.name;
//     // const email = req.body.email;
//     // const age = req.body.age;

//   // Now all of these are type-safe!
//   res.json({
//     message: `User ${name} created with email ${email} and age ${age}`
//   });
// };

//IMPORTANT WHEN YOU WANT TO USE .env methods.
dotenv.config();


export const signUp = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });//property shorthand

  if (existingUser)  res.status(400).json({ error: 'User already exists' });

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save new user
  const newUser = await User.create({ email, password: hashedPassword });

  res.status(201).json({ message: 'User created', userId: newUser._id });
};


export const signIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ email });
  if (user==null){
    res.status(400).json({ error: 'Invalid credentials' });
    return;
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)  {
    res.status(400).json({ error: 'Invalid credentials' })
    return
  };

  //
  //

  // Generate JWT
  const JWT_SECRET = process.env.SECRET_KEY; 

  const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET!, { expiresIn: '1h' });

  res.json({ user:user.email, token });
};





