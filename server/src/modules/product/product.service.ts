import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { ProductSku } from './product-sku.entity';
import { ProductListDto, CreateProductDto, UpdateProductDto } from './product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductSku)
    private readonly skuRepository: Repository<ProductSku>,
  ) {}

  /**
   * 商品列表
   */
  async getList(query: ProductListDto) {
    const { page = 1, pageSize = 10, category_id, keyword, status, sort = 'sort_order', order = 'desc', min_price, max_price, is_new, is_hot, is_recommend, in_stock } = query;

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    // status 不传则默认返回已上架商品，传值则按状态筛选
    if (status !== undefined && status !== null) {
      qb.andWhere('product.status = :status', { status: +status });
    } else {
      qb.andWhere('product.status = :status', { status: 1 });
    }

    if (category_id) {
      const ids = category_id.split(',').map(id => +id.trim()).filter(id => !isNaN(id));
      if (ids.length > 0) {
        qb.andWhere('product.category_id IN (:...ids)', { ids });
      }
    }

    if (keyword) {
      qb.andWhere('(product.title LIKE :keyword OR product.subtitle LIKE :keyword)', {
        keyword: `%${keyword}%`,
      });
    }

    if (min_price !== undefined) {
      qb.andWhere('product.price >= :min_price', { min_price });
    }

    if (max_price !== undefined) {
      qb.andWhere('product.price <= :max_price', { max_price });
    }

    if (is_new) {
      qb.andWhere('product.is_new = :is_new', { is_new: 1 });
    }

    if (is_hot) {
      qb.andWhere('product.is_hot = :is_hot', { is_hot: 1 });
    }

    if (is_recommend) {
      qb.andWhere('product.is_recommend = :is_recommend', { is_recommend: 1 });
    }

    // 只显示有库存的商品
    if (in_stock) {
      qb.andWhere('product.stock > :stock', { stock: 0 });
    }

    // 排序
    const orderMap: Record<string, string> = {
      sort_order: 'product.sort_order',
      price: 'product.price',
      sales_count: 'product.sales_count',
      created_at: 'product.created_at',
    };
    qb.orderBy(orderMap[sort] || 'product.sort_order', order.toUpperCase() as 'ASC' | 'DESC');

    // 分页
    const total = await qb.getCount();
    const list = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    // 获取 SKU
    for (const product of list) {
      product.skus = await this.skuRepository.find({
        where: { product_id: product.id, status: 1 },
      });
      // 解析 JSON 字段
      if (product.images) {
        try { product.images = JSON.parse(product.images as string); } catch { product.images = [] as any; }
      }
    }

    return {
      list,
      pagination: {
        page: +page,
        pageSize: +pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * 推荐商品
   */
  async getRecommend({ page, pageSize }) {
    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.status = :status', { status: 1 })
      .andWhere('product.is_recommend = :is_recommend', { is_recommend: 1 })
      .orderBy('product.sort_order', 'DESC');

    const total = await qb.getCount();
    const list = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return {
      list,
      pagination: { page, pageSize, total },
    };
  }

  /**
   * 主推商品（最新/最热的一款）
   */
  async getFeatured() {
    const product = await this.productRepository.findOne({
      where: { status: 1, is_recommend: 1 },
      order: { sort_order: 'DESC', created_at: 'DESC' },
      relations: ['category'],
    });

    if (product) {
      product.skus = await this.skuRepository.find({
        where: { product_id: product.id, status: 1 },
      });
      if (product.images) {
        try { product.images = JSON.parse(product.images as string); } catch { product.images = [] as any; }
      }
    }

    return product;
  }

  /**
   * 热卖商品
   */
  async getHot(limit: number = 10) {
    return this.productRepository.find({
      where: { status: 1, is_hot: 1 },
      order: { sales_count: 'DESC' },
      take: limit,
    });
  }

  /**
   * 商品详情
   */
  async getDetail(id: number) {
    const product = await this.productRepository.findOne({
      where: { id, status: 1 },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    // 增加浏览量
    await this.productRepository.increment({ id }, 'view_count', 1);

    // 获取 SKU
    product.skus = await this.skuRepository.find({
      where: { product_id: id, status: 1 },
    });
    if (product.images) {
      try { product.images = JSON.parse(product.images as string); } catch { product.images = [] as any; }
    }

    return product;
  }

  /**
   * 创建商品
   */
  async create(dto: CreateProductDto) {
    const product = this.productRepository.create({
      category_id: dto.category_id,
      title: dto.title,
      subtitle: dto.subtitle,
      cover_image: dto.cover_image,
      images: dto.images,
      detail_html: dto.detail_html,
      price: dto.price,
      original_price: dto.original_price,
      stock: dto.stock,
      is_recommend: dto.is_recommend || 0,
      is_hot: dto.is_hot || 0,
      is_new: dto.is_new || 0,
      status: dto.status ?? 1,
      sort_order: dto.sort_order || 0,
    });

    // 序列化 JSON 字段
    if (product.images && Array.isArray(product.images)) {
      product.images = JSON.stringify(product.images);
    }

    const result = await this.productRepository.save(product);

    // 创建 SKU
    if (dto.skus && dto.skus.length > 0) {
      for (const sku of dto.skus) {
        await this.skuRepository.save(
          this.skuRepository.create({
            product_id: result.id,
            sku_name: sku.sku_name,
            sku_attrs: typeof sku.sku_attrs === 'object' ? JSON.stringify(sku.sku_attrs) : sku.sku_attrs,
            price: sku.price,
            stock: sku.stock,
            image: sku.image,
          }),
        );
      }
    }

    return result;
  }

  /**
   * 更新商品
   */
  async update(id: number, dto: UpdateProductDto) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    Object.assign(product, dto);

    // 序列化 JSON 字段
    if (product.images && Array.isArray(product.images)) {
      product.images = JSON.stringify(product.images);
    }

    await this.productRepository.save(product);

    return { success: true };
  }

  /**
   * 删除商品
   */
  async delete(id: number) {
    await this.productRepository.delete(id);
    await this.skuRepository.delete({ product_id: id });
    return { success: true };
  }

  /**
   * 更新上下架状态
   */
  async updateStatus(id: number, status: number) {
    await this.productRepository.update(id, { status });
    return { success: true };
  }

  /**
   * 扣减库存
   */
  async decrementStock(productId: number, skuId: number | undefined, quantity: number) {
    if (skuId) {
      await this.skuRepository.decrement({ id: skuId }, 'stock', quantity);
    } else {
      await this.productRepository.decrement({ id: productId }, 'stock', quantity);
    }
  }

  /**
   * 增加库存
   */
  async incrementStock(productId: number, skuId: number | undefined, quantity: number) {
    if (skuId) {
      await this.skuRepository.increment({ id: skuId }, 'stock', quantity);
    } else {
      await this.productRepository.increment({ id: productId }, 'stock', quantity);
    }
  }

  /**
   * 批量更新状态
   */
  async batchUpdateStatus(ids: number[], status: number) {
    await this.productRepository.update(ids, { status });
    return { success: true };
  }
}

