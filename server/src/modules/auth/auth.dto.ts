import { IsString, IsNotEmpty } from 'class-validator';

export class WxLoginDto {
  @IsString()
  @IsNotEmpty()
  code: string; // 微信登录 code
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
}
