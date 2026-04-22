// icon 名称映射：iconfont class name → Material Symbols icon name
export const ICON_MAP = {
  // Navigation & UI
  'icon-location': 'location_on',
  'icon-arrow-down': 'expand_more',
  'icon-arrow-up': 'expand_less',
  'icon-arrow-right': 'chevron_right',
  'icon-arrow-left': 'arrow_back',
  'icon-search': 'search',
  'icon-camera': 'photo_camera',
  'icon-qrcode': 'qr_code_scanner',
  'icon-bell': 'notifications',
  'icon-more': 'more_horiz',

  // Actions
  'icon-add': 'add',
  'icon-add-cart': 'add_shopping_cart',
  'icon-remove': 'remove',
  'icon-check': 'check',
  'icon-close': 'close',
  'icon-delete': 'delete',
  'icon-edit': 'edit',

  // Commerce
  'icon-cart': 'shopping_cart',
  'icon-store': 'storefront',
  'icon-star': 'star',
  'icon-discount': 'local_offer',
  'icon-trend': 'trending_up',
  'icon-vip': 'workspace_premium',
  'icon-gift': 'redeem',
  'icon-crown': 'emoji_events',
  'icon-globe': 'public',
  'icon-face': 'face',
  'icon-leaf': 'eco',
  'icon-box': 'inventory_2',
  'icon-consult': 'support_agent',

  // Status
  'icon-wallet': 'account_balance_wallet',
  'icon-pay': 'payments',
  'icon-truck': 'local_shipping',
  'icon-package': 'inventory',
  'icon-review': 'rate_review',
  'icon-refund': 'assignment_return',
  'icon-complete': 'check_circle',

  // Misc
  'icon-help': 'help_outline',
  'icon-info': 'info',
  'icon-settings': 'settings',
  'icon-favorite': 'favorite',
  'icon-history': 'history',
  'icon-share': 'share',
  'icon-shield': 'verified_user',
  'icon-service': 'support_agent',
  'icon-stars': 'stars',
  'icon-empty': 'inbox',
};

// 获取 Material Symbols 图标名
export function getIconName(iconClass) {
  for (const [key, value] of Object.entries(ICON_MAP)) {
    if (iconClass.includes(key)) {
      return value;
    }
  }
  return iconClass.replace('icon-', '');
}