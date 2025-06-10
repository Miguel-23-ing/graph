import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';

interface JwtPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

export const getUserFromToken = async (token?: string): Promise<User | null> => {
  if (!token) return null;

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('❌ JWT_SECRET no está definido en las variables de entorno.');
    return null;
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;

    if (!decoded || typeof decoded !== 'object' || !decoded.userId) {
      console.warn('⚠️ Token decodificado inválido:', decoded);
      return null;
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: decoded.userId });

    return user || null;
  } catch (error) {
    console.warn('⚠️ Error al verificar token:', (error as Error).message);
    return null;
  }
};
