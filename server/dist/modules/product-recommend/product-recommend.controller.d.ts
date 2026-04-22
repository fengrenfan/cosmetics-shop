import { ProductRecommendService } from './product-recommend.service';
export declare class ProductRecommendController {
    private readonly productRecommendService;
    constructor(productRecommendService: ProductRecommendService);
    getRecommendIds(type?: string): Promise<number[]>;
    getAdminList(): Promise<import("./product-recommend.entity").ProductRecommend[]>;
    getHotAdminList(): Promise<import("./product-recommend.entity").ProductRecommend[]>;
    getRecommendProducts(): Promise<{
        list: import("../product/product.entity").Product[];
        total: number;
    }>;
    getHotProducts(): Promise<import("../product/product.entity").Product[]>;
    create(dto: {
        product_id: number;
        recommend_type?: string;
        sort_order?: number;
    }): Promise<import("./product-recommend.entity").ProductRecommend>;
    update(id: number, dto: {
        sort_order?: number;
        status?: number;
    }): Promise<import("./product-recommend.entity").ProductRecommend>;
    delete(id: number): Promise<{
        success: boolean;
    }>;
}
