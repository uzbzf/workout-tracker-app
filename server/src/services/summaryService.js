const { getRows, getRow } = require('../db/helpers');

const getSummaryStats = async (userId) => {
  const row = await getRow(
    `SELECT COUNT(*) as totalWorkouts,
            COALESCE(SUM(duration), 0) as totalTime,
            COALESCE(SUM(COALESCE(weight, 0) * COALESCE(reps, 0)), 0) as totalWeight,
            CASE WHEN COUNT(*) > 0 THEN ROUND(COALESCE(SUM(duration), 0) * 1.0 / COUNT(*), 1) ELSE 0 END as avgDuration
     FROM workouts WHERE user_id = ?`,
    [userId]
  );

  return (
    row || {
      totalWorkouts: 0,
      totalTime: 0,
      totalWeight: 0,
      avgDuration: 0,
    }
  );
};

const getProgressData = async (userId, exerciseName = null) => {
  let sql = 'SELECT date, weight, reps FROM workouts WHERE user_id = ? AND weight IS NOT NULL';
  const params = [userId];

  if (exerciseName) {
    sql += ' AND exercise = ?';
    params.push(exerciseName);
  }

  sql += ' ORDER BY date ASC';
  return getRows(sql, params);
};

const getActivityData = async (userId, period = 'week', count = 8) => {
  const rows = await getRows(
    'SELECT date FROM workouts WHERE user_id = ? ORDER BY date ASC',
    [userId]
  );

  const activity = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    let periodStart, periodEnd, label;

    if (period === 'month') {
      periodStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthNames = [
        'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
        'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек',
      ];
      label = monthNames[periodStart.getMonth()];
    } else {
      periodStart = new Date(now);
      periodStart.setDate(now.getDate() - i * 7 - now.getDay());
      periodStart.setHours(0, 0, 0, 0);
      periodEnd = new Date(periodStart);
      periodEnd.setDate(periodStart.getDate() + 6);
      periodEnd.setHours(23, 59, 59, 999);
      label = `${periodStart.getDate()}.${String(periodStart.getMonth() + 1).padStart(2, '0')}`;
    }

    const workoutCount = rows.filter((row) => {
      const workoutDate = new Date(row.date);
      return workoutDate >= periodStart && workoutDate <= periodEnd;
    }).length;

    activity.push({ period: label, count: workoutCount });
  }

  return activity;
};

module.exports = { getSummaryStats, getProgressData, getActivityData };
