const { createClient } = require('@libsql/client');
const fs = require('fs');
const config = require('../config');

let client;
let schemaReady;

/**
 * Создаёт (или возвращает уже созданный) клиент Turso / libSQL.
 */
const getClient = () => {
  if (client) return client;

  if (!config.turso.url) {
    throw new Error(
      '[DB] Не задан TURSO_DATABASE_URL. Скопируйте .env.example в .env и укажите данные из Turso Dashboard.'
    );
  }

  client = createClient({
    url: config.turso.url,
    authToken: config.turso.authToken,
  });

  return client;
};

/**
 * Применяет schema.sql к Turso (CREATE TABLE IF NOT EXISTS).
 * Безопасно вызывать повторно — выполняется один раз за процесс.
 */
const ensureDb = async () => {
  if (schemaReady) return schemaReady;

  schemaReady = (async () => {
    const db = getClient();
    const schemaSql = fs.readFileSync(config.schemaPath, 'utf-8');
    await db.executeMultiple(schemaSql);
    console.log('[DB] Подключено к Turso:', config.turso.url);
  })();

  return schemaReady;
};

/**
 * Инициализация при локальном запуске (index.js).
 * В serverless на Vercel используйте ensureDb().
 */
const initDb = async () => {
  try {
    await ensureDb();
  } catch (error) {
    console.error('[DB] Ошибка инициализации базы данных:', error.message || error);
    process.exit(1);
  }
};

module.exports = {
  getClient,
  getDb: getClient,
  ensureDb,
  initDb,
};
