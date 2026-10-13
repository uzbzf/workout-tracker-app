const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getRow, runQuery } = require('../db/helpers');
const config = require('../config');

/**
 * Регистрирует нового пользователя
 * @param {Object} data - { email, password, name }
 * @returns {Object} - { user, token }
 */
const register = async (data) => {
  const existing = await getRow('SELECT id FROM users WHERE email = ?', [data.email]);
  if (existing) {
    const error = new Error('Пользователь с таким email уже существует');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const id = uuidv4();
  const now = new Date().toISOString();

  await runQuery(
    'INSERT INTO users (id, email, password_hash, name, created_at) VALUES (?, ?, ?, ?, ?)',
    [id, data.email, passwordHash, data.name, now]
  );

  const user = await getRow(
    'SELECT id, email, name, created_at FROM users WHERE id = ?',
    [id]
  );

  const token = generateToken(user);
  return { user, token };
};

/**
 * Авторизует пользователя по email и паролю
 * @param {Object} data - { email, password }
 * @returns {Object} - { user, token }
 */
const login = async (data) => {
  const user = await getRow('SELECT * FROM users WHERE email = ?', [data.email]);

  if (!user) {
    const error = new Error('Неверный email или пароль');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.password_hash);
  if (!isPasswordValid) {
    const error = new Error('Неверный email или пароль');
    error.statusCode = 401;
    throw error;
  }

  const userWithoutPassword = {
    id: user.id,
    email: user.email,
    name: user.name,
    created_at: user.created_at,
  };

  const token = generateToken(userWithoutPassword);
  return { user: userWithoutPassword, token };
};

/**
 * Получает пользователя по ID (для эндпоинта /me)
 * @param {string} userId - ID пользователя
 * @returns {Object|null}
 */
const getUserById = async (userId) => {
  return getRow('SELECT id, email, name, created_at FROM users WHERE id = ?', [userId]);
};

/**
 * Генерирует JWT-токен для пользователя
 */
const generateToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

module.exports = {
  register,
  login,
  getUserById,
};
