require('dotenv').config();
const path = require('path');

/* Разрешённые origin для CORS (через запятую в CLIENT_URL) */
const buildCorsOrigin = () => {
  if (process.env.CLIENT_URL) {
    const list = process.env.CLIENT_URL.split(',').map((s) => s.trim()).filter(Boolean);
    return list.length === 1 ? list[0] : list;
  }

  /* На Vercel разрешаем тот же домен деплоя */
  if (process.env.VERCEL_URL) {
    return [`https://${process.env.VERCEL_URL}`, 'http://localhost:5173'];
  }

  return 'http://localhost:5173';
};

const config = {
  port: process.env.PORT || 3001,

  corsOptions: {
    origin: buildCorsOrigin(),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },

  turso: {
    url: process.env.TURSO_DATABASE_URL || '',
    authToken: process.env.TURSO_AUTH_TOKEN || '',
  },

  schemaPath: path.join(__dirname, '../db/schema.sql'),

  jwtSecret: process.env.JWT_SECRET || 'workout-tracker-dev-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};

module.exports = config;
