// src/schema/resolvers/taskResolvers.ts
import { AppDataSource } from '../../data-source';
import { Task } from '../../entities/Task';
import { Project } from '../../entities/Project';
import { User } from '../../entities/User';

const taskRepo = AppDataSource.getRepository(Task);
const projectRepo = AppDataSource.getRepository(Project);
const userRepo = AppDataSource.getRepository(User);

export const taskResolvers = {
  Query: {
    tasks: async (_: any, args: { userId?: number }, context: any) => {
      const user = context.user;
      if (!user) throw new Error('No autenticado');

      if (args.userId !== undefined) {
        if (!user.isAdmin) {
          throw new Error('No autorizado para ver tareas de otros usuarios');
        }

        // Admin consultando tareas de otro usuario
        return await taskRepo.find({
          where: {
            project: {
              user: { id: args.userId },
            },
          },
          relations: ['project', 'project.user'],
          order: { id: 'ASC' },
        });
      }

      // Usuario autenticado (admin o no) consultando sus propias tareas
      return await taskRepo.find({
        where: {
          project: {
            user: { id: user.id },
          },
        },
        relations: ['project', 'project.user'],
        order: { id: 'ASC' },
      });
    },
  },

  Mutation: {
    createTask: async (
      _: any,
      args: { title: string; description: string; projectId: number },
      context: any,
    ) => {
      const user = context.user;
      if (!user) throw new Error('No autenticado');

      const project = await projectRepo.findOne({
        where: { id: args.projectId },
        relations: ['user'],
      });

      if (!project) throw new Error('Proyecto no encontrado');
      if (!user.isAdmin && project.user.id !== user.id) {
        throw new Error('No autorizado');
      }

      const newTask = taskRepo.create({
        title: args.title,
        description: args.description,
        completed: false,
        project,
      });

      return await taskRepo.save(newTask);
    },

    updateTask: async (
      _: any,
      args: { id: number; title?: string; description?: string; completed?: boolean },
      context: any,
    ) => {
      const user = context.user;
      if (!user) throw new Error('No autenticado');

      const task = await taskRepo.findOne({
        where: { id: args.id },
        relations: ['project', 'project.user'],
      });

      if (!task) throw new Error('Tarea no encontrada');
      if (!user.isAdmin && task.project.user.id !== user.id) {
        throw new Error('No autorizado');
      }

      Object.assign(task, {
        title: args.title ?? task.title,
        description: args.description ?? task.description,
        completed: args.completed ?? task.completed,
      });

      return await taskRepo.save(task);
    },

    deleteTask: async (_: any, args: { id: number }, context: any) => {
      const user = context.user;
      if (!user) throw new Error('No autenticado');

      const task = await taskRepo.findOne({
        where: { id: args.id },
        relations: ['project', 'project.user'],
      });

      if (!task) throw new Error('Tarea no encontrada');
      if (!user.isAdmin && task.project.user.id !== user.id) {
        throw new Error('No autorizado');
      }

      await taskRepo.delete({ id: args.id });
      return true;
    },
  },

  Task: {
    project: async (parent: Task) => {
      const projectId = typeof parent.project === 'object' ? parent.project.id : parent.project;
      return await projectRepo.findOne({
        where: { id: projectId },
        relations: ['user'],
      });
    },
  },
};
