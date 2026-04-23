import { CartService } from './cart.service';
import { AddCartDto, UpdateCartDto, UpdateCheckedDto } from './cart.dto';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    getList(req: any): Promise<{
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
    add(dto: AddCartDto, req: any): Promise<{
        id: number;
        quantity: number;
    }>;
    update(id: string, dto: UpdateCartDto): Promise<{
        success: boolean;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    batchRemove(ids: number[]): Promise<{
        success: boolean;
    }>;
    updateChecked(dto: UpdateCheckedDto, req: any): Promise<{
        success: boolean;
    }>;
    getRecommend(req: any): Promise<import("../product/product.entity").Product[]>;
}
