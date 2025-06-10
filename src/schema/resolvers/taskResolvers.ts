import { AppDataSource } from '../../data-source';
import { Task } from '../../entities/Task';
import { Project } from '../../entities/Project';
import { User } from '../../entities/User';

const taskRepo = AppDataSource.getRepository(Task);
const projectRepo = AppDataSource.getRepository(Project);
const userRepo = AppDataSource.getRepository(User);

export const taskResolvers = {
  Query: {
    // Obtener múltiples tareas, con control de acceso
    tasks: async (_: any, args: { userId?: number }, context: any) => {
      const user = context.user;
      if (!user) throw new Error('No autenticado');

      if (args.userId !== undefined) {
        if (!user.isAdmin) {
          throw new Error('No autorizado para ver tareas de otros usuarios');
        }

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

      if (user.isAdmin) {
        // Admin: ver todas las tareas
        return await taskRepo.find({
          relations: ['project', 'project.user'],
          order: { id: 'ASC' },
        });
      }

      // Usuario normal: solo sus tareas
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

    // Obtener una tarea específica por ID
    task: async (_: any, { id }: { id: number }, context: any) => {
      const task = await taskRepo.findOne({
        where: { id },
        relations: ['project', 'project.user'],
      });

      if (!task) throw new Error('Tarea no encontrada');

      const currentUser = context?.user;
      if (!currentUser) throw new Error('No autenticado');

      const isOwner = task.project.user.id === currentUser.id;
      if (!currentUser.isAdmin && !isOwner) {
        throw new Error('No autorizado');
      }

      return task;
    },
  },

  Mutation: {
    // Crear tarea
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

    // Actualizar tarea
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

    // Eliminar tarea
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
    // Resolver para la relación con el proyecto
    project: async (parent: Task) => {
      const projectId = typeof parent.project === 'object' ? parent.project.id : parent.project;
      return await projectRepo.findOne({
        where: { id: projectId },
        relations: ['user'],
      });
    },
  },
};
