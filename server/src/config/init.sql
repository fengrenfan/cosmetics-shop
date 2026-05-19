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
  `points` INT DEFAULT 0 COMMENT '积分余额',
  `member_level_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '会员等级ID',
  `parent_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '邀请人/上级用户ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_openid` (`openid`),
  UNIQUE KEY `uk_phone` (`phone`),
  KEY `idx_parent` (`parent_id`),
  KEY `idx_member_level` (`member_level_id`)
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
  `user_id` BIGINT UNSIGNED DEFAULT NULL,
  `device_id` VARCHAR(64) DEFAULT NULL COMMENT '设备ID（游客模式）',
  `product_id` BIGINT UNSIGNED NOT NULL,
  `sku_id` BIGINT UNSIGNED DEFAULT NULL,
  `quantity` INT UNSIGNED DEFAULT 1,
  `is_checked` TINYINT UNSIGNED DEFAULT 1 COMMENT '是否选中',
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
  `pay_status` VARCHAR(20) DEFAULT 'unpaid' COMMENT 'unpaid/paying/paid/failed/closed/refunding/refunded',
  `pay_channel` VARCHAR(20) DEFAULT NULL COMMENT 'wechat/alipay',
  `pay_scene` VARCHAR(20) DEFAULT NULL COMMENT 'miniapp/h5',
  `out_trade_no` VARCHAR(64) DEFAULT NULL COMMENT '商户支付单号',
  `third_trade_no` VARCHAR(64) DEFAULT NULL COMMENT '第三方交易号',
  `total_amount` DECIMAL(10,2) NOT NULL COMMENT '商品总价',
  `freight_amount` DECIMAL(10,2) DEFAULT 0 COMMENT '运费',
  `pay_amount` DECIMAL(10,2) NOT NULL COMMENT '实付金额',
  `pay_time` DATETIME DEFAULT NULL,
  `paid_at` DATETIME DEFAULT NULL COMMENT '支付成功时间',
  `notify_at` DATETIME DEFAULT NULL COMMENT '回调时间',
  `pay_fail_reason` VARCHAR(255) DEFAULT NULL COMMENT '支付失败原因',
  `notify_payload` TEXT DEFAULT NULL COMMENT '回调原始数据',
  `ship_time` DATETIME DEFAULT NULL,
  `receive_time` DATETIME DEFAULT NULL,
  `complete_time` DATETIME DEFAULT NULL COMMENT '完成时间',
  `address_id` BIGINT UNSIGNED DEFAULT NULL,
  `address_snapshot` TEXT DEFAULT NULL COMMENT '收货地址快照JSON',
  `remark` VARCHAR(512) DEFAULT NULL,
  `express_company` VARCHAR(50) DEFAULT NULL COMMENT '快递公司',
  `express_no` VARCHAR(100) DEFAULT NULL COMMENT '快递单号',
  `coupon_amount` DECIMAL(10,2) DEFAULT NULL COMMENT '优惠券抵扣金额',
  `coupon_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '使用的优惠券ID',
  `cancel_time` DATETIME DEFAULT NULL COMMENT '取消时间',
  `cancel_reason` VARCHAR(255) DEFAULT NULL COMMENT '取消原因',
  `points_amount` INT DEFAULT 0 COMMENT '使用积分数量',
  `points_money` DECIMAL(10,2) DEFAULT 0 COMMENT '积分抵扣金额',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_user` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_pay_status` (`pay_status`),
  KEY `idx_out_trade_no` (`out_trade_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- ============================================
-- 8. 订单商品表
-- ============================================
CREATE TABLE `order_item` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `sku_id` BIGINT UNSIGNED DEFAULT NULL,
  `product_title` VARCHAR(255) NOT NULL COMMENT '商品名称',
  `cover_image` VARCHAR(512) DEFAULT NULL,
  `sku_name` VARCHAR(128) DEFAULT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `quantity` INT UNSIGNED DEFAULT 1,
  `subtotal` DECIMAL(10,2) DEFAULT NULL COMMENT '小计金额',
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
  `auto_grant` TINYINT UNSIGNED DEFAULT 0 COMMENT '0:否 1:新用户注册 2:首单',
  `description` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='优惠券表';

ALTER TABLE `coupon` ADD COLUMN IF NOT EXISTS `description` TEXT DEFAULT NULL AFTER `auto_grant`;

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
-- 11. 美圈动态表
-- ============================================
CREATE TABLE `community_post` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `content` TEXT NOT NULL,
  `images` JSON DEFAULT NULL,
  `like_count` INT UNSIGNED DEFAULT 0,
  `status` TINYINT UNSIGNED DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_status_created` (`status`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='美圈动态表';

-- ============================================
-- 12. 美圈点赞表
-- ============================================
CREATE TABLE `community_like` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `post_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_post_user` (`post_id`, `user_id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='美圈点赞表';

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

