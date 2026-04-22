import { ProductService } from './product.service';
import { ProductListDto, CreateProductDto, UpdateProductDto } from './product.dto';
export declare class ProductController {
    private readonly productService;
    constructor(productService: ProductService);
    getList(query: ProductListDto): Promise<{
        list: import("./product.entity").Product[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    getRecommend(page?: number, pageSize?: number): Promise<{
        list: import("./product.entity").Product[];
        pagination: {
            page: any;
            pageSize: any;
            total: number;
        };
    }>;
    getFeatured(): Promise<import("./product.entity").Product>;
    getHot(limit?: number): Promise<import("./product.entity").Product[]>;
    getDetail(id: string): Promise<import("./product.entity").Product>;
    create(dto: CreateProductDto): Promise<import("./product.entity").Product>;
    batchUpdateStatus(dto: {
        ids: number[];
        status: number;
    }): Promise<{
        success: boolean;
    }>;
    update(id: string, dto: UpdateProductDto): Promise<{
        success: boolean;
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
    updateStatus(id: string, status: number): Promise<{
        success: boolean;
    }>;
}
