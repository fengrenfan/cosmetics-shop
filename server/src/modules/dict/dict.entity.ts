import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('dict')
export class Dict {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, name: 'dict_name' })
  dict_name: string;

  @Column({ length: 50, name: 'dict_code' })
  dict_code: string;

  @Column({ type: 'text', nullable: true, name: 'description' })
  description: string;

  @Column({ default: 1, name: 'sort_order' })
  sort_order: number;

  @Column({ default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}

@Entity('dict_item')
export class DictItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'dict_id' })
  dict_id: number;

  @Column({ length: 100, name: 'item_label' })
  item_label: string;

  @Column({ length: 100, name: 'item_value' })
  item_value: string;

  @Column({ default: 0, name: 'sort_order' })
  sort_order: number;

  @Column({ default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
