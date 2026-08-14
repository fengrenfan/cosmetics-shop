import { IsNumber, IsOptional, IsString, IsArray, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReviewDto {
  @IsNumber()
  order_id: number;

  @IsNumber()
  product_id: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsNumber()
  is_anonymous?: number;
}

export class ReviewQueryDto {
  @IsOptional()
  @Type(() => Number)
  product_id?: number;

  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  rating?: number;
}

export class AdminReplyDto {
  @IsString()
  admin_reply: string;
}

export class AdminReviewQueryDto {
  @IsOptional()
  status?: string;

  @IsOptional()
  @Type(() => Number)
  product_id?: number;

  @IsOptional()
  keyword?: string;

  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
