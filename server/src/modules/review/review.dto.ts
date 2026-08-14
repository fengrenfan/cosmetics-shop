import { IsNumber, IsOptional, IsString, IsArray, Min, Max } from 'class-validator';

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
  @IsNumber()
  product_id?: number;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
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
  product_id?: number;

  @IsOptional()
  keyword?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}
