import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetPointsDto {
  @IsNumber()
  @Type(() => Number)
  user_id: number;
}

export class CalculatePointsDto {
  @IsNumber()
  @Type(() => Number)
  total_amount: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  points?: number;
}

export class DeductPointsDto {
  @IsNumber()
  @Type(() => Number)
  user_id: number;

  @IsNumber()
  @Type(() => Number)
  points: number;

  @IsNumber()
  @Type(() => Number)
  order_id: number;
}

export class AddPointsDto {
  @IsNumber()
  @Type(() => Number)
  user_id: number;

  @IsNumber()
  @Type(() => Number)
  points: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  order_id?: number;

  @IsOptional()
  @IsString()
  remark?: string;
}