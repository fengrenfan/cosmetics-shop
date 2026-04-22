import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 512, nullable: true })
  icon: string;

  @Column({ default: 0, name: 'parent_id' })
  parent_id: number;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0, name: 'sort_order' })
  sort_order: number;

  @Column({ default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
