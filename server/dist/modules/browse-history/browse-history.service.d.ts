import { Repository } from 'typeorm';
import { BrowseHistory } from './browse-history.entity';
export declare class BrowseHistoryService {
    private readonly browseHistoryRepository;
    constructor(browseHistoryRepository: Repository<BrowseHistory>);
    addOrUpdate(userId: number, productId: number): Promise<void>;
    getList(userId: number, page?: number, pageSize?: number): Promise<{
        list: BrowseHistory[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    clear(userId: number): Promise<void>;
    delete(userId: number, productId: number): Promise<void>;
}
