import { ProductSku } from './product-sku.entity';
import { Category } from '../category/category.entity';
export declare class Product {
    id: number;
    category_id: number;
    title: string;
    subtitle: string;
    cover_image: string;
    images: any;
    detail_html: any;
    price: number;
    original_price: number;
    stock: number;
    sales_count: number;
    view_count: number;
    is_recommend: number;
    is_hot: number;
    is_new: number;
    status: number;
    sort_order: number;
    created_at: Date;
    updated_at: Date;
    category: Category;
    skus: ProductSku[];
}
