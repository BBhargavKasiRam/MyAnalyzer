import axios from 'axios';

// Supports BACKEND_URL (non-VITE prefix), __BACKEND_URL__ injected at build, or /api fallback
let rawBaseURL =
  (typeof __BACKEND_URL__ !== 'undefined' && __BACKEND_URL__) ||
  import.meta.env.BACKEND_URL ||
  import.meta.env.VITE_API_URL ||
  '/api';

if (rawBaseURL.startsWith('http')) {
  rawBaseURL = rawBaseURL.replace(/\/+$/, '');
  if (!rawBaseURL.endsWith('/api')) {
    rawBaseURL = `${rawBaseURL}/api`;
  }
}

const api = axios.create({
  baseURL: rawBaseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Users
export const getUsers = async () => {
  const res = await api.get('/users');
  return res.data;
};

export const getUser = async (id) => {
  const res = await api.get(`/users/${id}`);
  return res.data;
};

export const createUser = async (userData) => {
  const res = await api.post('/users', userData);
  return res.data;
};

export const updateUser = async (id, userData) => {
  const res = await api.put(`/users/${id}`, userData);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await api.delete(`/users/${id}`);
  return res.data;
};

// Sync
export const syncUser = async (id, force = true) => {
  const res = await api.post(`/users/${id}/sync${force ? '?force=true' : '?force=false'}`);
  return res.data;
};

export const syncAllUsers = async () => {
  const res = await api.post('/users/sync-all');
  return res.data;
};

// Comparison Analytics (Daily, Weekly, Monthly)
export const getComparisonData = async (period = 'week', userIds = '') => {
  const params = { period };
  if (userIds) params.userIds = userIds;
  const res = await api.get('/comparison', { params });
  return res.data;
};

// Heatmap
export const getUserHeatmap = async (id) => {
  const res = await api.get(`/users/${id}/heatmap`);
  return res.data;
};

// Problems
export const getUserProblems = async (id, params = {}) => {
  const res = await api.get(`/users/${id}/problems`, { params });
  return res.data;
};

// Leaderboard
export const getLeaderboard = async (params = {}) => {
  const query = typeof params === 'string' ? { sortBy: params } : params;
  const res = await api.get('/leaderboard', { params: query });
  return res.data;
};

// Health
export const getHealth = async () => {
  const res = await api.get('/health');
  return res.data;
};

export default api;
