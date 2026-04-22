import { Order } from './order.entity';
import { Product } from '../product/product.entity';
export declare class OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    sku_id: number;
    product_title: string;
    sku_name: string;
    cover_image: string;
    price: number;
    quantity: number;
    subtotal: number;
    created_at: Date;
    order: Order;
    product: Product;
}
