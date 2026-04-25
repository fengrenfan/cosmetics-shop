import { Injectable, BadRequestException } from '@nestjs/common';
import { PaymentGatewayMock } from './payment.gateway.mock';
import { PaymentGatewayReal } from './payment.gateway.real';
import { PaymentGatewayAdapter } from './payment.gateway.types';

@Injectable()
export class PaymentGatewaySelector {
  constructor(
    private readonly mockGateway: PaymentGatewayMock,
    private readonly realGateway: PaymentGatewayReal,
  ) {}

  getCurrentMode() {
    return (process.env.PAY_MODE || 'mock').toLowerCase();
  }

  getGateway(): PaymentGatewayAdapter {
    const mode = this.getCurrentMode();
    if (mode === 'mock') return this.mockGateway;
    if (mode === 'sandbox' || mode === 'prod') return this.realGateway;
    throw new BadRequestException(`不支持的 PAY_MODE: ${mode}`);
  }
}