-- ============================================
-- 14. 支付记录表
-- ============================================
CREATE TABLE `payment_record` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `order_no` VARCHAR(64) NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `pay_channel` VARCHAR(20) NOT NULL COMMENT 'wechat/alipay',
  `pay_scene` VARCHAR(20) NOT NULL COMMENT 'miniapp/h5',
  `status` VARCHAR(20) DEFAULT 'paying' COMMENT 'paying/paid/failed/closed',
  `out_trade_no` VARCHAR(64) NOT NULL,
  `third_trade_no` VARCHAR(64) DEFAULT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `client_payload` TEXT DEFAULT NULL,
  `notify_payload` TEXT DEFAULT NULL,
  `paid_at` DATETIME DEFAULT NULL,
  `notify_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_out_trade_no` (`out_trade_no`),
  KEY `idx_order` (`order_id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付记录表';

-- ============================================
-- 15. 会员等级表
-- ============================================
CREATE TABLE IF NOT EXISTS `member_level` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(64) NOT NULL COMMENT '等级名称',
  `discount_rate` DECIMAL(5,2) DEFAULT 100.00 COMMENT '折扣率(%)',
  `benefit_desc` VARCHAR(512) DEFAULT NULL COMMENT '权益描述',
  `sort_order` INT UNSIGNED DEFAULT 0,
  `status` TINYINT UNSIGNED DEFAULT 1 COMMENT '0-禁用 1-启用',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员等级表';

INSERT INTO `member_level` (`id`, `name`, `discount_rate`, `benefit_desc`, `sort_order`, `status`) VALUES
(1, '普通会员', 100.00, '享受商城原价购买', 1, 1),
(2, 'VIP会员', 95.00, '下单享受VIP会员优惠价', 2, 1),
(3, '特级经销商', 85.00, '下单享受特级经销商优惠价', 3, 1);

-- ============================================
-- 16. 业绩考核期表
-- ============================================
CREATE TABLE IF NOT EXISTS `performance_period` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `period_code` VARCHAR(20) NOT NULL COMMENT '期数编码 如202605',
  `name` VARCHAR(64) NOT NULL COMMENT '期数名称 如202605期',
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `qualified_threshold` DECIMAL(12,2) DEFAULT 10000.00 COMMENT '部门合格业绩门槛',
  `status` TINYINT UNSIGNED DEFAULT 1 COMMENT '0-关闭 1-进行中',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_period_code` (`period_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='业绩考核期';

INSERT INTO `performance_period` (`period_code`, `name`, `start_date`, `end_date`, `qualified_threshold`, `status`) VALUES
('202605', '202605期', '2026-05-01', '2026-05-31', 10000.00, 1),
('202604', '202604期', '2026-04-01', '2026-04-30', 10000.00, 0);

-- ============================================
-- 17. 部门业绩快照表（可按期维护/覆盖）
-- ============================================
CREATE TABLE IF NOT EXISTS `department_performance` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `owner_user_id` BIGINT UNSIGNED NOT NULL COMMENT '部门所属用户(上级)',
  `direct_user_id` BIGINT UNSIGNED NOT NULL COMMENT '直属下级(部门负责人)',
  `period_id` BIGINT UNSIGNED NOT NULL,
  `dept_name` VARCHAR(64) DEFAULT NULL COMMENT '部门名称',
  `total_members` INT UNSIGNED DEFAULT 0 COMMENT '部门总人数',
  `total_performance` DECIMAL(12,2) DEFAULT 0 COMMENT '总业绩',
  `effective_performance` DECIMAL(12,2) DEFAULT 0 COMMENT '有效业绩',
  `status` TINYINT UNSIGNED DEFAULT 0 COMMENT '0-不合格 1-合格',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_owner_direct_period` (`owner_user_id`, `direct_user_id`, `period_id`),
  KEY `idx_owner_period` (`owner_user_id`, `period_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='部门业绩快照';

-- ============================================
-- 任务中心：签到 & 任务记录
-- ============================================
CREATE TABLE IF NOT EXISTS `user_checkin` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `checkin_date` DATE NOT NULL,
  `points` INT NOT NULL DEFAULT 10,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_checkin_date` (`user_id`, `checkin_date`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户每日签到';

CREATE TABLE IF NOT EXISTS `user_task_log` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `task_type` VARCHAR(32) NOT NULL,
  `period_key` VARCHAR(32) NOT NULL,
  `ref_id` BIGINT UNSIGNED DEFAULT NULL,
  `points` INT NOT NULL DEFAULT 10,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_task_period` (`user_id`, `task_type`, `period_key`),
  KEY `idx_user_task_type` (`user_id`, `task_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户任务完成记录';

-- 已有库迁移（可重复执行）
ALTER TABLE `user` ADD COLUMN IF NOT EXISTS `points` INT DEFAULT 0 COMMENT '积分余额' AFTER `last_login_ip`;
ALTER TABLE `user` ADD COLUMN IF NOT EXISTS `member_level_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '会员等级ID' AFTER `points`;
ALTER TABLE `user` ADD COLUMN IF NOT EXISTS `parent_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '邀请人/上级用户ID' AFTER `member_level_id`;
