import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './User';
import { Task } from './Task';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  content!: string;

  @ManyToOne(() => User, (user) => user.projects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' }) // crea la columna userId en la tabla project
  user!: User;

  @OneToMany(() => Task, (task) => task.project)
  tasks!: Task[];
}
