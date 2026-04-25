import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  order_id: number;

  @IsString()
  @IsIn(['wechat', 'alipay'])
  pay_channel: string;

  @IsString()
  @IsIn(['miniapp', 'h5'])
  pay_scene: string;
}

export class MockSuccessDto {
  @IsString()
  out_trade_no: string;

  @IsOptional()
  @IsString()
  @IsIn(['wechat', 'alipay'])
  pay_channel?: string;

  @IsOptional()
  @IsString()
  third_trade_no?: string;
}
