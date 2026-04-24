export declare class ProductListDto {
    page?: number;
    pageSize?: number;
    category_id?: string;
    keyword?: string;
    status?: number;
    sort?: string;
    order?: string;
    min_price?: number;
    max_price?: number;
    is_new?: number;
    is_hot?: number;
    is_recommend?: number;
    in_stock?: number;
}
export declare class CreateProductDto {
    category_id: number;
    title: string;
    subtitle?: string;
    cover_image: string;
    images?: string[] | string;
    detail_html?: string;
    price: number;
    original_price?: number;
    stock: number;
    is_recommend?: number;
    is_hot?: number;
    is_new?: number;
    status?: number;
    sort_order?: number;
    skus?: {
        sku_name: string;
        sku_attrs?: Record<string, string>;
        price: number;
        stock: number;
        image?: string;
    }[];
}
export declare class UpdateProductDto extends CreateProductDto {
}
export declare class BatchUpdateStatusDto {
    ids: number[];
    status: number;
}
