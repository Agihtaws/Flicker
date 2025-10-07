const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');
const playerRoutes = require('./routes/players');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://your-frontend-app-name.onrender.com'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/players', playerRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Speedster Arena API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Speedster Arena Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      register: 'POST /api/players/register',
      login: 'POST /api/players/login',
      profile: 'GET /api/players/profile',
      submitScore: 'POST /api/players/score',
      leaderboard: 'GET /api/players/leaderboard/:gameMode'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'API endpoint not found',
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'POST /api/players/register',
      'POST /api/players/login',
      'GET /api/players/profile',
      'POST /api/players/score',
      'GET /api/players/leaderboard/:gameMode'
    ]
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Speedster Arena API server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});
