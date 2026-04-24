import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from '../product/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * 获取购物车列表
   */
  async getList(userId: number | null, deviceId: string | null) {
    const where: any = {};
    if (userId) {
      where.user_id = userId;
    } else if (deviceId) {
      where.device_id = deviceId;
    } else {
      return [];
    }

    const carts = await this.cartRepository.find({
      where,
      relations: ['product', 'sku'],
      order: { created_at: 'DESC' },
    });

    return carts.map((cart) => ({
      id: cart.id,
      product_id: cart.product_id,
      sku_id: cart.sku_id,
      title: cart.product?.title,
      cover_image: cart.product?.cover_image,
      price: cart.sku?.price || cart.product?.price,
      stock: cart.sku?.stock || cart.product?.stock,
      sku_name: cart.sku?.sku_name,
      quantity: cart.quantity,
      is_checked: cart.is_checked,
    }));
  }

  /**
   * 加入购物车
   */
  async add(dto: { user_id?: number | null; device_id?: string | null; product_id: number; sku_id?: number; quantity?: number }) {
    const { user_id, device_id, product_id, sku_id, quantity = 1 } = dto;

    if (!user_id && !device_id) {
      throw new BadRequestException('无法识别用户身份');
    }

    // 检查商品是否存在
    const product = await this.productRepository.findOne({
      where: { id: product_id },
      relations: ['skus'],
    });
    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    if (product.status === 0) {
      throw new BadRequestException('商品已下架');
    }

    // 检查库存
    let price = product.price;
    let stock = product.stock;

    if (sku_id) {
      const sku = product.skus?.find((s: any) => s.id === sku_id);
      if (!sku) {
        throw new BadRequestException('SKU不存在');
      }
      price = sku.price;
      stock = sku.stock;
    }

    if (stock < quantity) {
      throw new BadRequestException('库存不足');
    }

    // 检查是否已存在（同一用户/设备 + 同一商品 + 同一规格）
    const qb = this.cartRepository.createQueryBuilder('cart')
      .where('cart.product_id = :product_id', { product_id })
      .andWhere(sku_id ? 'cart.sku_id = :sku_id' : 'cart.sku_id IS NULL', { sku_id: sku_id || undefined });

    if (user_id) {
      qb.andWhere('cart.user_id = :user_id', { user_id });
    } else {
      qb.andWhere('cart.device_id = :device_id', { device_id });
    }

    const existCart = await qb.getOne();

    if (existCart) {
      // 更新数量
      const newQuantity = existCart.quantity + quantity;
      if (newQuantity > stock) {
        throw new BadRequestException('库存不足');
      }
      existCart.quantity = newQuantity;
      await this.cartRepository.save(existCart);
      return { id: existCart.id, quantity: newQuantity };
    }

    // 新增
    const cart = this.cartRepository.create({
      user_id: user_id || null,
      device_id: device_id || null,
      product_id,
      sku_id: sku_id || null,
      quantity,
      is_checked: 1,
    });
    const result = await this.cartRepository.save(cart);
    return { id: result.id, quantity };
  }

  /**
   * 更新购物车数量
   */
  async update(id: number, dto: { quantity?: number }) {
    const cart = await this.cartRepository.findOne({
      where: { id },
      relations: ['product', 'sku'],
    });

    if (!cart) {
      throw new NotFoundException('购物车商品不存在');
    }

    if (dto.quantity !== undefined) {
      if (dto.quantity === 0) {
        await this.cartRepository.delete(id);
        return { success: true };
      }

      const stock = cart.sku?.stock || cart.product?.stock;
      if (dto.quantity > stock) {
        throw new BadRequestException('库存不足');
      }
      cart.quantity = dto.quantity;
    }

    await this.cartRepository.save(cart);
    return { success: true };
  }

  /**
   * 删除购物车商品
   */
  async remove(id: number) {
    await this.cartRepository.delete(id);
    return { success: true };
  }

  /**
   * 批量删除
   */
  async batchRemove(ids: number[]) {
    await this.cartRepository.delete(ids);
    return { success: true };
  }

  /**
   * 更新选中状态
   */
  async updateChecked(ids: number[], checked: number, userId: number | null, deviceId: string | null) {
    if (ids && ids.length > 0) {
      const where: any = { id: ids.map(id => +id) };
      if (userId) {
        where.user_id = userId;
      } else if (deviceId) {
        where.device_id = deviceId;
      }
      await this.cartRepository
        .createQueryBuilder()
        .update(Cart)
        .set({ is_checked: checked })
        .whereInIds(ids)
        .execute();
    }
    return { success: true };
  }

  /**
   * 猜你喜欢 - 根据购物车分类推荐 或 热销商品
   */
  async getRecommend(userId: number | null, deviceId: string | null, limit: number = 50) {
    // 获取购物车商品的一级分类ID列表
    const qb = this.cartRepository.createQueryBuilder('cart')
      .leftJoinAndSelect('cart.product', 'product')
      .leftJoinAndSelect('product.category', 'category');

    if (userId) {
      qb.where('cart.user_id = :userId', { userId });
    } else if (deviceId) {
      qb.where('cart.device_id = :deviceId', { deviceId });
    } else {
      return this.getHotProducts(limit);
    }

    const carts = await qb.getMany();

    if (carts.length === 0) {
      return this.getHotProducts(limit);
    }

    // 获取购物车商品的一级分类ID
    const categoryIds = [...new Set(
      carts
        .map(cart => cart.product?.category?.parent_id || cart.product?.category_id)
        .filter(id => id)
    )];

    // 排除购物车中已有的商品
    const cartProductIds = carts.map(c => c.product_id);

    const productQb = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.status = :status', { status: 1 })
      .andWhere('product.id NOT IN (:...cartProductIds)', { cartProductIds });

    if (categoryIds.length > 0) {
      productQb.andWhere('(product.category_id IN (:...categoryIds) OR product.category_id IN (SELECT id FROM category WHERE parent_id IN (:...categoryIds)))',
        { categoryIds });
    }

    productQb.orderBy('product.sales_count', 'DESC').take(limit);

    const products = await productQb.getMany();

    // 解析 images
    for (const product of products) {
      if (product.images) {
        try { product.images = JSON.parse(product.images as string); } catch { product.images = []; }
      }
    }

    return products;
  }

  /**
   * 获取热销商品
   */
  private async getHotProducts(limit: number = 50) {
    const products = await this.productRepository.find({
      where: { status: 1 },
      order: { sales_count: 'DESC' },
      take: limit,
      relations: ['category'],
    });

    for (const product of products) {
      if (product.images) {
        try { product.images = JSON.parse(product.images as string); } catch { product.images = []; }
      }
    }

    return products;
  }
}
