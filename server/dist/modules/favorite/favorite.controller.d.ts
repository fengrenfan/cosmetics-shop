import { FavoriteService } from './favorite.service';
export declare class FavoriteController {
    private readonly favoriteService;
    constructor(favoriteService: FavoriteService);
    getList(userId: number): Promise<{
        id: number;
        product_id: number;
        title: string;
        cover_image: string;
        price: number;
        created_at: Date;
    }[]>;
    toggle(userId: number, productId: number): Promise<{
        is_favorited: boolean;
    }>;
}
