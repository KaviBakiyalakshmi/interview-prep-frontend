const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');
const TOKEN_KEY = 'ip_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check that the backend is running.', 0);
  }

  if (res.status === 204) return null;

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    if (res.status === 401 && token) {
      setToken(null);
      window.dispatchEvent(new Event('auth-expired'));
    }
    let message = data?.message || data?.detail || `Request failed (${res.status})`;
    if (data?.details && typeof data.details === 'object') {
      const first = Object.values(data.details)[0];
      if (first) message = String(first);
    }
    throw new ApiError(message, res.status, data?.details);
  }
  return data;
}

const query = (params) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') sp.set(k, v);
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
};

export const api = {
  // auth
  register: (body) => request('/api/auth/register', { method: 'POST', body }),
  login: (body) => request('/api/auth/login', { method: 'POST', body }),
  me: () => request('/api/users/me'),

  // questions
  topics: () => request('/api/topics'),
  daily: () => request('/api/questions/daily'),
  check: (id, selectedIndex) => request(`/api/questions/${id}/check`, { method: 'POST', body: { selectedIndex } }),
  questions: (params) => request(`/api/questions${query(params)}`),

  // quiz
  startQuiz: (body) => request('/api/quiz/start', { method: 'POST', body }),
  submitQuiz: (attemptId, answers) => request(`/api/quiz/${attemptId}/submit`, { method: 'POST', body: { answers } }),
  result: (attemptId) => request(`/api/quiz/${attemptId}`),
  history: (page = 0, size = 20) => request(`/api/quiz/history${query({ page, size })}`),

  // stats
  stats: () => request('/api/stats/me'),
  leaderboard: (limit = 10) => request(`/api/leaderboard${query({ limit })}`),

  // bookmarks
  bookmarks: () => request('/api/bookmarks'),
  addBookmark: (id) => request(`/api/bookmarks/${id}`, { method: 'POST' }),
  removeBookmark: (id) => request(`/api/bookmarks/${id}`, { method: 'DELETE' }),

  // admin
  createQuestion: (body) => request('/api/admin/questions', { method: 'POST', body }),
  bulkQuestions: (body) => request('/api/admin/questions/bulk', { method: 'POST', body }),
};
