import 'reflect-metadata'; // Necesario para TypeORM
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import dotenv from 'dotenv';
import { typeDefs } from './schema/typeDefs';
import { resolvers } from './schema/resolvers';
import { AppDataSource } from './data-source';
import { getUserFromToken } from './middleware/authContext';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const isDev = process.env.NODE_ENV !== 'production';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: isDev, // Solo activado en desarrollo
});

async function startServer() {
  try {
    await AppDataSource.initialize();
    console.log('📦 Conectado a la base de datos');

    await server.start();

    app.use(
      cors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
      })
    );
    app.use(json());

    app.use(
      '/graphql',
      expressMiddleware(server, {
        context: async ({ req }) => {
          const authHeader = req.headers.authorization;
          const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

          const userFromToken = token ? await getUserFromToken(token) : null;

          const user = userFromToken
            ? {
                id: userFromToken.id,
                email: userFromToken.email,
                isAdmin: userFromToken.isAdmin,
              }
            : null;

          if (isDev) {
            console.log('🛡️ Usuario en contexto:', user ? `ID ${user.id}` : 'No autenticado');
          }

          return { user };
        },
      })
    );

    app.listen(port, () => {
      console.log(`🚀 Servidor GraphQL escuchando en http://localhost:${port}/graphql`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();
