// icon 名称映射：iconfont class name → Font Awesome class name
export const ICON_MAP = {
  // Navigation & UI
  'icon-location': 'fa-location-dot',
  'icon-arrow-down': 'fa-chevron-down',
  'icon-arrow-up': 'fa-chevron-up',
  'icon-arrow-right': 'fa-chevron-right',
  'icon-arrow-left': 'fa-chevron-left',
  'icon-search': 'fa-search',
  'icon-camera': 'fa-camera',
  'icon-qrcode': 'fa-qrcode',
  'icon-bell': 'fa-bell',
  'icon-more': 'fa-ellipsis-vertical',

  // Actions
  'icon-add': 'fa-plus',
  'icon-add-cart': 'fa-cart-plus',
  'icon-remove': 'fa-minus',
  'icon-check': 'fa-check',
  'icon-close': 'fa-xmark',
  'icon-delete': 'fa-trash',
  'icon-edit': 'fa-pen',
  'icon-clear': 'fa-trash-can',

  // Commerce
  'icon-cart': 'fa-cart-shopping',
  'icon-store': 'fa-shop',
  'icon-star': 'fa-star',
  'icon-discount': 'fa-tag',
  'icon-trend': 'fa-chart-line',
  'icon-vip': 'fa-crown',
  'icon-gift': 'fa-gift',
  'icon-crown': 'fa-trophy',
  'icon-globe': 'fa-globe',
  'icon-face': 'fa-face-smile',
  'icon-leaf': 'fa-leaf',
  'icon-box': 'fa-box',
  'icon-consult': 'fa-headset',

  // Status
  'icon-wallet': 'fa-wallet',
  'icon-pay': 'fa-money-bill-wave',
  'icon-truck': 'fa-truck',
  'icon-package': 'fa-box-open',
  'icon-review': 'fa-pen-to-square',
  'icon-refund': 'fa-rotate-left',
  'icon-complete': 'fa-circle-check',

  // Misc
  'icon-help': 'fa-circle-question',
  'icon-info': 'fa-circle-info',
  'icon-settings': 'fa-gear',
  'icon-favorite': 'fa-heart',
  'icon-history': 'fa-clock-rotate-left',
  'icon-share': 'fa-share',
  'icon-shield': 'fa-shield-halved',
  'icon-service': 'fa-headset',
  'icon-stars': 'fa-star',
  'icon-empty': 'fa-inbox',
  'icon-about': 'fa-circle-info',
  'icon-phone': 'fa-phone',
  'icon-filter': 'fa-filter',
  'icon-grid': 'fa-table-cells',
  'icon-list': 'fa-list',
};

// 获取 Font Awesome 图标 class
export function getIconName(iconClass) {
  for (const [key, value] of Object.entries(ICON_MAP)) {
    if (iconClass.includes(key)) {
      return value;
    }
  }
  return iconClass.replace('icon-', 'fa-');
}
