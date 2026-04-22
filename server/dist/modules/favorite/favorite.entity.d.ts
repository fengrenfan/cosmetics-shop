import { User } from '../user/user.entity';
import { Product } from '../product/product.entity';
export declare class Favorite {
    id: number;
    user_id: number;
    product_id: number;
    created_at: Date;
    user: User;
    product: Product;
}
