import { IsNumber, IsOptional, IsString, IsArray, Min } from 'class-validator';

export class CreateAfterSaleDto {
  @IsNumber()
  order_id: number;

  @IsString()
  type: string; // refund | return

  @IsNumber()
  @Min(0.01)
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
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class AdminProcessDto {
  @IsOptional()
  @IsString()
  admin_remark?: string;
}
