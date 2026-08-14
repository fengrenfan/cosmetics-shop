import { IsOptional, IsString, IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAfterSaleDto {
  @IsNumber()
  order_id: number;

  @IsString()
  type: string; // refund | return

  @IsNumber()
  refund_amount: number;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsArray()
  order_item_ids?: number[];
}

export class AdminAfterSaleQueryDto {
  @IsOptional()
  status?: string;

  @IsOptional()
  keyword?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}

export class AdminProcessDto {
  @IsOptional()
  @IsString()
  admin_remark?: string;
}
