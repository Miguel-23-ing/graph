import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { Project } from './entities/Project';
import { Task } from './entities/Task'; // <-- importar Task
import dotenv from 'dotenv';

dotenv.config(); // Cargar variables desde el archivo .env

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL, // Usamos la URL completa
  synchronize: true, // Solo en desarrollo
  logging: false,
  entities: [User, Project, Task], // Registrar todas las entidades
  migrations: [],
  subscribers: [],
});
