import { Product } from './product.entity';
export declare class ProductSku {
    id: number;
    product_id: number;
    sku_name: string;
    sku_attrs: any;
    price: number;
    stock: number;
    image: string;
    status: number;
    created_at: Date;
    updated_at: Date;
    product: Product;
}
