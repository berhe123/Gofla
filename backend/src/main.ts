import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });

  app.useLogger(app.get(Logger));

  // Static product images — register before global prefix / guards.
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
    maxAge: 60 * 60 * 24 * 7,
  });

  const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const isAllowedOrigin = (origin?: string) => {
    if (!origin) return true;
    if (allowedOrigins.includes(origin)) return true;
    if (process.env.NODE_ENV === 'production') {
      try {
        const host = new URL(origin).hostname;
        if (host.endsWith('.vercel.app') || host.endsWith('.onrender.com')) return true;
      } catch {
        /* ignore */
      }
    }
    return false;
  };

  app.enableCors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) return callback(null, true);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  });

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    }),
  );
  app.use(cookieParser());

  app.setGlobalPrefix('api', { exclude: ['health', 'docs'] });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger / OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Gofla API')
    .setDescription('Gofla e-commerce platform REST API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth')
    .addTag('products')
    .addTag('categories')
    .addTag('cart')
    .addTag('wishlist')
    .addTag('orders')
    .addTag('reviews')
    .addTag('studio')
    .addTag('admin')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(`🚀 Gofla API ready at http://localhost:${port} — docs at /docs`);
}

bootstrap();
