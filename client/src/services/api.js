/* На Vercel — относительный /api/v1 (тот же домен). Локально — из .env или localhost */
const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const buildQueryString = (params) => {
  if (!params || typeof params !== 'object') return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

const request = async (path, options = {}) => {
  const url = `${BASE_URL}${path}`;
  
  /* Получаем токен из localStorage */
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  /* Если токен есть, добавляем его в заголовок */
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();

    if (data.error) {
      const error = new Error(data.error.message || 'Ошибка сервера');
      error.statusCode = data.error.code || response.status;
      
      /* Если токен истёк или невалиден, очищаем localStorage и редиректим на логин */
      if (error.statusCode === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      throw error;
    }

    if (!response.ok) {
      const error = new Error(`HTTP ошибка: ${response.status}`);
      error.statusCode = response.status;
      throw error;
    }

    if (data.data !== undefined) {
      return data.pagination ? { data: data.data, pagination: data.pagination } : data.data;
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const networkError = new Error('Ошибка сети. Проверьте подключение к серверу.');
      networkError.statusCode = 0;
      throw networkError;
    }
    throw error;
  }
};

export const get = (path, params) => {
  const queryString = buildQueryString(params);
  return request(`${path}${queryString}`, { method: 'GET' });
};

export const post = (path, body) => {
  return request(path, { method: 'POST', body: JSON.stringify(body) });
};

export const put = (path, body) => {
  return request(path, { method: 'PUT', body: JSON.stringify(body) });
};

export const del = (path) => {
  return request(path, { method: 'DELETE' });
};

export default { get, post, put, del };
