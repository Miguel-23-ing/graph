import { AppDataSource } from '../../data-source';
import { Project } from '../../entities/Project';
import { User } from '../../entities/User';
import { Task } from '../../entities/Task';

const projectRepo = AppDataSource.getRepository(Project);
const userRepo = AppDataSource.getRepository(User);
const taskRepo = AppDataSource.getRepository(Task);

export const projectResolvers = {
  Query: {
    projects: async (_: any, __: any, context: any) => {
      const user = context.user;
      if (!user) throw new Error('No autenticado');

      const whereClause = user.isAdmin ? {} : { user: { id: user.id } };

      return await projectRepo.find({
        where: whereClause,
        relations: ['user', 'tasks'],
        order: { id: 'ASC' },
      });
    },

    project: async (_: any, args: { id: number }, context: any) => {
      const user = context.user;
      if (!user) throw new Error('No autenticado');

      const project = await projectRepo.findOne({
        where: { id: args.id },
        relations: ['user', 'tasks'],
      });

      if (!project) throw new Error('Proyecto no encontrado');
      if (!user.isAdmin && project.user.id !== user.id) {
        throw new Error('No autorizado para ver este proyecto');
      }

      return project;
    },
  },

  Mutation: {
    createProject: async (
      _: any,
      args: { title: string; content: string; userId?: number },
      context: any,
    ) => {
      const user = context.user;
      if (!user) throw new Error('No autenticado');

      if (!user.isAdmin && args.userId && args.userId !== user.id) {
        throw new Error('No autorizado para crear proyectos a otros usuarios');
      }

      const targetUserId = user.isAdmin
        ? args.userId ?? user.id
        : user.id;

      const finalUser = await userRepo.findOneBy({ id: targetUserId });
      if (!finalUser) throw new Error('Usuario no encontrado');

      const project = projectRepo.create({
        title: args.title,
        content: args.content,
        user: finalUser,
      });

      return await projectRepo.save(project);
    },

    updateProject: async (
      _: any,
      args: { id: number; title?: string; content?: string },
      context: any,
    ) => {
      const user = context.user;
      if (!user) throw new Error('No autenticado');

      const project = await projectRepo.findOne({
        where: { id: args.id },
        relations: ['user'],
      });

      if (!project) throw new Error('Proyecto no encontrado');
      if (!user.isAdmin && project.user.id !== user.id) {
        throw new Error('No autorizado para editar este proyecto');
      }

      Object.assign(project, {
        title: args.title ?? project.title,
        content: args.content ?? project.content,
      });

      return await projectRepo.save(project);
    },

    deleteProject: async (_: any, args: { id: number }, context: any) => {
      const user = context.user;
      if (!user) throw new Error('No autenticado');

      const project = await projectRepo.findOne({
        where: { id: args.id },
        relations: ['user'],
      });

      if (!project) throw new Error('Proyecto no encontrado');
      if (!user.isAdmin && project.user.id !== user.id) {
        throw new Error('No autorizado para eliminar este proyecto');
      }

      await projectRepo.delete({ id: args.id });
      return true;
    },
  },

  Project: {
    user: async (parent: Project) => {
      const userId = typeof parent.user === 'object' ? parent.user.id : parent.user;
      return await userRepo.findOneBy({ id: userId });
    },

    tasks: async (parent: Project) => {
      return await taskRepo.find({
        where: { project: { id: parent.id } },
        order: { id: 'ASC' },
      });
    },
  },
};
