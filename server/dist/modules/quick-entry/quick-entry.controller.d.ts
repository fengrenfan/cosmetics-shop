import { QuickEntryService } from './quick-entry.service';
export declare class QuickEntryController {
    private readonly quickEntryService;
    constructor(quickEntryService: QuickEntryService);
    getList(): Promise<import("./quick-entry.entity").QuickEntry[]>;
    getAdminList(): Promise<import("./quick-entry.entity").QuickEntry[]>;
    create(dto: {
        title: string;
        icon?: string;
        type?: string;
        target_id?: string;
        sort_order?: number;
    }): Promise<import("./quick-entry.entity").QuickEntry>;
    update(id: number, dto: {
        title?: string;
        icon?: string;
        type?: string;
        target_id?: string;
        sort_order?: number;
        status?: number;
    }): Promise<import("./quick-entry.entity").QuickEntry>;
    delete(id: number): Promise<{
        success: boolean;
    }>;
}
