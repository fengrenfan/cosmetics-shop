## Context

现有购物车具备基础增删改查，但存在以下体验问题：

1. **库存不感知** - 用户加入购物车时未校验库存，结算时才发现缺货
2. **失效商品无处理** - 商品下架或库存为0时仍出现在购物车，用户无法识别
3. **SKU切换不便** - 要切换规格需要进入商品详情页操作
4. **运费信息缺失** - 免运费进度仅靠静态文案提示，无法动态反馈

## Goals / Non-Goals

**Goals:**
- 购物车加载时校验库存不足商品并标记
- 下架商品标记为不可购买状态
- 购物车内可直接切换SKU规格
- 结算栏展示免运费进度
- 提供失效商品一键清理入口

**Non-Goals:**
- 不改变购物流程基本架构
- 不新增独立模块，纯属增强
- 不修改后端数据模型（利用现有字段）

## Decisions

### 1. 库存校验方案

**方案A**: 每次加载购物车时调用批量库存校验API
**方案B**: 在现有 `getList` 接口中直接返回 stock 字段，前端自行判断

选择 **方案B**。理由：`getList` 已返回 `stock`，前端可基于 `stock === 0` 或 `status === 0` 判断。

但需要后端 `getList` 返回 `product.status` 以便前端判断是否下架。

### 2. 失效商品清理

在 `CartService.getList` 中增加 `product.status` 和 `product.stock` 字段返回。

前端增加 `is_invalid` 计算属性：`stock === 0 || status === 0`。

提供"清理失效商品"按钮，点击调用 `DELETE /cart/batch` 删除所有失效商品。

### 3. SKU切换

复用现有 `PUT /cart/:id` 接口（已支持 sku_id 更新）。

前端在购物车行内增加"规格"点击区域，点击弹出 SKU 选择弹层，选中后调用更新接口。

### 4. 运费进度

从系统配置（dict 或 settings）中读取 `free_shipping_threshold`（默认 99）。

前端结算栏显示：`还需 ¥XX 免运费` 或 `已满 ¥XX，免运费`。

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| 库存校验增加加载延迟 | 仅在购物车页面 onShow 时校验，不做实时轮询 |
| SKU 弹层与现有 UI 风格差异 | 使用现有项目中的 `uni.showModal` 或自定义 popup 组件 |
| 失效商品状态变更后未刷新 | 页面 onShow 时重新加载购物车列表 |
| **checked 状态同步 BUG** - `syncCartCheck` 硬编码 `checked=1`，导致取消选中无法同步到后端；全选/取消全选不同步后端 | 前端传正确的 `checked` 值（0或1），`toggleAllChecked` 时同步全部状态；后端 `updateChecked` 本身已支持 0/1 值，无需修改 |

**checked 同步数据流（修复后）：**

```
前端: toggleAllChecked(false)
  → 遍历所有 item，设置 local is_checked = false
  → 调用 syncAllChecked(items) 发送:
      { ids: [A.id, B.id, C.id], checked: 0 }

后端: UPDATE cart SET is_checked = 0 WHERE id IN (A, B, C)
```
