-- ============================================
-- 唯伊美妆电商小程序 - 数据库初始化脚本
-- MySQL 8.0+
-- 执行方式: mysql -u root -p < init.sql
-- ============================================

CREATE DATABASE IF NOT EXISTS `cosmetics_shop` 
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `cosmetics_shop`;

-- ============================================
-- 1. 用户表
-- ============================================
CREATE TABLE `user` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `openid` VARCHAR(128) DEFAULT NULL COMMENT '微信openid',
  `unionid` VARCHAR(128) DEFAULT NULL COMMENT '微信unionid',
  `nickname` VARCHAR(64) DEFAULT NULL COMMENT '昵称',
  `avatar` VARCHAR(512) DEFAULT NULL COMMENT '头像URL',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `gender` TINYINT UNSIGNED DEFAULT 0 COMMENT '性别 0-未知 1-男 2-女',
  `password_hash` VARCHAR(255) DEFAULT NULL COMMENT '密码哈希',
  `status` TINYINT UNSIGNED DEFAULT 1 COMMENT '状态 0-禁用 1-正常',
  `last_login_at` DATETIME DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` VARCHAR(45) DEFAULT NULL COMMENT '最后登录IP',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_openid` (`openid`),
  UNIQUE KEY `uk_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 插入管理员
INSERT INTO `user` (`id`, `nickname`, `phone`, `password_hash`, `status`, `created_at`) VALUES
(1, '管理员', 'admin', '$2b$10$Xv5H7r3eDnLqM0kR8gQYX.HJLGQkRqWHYwW3p.vJQGqKkX9GvXyKO', 1, NOW());

-- ============================================
-- 2. 商品分类表
-- ============================================
CREATE TABLE `category` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `parent_id` BIGINT UNSIGNED DEFAULT 0 COMMENT '父分类ID',
  `name` VARCHAR(64) NOT NULL COMMENT '分类名称',
  `icon` VARCHAR(512) DEFAULT NULL COMMENT '图标',
  `sort_order` INT UNSIGNED DEFAULT 0,
  `status` TINYINT UNSIGNED DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品分类表';

INSERT INTO `category` (`id`, `parent_id`, `name`, `sort_order`, `status`) VALUES
(1, 0, '护肤', 1, 1),
(2, 0, '彩妆', 2, 1),
(3, 0, '香水', 3, 1),
(4, 0, '美发', 4, 1),
(5, 0, '美甲', 5, 1),
(6, 0, '工具', 6, 1),
(7, 1, '面膜', 1, 1),
(8, 1, '乳液', 2, 1),
(9, 1, '精华', 3, 1),
(10, 2, '口红', 1, 1),
(11, 2, '眼影', 2, 1),
(12, 2, '粉底', 3, 1);

-- ============================================
-- 3. 商品表
-- ============================================
CREATE TABLE `product` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL COMMENT '商品名称',
  `subtitle` VARCHAR(512) DEFAULT NULL COMMENT '副标题',
  `cover_image` VARCHAR(512) DEFAULT NULL COMMENT '封面图',
  `images` JSON DEFAULT NULL COMMENT '图片列表',
  `price` DECIMAL(10,2) NOT NULL COMMENT '售价',
  `original_price` DECIMAL(10,2) DEFAULT NULL COMMENT '原价',
  `stock` INT UNSIGNED DEFAULT 0 COMMENT '库存',
  `unit` VARCHAR(20) DEFAULT '件' COMMENT '单位',
  `detail_html` TEXT DEFAULT NULL COMMENT '商品详情HTML',
  `is_recommend` TINYINT UNSIGNED DEFAULT 0,
  `is_hot` TINYINT UNSIGNED DEFAULT 0,
  `is_new` TINYINT UNSIGNED DEFAULT 0,
  `status` TINYINT UNSIGNED DEFAULT 1,
  `sales_count` INT UNSIGNED DEFAULT 0,
  `sort_order` INT UNSIGNED DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品表';

INSERT INTO `product` (`id`, `category_id`, `title`, `subtitle`, `cover_image`, `images`, `price`, `original_price`, `stock`, `is_recommend`, `is_hot`, `is_new`, `status`, `sort_order`) VALUES
(1001, 10, '烈焰幻彩唇膏 #999', '经典正红色 丝绒质感', 'https://picsum.photos/400/400?random=10', '["https://picsum.photos/400/400?random=10"]', 199.00, 299.00, 500, 1, 1, 0, 1, 1),
(1002, 7, '玻尿酸保湿面膜 10片装', '深层补水 急救修复', 'https://picsum.photos/400/400?random=12', '["https://picsum.photos/400/400?random=12"]', 89.00, 129.00, 1000, 1, 1, 1, 1, 2),
(1003, 9, '焕颜精华液 30ml', '焕亮肌肤 紧致抗衰', 'https://picsum.photos/400/400?random=13', '["https://picsum.photos/400/400?random=13"]', 399.00, 599.00, 200, 1, 0, 0, 1, 3);

-- ============================================
-- 4. SKU表
-- ============================================
CREATE TABLE `product_sku` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `sku_name` VARCHAR(128) NOT NULL COMMENT '规格名称',
  `sku_attrs` JSON DEFAULT NULL COMMENT '规格属性',
  `price` DECIMAL(10,2) NOT NULL,
  `stock` INT UNSIGNED DEFAULT 0,
  `image` VARCHAR(512) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SKU规格表';

INSERT INTO `product_sku` (`product_id`, `sku_name`, `sku_attrs`, `price`, `stock`) VALUES
(1001, '999#正红色', '{"颜色":"999 正红色"}', 199.00, 200),
(1001, '888#枫叶红', '{"颜色":"888 枫叶红"}', 199.00, 150),
(1002, '10片装', '{}', 89.00, 500),
(1002, '20片装', '{}', 169.00, 500);

-- ============================================
-- 5. 收货地址表
-- ============================================
CREATE TABLE `address` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `province` VARCHAR(50) NOT NULL,
  `city` VARCHAR(50) NOT NULL,
  `district` VARCHAR(50) NOT NULL,
  `detail_address` VARCHAR(255) NOT NULL,
  `postal_code` VARCHAR(10) DEFAULT NULL,
  `is_default` TINYINT UNSIGNED DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收货地址表';

-- ============================================
-- 6. 购物车表
-- ============================================
CREATE TABLE `cart` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `sku_id` BIGINT UNSIGNED DEFAULT NULL,
  `quantity` INT UNSIGNED DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='购物车表';

-- ============================================
-- 7. 订单表
-- ============================================
CREATE TABLE `order` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_no` VARCHAR(64) NOT NULL COMMENT '订单号',
  `user_id` BIGINT UNSIGNED NOT NULL,
  `status` VARCHAR(20) DEFAULT 'pending' COMMENT 'pending/paid/shipped/completed/cancelled',
  `total_amount` DECIMAL(10,2) NOT NULL COMMENT '商品总价',
  `freight_amount` DECIMAL(10,2) DEFAULT 0 COMMENT '运费',
  `pay_amount` DECIMAL(10,2) NOT NULL COMMENT '实付金额',
  `pay_time` DATETIME DEFAULT NULL,
  `ship_time` DATETIME DEFAULT NULL,
  `receive_time` DATETIME DEFAULT NULL,
  `address_id` BIGINT UNSIGNED DEFAULT NULL,
  `remark` VARCHAR(512) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_user` (`user_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- ============================================
