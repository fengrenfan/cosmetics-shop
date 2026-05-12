import { IsNumber, IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @Type(() => Number)
  @IsNumber()
  product_id: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sku_id?: number;

  @Type(() => Number)
  @IsNumber()
  quantity: number;

  @IsOptional()
  @Type(() => Number)
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

  @IsOptional()
  @IsNumber()
  points_amount?: number;

  @IsOptional()
  @IsNumber()
  points_money?: number;

  @IsOptional()
  @IsNumber()
  user_id?: number;

  @IsOptional()
  @IsString()
  pay_channel?: string; // wechat | alipay

  @IsOptional()
  @IsString()
  pay_scene?: string; // miniapp | h5
}
