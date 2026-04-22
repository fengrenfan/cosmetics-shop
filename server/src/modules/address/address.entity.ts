import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('address')
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 50 })
  province: string;

  @Column({ length: 50 })
  city: string;

  @Column({ length: 50 })
  district: string;

  @Column({ length: 255, name: 'detail_address' })
  detail_address: string;

  @Column({ length: 10, nullable: true, name: 'postal_code' })
  postal_code: string;

  @Column({ default: 0, name: 'is_default' })
  is_default: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
