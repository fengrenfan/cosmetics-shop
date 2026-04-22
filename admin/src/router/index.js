import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '首页', icon: 'Odometer' },
      },
      {
        path: 'product',
        name: 'Product',
        meta: { title: '商品管理', icon: 'Goods' },
        children: [
          {
            path: 'list',
            name: 'ProductList',
            component: () => import('@/views/product/list.vue'),
            meta: { title: '商品列表' },
          },
          {
            path: 'category',
            name: 'Category',
            component: () => import('@/views/product/category.vue'),
            meta: { title: '分类管理' },
          },
        ],
      },
      {
        path: 'order',
        name: 'Order',
        meta: { title: '订单管理', icon: 'List' },
        children: [
          {
            path: 'list',
            name: 'OrderList',
            component: () => import('@/views/order/list.vue'),
            meta: { title: '订单列表' },
          },
        ],
      },
      {
        path: 'user',
        name: 'User',
        meta: { title: '用户管理', icon: 'User' },
        children: [
          {
            path: 'list',
            name: 'UserList',
            component: () => import('@/views/user/list.vue'),
            meta: { title: '用户列表' },
          },
        ],
      },
      {
        path: 'marketing',
        name: 'Marketing',
        meta: { title: '营销管理', icon: 'Present' },
        children: [
          {
            path: 'banner',
            name: 'Banner',
            component: () => import('@/views/marketing/banner.vue'),
            meta: { title: 'Banner管理' },
          },
          {
            path: 'coupon',
            name: 'Coupon',
            component: () => import('@/views/marketing/coupon.vue'),
            meta: { title: '优惠券管理' },
          },
          {
            path: 'quick-entry',
            name: 'QuickEntry',
            component: () => import('@/views/marketing/quick-entry.vue'),
            meta: { title: '快捷入口' },
          },
          {
            path: 'product-recommend',
            name: 'ProductRecommend',
            component: () => import('@/views/marketing/product-recommend.vue'),
            meta: { title: '商品推荐' },
          },
          {
            path: 'hot-products',
            name: 'HotProducts',
            component: () => import('@/views/marketing/hot-products.vue'),
            meta: { title: '热销商品' },
          },
        ],
      },
      {
        path: 'system',
        name: 'System',
        meta: { title: '系统管理', icon: 'Setting' },
        children: [
          {
            path: 'dict',
            name: 'Dict',
            component: () => import('@/views/system/dict.vue'),
            meta: { title: '字典管理' },
          },
        ],
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
  document.title = to.meta.title 
    ? `${to.meta.title} - 唯伊美妆管理后台` 
    : '唯伊美妆管理后台';

  const token = localStorage.getItem('admin_token');
  if (to.path !== '/login' && !token) {
    next('/login');
  } else {
    next();
  }
});

export default router;
