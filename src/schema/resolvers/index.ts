// src/schema/resolvers/index.ts
import { userResolvers } from './userResolvers';
import { projectResolvers } from './projectResolvers';
import { taskResolvers } from './taskResolvers';

export const resolvers = {
  Query: {
    hello: () => 'Hola mundo desde GraphQL',
    ...userResolvers.Query,
    ...projectResolvers.Query,
    ...taskResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...projectResolvers.Mutation,
    ...taskResolvers.Mutation,
  },
  User: userResolvers.User,
  Project: projectResolvers.Project,
  Task: taskResolvers.Task,
};
