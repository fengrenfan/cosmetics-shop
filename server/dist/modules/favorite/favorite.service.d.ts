import { Repository } from 'typeorm';
import { Favorite } from './favorite.entity';
export declare class FavoriteService {
    private readonly favoriteRepository;
    constructor(favoriteRepository: Repository<Favorite>);
    getList(userId: number): Promise<{
        id: number;
        product_id: number;
        title: string;
        cover_image: string;
        price: number;
        created_at: Date;
    }[]>;
    getCount(userId: number): Promise<number>;
    toggle(userId: number, productId: number): Promise<{
        is_favorited: boolean;
    }>;
}
