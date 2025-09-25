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
    register: (userData) => apiClient.post('/auth/register', userData),
    login: (credentials) => apiClient.post('/auth/login', credentials),
    logout: () => apiClient.post('/auth/logout'),
    getMe: () => apiClient.get('/auth/me'),
  },

  // AI endpoints
  ai: {
    generateExplanation: (data) => apiClient.post('/ai/generate-explanation', data),
    generateQuestions: (data) => apiClient.post('/ai/generate-questions', data),
    generateLearningPath: (data) => apiClient.post('/ai/generate-learning-path', data),
    submitQuiz: (data) => apiClient.post('/ai/submit-quiz', data),
    chat: (data) => apiClient.post('/ai/chat', data),
  },

  // Learning endpoints
  learning: {
    getCourses: (params) => apiClient.get('/learning/courses', { params }),
    getCourse: (courseId) => apiClient.get(`/learning/courses/${courseId}`),
    enrollCourse: (courseId) => apiClient.post(`/learning/courses/${courseId}/enroll`),
    completeModule: (courseId, moduleId) => 
      apiClient.post(`/learning/courses/${courseId}/modules/${moduleId}/complete`),
    getMyCourses: () => apiClient.get('/learning/my-courses'),
    getRecommendations: () => apiClient.get('/learning/recommendations'),
  },

  // Gamification endpoints
  gamification: {
    getAchievements: () => apiClient.get('/gamification/achievements'),
    getLeaderboard: (params) => apiClient.get('/gamification/leaderboard', { params }),
    getProgress: () => apiClient.get('/gamification/progress'),
    awardXP: (data) => apiClient.post('/gamification/award-xp', data),
    getChallenges: () => apiClient.get('/gamification/challenges'),
  },

  // User endpoints
  user: {
    getProfile: () => apiClient.get('/user/profile'),
    updatePreferences: (preferences) => apiClient.put('/user/preferences', preferences),
    getAnalytics: (params) => apiClient.get('/user/analytics', { params }),
    setGoals: (goals) => apiClient.post('/user/goals', goals),
    getGoals: () => apiClient.get('/user/goals'),
    updateMood: (mood) => apiClient.post('/user/mood', mood),
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