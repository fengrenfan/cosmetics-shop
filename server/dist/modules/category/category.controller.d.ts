import { CategoryService } from './category.service';
export declare class CategoryController {
    private readonly categoryService;
    constructor(categoryService: CategoryService);
    getTree(): Promise<any[]>;
    getList(): Promise<import("./category.entity").Category[]>;
    create(dto: {
        name: string;
        parent_id?: number;
        sort_order?: number;
        icon?: string;
    }): Promise<import("./category.entity").Category>;
    update(id: number, dto: {
        name?: string;
        parent_id?: number;
        sort_order?: number;
        icon?: string;
        status?: number;
    }): Promise<import("./category.entity").Category>;
    delete(id: number): Promise<{
        success: boolean;
    }>;
}
