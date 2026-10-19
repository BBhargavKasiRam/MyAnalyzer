import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
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
export const syncUser = async (id, force = false) => {
  const res = await api.post(`/users/${id}/sync${force ? '?force=true' : ''}`);
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
export const getLeaderboard = async (sortBy = 'totalSolved') => {
  const res = await api.get(`/leaderboard?sortBy=${sortBy}`);
  return res.data;
};

// Health
export const getHealth = async () => {
  const res = await api.get('/health');
  return res.data;
};

export default api;
