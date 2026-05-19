/**
 * 任务中心：签到表、任务完成记录表
 * 运行: node scripts/migrate-task.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

const statements = [
  `CREATE TABLE IF NOT EXISTS \`user_checkin\` (
    \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    \`user_id\` BIGINT UNSIGNED NOT NULL,
    \`checkin_date\` DATE NOT NULL,
    \`points\` INT NOT NULL DEFAULT 10,
    \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`uk_user_checkin_date\` (\`user_id\`, \`checkin_date\`),
    KEY \`idx_user_id\` (\`user_id\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户每日签到'`,
  `CREATE TABLE IF NOT EXISTS \`user_task_log\` (
    \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    \`user_id\` BIGINT UNSIGNED NOT NULL,
    \`task_type\` VARCHAR(32) NOT NULL,
    \`period_key\` VARCHAR(32) NOT NULL,
    \`ref_id\` BIGINT UNSIGNED DEFAULT NULL,
    \`points\` INT NOT NULL DEFAULT 10,
    \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`uk_user_task_period\` (\`user_id\`, \`task_type\`, \`period_key\`),
    KEY \`idx_user_task_type\` (\`user_id\`, \`task_type\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户任务完成记录'`,
];

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  for (const sql of statements) {
    await conn.query(sql);
    console.log('OK:', sql.slice(0, 60).replace(/\s+/g, ' ') + '...');
  }
  await conn.end();
  console.log('migrate-task done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
