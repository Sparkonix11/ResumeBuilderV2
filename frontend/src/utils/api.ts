import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  login: (credentials: { email: string; password: string }) => 
    api.post('/auth/login', credentials),
  register: (userData: { name: string; email: string; password: string; phone: string }) => 
    api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
};

// Education endpoints
export const educationAPI = {
  getAll: () => api.get('/education'),
  getById: (id: string) => api.get(`/education/${id}`),
  create: (data: unknown) => api.post('/education', data),
  update: (id: string, data: unknown) => api.put(`/education/${id}`, data),
  delete: (id: string) => api.delete(`/education/${id}`),
};

// Experience endpoints
export const experienceAPI = {
  getAll: () => api.get('/experience'),
  getById: (id: string) => api.get(`/experience/${id}`),
  create: (data: unknown) => api.post('/experience', data),
  update: (id: string, data: unknown) => api.put(`/experience/${id}`, data),
  delete: (id: string) => api.delete(`/experience/${id}`),
};

// Projects endpoints
export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id: string) => api.get(`/projects/${id}`),
  create: (data: unknown) => api.post('/projects', data),
  update: (id: string, data: unknown) => api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

// Skills endpoints
export const skillsAPI = {
  getAll: () => api.get('/skills'),
  create: (data: unknown) => api.post('/skills', data),
  update: (id: string, data: unknown) => api.put(`/skills/${id}`, data),
  delete: (id: string) => api.delete(`/skills/${id}`),
};

// Links endpoints
export const linksAPI = {
  getAll: () => api.get('/links'),
  create: (data: unknown) => api.post('/links', data),
  update: (id: string, data: unknown) => api.put(`/links/${id}`, data),
  delete: (id: string) => api.delete(`/links/${id}`),
};

// Achievements endpoints
export const achievementsAPI = {
  getAll: () => api.get('/achievements'),
  create: (data: unknown) => api.post('/achievements', data),
  update: (id: string, data: unknown) => api.put(`/achievements/${id}`, data),
  delete: (id: string) => api.delete(`/achievements/${id}`),
};

export default api;