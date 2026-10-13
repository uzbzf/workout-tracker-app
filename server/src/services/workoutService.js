const { v4: uuidv4 } = require('uuid');
const { getRows, getRow, runQuery } = require('../db/helpers');

const getAllWorkouts = async (userId, filters = {}) => {
  let query = 'SELECT * FROM workouts WHERE user_id = ?';
  const params = [userId];

  if (filters.workoutType) {
    query += ' AND workout_type = ?';
    params.push(filters.workoutType);
  }
  if (filters.dateFrom) {
    query += ' AND date >= ?';
    params.push(filters.dateFrom);
  }
  if (filters.dateTo) {
    query += ' AND date <= ?';
    params.push(filters.dateTo);
  }

  query += ' ORDER BY date DESC';
  const limit = filters.limit ? parseInt(filters.limit, 10) : 50;
  const offset = filters.offset ? parseInt(filters.offset, 10) : 0;
  query += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);

  return getRows(query, params);
};

const getWorkoutById = async (userId, id) => {
  return getRow('SELECT * FROM workouts WHERE id = ? AND user_id = ?', [id, userId]);
};

const createWorkout = async (userId, data) => {
  const id = uuidv4();
  const now = new Date().toISOString();

  await runQuery(
    `INSERT INTO workouts (id, workout_type, exercise, weight, reps, duration, date, comment, user_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.workout_type,
      data.exercise,
      data.weight !== undefined ? data.weight : null,
      data.reps !== undefined ? data.reps : null,
      data.duration !== undefined ? data.duration : null,
      data.date,
      data.comment || null,
      userId,
      now,
      now,
    ]
  );

  return getWorkoutById(userId, id);
};

const updateWorkout = async (userId, id, data) => {
  const existing = await getWorkoutById(userId, id);
  if (!existing) return null;

  const now = new Date().toISOString();
  await runQuery(
    `UPDATE workouts SET workout_type = ?, exercise = ?, weight = ?, reps = ?, duration = ?, date = ?, comment = ?, updated_at = ?
     WHERE id = ? AND user_id = ?`,
    [
      data.workout_type !== undefined ? data.workout_type : existing.workout_type,
      data.exercise !== undefined ? data.exercise : existing.exercise,
      data.weight !== undefined ? data.weight : existing.weight,
      data.reps !== undefined ? data.reps : existing.reps,
      data.duration !== undefined ? data.duration : existing.duration,
      data.date !== undefined ? data.date : existing.date,
      data.comment !== undefined ? data.comment : existing.comment,
      now,
      id,
      userId,
    ]
  );

  return getWorkoutById(userId, id);
};

const deleteWorkout = async (userId, id) => {
  const existing = await getWorkoutById(userId, id);
  if (!existing) return false;

  await runQuery('DELETE FROM workouts WHERE id = ? AND user_id = ?', [id, userId]);
  return true;
};

module.exports = {
  getAllWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
};
