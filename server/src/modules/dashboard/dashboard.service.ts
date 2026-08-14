import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order } from '../order/order.entity';
import { OrderItem } from '../order/order-item.entity';
import { Product } from '../product/product.entity';
import { User } from '../user/user.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
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

    // 今日新增用户
    const todayNewUsers = await this.userRepository.count({
      where: { created_at: Between(today, tomorrow) },
    });

    // 库存预警 (库存 < 10)
    const lowStockCount = await this.productRepository
      .createQueryBuilder('p')
      .where('p.status = :status', { status: 1 })
      .andWhere('p.stock < :stock', { stock: 10 })
      .getCount();

    // 待发货订单
    const pendingOrders = await this.orderRepository.count({
      where: { status: 'paid' as any },
    });

    return {
      today_orders: todayOrders,
      today_sales: parseFloat(todaySales?.total || 0),
      product_count: productCount,
      user_count: userCount,
      today_new_users: todayNewUsers,
      low_stock_count: lowStockCount,
      pending_orders: pendingOrders,
    };
  }

  /**
   * 获取销售趋势（近 N 天）
   */
  async getSalesTrend(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 1);
    endDate.setHours(0, 0, 0, 0);

    const rows = await this.orderRepository
      .createQueryBuilder('o')
      .select("DATE(o.created_at)", 'date')
      .addSelect('COUNT(o.id)', 'orders')
      .addSelect('COALESCE(SUM(o.pay_amount), 0)', 'sales')
      .where('o.created_at >= :startDate', { startDate })
      .andWhere('o.created_at < :endDate', { endDate })
      .andWhere('o.status != :status', { status: 'cancelled' })
      .groupBy("DATE(o.created_at)")
      .orderBy("DATE(o.created_at)", 'ASC')
      .getRawMany();

    const dataMap = new Map<string, { orders: number; sales: number }>();
    for (const row of rows) {
      const dateStr = typeof row.date === 'string' ? row.date.slice(0, 10) : '';
      dataMap.set(dateStr, {
        orders: parseInt(row.orders) || 0,
        sales: parseFloat(row.sales) || 0,
      });
    }

    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);
      const data = dataMap.get(dateStr);
      result.push({
        date: dateStr,
        orders: data?.orders || 0,
        sales: data?.sales || 0,
      });
    }
    return result;
  }

  /**
   * 获取商品销售排行 TOP N
   */
  async getProductRanking(limit: number = 5) {
    const rows = await this.orderItemRepository
      .createQueryBuilder('oi')
      .select('oi.product_title', 'name')
      .addSelect('SUM(oi.quantity)', 'sales')
      .addSelect('SUM(oi.subtotal)', 'amount')
      .groupBy('oi.product_id')
      .addGroupBy('oi.product_title')
      .orderBy('SUM(oi.quantity)', 'DESC')
      .limit(limit)
      .getRawMany();

    return rows.map(r => ({
      name: r.name,
      sales: parseInt(r.sales) || 0,
      amount: parseFloat(r.amount) || 0,
    }));
  }

  /**
   * 获取最新订单
   */
  async getLatestOrders(limit: number = 5) {
    const orders = await this.orderRepository
      .createQueryBuilder('o')
      .leftJoin('user', 'u', 'u.id = o.user_id')
      .select(['o.id', 'o.order_no', 'o.pay_amount', 'o.status', 'o.created_at'])
      .addSelect('u.nickname', 'user_nickname')
      .addSelect('u.phone', 'user_phone')
      .orderBy('o.created_at', 'DESC')
      .limit(limit)
      .getRawMany();

    return orders.map(o => ({
      id: o.o_id,
      order_no: o.o_order_no,
      user: o.user_nickname || o.user_phone || null,
      amount: o.o_pay_amount,
      status: o.o_status,
      created_at: o.o_created_at,
    }));
  }

}