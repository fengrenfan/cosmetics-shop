import { Product } from '../product/product.entity';
import { ProductSku } from '../product/product-sku.entity';
export declare class Cart {
    id: number;
    user_id: number;
    device_id: string;
    product_id: number;
    sku_id: number;
    quantity: number;
    is_checked: number;
    created_at: Date;
    product: Product;
    sku: ProductSku;
}
