## 1. Backend Changes

- [x] 1.1 Modify `CartService.getList` to return `product.status` field for invalid item detection (stock=0 OR status=0 → invalid)
- [x] 1.2 Add `GET /cart/shipping-config` endpoint to return free shipping threshold from dict table
- [x] 1.3 ~~Fix `CartService.updateChecked`~~ - 后端 `updateChecked` 已支持 0/1 值，无需修改 (BUG 在前端硬编码 checked=1)

## 2. Frontend - Cart Store Enhancement

- [x] 2.1 Add `invalidItems` getter to `cart.js` (items where stock = 0 or status = 0)
- [x] 2.2 Add `shippingThreshold` and `shippingGap` getters to calculate free shipping progress
- [x] 2.3 Add `clearInvalidItems()` action to batch delete invalid items
- [x] 2.4 Fix `syncCartCheck` to send correct `checked` value (0 or 1) instead of hardcoded 1, so deselect operations are properly synced to backend
- [x] 2.5 Add `syncAllChecked()` action to sync full checked state when toggling select-all (pass all item IDs with their current checked status)

## 3. Frontend - Cart Page Improvements

- [x] 3.1 Display invalid item state: "已下架"/"缺货" badge and dimmed styling
- [x] 3.2 Add "清理失效商品" button in tip bar, visible when invalid items exist
- [x] 3.3 Implement SKU selection popup (tap SKU row → show available SKUs → update on confirm) - implemented as navigate to product detail page
- [x] 3.4 Add shipping progress indicator in footer (动态显示还需/已满免运费)
- [x] 3.5 Block checkout when any checked item is invalid - show dialog listing invalid items and prompt to remove them before proceeding
- [x] 3.6 Add "从收藏夹添加" button in empty cart state
