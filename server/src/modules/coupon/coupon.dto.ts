// coupon.dto.ts
import { IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';
import { COUPON_TYPE } from './coupon.constants';

// 创建优惠券 DTO
export class CreateCouponDto {
  @IsString()
  title: string;

  @IsString()
  type: string; // 'cash' | 'discount' | 'noThreshold'

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
  @IsOptional()
  auto_grant?: number; // 0:否 1:新用户注册 2:首单
}

// 更新优惠券 DTO
export class UpdateCouponDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  type?: string;

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
  @IsOptional()
  status?: number;

  @IsNumber()
  @IsOptional()
  auto_grant?: number;
}

// 核销验证 DTO
export class ValidateCouponDto {
  @IsNumber()
  user_id: number;

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
