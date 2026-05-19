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

INSERT IGNORE INTO `member_level` (`id`, `name`, `discount_rate`, `benefit_desc`, `sort_order`, `status`) VALUES
(1, '普通会员', 100.00, '享受商城原价购买', 1, 1),
(2, 'VIP会员', 95.00, '下单享受VIP会员优惠价', 2, 1),
(3, '特级经销商', 85.00, '下单享受特级经销商优惠价', 3, 1);

CREATE TABLE IF NOT EXISTS `performance_period` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `period_code` VARCHAR(20) NOT NULL COMMENT '期数编码',
  `name` VARCHAR(64) NOT NULL COMMENT '期数名称',
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `qualified_threshold` DECIMAL(12,2) DEFAULT 10000.00 COMMENT '部门合格业绩门槛',
  `status` TINYINT UNSIGNED DEFAULT 1 COMMENT '0-关闭 1-进行中',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_period_code` (`period_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='业绩考核期';

INSERT IGNORE INTO `performance_period` (`period_code`, `name`, `start_date`, `end_date`, `qualified_threshold`, `status`) VALUES
('202605', '202605期', '2026-05-01', '2026-05-31', 10000.00, 1),
('202604', '202604期', '2026-04-01', '2026-04-30', 10000.00, 0);

CREATE TABLE IF NOT EXISTS `department_performance` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `owner_user_id` BIGINT UNSIGNED NOT NULL,
  `direct_user_id` BIGINT UNSIGNED NOT NULL,
  `period_id` BIGINT UNSIGNED NOT NULL,
  `dept_name` VARCHAR(64) DEFAULT NULL,
  `total_members` INT UNSIGNED DEFAULT 0,
  `total_performance` DECIMAL(12,2) DEFAULT 0,
  `effective_performance` DECIMAL(12,2) DEFAULT 0,
  `status` TINYINT UNSIGNED DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_owner_direct_period` (`owner_user_id`, `direct_user_id`, `period_id`),
  KEY `idx_owner_period` (`owner_user_id`, `period_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='部门业绩快照';
