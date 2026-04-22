import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { ProductSku } from './product-sku.entity';
import { ProductListDto, CreateProductDto, UpdateProductDto } from './product.dto';
export declare class ProductService {
    private readonly productRepository;
    private readonly skuRepository;
    constructor(productRepository: Repository<Product>, skuRepository: Repository<ProductSku>);
    getList(query: ProductListDto): Promise<{
        list: Product[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    getRecommend({ page, pageSize }: {
        page: any;
        pageSize: any;
    }): Promise<{
        list: Product[];
        pagination: {
            page: any;
            pageSize: any;
            total: number;
        };
    }>;
    getFeatured(): Promise<Product>;
    getHot(limit?: number): Promise<Product[]>;
    getDetail(id: number): Promise<Product>;
    create(dto: CreateProductDto): Promise<Product>;
    update(id: number, dto: UpdateProductDto): Promise<{
        success: boolean;
    }>;
    delete(id: number): Promise<{
        success: boolean;
    }>;
    updateStatus(id: number, status: number): Promise<{
        success: boolean;
    }>;
    decrementStock(productId: number, skuId: number | undefined, quantity: number): Promise<void>;
    incrementStock(productId: number, skuId: number | undefined, quantity: number): Promise<void>;
    batchUpdateStatus(ids: number[], status: number): Promise<{
        success: boolean;
    }>;
}
