import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('banner')
export class Banner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: true })
  title: string;

  @Column({ length: 200, nullable: true })
  subtitle: string;

  @Column({ length: 50, nullable: true })
  tag: string;

  @Column({ length: 512 })
  image: string;

  @Column({ length: 20, default: 'none', name: 'link_type' })
  link_type: string;

  @Column({ length: 100, nullable: true, name: 'link_id' })
  link_id: string;

  @Column({ default: 0, name: 'sort_order' })
  sort_order: number;

  @Column({ default: 1 })
  status: number;

  @Column({ type: 'datetime', nullable: true, name: 'start_time' })
  start_time: Date;

  @Column({ type: 'datetime', nullable: true, name: 'end_time' })
  end_time: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
