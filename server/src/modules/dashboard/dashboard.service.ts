import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order } from '../order/order.entity';
import { Product } from '../product/product.entity';
import { User } from '../user/user.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 获取统计数据
   */
  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 今日订单
    const todayOrders = await this.orderRepository.count({
      where: {
        created_at: Between(today, tomorrow),
      },
    });

    // 今日销售额
    const todaySales = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.pay_amount)', 'total')
      .where('order.created_at >= :today', { today })
      .andWhere('order.status != :status', { status: 'cancelled' })
      .getRawOne();

    // 商品总数
    const productCount = await this.productRepository.count({
      where: { status: 1 },
    });

    // 用户总数
    const userCount = await this.userRepository.count();

    return {
      today_orders: todayOrders,
      today_sales: parseFloat(todaySales?.total || 0),
      product_count: productCount,
      user_count: userCount,
    };
  }
}
