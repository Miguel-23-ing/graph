import { gql } from 'graphql-tag';
import { userTypeDefs } from './userTypeDefs';
import { projectTypeDefs } from './projectTypeDefs';
import { taskTypeDefs } from './taskTypeDefs';

export const typeDefs = gql`
  ${userTypeDefs}
  ${projectTypeDefs}
  ${taskTypeDefs}

  type Query {
    hello: String!
  }

  type Mutation
`;
