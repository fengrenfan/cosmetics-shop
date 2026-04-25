import { BrowseHistoryService } from './browse-history.service';
export declare class BrowseHistoryController {
    private readonly browseHistoryService;
    constructor(browseHistoryService: BrowseHistoryService);
    add(body: {
        product_id: number;
    }, req: any): Promise<{
        code: number;
        message: string;
    }>;
    getList(req: any, page?: string, pageSize?: string): Promise<{
        code: number;
        message: string;
        data: {
            list: import("./browse-history.entity").BrowseHistory[];
            pagination: {
                page: number;
                pageSize: number;
                total: number;
                totalPages: number;
            };
        };
    }>;
    clear(req: any): Promise<{
        code: number;
        message: string;
    }>;
    delete(req: any, productId: string): Promise<{
        code: number;
        message: string;
    }>;
}
