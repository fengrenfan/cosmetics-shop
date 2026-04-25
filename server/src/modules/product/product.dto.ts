import { IsString, IsNumber, IsOptional, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductListDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageSize?: number = 10;

  @IsOptional()
  @IsString()
  category_id?: string;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @Type(() => Number)
  status?: number;

  @IsOptional()
  @IsString()
  sort?: string = 'sort_order';

  @IsOptional()
  @IsString()
  order?: string = 'desc';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  min_price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  max_price?: number;

  @IsOptional()
  @Type(() => Number)
  is_new?: number;

  @IsOptional()
  @Type(() => Number)
  is_hot?: number;

  @IsOptional()
  @Type(() => Number)
  is_recommend?: number;

  @IsOptional()
  @Type(() => Number)
  in_stock?: number; // 1: 只显示有库存的商品
}

export class CreateProductDto {
  @IsNumber()
  category_id: number;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsString()
  cover_image: string;

  @IsOptional()
  images?: string[] | string;

  @IsOptional()
  @IsString()
  detail_html?: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  original_price?: number;

  @IsNumber()
  stock: number;

  @IsOptional()
  @IsNumber()
  is_recommend?: number;

  @IsOptional()
  @IsNumber()
  is_hot?: number;

  @IsOptional()
  @IsNumber()
  is_new?: number;

  @IsOptional()
  @IsNumber()
  status?: number;

  @IsOptional()
  @IsNumber()
  sort_order?: number;

  @IsOptional()
  @IsArray()
  skus?: {
    sku_name: string;
    sku_code?: string;
    sku_attrs?: Record<string, string>;
    price: number;
    stock: number;
    image?: string;
  }[];
}

export class UpdateProductDto extends CreateProductDto {}

export class BatchUpdateStatusDto {
  @IsArray()
  ids: number[];

  @IsNumber()
  status: number;
}
