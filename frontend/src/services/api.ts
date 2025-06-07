import axios from 'axios';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
      
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  register: (name: string, email: string, password: string) => 
    api.post('/auth/register', { name, email, password }),
  
  forgotPassword: (email: string) => 
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, newPassword: string) => 
    api.post('/auth/reset-password', { token, newPassword }),
  
  getCurrentUser: () => 
    api.get('/auth/me'),
};

// Habits API
export const habitsAPI = {
  getHabits: () => 
    api.get('/habits'),
  
  createHabit: (habitData: any) => 
    api.post('/habits', habitData),
  
  updateHabit: (habitId: string, habitData: any) => 
    api.put(`/habits/${habitId}`, habitData),
  
  deleteHabit: (habitId: string) => 
    api.delete(`/habits/${habitId}`),
  
  trackHabit: (habitId: string, completed: boolean) => 
    api.post(`/habits/${habitId}/track`, { completed }),
};

// Focus Sessions API
export const sessionsAPI = {
  getSessions: () => 
    api.get('/personalization/sessions'),
  
  createSession: (sessionData: any) => 
    api.post('/personalization/sessions', sessionData),
  
  updateSession: (sessionId: string, sessionData: any) => 
    api.put(`/personalization/sessions/${sessionId}`, sessionData),
  
  deleteSession: (sessionId: string) => 
    api.delete(`/personalization/sessions/${sessionId}`),
};

// User preferences API
export const preferencesAPI = {
  getPreferences: () => 
    api.get('/personalization/preferences'),
  
  updatePreferences: (preferencesData: any) => 
    api.put('/personalization/preferences', preferencesData),
};

export default api; 