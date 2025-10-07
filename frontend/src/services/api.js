import axios from 'axios';

// FIXED: Use REACT_APP_API_URL for the backend URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('flickerToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Handle token expiration and errors
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    
    // Handle token expiration
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('flickerToken');
      localStorage.removeItem('flickerPlayer');
      window.location.reload(); // Force re-authentication
    }
    
    return Promise.reject(error);
  }
);

export const playerAPI = {
  // Register a new player with email and password
  register: async ({ name, email, password }) => {
    try {
      const response = await api.post('/players/register', { 
        name, 
        email, 
        password 
      });
      
      if (response.data.success && response.data.token) {
        // Store token and player data
        localStorage.setItem('flickerToken', response.data.token);
        localStorage.setItem('flickerPlayer', JSON.stringify(response.data.player));
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Login player with email and password
  login: async ({ email, password }) => {
    try {
      const response = await api.post('/players/login', { 
        email, 
        password 
      });
      
      if (response.data.success && response.data.token) {
        // Store token and player data
        localStorage.setItem('speedsterToken', response.data.token);
        localStorage.setItem('speedsterPlayer', JSON.stringify(response.data.player));
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  // Get current player profile (requires authentication)
  getProfile: async () => {
    try {
      const response = await api.get('/players/profile');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get profile');
    }
  },

  // Submit score (requires authentication)
  submitScore: async (gameMode, score) => {
    try {
      const response = await api.post('/players/score', {
        gameMode,
        score
      });
      
      if (response.data.success && response.data.player) {
        // Update stored player data
        localStorage.setItem('speedsterPlayer', JSON.stringify(response.data.player));
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Score submission failed');
    }
  },

  // Get leaderboard for specific game mode
  getLeaderboard: async (gameMode) => {
    try {
      const response = await api.get(`/players/leaderboard/${gameMode}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get leaderboard');
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw new Error('Server is not responding');
    }
  },

  // Logout (clear local storage)
  logout: () => {
    localStorage.removeItem('speedsterToken');
    localStorage.removeItem('speedsterPlayer');
  }
};

export default api;
