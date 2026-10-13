const { v4: uuidv4 } = require('uuid');
const { getRows, getRow, runQuery } = require('../db/helpers');

/**
 * Получает список всех упражнений, отсортированный по алфавиту
 */
const getAllExercises = async () => {
  return getRows('SELECT * FROM exercises ORDER BY name ASC');
};

/**
 * Получает одно упражнение по ID
 */
const getExerciseById = async (id) => {
  return getRow('SELECT * FROM exercises WHERE id = ?', [id]);
};

/**
 * Создаёт новое упражнение в справочнике
 */
const createExercise = async (data) => {
  const id = uuidv4();
  const now = new Date().toISOString();
  const isCustom = data.isCustom ? 1 : 0;

  await runQuery(
    'INSERT INTO exercises (id, name, is_custom, created_at) VALUES (?, ?, ?, ?)',
    [id, data.name, isCustom, now]
  );

  return getExerciseById(id);
};

/**
 * Обновляет название существующего упражнения
 */
const updateExercise = async (id, data) => {
  const existing = await getExerciseById(id);
  if (!existing) return null;

  await runQuery('UPDATE exercises SET name = ? WHERE id = ?', [data.name, id]);
  return getExerciseById(id);
};

/**
 * Удаляет упражнение по ID
 */
const deleteExercise = async (id) => {
  const existing = await getExerciseById(id);
  if (!existing) return false;

  await runQuery('DELETE FROM exercises WHERE id = ?', [id]);
  return true;
};

module.exports = {
  getAllExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
};
