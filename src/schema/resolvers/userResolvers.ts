// src/schema/resolvers/userResolvers.ts
import { AppDataSource } from '../../data-source';
import { User } from '../../entities/User';
import { Project } from '../../entities/Project';
import { hashPassword, verifyPassword, generateToken } from '../../utils/auth';

const userRepo = AppDataSource.getRepository(User);
const projectRepo = AppDataSource.getRepository(Project);

export const userResolvers = {
  Query: {
    users: async () => {
      return await userRepo.find({ relations: ['projects'] });
    },
  },

  Mutation: {
    // Registro de usuario. Solo un admin puede crear otro admin.
    register: async (
      _: any,
      { name, email, password, isAdmin }: { name: string; email: string; password: string; isAdmin?: boolean },
      context: any
    ) => {
      const existing = await userRepo.findOne({ where: { email } });
      if (existing) throw new Error('El correo ya está registrado.');

      const requestedIsAdmin = isAdmin ?? false;

      if (requestedIsAdmin) {
        const currentUser = context?.user;
        if (!currentUser || !currentUser.isAdmin) {
          throw new Error('Solo un administrador puede crear otro administrador.');
        }
      }

      const hashedPassword = await hashPassword(password);
      const newUser = userRepo.create({
        name,
        email,
        password: hashedPassword,
        isAdmin: requestedIsAdmin,
      });

      return await userRepo.save(newUser);
    },

    // Login con verificación de contraseña y generación de token
    login: async (_: any, { email, password }: { email: string; password: string }) => {
      const user = await userRepo.findOne({ where: { email } });
      if (!user) throw new Error('Credenciales inválidas');

      const isValid = await verifyPassword(password, user.password);
      if (!isValid) throw new Error('Credenciales inválidas');

      const token = generateToken(user); // debe incluir isAdmin

      return { token, user };
    },

    updateUser: async (_: any, args: { id: number; name?: string; email?: string }, context: any) => {
      const user = await userRepo.findOneBy({ id: args.id });
      if (!user) throw new Error('Usuario no encontrado');

      if (args.name !== undefined) user.name = args.name;
      if (args.email !== undefined) user.email = args.email;

      return await userRepo.save(user);
    },

    deleteUser: async (_: any, args: { id: number }, context: any) => {
      const result = await userRepo.delete(args.id);
      return result.affected === 1;
    },
  },

  User: {
    projects: async (parent: User) => {
      return await projectRepo.find({
        where: { user: { id: parent.id } },
      });
    },
  },
};
