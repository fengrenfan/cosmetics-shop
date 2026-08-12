import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  // 环境变量校验
  const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
  const missing = requiredEnvVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    console.error(`❌ 缺少必要的环境变量: ${missing.join(', ')}`);
    console.error('请复制 .env.example 为 .env 并填写实际值');
    process.exit(1);
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 静态文件服务（上传的图片）
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  // 全局前缀
  app.setGlobalPrefix('api');

  // 跨域
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 请求日志中间件（调试用）
  app.use((req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT') {
      console.log(req.method + " " + req.url, JSON.stringify(req.body, null, 2));
    }
    next();
  });

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        console.log('Validation Errors:', JSON.stringify(errors, null, 2));
        const messages = errors.map(err => 
          Object.values(err.constraints || {}).join(', ')
        ).join('; ');
        return new (require('@nestjs/common').BadRequestException)(messages);
      },
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
}

bootstrap();
