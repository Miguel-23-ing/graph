// src/schema/typeDefs/taskTypeDefs.ts
import { gql } from 'graphql-tag';

export const taskTypeDefs = gql`
  type Task {
    id: ID!
    title: String!
    description: String!
    completed: Boolean!
    project: Project!
  }

  extend type Query {
    # Admin puede pasar userId para obtener todas las tareas de ese usuario.
    # Usuarios normales solo obtienen sus propias tareas (de sus proyectos).
    tasks(userId: Int): [Task!]!
  }

  extend type Mutation {
    # Crea una tarea en un proyecto propio (usuario) o en cualquier proyecto (admin)
    createTask(title: String!, description: String!, projectId: Int!): Task!

    # Actualiza una tarea propia (usuario) o cualquier tarea (admin)
    updateTask(id: Int!, title: String, description: String, completed: Boolean): Task!

    # Elimina una tarea propia (usuario) o cualquier tarea (admin)
    deleteTask(id: Int!): Boolean!
  }
`;
