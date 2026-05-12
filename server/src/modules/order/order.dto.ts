import { IsNumber, IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class OrderItemDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  product_id: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  sku_id?: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  quantity: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
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
