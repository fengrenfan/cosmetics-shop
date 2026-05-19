import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('member_level')
export class MemberLevel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 64 })
  name: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100, name: 'discount_rate' })
  discount_rate: number;

  @Column({ length: 512, nullable: true, name: 'benefit_desc' })
  benefit_desc: string;

  @Column({ default: 0, name: 'sort_order' })
  sort_order: number;

  @Column({ default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
