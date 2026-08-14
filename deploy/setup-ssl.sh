#!/bin/bash
# 唯伊美妆 - 域名 + SSL 证书配置脚本
# 在服务器上以 root 权限运行: sudo bash deploy/setup-ssl.sh

set -e

DOMAIN="xiaodigua.shop"
EMAIL="admin@xiaodigua.shop"  # 修改为你的邮箱，用于 Let's Encrypt 通知
APP_DIR="/home/ubuntu/app"

echo "=========================================="
echo "  唯伊美妆 - 域名 + SSL 配置"
echo "=========================================="

# 1. 更新系统并安装 Nginx
echo ""
echo "[1/6] 安装 Nginx..."
apt-get update
apt-get install -y nginx
systemctl enable nginx
systemctl start nginx

# 2. 安装 Certbot
echo ""
echo "[2/6] 安装 Certbot..."
apt-get install -y certbot python3-certbot-nginx

# 3. 创建 Webroot 目录
echo ""
echo "[3/6] 创建 Webroot 目录..."
mkdir -p /var/www/certbot

# 4. 先配置 HTTP，用于 Let's Encrypt 验证
echo ""
echo "[4/6] 配置临时 HTTP 配置..."
cat > /etc/nginx/sites-available/temp-http.conf << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name xiaodigua.shop www.xiaodigua.shop;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
EOF

ln -sf /etc/nginx/sites-available/temp-http.conf /etc/nginx/sites-enabled/temp-http.conf
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# 5. 申请 SSL 证书
echo ""
echo "[5/6] 申请 SSL 证书..."
echo "请确保域名 ${DOMAIN} 已解析到此服务器 IP: $(curl -s ifconfig.me)"
echo "按 Enter 继续..."
read -r

certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  -d "${DOMAIN}" \
  -d "www.${DOMAIN}" \
  --email "${EMAIL}" \
  --agree-tos \
  --no-eff-email \
  --force-renewal

# 6. 配置正式 Nginx
echo ""
echo "[6/6] 配置正式 Nginx..."
cp "${APP_DIR}/deploy/nginx/xiaodigua.shop.conf" /etc/nginx/sites-available/xiaodigua.shop.conf
ln -sf /etc/nginx/sites-available/xiaodigua.shop.conf /etc/nginx/sites-enabled/xiaodigua.shop.conf
rm -f /etc/nginx/sites-enabled/temp-http.conf

# 测试并重载
nginx -t && systemctl reload nginx

# 7. 设置证书自动续期
echo ""
echo "设置证书自动续期..."
echo "0 0,12 * * * root certbot renew --quiet --post-hook 'systemctl reload nginx'" > /etc/cron.d/certbot-renew

# 8. 配置防火墙
echo ""
echo "配置防火墙..."
ufw allow 'Nginx Full'
ufw allow 22
ufw allow 3001
ufw allow 9090
echo "y" | ufw enable

echo ""
echo "=========================================="
echo "  配置完成!"
echo "=========================================="
echo ""
echo "访问地址:"
echo "  管理后台: https://${DOMAIN}/admin/"
echo "  H5 小程序: https://${DOMAIN}/miniapp/"
echo "  DevOps:   https://${DOMAIN}/devops/"
echo "  API:      https://${DOMAIN}/api/"
echo ""
echo "证书续期已自动配置，每12小时检查一次"
echo ""
