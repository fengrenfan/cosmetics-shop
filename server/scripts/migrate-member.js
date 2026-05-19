/**
 * 会员中心相关表结构迁移（可重复执行）
 * 用法: npm run db:migrate-member
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const USER_ALTER_SQL = [
  "ALTER TABLE `user` ADD COLUMN `points` INT DEFAULT 0 COMMENT '积分余额' AFTER `last_login_ip`",
  "ALTER TABLE `user` ADD COLUMN `member_level_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '会员等级ID' AFTER `points`",
  "ALTER TABLE `user` ADD COLUMN `parent_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '邀请人/上级用户ID' AFTER `member_level_id`",
];

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  for (const sql of USER_ALTER_SQL) {
    try {
      await conn.query(sql);
      console.log('✓', sql.match(/ADD COLUMN `(\w+)`/)?.[1] || sql.slice(0, 40));
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('· 已存在，跳过');
      } else {
        throw err;
      }
    }
  }

  const sqlPath = path.join(__dirname, '../src/config/member-migration-tables.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  await conn.query(sql);
  await conn.end();
  console.log('✅ 会员中心数据库迁移完成');
}

run().catch((err) => {
  console.error('❌ 迁移失败:', err.message);
  process.exit(1);
});
