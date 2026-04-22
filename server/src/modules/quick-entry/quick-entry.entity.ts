import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('quick_entry')
export class QuickEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  title: string;

  @Column({ length: 500, nullable: true })
  icon: string;

  @Column({ name: 'type', length: 20, default: 'none' })
  type: string;

  @Column({ name: 'target_id', length: 255, nullable: true })
  target_id: string;

  @Column({ name: 'sort_order', default: 0 })
  sort_order: number;

  @Column({ default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
