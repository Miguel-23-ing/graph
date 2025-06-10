// src/utils/auth.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../entities/User';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_ultra_seguro';

export const hashPassword = async (plainPassword: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(plainPassword, salt);
};

export const verifyPassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// Incluye más datos útiles en el token por si los necesitas en el frontend
export const generateToken = (user: User): string => {
  return jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, JWT_SECRET);
};
