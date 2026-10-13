/**
 * Точка входа Express API для Vercel Serverless.
 * Запросы /api/* и /health проксируются сюда через vercel.json.
 */
const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '../server/.env'),
});

const { ensureDb } = require('../server/src/db/connection');
const app = require('../server/src/app');

module.exports = async (req, res) => {
  try {
    await ensureDb();
  } catch (error) {
    console.error('[API] Ошибка инициализации БД:', error.message || error);
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: {
          code: 503,
          message:
            'База данных недоступна. Проверьте TURSO_DATABASE_URL и TURSO_AUTH_TOKEN.',
        },
      })
    );
    return;
  }

  return app(req, res);
};
