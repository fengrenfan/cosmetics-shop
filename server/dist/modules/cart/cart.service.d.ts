import { Repository } from 'typeorm';
import { Cart } from './cart.entity';
import { ProductService } from '../product/product.service';
export declare class CartService {
    private readonly cartRepository;
    private readonly productService;
    constructor(cartRepository: Repository<Cart>, productService: ProductService);
    getList(userId: number | null, deviceId: string | null): Promise<{
        id: number;
        product_id: number;
        sku_id: number;
        title: string;
        cover_image: string;
        price: number;
        stock: number;
        sku_name: string;
        quantity: number;
        is_checked: number;
    }[]>;
    add(dto: {
        user_id?: number | null;
        device_id?: string | null;
        product_id: number;
        sku_id?: number;
        quantity?: number;
    }): Promise<{
        id: number;
        quantity: number;
    }>;
    update(id: number, dto: {
        quantity?: number;
    }): Promise<{
        success: boolean;
    }>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
    batchRemove(ids: number[]): Promise<{
        success: boolean;
    }>;
    updateChecked(ids: number[], checked: number): Promise<{
        success: boolean;
    }>;
}
