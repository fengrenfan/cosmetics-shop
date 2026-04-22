import { DictService } from './dict.service';
export declare class DictController {
    private readonly dictService;
    constructor(dictService: DictService);
    getAllDictsWithItems(): Promise<{
        items: import("./dict.entity").DictItem[];
        id: number;
        dict_name: string;
        dict_code: string;
        description: string;
        sort_order: number;
        status: number;
        created_at: Date;
        updated_at: Date;
    }[]>;
    getDictList(): Promise<import("./dict.entity").Dict[]>;
    createDict(dto: {
        dict_name: string;
        dict_code: string;
        description?: string;
        sort_order?: number;
    }): Promise<import("./dict.entity").Dict>;
    updateDict(id: number, dto: {
        dict_name?: string;
        dict_code?: string;
        description?: string;
        sort_order?: number;
        status?: number;
    }): Promise<import("./dict.entity").Dict>;
    deleteDict(id: number): Promise<{
        success: boolean;
    }>;
    getDictItems(dictId?: string): Promise<import("./dict.entity").DictItem[]>;
    createDictItem(dto: {
        dict_id: number;
        item_label: string;
        item_value: string;
        sort_order?: number;
    }): Promise<import("./dict.entity").DictItem>;
    updateDictItem(id: number, dto: {
        item_label?: string;
        item_value?: string;
        sort_order?: number;
        status?: number;
    }): Promise<import("./dict.entity").DictItem>;
    deleteDictItem(id: number): Promise<{
        success: boolean;
    }>;
}
