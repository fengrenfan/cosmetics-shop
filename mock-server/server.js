import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware
app.use(cors({ origin: '*', allowedHeaders: '*' }));
app.use(express.json());

// ── 验证 Token 中间件 ──
function authMiddleware(req, res, next) {
  const auth = req.headers['authorization'];
  if (auth && auth.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(auth.slice(7), JWT_SECRET);
    } catch (e) {
      req.user = null;
    }
  }
  next();
}
app.use(authMiddleware);

// ── 工具函数 ──
const db = {
  users: [{ id: 1, phone: '13800138000', nickname: '测试用户', password_hash: '123456', avatar: '', is_plus: false, points: 280, balance: '0.00', coupon_count: 3 }],
  products: [
    { id: 1, title: '水感保湿精华液 30ml', subtitle: '深层补水 持久滋润', price: 299, cover_image: 'https://picsum.photos/400/400?random=1', stock: 100, sales_count: 856, rating: '4.9', tag: '热销', status: 1, category_id: 1 },
    { id: 2, title: '柔雾持妆气垫霜', subtitle: '遮瑕持久 清透自然', price: 199, cover_image: 'https://picsum.photos/400/400?random=2', stock: 80, sales_count: 623, rating: '4.8', tag: '新品', status: 1, category_id: 2 },
    { id: 3, title: '丝绒雾面哑光口红', subtitle: '丝滑质地 持久不脱色', price: 89, cover_image: 'https://picsum.photos/400/400?random=3', stock: 200, sales_count: 1205, rating: '4.7', tag: '', status: 1, category_id: 3 },
    { id: 4, title: '温和净透洁面乳 100g', subtitle: '氨基酸配方 温和清洁', price: 128, cover_image: 'https://picsum.photos/400/400?random=4', stock: 150, sales_count: 432, rating: '4.8', tag: '', status: 1, category_id: 1 },
    { id: 5, title: '玻尿酸密集补水面膜 5片装', subtitle: '医研级玻尿酸 深层补水', price: 69, cover_image: 'https://picsum.photos/400/400?random=5', stock: 300, sales_count: 2341, rating: '4.6', tag: '特惠', status: 1, category_id: 1 },
    { id: 6, title: '紧致焕亮眼霜 15g', subtitle: '淡化细纹 黑眼圈', price: 359, cover_image: 'https://picsum.photos/400/400?random=6', stock: 60, sales_count: 287, rating: '4.9', tag: '推荐', status: 1, category_id: 2 },
    { id: 7, title: '清透防晒隔离乳 SPF50+', subtitle: '轻薄不闷痘 高倍防晒', price: 159, cover_image: 'https://picsum.photos/400/400?random=7', stock: 120, sales_count: 568, rating: '4.7', tag: '', status: 1, category_id: 1 },
    { id: 8, title: '丝缎光泽妆前乳', subtitle: '隐形毛孔 持妆服帖', price: 149, cover_image: 'https://picsum.photos/400/400?random=8', stock: 90, sales_count: 341, rating: '4.8', tag: '', status: 1, category_id: 2 },
    { id: 9, title: '沁润焕亮素颜霜', subtitle: '一抹提亮 养肤遮瑕', price: 119, cover_image: 'https://picsum.photos/400/400?random=9', stock: 110, sales_count: 719, rating: '4.5', tag: '', status: 1, category_id: 3 },
    { id: 10, title: '柔焦定妆散粉 8g', subtitle: '细腻控油 柔焦磨皮', price: 98, cover_image: 'https://picsum.photos/400/400?random=10', stock: 180, sales_count: 892, rating: '4.7', tag: '爆款', status: 1, category_id: 2 },
  ],
  categories: [
    { id: 1, name: '护肤', icon: 'icon-leaf', banner: 'https://picsum.photos/800/300?random=c1', children: [
      { id: 11, name: '精华', icon: 'https://picsum.photos/100/100?random=s1' },
      { id: 12, name: '面霜', icon: 'https://picsum.photos/100/100?random=s2' },
      { id: 13, name: '面膜', icon: 'https://picsum.photos/100/100?random=s3' },
      { id: 14, name: '洁面', icon: 'https://picsum.photos/100/100?random=s4' },
    ]},
    { id: 2, name: '彩妆', icon: 'icon-palette', banner: 'https://picsum.photos/800/300?random=c2', children: [
      { id: 21, name: '底妆', icon: 'https://picsum.photos/100/100?random=s5' },
      { id: 22, name: '口红', icon: 'https://picsum.photos/100/100?random=s6' },
      { id: 23, name: '眼影', icon: 'https://picsum.photos/100/100?random=s7' },
    ]},
    { id: 3, name: '香水', icon: 'icon-flower', banner: 'https://picsum.photos/800/300?random=c3', children: [
      { id: 31, name: '淡香水', icon: 'https://picsum.photos/100/100?random=s8' },
      { id: 32, name: '浓香水', icon: 'https://picsum.photos/100/100?random=s9' },
    ]},
  ],
  banners: [
    { id: 1, title: '新品首发', image: 'https://picsum.photos/800/400?random=b1', link_type: 'url', link_id: '' },
    { id: 2, title: '限时特惠', image: 'https://picsum.photos/800/400?random=b2', link_type: 'product', link_id: '5' },
    { id: 3, title: '会员专享', image: 'https://picsum.photos/800/400?random=b3', link_type: 'url', link_id: '' },
  ],
  cart: [],
  orders: [],
  addresses: [
    { id: 1, user_id: 1, name: '张小美', phone: '13800138000', province: '上海市', city: '上海市', district: '浦东新区', detail_address: '世纪大道100号', is_default: 1 },
  ],
  coupons: [
    { id: 1, title: '新人专享券', value: 20, min_amount: 99, type: 'fixed', can_use: true },
    { id: 2, title: '满减券', value: 50, min_amount: 200, type: 'fixed', can_use: false },
  ],
  admins: [
    { id: 1, username: 'admin', password: '123456', nickname: '管理员', role: 'super_admin' },
  ],
  orders: [],
  quickEntries: [
    { id: 1, title: '每日签到', icon: 'icon-calendar', link_type: 'page', link_path: '/pages/sign/index', status: 1 },
    { id: 2, title: '邀请有礼', icon: 'icon-share', link_type: 'page', link_path: '/pages/invite/index', status: 1 },
    { id: 3, title: '优惠券', icon: 'icon-ticket', link_type: 'page', link_path: '/pages/coupon/index', status: 1 },
    { id: 4, title: '积分商城', icon: 'icon-star', link_type: 'page', link_path: '/pages/points/index', status: 1 },
    { id: 5, title: '我的收藏', icon: 'icon-heart', link_type: 'page', link_path: '/pages/favorite/index', status: 1 },
    { id: 6, title: '历史记录', icon: 'icon-clock', link_type: 'page', link_path: '/pages/history/index', status: 1 },
  ],
  productRecommend: [
    { id: 1, product_id: 1, position: 1, status: 1 },
    { id: 2, product_id: 6, position: 2, status: 1 },
    { id: 3, product_id: 10, position: 3, status: 1 },
  ],
  hotProducts: [
    { id: 1, product_id: 3, position: 1, status: 1 },
    { id: 2, product_id: 5, position: 2, status: 1 },
  ],
  dicts: [
    { id: 1, name: '商品状态', code: 'product_status', items: [
      { label: '上架', value: 1 },
      { label: '下架', value: 0 },
    ]},
    { id: 2, name: '订单状态', code: 'order_status', items: [
      { label: '待支付', value: 'pending' },
      { label: '已支付', value: 'paid' },
      { label: '已发货', value: 'shipped' },
      { label: '已完成', value: 'completed' },
      { label: '已取消', value: 'cancelled' },
    ]},
  ],
  banners: [
    { id: 1, title: '新品首发', image: 'https://picsum.photos/800/400?random=b1', link_type: 'url', link_id: '', status: 1, sort: 1 },
    { id: 2, title: '限时特惠', image: 'https://picsum.photos/800/400?random=b2', link_type: 'product', link_id: '5', status: 1, sort: 2 },
    { id: 3, title: '会员专享', image: 'https://picsum.photos/800/400?random=b3', link_type: 'url', link_id: '', status: 0, sort: 3 },
  ],
};