-- 8. 订单商品表
-- ============================================
CREATE TABLE `order_item` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `sku_id` BIGINT UNSIGNED DEFAULT NULL,
  `title` VARCHAR(255) NOT NULL,
  `cover_image` VARCHAR(512) DEFAULT NULL,
  `sku_name` VARCHAR(128) DEFAULT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `quantity` INT UNSIGNED DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单商品表';

-- ============================================
-- 9. 优惠券表
-- ============================================
CREATE TABLE `coupon` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(128) NOT NULL,
  `type` VARCHAR(20) DEFAULT 'fixed' COMMENT 'fixed/percent/no_threshold',
  `value` DECIMAL(10,2) NOT NULL COMMENT '优惠值',
  `min_amount` DECIMAL(10,2) DEFAULT 0 COMMENT '使用门槛',
  `total_count` INT UNSIGNED DEFAULT 0,
  `claimed_count` INT UNSIGNED DEFAULT 0,
  `per_limit` INT UNSIGNED DEFAULT 1,
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME NOT NULL,
  `status` TINYINT UNSIGNED DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='优惠券表';

INSERT INTO `coupon` (`title`, `type`, `value`, `min_amount`, `total_count`, `start_time`, `end_time`) VALUES
('新人专享券', 'fixed', 20.00, 100.00, 10000, '2024-01-01 00:00:00', '2027-12-31 23:59:59'),
('满减优惠券', 'fixed', 50.00, 300.00, 5000, '2024-01-01 00:00:00', '2027-12-31 23:59:59');

-- ============================================
-- 10. 用户优惠券表
-- ============================================
CREATE TABLE `user_coupon` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `coupon_id` BIGINT UNSIGNED NOT NULL,
  `status` VARCHAR(20) DEFAULT 'unused' COMMENT 'unused/used/expired',
  `claimed_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `used_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_coupon` (`coupon_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户优惠券表';

-- ============================================
-- 11. 收藏表
-- ============================================
CREATE TABLE `favorite` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_product` (`user_id`, `product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏表';

-- ============================================
-- 12. Banner表
-- ============================================
CREATE TABLE `banner` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(128) NOT NULL,
  `image` VARCHAR(512) NOT NULL,
  `link_type` VARCHAR(20) DEFAULT 'none' COMMENT 'none/product/category/url',
  `link_id` VARCHAR(128) DEFAULT NULL,
  `sort_order` INT UNSIGNED DEFAULT 0,
  `status` TINYINT UNSIGNED DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Banner表';

INSERT INTO `banner` (`title`, `image`, `link_type`, `sort_order`, `status`) VALUES
('春季护肤季', 'https://picsum.photos/750/400?random=1', 'none', 1, 1),
('热卖口红专区', 'https://picsum.photos/750/400?random=2', 'category', '10', 2, 1),
('新品上市', 'https://picsum.photos/750/400?random=3', 'none', 3, 1);

-- ============================================
-- 13. 上传记录表
-- ============================================
CREATE TABLE `upload` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `url` VARCHAR(512) NOT NULL,
  `filename` VARCHAR(255) DEFAULT NULL,
  `mime_type` VARCHAR(100) DEFAULT NULL,
  `size` INT UNSIGNED DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='上传记录表';
