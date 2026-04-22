import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 128, nullable: true })
  openid: string;

  @Column({ length: 128, nullable: true })
  unionid: string;

  @Column({ length: 64, nullable: true })
  nickname: string;

  @Column({ length: 512, nullable: true })
  avatar: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ default: 0 })
  gender: number;

  @Column({ length: 255, nullable: true })
  password_hash: string;

  @Column({ default: 1 })
  status: number;

  @Column({ type: 'datetime', nullable: true })
  last_login_at: Date;

  @Column({ length: 45, nullable: true })
  last_login_ip: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
