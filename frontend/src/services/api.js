import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Handle network errors
    if (!error.response) {
      error.message = 'Network error. Please check your connection.';
    }
    
    return Promise.reject(error);
  }
);

// API methods organized by feature
const api = {
  // Set auth token method
  setAuthToken: (token) => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  },

  // Authentication endpoints
  auth: {
    register: (userData) => apiClient.post('/api/auth/register', userData),
    login: (credentials) => apiClient.post('/api/auth/login', credentials),
    logout: () => apiClient.post('/api/auth/logout'),
    getMe: () => apiClient.get('/api/auth/profile'),
  },

  // AI endpoints
  ai: {
    generateExplanation: (data) => apiClient.post('/api/ai/generate-explanation', data),
    generateQuestions: (data) => apiClient.post('/api/ai/generate-questions', data),
    generateLearningPath: (data) => apiClient.post('/api/ai/generate-learning-path', data),
    submitQuiz: (data) => apiClient.post('/api/ai/submit-quiz', data),
    chat: (data) => apiClient.post('/api/ai/chat', data),
  },

  // Learning endpoints
  learning: {
    getCourses: (params) => apiClient.get('/api/learning/courses', { params }),
    getCourse: (courseId) => apiClient.get(`/api/learning/courses/${courseId}`),
    enrollCourse: (courseId) => apiClient.post(`/api/learning/courses/${courseId}/enroll`),
    completeModule: (courseId, moduleId) => 
      apiClient.post(`/api/learning/courses/${courseId}/modules/${moduleId}/complete`),
    getMyCourses: () => apiClient.get('/api/learning/my-courses'),
    getRecommendations: () => apiClient.get('/api/learning/recommendations'),
  },

  // Gamification endpoints
  gamification: {
    getAchievements: () => apiClient.get('/api/gamification/achievements'),
    getLeaderboard: (params) => apiClient.get('/api/gamification/leaderboard', { params }),
    getProgress: () => apiClient.get('/api/gamification/progress'),
    awardXP: (data) => apiClient.post('/api/gamification/award-xp', data),
    getChallenges: () => apiClient.get('/api/gamification/challenges'),
  },

  // User endpoints
  user: {
    getProfile: () => apiClient.get('/api/user/profile'),
    updatePreferences: (preferences) => apiClient.put('/api/user/preferences', preferences),
    getAnalytics: (params) => apiClient.get('/api/user/analytics', { params }),
    setGoals: (goals) => apiClient.post('/api/user/goals', goals),
    getGoals: () => apiClient.get('/api/user/goals'),
    updateMood: (mood) => apiClient.post('/api/user/mood', mood),
    getWellness: () => apiClient.get('/user/wellness'),
  },

  // Health check
  health: () => apiClient.get('/health'),
};

// Utility functions
api.handleError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.message || error.response.data?.error || 'Server error',
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    // Request made but no response received
    return {
      message: 'Network error. Please check your connection.',
      status: 0,
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: 0,
    };
  }
};

api.isNetworkError = (error) => {
  return !error.response && error.request;
};

api.isAuthError = (error) => {
  return error.response?.status === 401;
};

api.isServerError = (error) => {
  return error.response?.status >= 500;
};

export default api;