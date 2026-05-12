import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderService } from './order.service';

@Injectable()
export class OrderTask {
  private readonly logger = new Logger(OrderTask.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly orderService: OrderService,
  ) {}

  @Cron('*/5 * * * *')
  async handlePendingTimeout() {
    const deadline = new Date(Date.now() - 30 * 60 * 1000);

    const expiredOrders = await this.orderRepository.find({
      where: {
        status: 'pending',
        pay_status: 'unpaid',
        created_at: LessThan(deadline),
      },
      take: 50,
      order: { created_at: 'ASC' },
    });

    if (expiredOrders.length === 0) return;

    this.logger.log(`发现 ${expiredOrders.length} 笔超时未支付订单，开始自动取消`);

    for (const order of expiredOrders) {
      try {
        await this.orderService.cancel(order.id, '超时未支付自动取消');
        this.logger.log(`订单 ${order.order_no} 已自动取消`);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        this.logger.error(`订单 ${order.order_no} 自动取消失败: ${msg}`);
      }
    }
  }
}
