import { gql } from 'graphql-tag';

export const projectTypeDefs = gql`
  type Project {
    id: ID!
    title: String!
    content: String!
    user: User!
    tasks: [Task!]!
  }

  extend type Query {
    projects(userId: Int): [Project!]!
    project(id: Int!): Project
    # Si el usuario NO es admin => devuelve solo sus proyectos (ignora userId)
    # Si el usuario es admin => puede pasar userId para obtener proyectos de otros
  }

  extend type Mutation {
    createProject(title: String!, content: String!, userId: Int): Project!
    # userId es opcional: si es admin puede especificarlo; si no, se ignora y se usa el propio ID

    updateProject(id: Int!, title: String, content: String, userId: Int): Project!
    # Igual que arriba: si no es admin, se ignora userId; solo puede editar sus propios

    deleteProject(id: Int!, userId: Int): Boolean!
    # Igual: admin puede borrar de otros; usuarios normales, solo los suyos
  }
`;
