/**
 * 修复数据库中错误的占位图路径 /static/uploads/placeholder.jpg
 * 用法: npm run db:fix-placeholder-images
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const [result] = await conn.query(`
    UPDATE product
    SET cover_image = CONCAT('https://picsum.photos/seed/product', id, '/400/400')
    WHERE cover_image LIKE '%placeholder%'
       OR cover_image = '/static/uploads/placeholder.jpg'
  `);

  console.log(`✅ 已修复 ${result.affectedRows} 条商品封面图`);
  await conn.end();
}

run().catch((err) => {
  console.error('❌ 修复失败:', err.message);
  process.exit(1);
});
