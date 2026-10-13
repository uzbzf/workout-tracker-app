const { getClient } = require('./connection');

/**
 * Выполняет SELECT и возвращает массив строк (объектов).
 */
const getRows = async (sql, args = []) => {
  const result = await getClient().execute({ sql, args });
  return result.rows.map((row) => ({ ...row }));
};

/**
 * Выполняет SELECT и возвращает одну строку или null.
 */
const getRow = async (sql, args = []) => {
  const rows = await getRows(sql, args);
  return rows[0] || null;
};

/**
 * Выполняет INSERT / UPDATE / DELETE.
 */
const runQuery = async (sql, args = []) => {
  return getClient().execute({ sql, args });
};

module.exports = {
  getRows,
  getRow,
  runQuery,
};
