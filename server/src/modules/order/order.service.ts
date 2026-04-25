import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { ProductService } from '../product/product.service';
import { AddressService } from '../address/address.service';
import { CartService } from '../cart/cart.service';
import { PointsService } from '../points/points.service';
import { CouponService } from '../coupon/coupon.service';
import { UserCoupon } from '../coupon/coupon.entity';
import { USER_COUPON_STATUS } from '../coupon/coupon.constants';
import { CreateOrderDto } from './order.dto';

export const ORDER_PAY_STATUS = {
  UNPAID: 'unpaid',
  PAYING: 'paying',
  PAID: 'paid',
  FAILED: 'failed',
  CLOSED: 'closed',
  REFUNDING: 'refunding',
  REFUNDED: 'refunded',
} as const;

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(UserCoupon)
    private readonly userCouponRepository: Repository<UserCoupon>,
    private readonly productService: ProductService,
    private readonly addressService: AddressService,
    private readonly cartService: CartService,
    private readonly pointsService: PointsService,
    private readonly couponService: CouponService,
  ) {}

  /**
   * 创建订单
   */
  async create(dto: CreateOrderDto) {
    const { user_id, address_id, items, remark, coupon_id, points_amount, points_money, pay_channel, pay_scene } = dto;

    // 获取收货地址快照
    const address = await this.addressService.getById(address_id, user_id);
    if (!address) {
      throw new NotFoundException('收货地址不存在');
    }

    // 计算商品总价
    let totalAmount = 0;
    const orderItems: any[] = [];

    for (const item of items) {
      const product = await this.productService.getDetail(item.product_id);
      if (!product) {
        throw new NotFoundException(`商品[${item.product_id}]不存在`);
      }

      if (product.status === 0) {
        throw new BadRequestException(`商品[${product.title}]已下架`);
      }

      let price = product.price;
      let skuName = '';

      if (item.sku_id) {
        const sku = product.skus?.find((s: any) => s.id === item.sku_id);
        if (!sku) {
          throw new BadRequestException('SKU不存在');
        }
        price = sku.price;
        skuName = sku.sku_name;
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(`商品[${product.title}]库存不足`);
      }

      const subtotal = price * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        product_id: item.product_id,
        sku_id: item.sku_id || null,
        product_title: product.title,
        sku_name: skuName,
        cover_image: product.cover_image,
        price,
        quantity: item.quantity,
        subtotal,
      });

      // 扣减库存
      await this.productService.decrementStock(item.product_id, item.sku_id, item.quantity);
    }

    // 计算运费（满99免运费）
    const freightAmount = totalAmount >= 99 ? 0 : 10;

    // 如果使用了优惠券，验证并计算优惠
    let discountAmount = 0;
    let userCouponId = null;

    if (coupon_id) {
      const validation = await this.couponService.validateForOrder(
        user_id,
        coupon_id,
        totalAmount,
      );

      if (!validation.valid) {
        throw new BadRequestException(validation.error);
      }

      const discount = await this.couponService.applyToOrder(coupon_id, totalAmount);
      discountAmount = discount.discountAmount;

      // 获取用户优惠券 ID
      const userCoupon = await this.userCouponRepository.findOne({
        where: { user_id, coupon_id, status: USER_COUPON_STATUS.UNUSED },
      });
      userCouponId = userCoupon?.id;
    }

    // 计算实付金额
    const pointsMoney = points_money || 0;
    const payAmount = totalAmount + freightAmount - discountAmount - pointsMoney;

    // 生成订单号
    const orderNo = this.generateOrderNo();

    // 创建订单
    const order = this.orderRepository.create({
      order_no: orderNo,
      user_id,
      total_amount: totalAmount,
      freight_amount: freightAmount,
      coupon_amount: discountAmount,
      coupon_id: coupon_id || null,
      pay_amount: payAmount,
      status: 'pending',
      pay_status: ORDER_PAY_STATUS.UNPAID,
      pay_channel: pay_channel || null,
      pay_scene: pay_scene || null,
      address_snapshot: {
        name: address.name,
        phone: address.phone,
        province: address.province,
        city: address.city,
        district: address.district,
        detail_address: address.detail_address,
      },
      remark,
    });

    const savedOrder = await this.orderRepository.save(order);

    // 标记优惠券已使用
    if (userCouponId) {
      await this.couponService.markAsUsed(userCouponId, savedOrder.id);
    }

    // 处理积分抵扣
    if (points_amount && points_amount > 0) {
      try {
        await this.pointsService.deductPoints(user_id, points_amount, savedOrder.id);
        savedOrder.points_amount = points_amount;
        savedOrder.points_money = pointsMoney;
        await this.orderRepository.save(savedOrder);
      } catch (e) {
        throw new BadRequestException('积分扣减失败：' + e.message);
      }
    }

    // 创建订单明细
    for (const item of orderItems) {
      const orderItem = this.orderItemRepository.create({
        ...item,
        order_id: savedOrder.id,
      });
      await this.orderItemRepository.save(orderItem);
    }

    // 删除购物车中已购买的商品
    for (const item of items) {
      if (item.cart_id) {
        await this.cartService.remove(item.cart_id);
      }
    }

    return {
      id: savedOrder.id,
      order_no: orderNo,
      pay_amount: payAmount,
      pay_status: savedOrder.pay_status,
    };
  }

  async getById(id: number) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }
    return order;
  }

  async markPaying(orderId: number, params: { pay_channel: string; pay_scene: string; out_trade_no: string }) {
    const order = await this.getById(orderId);
    if (!['pending'].includes(order.status)) {
      throw new BadRequestException('当前订单状态不允许发起支付');
    }
    if (order.pay_status === ORDER_PAY_STATUS.PAID) {
      return order;
    }

    order.pay_channel = params.pay_channel;
    order.pay_scene = params.pay_scene;
    order.out_trade_no = params.out_trade_no;
    order.pay_status = ORDER_PAY_STATUS.PAYING;
    return this.orderRepository.save(order);
  }

  async markPaid(orderId: number, params: { third_trade_no?: string; notify_payload?: string; notify_at?: Date }) {
    const order = await this.getById(orderId);
    if (order.pay_status === ORDER_PAY_STATUS.PAID && order.status === 'paid') {
      return order;
    }
    if (order.status !== 'pending') {
      throw new BadRequestException('当前订单状态不允许标记支付成功');
    }

    const now = new Date();
    order.status = 'paid';
    order.pay_status = ORDER_PAY_STATUS.PAID;
    order.pay_time = now;
    order.paid_at = now;
    order.third_trade_no = params.third_trade_no || order.third_trade_no;
    order.notify_payload = params.notify_payload || order.notify_payload;
    order.notify_at = params.notify_at || now;
    order.pay_fail_reason = null;
    return this.orderRepository.save(order);
  }

  async markPayFailed(orderId: number, reason: string, notifyPayload?: string) {
    const order = await this.getById(orderId);
    if (order.pay_status === ORDER_PAY_STATUS.PAID) {
      return order;
    }
    order.pay_status = ORDER_PAY_STATUS.FAILED;
    order.pay_fail_reason = reason || '支付失败';
    order.notify_payload = notifyPayload || order.notify_payload;
    order.notify_at = new Date();
    return this.orderRepository.save(order);
  }

  async markClosed(orderId: number, reason?: string) {
    const order = await this.getById(orderId);
    if (order.pay_status === ORDER_PAY_STATUS.PAID) {
      throw new BadRequestException('已支付订单不可关闭');
    }
    if (order.status === 'cancelled' && order.pay_status === ORDER_PAY_STATUS.CLOSED) {
      return order;
    }
    order.status = 'cancelled';
    order.cancel_time = new Date();
    order.cancel_reason = reason || order.cancel_reason || '支付关闭';
    order.pay_status = ORDER_PAY_STATUS.CLOSED;
    return this.orderRepository.save(order);
  }

  async markRefunded(orderId: number) {
    const order = await this.getById(orderId);
    order.status = 'refunded';
    order.pay_status = ORDER_PAY_STATUS.REFUNDED;
    return this.orderRepository.save(order);
  }

  /**
   * 订单列表
   */
  async getList(query: { user_id: number; status?: string; page?: number; pageSize?: number }) {
    const { user_id, status, page = 1, pageSize = 10 } = query;

    const qb = this.orderRepository
      .createQueryBuilder('order')
      .where('order.user_id = :user_id', { user_id });

    if (status) {
      qb.andWhere('order.status = :status', { status });
    }

    const total = await qb.getCount();
    const list = await qb
      .orderBy('order.created_at', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    // 获取订单明细
    for (const order of list) {
      order.items = await this.orderItemRepository.find({
        where: { order_id: order.id },
      });
    }

    return {
      list,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * 订单详情
   */
  async getDetail(id: number) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    order.items = await this.orderItemRepository.find({
      where: { order_id: id },
    });

    return order;
  }

  /**
   * 取消订单
   */
  async cancel(id: number, reason: string) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (!['pending'].includes(order.status)) {
      throw new BadRequestException('当前状态不允许取消');
    }

    order.status = 'cancelled';
    order.cancel_time = new Date();
    order.cancel_reason = reason || '用户取消';
    order.pay_status = ORDER_PAY_STATUS.CLOSED;

    await this.orderRepository.save(order);

    // 恢复库存
    const items = await this.orderItemRepository.find({ where: { order_id: id } });
    for (const item of items) {
      await this.productService.incrementStock(item.product_id, item.sku_id, item.quantity);
    }

    // 返还积分（如果使用了积分抵扣）
    if (order.points_amount && order.points_amount > 0) {
      await this.pointsService.addPoints(
        order.user_id,
        order.points_amount,
        order.id,
        `订单取消返还积分`,
      );
    }

    return { success: true };
  }

  /**
   * 确认收货
   */
  async confirm(id: number) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== 'shipped') {
      throw new BadRequestException('当前状态不允许确认收货');
    }

    order.status = 'completed';
    order.complete_time = new Date();

    await this.orderRepository.save(order);

    // 返积分
    const points = this.pointsService.calculateOrderPoints(order.pay_amount);
    await this.pointsService.addPoints(
      order.user_id,
      points,
      order.id,
      `订单 ${order.order_no} 完成返积分`,
    );

    return { success: true };
  }

  /**
   * 获取订单数量统计
   */
  async getCount(userId: number) {
    const pendingCount = await this.orderRepository.count({ where: { user_id: userId, status: 'pending' } });
    const paidCount = await this.orderRepository.count({ where: { user_id: userId, status: 'paid' } });
    const shippedCount = await this.orderRepository.count({ where: { user_id: userId, status: 'shipped' } });
    const completedCount = await this.orderRepository.count({ where: { user_id: userId, status: 'completed' } });

    return {
      pending: pendingCount,
      paid: paidCount,
      shipped: shippedCount,
      completed: completedCount,
    };
  }

  // ==================== 管理端接口 ====================

  /**
   * 管理端订单列表
   */
  async getAdminList(query: { status?: string; pay_status?: string; order_no?: string; page?: number; pageSize?: number }) {
    const { status, pay_status, order_no, page = 1, pageSize = 10 } = query;

    const qb = this.orderRepository.createQueryBuilder('order');

    if (status) {
      qb.andWhere('order.status = :status', { status });
    }
    if (pay_status) {
      qb.andWhere('order.pay_status = :pay_status', { pay_status });
    }
    if (order_no) {
      qb.andWhere('order.order_no LIKE :order_no', { order_no: `%${order_no}%` });
    }

    const total = await qb.getCount();
    const list = await qb
      .orderBy('order.created_at', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    for (const order of list) {
      order.items = await this.orderItemRepository.find({
        where: { order_id: order.id },
      });
    }

    return {
      list,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  /**
   * 管理端发货
   */
  async ship(id: number, dto: { express_company: string; express_no: string }) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== 'paid') {
      throw new BadRequestException('当前状态不允许发货');
    }

    order.status = 'shipped';
    order.ship_time = new Date();
    order.express_company = dto.express_company;
    order.express_no = dto.express_no;

    await this.orderRepository.save(order);
    return { success: true };
  }

  /**
   * 管理端退款
   */
  async refund(id: number) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (!['paid', 'shipped'].includes(order.status)) {
      throw new BadRequestException('当前状态不允许退款');
    }

    await this.markRefunded(order.id);

    // 恢复库存
    const items = await this.orderItemRepository.find({ where: { order_id: id } });
    for (const item of items) {
      await this.productService.incrementStock(item.product_id, item.sku_id, item.quantity);
    }

    // 返还积分（如果使用了积分抵扣）
    if (order.points_amount && order.points_amount > 0) {
      await this.pointsService.addPoints(
        order.user_id,
        order.points_amount,
        order.id,
        `订单退款返还积分`,
      );
    }

    return { success: true };
  }

  /**
   * 生成订单号
   */
  private generateOrderNo(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `COS${year}${month}${day}${random}`;
  }
}
