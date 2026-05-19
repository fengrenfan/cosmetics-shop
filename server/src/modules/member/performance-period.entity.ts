import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('performance_period')
export class PerformancePeriod {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, name: 'period_code' })
  period_code: string;

  @Column({ length: 64 })
  name: string;

  @Column({ type: 'date', name: 'start_date' })
  start_date: string;

  @Column({ type: 'date', name: 'end_date' })
  end_date: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 10000, name: 'qualified_threshold' })
  qualified_threshold: number;

  @Column({ default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
