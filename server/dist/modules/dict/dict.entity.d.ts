export declare class Dict {
    id: number;
    dict_name: string;
    dict_code: string;
    description: string;
    sort_order: number;
    status: number;
    created_at: Date;
    updated_at: Date;
}
export declare class DictItem {
    id: number;
    dict_id: number;
    item_label: string;
    item_value: string;
    sort_order: number;
    status: number;
    created_at: Date;
    updated_at: Date;
}
