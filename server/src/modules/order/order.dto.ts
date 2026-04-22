import { IsNumber, IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsNumber()
  product_id: number;

  @IsOptional()
  @IsNumber()
  sku_id?: number;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsNumber()
  cart_id?: number;
}

export class CreateOrderDto {
  @IsNumber()
  address_id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsString()
  remark?: string;

  @IsOptional()
  @IsNumber()
  coupon_id?: number;

  @IsNumber()
  user_id: number;
}
