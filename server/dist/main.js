"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
    const missing = requiredEnvVars.filter((v) => !process.env[v]);
    if (missing.length > 0) {
        console.error(`❌ 缺少必要的环境变量: ${missing.join(', ')}`);
        console.error('请复制 .env.example 为 .env 并填写实际值');
        process.exit(1);
    }
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'uploads'), { prefix: '/uploads' });
    app.setGlobalPrefix('api');
    const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').filter(Boolean);
    app.enableCors({
        origin: allowedOrigins.length > 0 ? allowedOrigins : false,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    app.use((req, res, next) => {
        if (process.env.NODE_ENV === 'production') {
            next();
            return;
        }
        if (req.method === 'POST' || req.method === 'PUT') {
            const body = { ...req.body };
            for (const key of ['password', 'token', 'password_hash', 'code']) {
                if (body[key])
                    body[key] = '***';
            }
            console.log(req.method + " " + req.url, JSON.stringify(body));
        }
        next();
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        exceptionFactory: (errors) => {
            console.log('Validation Errors:', JSON.stringify(errors, null, 2));
            const messages = errors.map(err => Object.values(err.constraints || {}).join(', ')).join('; ');
            return new (require('@nestjs/common').BadRequestException)(messages);
        },
    }));
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 Server running on http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map