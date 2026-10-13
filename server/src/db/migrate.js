/**
 * Скрипт применения схемы к базе Turso.
 * Запуск: npm run db:migrate
 *
 * Перед запуском заполните TURSO_DATABASE_URL и TURSO_AUTH_TOKEN в .env
 */
require('dotenv').config();

const { initDb } = require('./connection');

const migrate = async () => {
  console.log('[MIGRATE] Применение schema.sql к Turso...');
  await initDb();
  console.log('[MIGRATE] Готово.');
  process.exit(0);
};

migrate().catch((error) => {
  console.error('[MIGRATE] Ошибка:', error);
  process.exit(1);
});
