import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('upload')
export class Upload {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 512 })
  url: string;

  @Column({ length: 255, nullable: true })
  filename: string;

  @Column({ length: 100, nullable: true })
  mime_type: string;

  @Column({ default: 0 })
  size: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
