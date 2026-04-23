import { IsNumber, IsOptional, Min, IsString, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class AddCartDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  user_id?: number;

  @IsOptional()
  @IsString()
  device_id?: string;

  @IsNumber()
  product_id: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sku_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity?: number = 1;
}

export class UpdateCartDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantity?: number;
}

export class UpdateCheckedDto {
  @IsArray()
  ids: number[];

  @IsNumber()
  checked: number;
}
