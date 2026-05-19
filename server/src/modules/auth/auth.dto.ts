import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class WxLoginDto {
  @IsString()
  @IsNotEmpty()
  code: string; // 微信登录 code

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  inviter_id?: number;
}

export class AdminLoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class SendCodeDto {
  @IsString()
  @IsNotEmpty()
  phone: string; // 手机号
}

export class PhoneLoginDto {
  @IsString()
  @IsNotEmpty()
  phone: string; // 手机号

  @IsString()
  @IsNotEmpty()
  code: string; // 验证码

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  inviter_id?: number;
}
