export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  appUrl: process.env.APP_URL || 'http://localhost:5173',
  apiUrl: process.env.API_URL || 'http://localhost:3000',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  database: {
    url: process.env.DATABASE_URL,
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_access_secret',
    accessTtl: process.env.JWT_ACCESS_TTL || '900s',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
    refreshTtl: process.env.JWT_REFRESH_TTL || '7d',
  },

  storage: {
    driver: process.env.STORAGE_DRIVER || 'local',
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || 'us-east-1',
    accessKey: process.env.S3_ACCESS_KEY,
    secretKey: process.env.S3_SECRET_KEY,
    bucket: process.env.S3_BUCKET || 'gofla-products',
    publicUrl: process.env.S3_PUBLIC_URL,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  },

  mail: {
    host: process.env.MAIL_HOST || 'localhost',
    port: parseInt(process.env.MAIL_PORT || '1025', 10),
    user: process.env.MAIL_USER,
    password: process.env.MAIL_PASSWORD,
    from: process.env.MAIL_FROM || 'Gofla <no-reply@gofla.com>',
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  },

  commerce: {
    currency: process.env.DEFAULT_CURRENCY || 'USD',
    shippingFlatFee: parseFloat(process.env.SHIPPING_FLAT_FEE || '5'),
    freeShippingThreshold: parseFloat(process.env.FREE_SHIPPING_THRESHOLD || '60'),
    taxRate: parseFloat(process.env.TAX_RATE || '0.10'),
    returnWindowDays: parseInt(process.env.RETURN_WINDOW_DAYS || '30', 10),
    reviewModeration: process.env.REVIEW_MODERATION !== 'false',
  },
});
