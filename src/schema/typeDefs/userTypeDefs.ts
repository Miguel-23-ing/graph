import { gql } from 'graphql-tag';

export const userTypeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    isAdmin: Boolean!
    projects: [Project!]!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  extend type Query {
    users: [User!]!
  }

  extend type Mutation {
    register(name: String!, email: String!, password: String!, isAdmin: Boolean): User!
    login(email: String!, password: String!): AuthPayload!
    updateUser(id: Int!, name: String, email: String): User!
    deleteUser(id: Int!): Boolean!
  }
`;