// ── 后台管理员登录 ──
app.post('/api/auth/admin-login', (req, res) => {
  const { username, password } = req.body;
  const admin = db.admins.find(a => a.username === username && a.password === password);
  if (!admin) return res.json({ code: 401, message: '用户名或密码错误' });
  const token = jwt.sign({ adminId: admin.id, username: admin.username, role: admin.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ code: 0, data: { token, admin: { id: admin.id, username: admin.username, nickname: admin.nickname, role: admin.role } } });
});

// ── 认证接口 ──
app.post('/api/auth/phone-login', (req, res) => {
  const { phone, code } = req.body;
  if (!phone || code !== '1234') {
    return res.json({ code: 401, message: '验证码错误' });
  }
  let user = db.users.find(u => u.phone === phone);
  if (!user) {
    user = { id: db.users.length + 1, phone, nickname: `用户${phone.slice(-4)}`, avatar: '', is_plus: false, points: 0, balance: '0.00', coupon_count: 0 };
    db.users.push(user);
  }
  const token = jwt.sign({ userId: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ code: 0, data: { token, user } });
});

app.post('/api/auth/send-code', (req, res) => {
  console.log(`[验证码] 手机号 ${req.body.phone} 的验证码为: 1234`);
  res.json({ code: 0, data: { success: true, message: '验证码已发送' } });
});

