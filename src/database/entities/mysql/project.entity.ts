import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from './user.entity';

@Entity('project')
export class Project {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number

  @Index()
  @Column({ type: 'bigint', unsigned: true })
  userId: number

  @Index({ fulltext: true })
  @Column({ nullable: true, default: null })
  title: string

  @Index({ fulltext: true })
  @Column({ nullable: true, default: null, type: 'varchar', length: 2000 })
  description: string

  @Index({ fulltext: true })
  @Column({ nullable: true, default: null })
  member_join: number

  @Index({ fulltext: true })
  @Column({ nullable: true, default: null })
  percent_join: number

  @ManyToOne(type => User, user => user.posts)
  user: User;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date
}
