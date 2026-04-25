import { Controller, Post, Get, Body, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentService } from './payment.service';
import { CreatePaymentDto, MockSuccessDto } from './payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(@Req() req: any, @Body() dto: CreatePaymentDto) {
    return this.paymentService.create(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('status/:orderId')
  async getStatus(@Req() req: any, @Param('orderId') orderId: string) {
    return this.paymentService.getStatus(+orderId, req.user.id);
  }

  @Post('notify/wechat')
  async notifyWechat(@Body() body: any) {
    return this.paymentService.handleNotify('wechat', body);
  }

  @Post('notify/alipay')
  async notifyAlipay(@Body() body: any) {
    return this.paymentService.handleNotify('alipay', body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mock/success')
  async mockSuccess(@Body() dto: MockSuccessDto) {
    return this.paymentService.mockSuccess(dto.out_trade_no, dto.pay_channel, dto.third_trade_no);
  }
}
