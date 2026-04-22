import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
export declare class CategoryService implements OnModuleInit {
    private readonly categoryRepository;
    constructor(categoryRepository: Repository<Category>);
    onModuleInit(): Promise<void>;
    getTree(): Promise<any[]>;
    getList(): Promise<Category[]>;
    create(dto: {
        name: string;
        parent_id?: number;
        sort_order?: number;
        icon?: string;
    }): Promise<Category>;
    update(id: number, dto: {
        name?: string;
        parent_id?: number;
        sort_order?: number;
        icon?: string;
        status?: number;
    }): Promise<Category>;
    delete(id: number): Promise<{
        success: boolean;
    }>;
    private buildTree;
}
