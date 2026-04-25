// coupon.dto.ts
import { IsString, IsNumber, IsOptional, IsDateString, Min, Max, IsEnum } from 'class-validator';
import { COUPON_TYPE, CouponType } from './coupon.constants';

// 创建优惠券 DTO
export class CreateCouponDto {
  @IsString()
  title: string;

  @IsEnum(COUPON_TYPE)
  type: CouponType; // 'cash' | 'discount' | 'noThreshold'

  @IsNumber()
  @Min(0)
  value: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  min_amount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  max_discount?: number;

  @IsNumber()
  @Min(1)
  total_count: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  per_limit?: number;

  @IsDateString()
  @IsOptional()
  start_time?: string;

  @IsDateString()
  @IsOptional()
  end_time?: string;

  @IsNumber()
  @Min(0)
  @Max(2)
  @IsOptional()
  auto_grant?: number; // 0:否 1:新用户注册 2:首单

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  status?: number;
}

// 更新优惠券 DTO
export class UpdateCouponDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsEnum(COUPON_TYPE)
  @IsOptional()
  type?: CouponType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  value?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  min_amount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  max_discount?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  total_count?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  per_limit?: number;

  @IsDateString()
  @IsOptional()
  start_time?: string;

  @IsDateString()
  @IsOptional()
  end_time?: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  status?: number;

 @IsNumber()
  @Min(0)
  @Max(2)
  @IsOptional()
  auto_grant?: number | null;

  @IsString()
  @IsOptional()
  description?: string | null;
}

// 核销验证 DTO
export class ValidateCouponDto {
  @IsNumber()
  @IsOptional()
  user_id?: number;

  @IsNumber()
  coupon_id: number;

  @IsNumber()
  @Min(0)
  order_amount: number;
}

// 计算优惠 DTO
export class ApplyCouponDto {
  @IsNumber()
  coupon_id: number;

  @IsNumber()
  @Min(0)
  order_amount: number;
}

// 标记已使用 DTO
export class MarkUsedDto {
  @IsNumber()
  user_coupon_id: number;

  @IsNumber()
  order_id: number;
}

// 管理员发放 DTO
export class GrantCouponDto {
  @IsNumber()
  user_id: number;

  @IsNumber()
  coupon_id: number;
}