app.post('/api/auth/wx-login', (req, res) => {
  const user = db.users[0];
  const token = jwt.sign({ userId: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ code: 0, data: { token, user } });
});

app.get('/api/auth/profile', (req, res) => {
  const user = db.users[0];
  res.json({ code: 0, data: { id: user.id, nickname: user.nickname, avatar: user.avatar, phone: user.phone } });
});

// ── 商品接口 ──
app.get('/api/product/list', (req, res) => {
  const { page = 1, pageSize = 10, category_id } = req.query;
  let list = db.products;
  if (category_id) list = list.filter(p => p.category_id === parseInt(category_id));
  const start = (page - 1) * pageSize;
  res.json({ code: 0, data: { list: list.slice(start, start + +pageSize), total: list.length } });
});

app.get('/api/product/recommend', (req, res) => {
  res.json({ code: 0, data: { list: db.products.slice(0, 6) } });
});

app.get('/api/product/hot', (req, res) => {
  res.json({ code: 0, data: db.products.slice(0, 10) });
});

app.get('/api/product/featured', (req, res) => {
  res.json({ code: 0, data: db.products[0] });
});

app.get('/api/product/detail', (req, res) => {
  const p = db.products.find(p => p.id === parseInt(req.query.id));
  if (!p) return res.json({ code: 404, message: '商品不存在' });
  res.json({ code: 0, data: { ...p, skus: [{ id: 1, sku_name: '默认', price: p.price, stock: p.stock }] } });
});

// ── 分类接口 ──
app.get('/api/category/tree', (req, res) => {
  res.json({ code: 0, data: db.categories });
});

// ── Banner 管理接口（后台） ──
app.get('/api/banner/admin', (req, res) => {
  const { page = 1, pageSize = 10 } = req.query;
  const start = (page - 1) * pageSize;
  const list = db.banners.slice(start, start + +pageSize);
  res.json({ code: 0, data: { list, total: db.banners.length } });
});

app.post('/api/banner', (req, res) => {
  const banner = { id: Date.now(), ...req.body, status: 1, sort: req.body.sort || 0 };
  db.banners.push(banner);
  res.json({ code: 0, data: banner });
});

app.put('/api/banner/:id', (req, res) => {
  const idx = db.banners.findIndex(b => b.id === parseInt(req.params.id));
  if (idx === -1) return res.json({ code: 404, message: 'Banner不存在' });
  db.banners[idx] = { ...db.banners[idx], ...req.body };
  res.json({ code: 0, data: db.banners[idx] });
});

app.delete('/api/banner/:id', (req, res) => {
  db.banners = db.banners.filter(b => b.id !== parseInt(req.params.id));
  res.json({ code: 0, data: { success: true } });
});

// ── 分类管理接口 ──
app.get('/api/category', (req, res) => {
  const { name, page = 1, pageSize = 50 } = req.query;
  let list = db.categories;
  if (name) list = list.filter(c => c.name.includes(name));
  const start = (page - 1) * pageSize;
  res.json({ code: 0, data: { list: list.slice(start, start + +pageSize), total: list.length } });
});

app.post('/api/category', (req, res) => {
  const cat = { id: Date.now(), ...req.body, children: [] };
  db.categories.push(cat);
  res.json({ code: 0, data: cat });
});

app.put('/api/category/:id', (req, res) => {
  const idx = db.categories.findIndex(c => c.id === parseInt(req.params.id));
  if (idx === -1) return res.json({ code: 404, message: '分类不存在' });
  db.categories[idx] = { ...db.categories[idx], ...req.body };
  res.json({ code: 0, data: db.categories[idx] });
});

app.delete('/api/category/:id', (req, res) => {
  db.categories = db.categories.filter(c => c.id !== parseInt(req.params.id));
  res.json({ code: 0, data: { success: true } });
});

