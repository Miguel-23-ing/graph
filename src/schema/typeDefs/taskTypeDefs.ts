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
    # Obtener todas las tareas. 
    # Admin puede usar userId para ver tareas de cualquier usuario.
    # Usuarios normales solo verán tareas de sus propios proyectos.
    tasks(userId: Int): [Task!]!

    # Obtener una tarea por ID.
    # Solo el admin o el dueño del proyecto puede verla.
    task(id: Int!): Task
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
