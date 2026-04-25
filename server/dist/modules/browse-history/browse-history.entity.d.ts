import { Product } from '../product/product.entity';
export declare class BrowseHistory {
    id: number;
    user_id: number;
    product_id: number;
    viewed_at: Date;
    product: Product;
}
