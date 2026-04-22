export declare class CreateDictDto {
    dict_name: string;
    dict_code: string;
    description?: string;
    sort_order?: number;
}
export declare class UpdateDictDto {
    dict_name?: string;
    dict_code?: string;
    description?: string;
    sort_order?: number;
    status?: number;
}
export declare class CreateDictItemDto {
    dict_id: number;
    item_label: string;
    item_value: string;
    sort_order?: number;
}
export declare class UpdateDictItemDto {
    item_label?: string;
    item_value?: string;
    sort_order?: number;
    status?: number;
}
