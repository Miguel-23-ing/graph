// src/entities/User.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Project } from './Project';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ default: false })
  isAdmin!: boolean;

  @OneToMany(() => Project, (project) => project.user)
  projects!: Project[];
}
