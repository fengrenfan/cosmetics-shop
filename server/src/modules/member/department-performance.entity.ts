import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('department_performance')
export class DepartmentPerformance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'owner_user_id' })
  owner_user_id: number;

  @Column({ name: 'direct_user_id' })
  direct_user_id: number;

  @Column({ name: 'period_id' })
  period_id: number;

  @Column({ length: 64, nullable: true, name: 'dept_name' })
  dept_name: string;

  @Column({ default: 0, name: 'total_members' })
  total_members: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'total_performance' })
  total_performance: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'effective_performance' })
  effective_performance: number;

  @Column({ default: 0 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