// ── 优惠券管理接口 ──
app.get('/api/coupon', (req, res) => {
  const { title, page = 1, pageSize = 10 } = req.query;
  let list = db.coupons;
  if (title) list = list.filter(c => c.title.includes(title));
  const start = (page - 1) * pageSize;
  res.json({ code: 0, data: { list: list.slice(start, start + +pageSize), total: list.length } });
});

app.post('/api/coupon', (req, res) => {
  const coupon = { id: Date.now(), ...req.body, status: 1 };
  db.coupons.push(coupon);
  res.json({ code: 0, data: coupon });
});

app.put('/api/coupon/:id', (req, res) => {
  const idx = db.coupons.findIndex(c => c.id === parseInt(req.params.id));
  if (idx === -1) return res.json({ code: 404, message: '优惠券不存在' });
  db.coupons[idx] = { ...db.coupons[idx], ...req.body };
  res.json({ code: 0, data: db.coupons[idx] });
});

app.delete('/api/coupon/:id', (req, res) => {
  db.coupons = db.coupons.filter(c => c.id !== parseInt(req.params.id));
  res.json({ code: 0, data: { success: true } });
});

// ── 字典管理接口 ──
app.get('/api/dict/list', (req, res) => {
  const { name, page = 1, pageSize = 10 } = req.query;
  let list = db.dicts;
  if (name) list = list.filter(d => d.name.includes(name));
  const start = (page - 1) * pageSize;
  res.json({ code: 0, data: { list: list.slice(start, start + +pageSize), total: list.length } });
});

app.get('/api/dict/item', (req, res) => {
  const { code } = req.query;
  const dict = db.dicts.find(d => d.code === code);
  res.json({ code: 0, data: dict?.items || [] });
});

// ── 商品管理接口 ──
app.post('/api/product', (req, res) => {
  const product = { id: Date.now(), sales_count: 0, rating: '5.0', ...req.body, status: 1 };
  db.products.push(product);
  res.json({ code: 0, data: product });
});

app.put('/api/product/:id', (req, res) => {
  const idx = db.products.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.json({ code: 404, message: '商品不存在' });
  db.products[idx] = { ...db.products[idx], ...req.body };
  res.json({ code: 0, data: db.products[idx] });
});

app.delete('/api/product/:id', (req, res) => {
  db.products = db.products.filter(p => p.id !== parseInt(req.params.id));
  res.json({ code: 0, data: { success: true } });
});

app.post('/api/product/batch-delete', (req, res) => {
  const { ids } = req.body;
  db.products = db.products.filter(p => !ids.includes(p.id));
  res.json({ code: 0, data: { success: true } });
});

app.put('/api/product/batch-status', (req, res) => {
  const { ids, status } = req.body;
  db.products.forEach(p => { if (ids.includes(p.id)) p.status = status; });
  res.json({ code: 0, data: { success: true } });
});

// ── 订单管理接口 ──
app.get('/api/order/admin/list', (req, res) => {
  const { page = 1, pageSize = 10, status } = req.query;
  let list = db.orders;
  if (status) list = list.filter(o => o.status === status);
  const start = (page - 1) * pageSize;
  res.json({ code: 0, data: { list: list.slice(start, start + +pageSize), total: list.length } });
});

// ── 推荐商品管理 ──
app.get('/api/product-recommend/admin', (req, res) => {
  const { page = 1, pageSize = 10 } = req.query;
  const list = db.productRecommend.map(r => ({ ...r, product: db.products.find(p => p.id === r.product_id) }));
  const start = (page - 1) * pageSize;
  res.json({ code: 0, data: { list: list.slice(start, start + +pageSize), total: list.length } });
});

app.post('/api/product-recommend', (req, res) => {
  const { product_id, position } = req.body;
  const exist = db.productRecommend.find(r => r.product_id === product_id);
  if (exist) { exist.position = position; return res.json({ code: 0, data: exist }); }
  const item = { id: Date.now(), product_id, position, status: 1 };
  db.productRecommend.push(item);
  res.json({ code: 0, data: item });
});

// ── 热销商品管理 ──
app.get('/api/product-recommend/hot-admin', (req, res) => {
  const { page = 1, pageSize = 10 } = req.query;
  const list = db.hotProducts.map(r => ({ ...r, product: db.products.find(p => p.id === r.product_id) }));
  const start = (page - 1) * pageSize;
  res.json({ code: 0, data: { list: list.slice(start, start + +pageSize), total: list.length } });
});

app.post('/api/product-recommend/hot', (req, res) => {
  const { product_id, position } = req.body;
  const exist = db.hotProducts.find(r => r.product_id === product_id);
  if (exist) { exist.position = position; return res.json({ code: 0, data: exist }); }
  const item = { id: Date.now(), product_id, position, status: 1 };
  db.hotProducts.push(item);
  res.json({ code: 0, data: item });
});

