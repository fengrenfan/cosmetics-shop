import { Repository } from 'typeorm';
import { ProductRecommend } from './product-recommend.entity';
import { Product } from '../product/product.entity';
export declare class ProductRecommendService {
    private readonly recommendRepository;
    private readonly productRepository;
    constructor(recommendRepository: Repository<ProductRecommend>, productRepository: Repository<Product>);
    getRecommendProducts(type?: string): Promise<ProductRecommend[]>;
    getRecommendProductsWithDetail(type?: string): Promise<{
        list: Product[];
        total: number;
    }>;
    getHotProductsWithDetail(): Promise<Product[]>;
    getAllList(): Promise<ProductRecommend[]>;
    getListByType(type: string): Promise<ProductRecommend[]>;
    create(dto: {
        product_id: number;
        recommend_type?: string;
        sort_order?: number;
    }): Promise<ProductRecommend>;
    update(id: number, dto: {
        sort_order?: number;
        status?: number;
    }): Promise<ProductRecommend>;
    delete(id: number): Promise<{
        success: boolean;
    }>;
}
