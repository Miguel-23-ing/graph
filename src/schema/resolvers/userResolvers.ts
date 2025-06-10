import { AppDataSource } from '../../data-source';
import { User } from '../../entities/User';
import { Project } from '../../entities/Project';
import { hashPassword, verifyPassword, generateToken } from '../../utils/auth';

const userRepo = AppDataSource.getRepository(User);
const projectRepo = AppDataSource.getRepository(Project);

export const userResolvers = {
  Query: {
    // Solo un admin puede ver todos los usuarios
    users: async (_: any, __: any, context: any) => {
      const currentUser = context.user;
      if (!currentUser || !currentUser.isAdmin) {
        throw new Error('Solo los administradores pueden ver todos los usuarios');
      }

      return await userRepo.find({ relations: ['projects'] });
    },

    // Solo un admin puede consultar a otros usuarios
    user: async (_: any, args: { id: number }, context: any) => {
      const currentUser = context.user;
      if (!currentUser) throw new Error('No autenticado');

      const targetUser = await userRepo.findOne({
        where: { id: args.id },
        relations: ['projects'],
      });

      if (!targetUser) throw new Error('Usuario no encontrado');

      // Solo puede acceder el mismo usuario o un admin
      if (!currentUser.isAdmin && currentUser.id !== targetUser.id) {
        throw new Error('No autorizado para ver este usuario');
      }

      return targetUser;
    },
  },

  Mutation: {
    // Registro (admin puede crear admin; cualquier usuario puede crear usuario normal)
    register: async (
      _: any,
      { name, email, password, isAdmin }: { name: string; email: string; password: string; isAdmin?: boolean },
      context: any
    ) => {
      const existing = await userRepo.findOne({ where: { email } });
      if (existing) throw new Error('El correo ya está registrado.');

      const requestedIsAdmin = isAdmin ?? false;

      // Solo un admin puede crear otro admin
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

    // Login
    login: async (_: any, { email, password }: { email: string; password: string }) => {
      const user = await userRepo.findOne({ where: { email } });
      if (!user) throw new Error('Credenciales inválidas');

      const isValid = await verifyPassword(password, user.password);
      if (!isValid) throw new Error('Credenciales inválidas');

      const token = generateToken(user); // debe incluir id y isAdmin

      return { token, user };
    },

    // Solo admin puede actualizar a otros usuarios
    updateUser: async (_: any, args: { id: number; name?: string; email?: string }, context: any) => {
      const currentUser = context.user;
      if (!currentUser || !currentUser.isAdmin) {
        throw new Error('Solo un administrador puede editar usuarios');
      }

      const user = await userRepo.findOneBy({ id: args.id });
      if (!user) throw new Error('Usuario no encontrado');

      if (args.name !== undefined) user.name = args.name;
      if (args.email !== undefined) user.email = args.email;

      return await userRepo.save(user);
    },

    // Solo admin puede eliminar usuarios
    deleteUser: async (_: any, args: { id: number }, context: any) => {
      const currentUser = context.user;
      if (!currentUser || !currentUser.isAdmin) {
        throw new Error('Solo un administrador puede eliminar usuarios');
      }

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