// ── 快捷入口管理 ──
app.get('/api/quick-entry/admin', (req, res) => {
  const { page = 1, pageSize = 10 } = req.query;
  const start = (page - 1) * pageSize;
  const list = db.quickEntries.slice(start, start + +pageSize);
  res.json({ code: 0, data: { list, total: db.quickEntries.length } });
});

app.post('/api/quick-entry', (req, res) => {
  const entry = { id: Date.now(), ...req.body, status: 1 };
  db.quickEntries.push(entry);
  res.json({ code: 0, data: entry });
});

app.put('/api/quick-entry/:id', (req, res) => {
  const idx = db.quickEntries.findIndex(e => e.id === parseInt(req.params.id));
  if (idx === -1) return res.json({ code: 404, message: '入口不存在' });
  db.quickEntries[idx] = { ...db.quickEntries[idx], ...req.body };
  res.json({ code: 0, data: db.quickEntries[idx] });
});

app.delete('/api/quick-entry/:id', (req, res) => {
  db.quickEntries = db.quickEntries.filter(e => e.id !== parseInt(req.params.id));
  res.json({ code: 0, data: { success: true } });
});

// ── 图片上传 ──
app.post('/api/upload/image', (req, res) => {
  res.json({ code: 0, data: { url: `https://picsum.photos/400/400?random=${Date.now()}`, filename: 'upload.jpg' } });
});

// ── Banner 接口 ──
app.get('/api/banner/list', (req, res) => {
  res.json({ code: 0, data: db.banners.filter(b => b.status === 1) });
});

// ── 购物车接口 ──
app.get('/api/cart/list', (req, res) => {
  const userId = req.user?.userId;
  const list = db.cart.filter(c => c.user_id === userId);
  res.json({ code: 0, data: list });
});

app.post('/api/cart/add', (req, res) => {
  const userId = req.user?.userId || 1;
  const { product_id, sku_id, quantity = 1, device_id } = req.body;
  const product = db.products.find(p => p.id === product_id);
  if (!product) return res.json({ code: 404, message: '商品不存在' });
  
  const exist = db.cart.find(c => c.user_id === userId && c.product_id === product_id);
  if (exist) {
    exist.quantity += quantity;
  } else {
    db.cart.push({
      id: Date.now(), user_id: userId, product_id, sku_id, quantity,
      title: product.title, cover_image: product.cover_image,
      price: product.price, stock: product.stock, is_checked: 1
    });
  }
  res.json({ code: 0, data: { id: exist?.id || Date.now(), quantity: exist?.quantity || quantity } });
});

app.put('/api/cart/:id', (req, res) => {
  const item = db.cart.find(c => c.id === parseInt(req.params.id));
  if (item) item.quantity = req.body.quantity;
  res.json({ code: 0, data: { success: true } });
});

app.delete('/api/cart/:id', (req, res) => {
  db.cart = db.cart.filter(c => c.id !== parseInt(req.params.id));
  res.json({ code: 0, data: { success: true } });
});

app.delete('/api/cart/batch', (req, res) => {
  const { ids } = req.body;
  db.cart = db.cart.filter(c => !ids.includes(c.id));
  res.json({ code: 0, data: { success: true } });
});

app.put('/api/cart/checked', (req, res) => {
  res.json({ code: 0, data: { success: true } });
});

// ── 地址接口 ──
app.get('/api/address/list', (req, res) => {
  res.json({ code: 0, data: db.addresses });
});

// ── 优惠券接口 ──
app.get('/api/coupon/available', (req, res) => {
  res.json({ code: 0, data: db.coupons });
});

// ── 订单接口 ──
app.post('/api/order/create', (req, res) => {
  const { address_id, items } = req.body;
  const order = {
    id: Date.now(),
    order_no: 'ORD' + Date.now(),
    user_id: req.user?.userId || 1,
    address_id,
    items,
    status: 'pending',
    pay_amount: items.reduce((s, i) => s + i.price * i.quantity, 0),
    created_at: new Date().toISOString()
  };
  db.orders.push(order);
  res.json({ code: 0, data: order });
});

app.get('/api/order/count', (req, res) => {
  res.json({ code: 0, data: { pending: 2, paid: 1, shipped: 3, completed: 5 } });
});

app.listen(3000, '0.0.0.0', () => {
  console.log(`Mock server running at http://192.168.20.181:3000`);
});