## Why

当前购物车功能已具备基础增删改查能力，但在用户体验方面仍有不足：无法实时感知库存变化、下架商品缺少提示、SKU选择不够灵活、运费计算无进度展示。这些问题影响转化率，需要完善。

## What Changes

1. **购物车库存实时校验** - 商品页面加入购物车时检查库存，购物车页面加载时校验库存不足商品并提示
2. **下架/失效商品标记** - 商品下架或库存为0时，在购物车中显示不可购买状态，禁止结算
3. **SKU弹层选择优化** - 在购物车商品行内可直接切换SKU规格
4. **运费进度提示** - 结算栏实时显示离免运费还差多少
5. **商品失效一键清理** - 提供"清理失效商品"功能按钮
6. **从收藏夹移入购物车** - 支持将收藏商品快速加入购物车

## Capabilities

### New Capabilities
- `cart-stock-validation`: 购物车库存实时校验，下架/缺货商品标记与提示
- `cart-sku-switch`: 购物车内直接切换SKU规格
- `cart-shipping-progress`: 运费进度实时计算与展示
- `cart-invalid-item-cleanup`: 失效商品一键清理

### Modified Capabilities
- (none - 现有能力无规格层面的变化)

## Impact

- **Backend**: `CartService` 新增库存校验逻辑
- **Frontend**: 购物车页面增加库存状态显示、运费进度条、SKU切换、失效清理
- **Store**: `cart.js` 状态增加 `invalidItems` 数组
