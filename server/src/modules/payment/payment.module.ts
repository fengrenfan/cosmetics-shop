import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderModule } from '../order/order.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentGatewayMock } from './payment.gateway.mock';
import { PaymentGatewayReal } from './payment.gateway.real';
import { PaymentGatewaySelector } from './payment.gateway.selector';
import { PaymentRecord } from './payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentRecord]), OrderModule],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentGatewayMock, PaymentGatewayReal, PaymentGatewaySelector],
  exports: [PaymentService],
})
export class PaymentModule {}
