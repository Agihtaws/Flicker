const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Player = require('../models/Player');

// Generate JWT token
const generateToken = (playerId) => {
  return jwt.sign({ playerId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register a new player
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and password are required' 
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name must be at least 2 characters long' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if email already exists
    const existingPlayer = await Player.findOne({ email: email.toLowerCase() });
    if (existingPlayer) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Create new player
    const player = new Player({
      name: name.trim(),
      email: email.toLowerCase(),
      password
    });

    await player.save();
    
    // Generate token
    const token = generateToken(player._id);
    
    res.status(201).json({
      success: true,
      message: 'Player registered successfully',
      token,
      player: {
        id: player._id,
        name: player.name,
        email: player.email,
        scores: player.scores,
        gamesPlayed: player.gamesPlayed
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
});

// Login player
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Find player by email
    const player = await Player.findOne({ email: email.toLowerCase() });
    if (!player) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isPasswordValid = await player.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Generate token
    const token = generateToken(player._id);
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      player: {
        id: player._id,
        name: player.name,
        email: player.email,
        scores: player.scores,
        gamesPlayed: player.gamesPlayed
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const player = await Player.findById(decoded.playerId);
    
    if (!player) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }

    req.player = player;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

// Submit score (protected route)
router.post('/score', authenticateToken, async (req, res) => {
  try {
    const { gameMode, score } = req.body;
    const player = req.player;
    
    if (!gameMode || typeof score !== 'number') {
      return res.status(400).json({ 
        success: false, 
        message: 'Game mode and score are required' 
      });
    }

    if (!['standard', 'timeAttack', 'precision'].includes(gameMode)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid game mode' 
      });
    }

    if (score < 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Score cannot be negative' 
      });
    }

    // Update score only if it's higher than current high score
    const currentHighScore = player.scores[gameMode];
    const isNewHighScore = score > currentHighScore;
    
    if (isNewHighScore) {
      player.scores[gameMode] = score;
    }
    
    player.gamesPlayed += 1;
    player.lastPlayedAt = new Date();
    
    await player.save();
    
    res.json({
      success: true,
      message: isNewHighScore ? 'New high score!' : 'Score submitted',
      isNewHighScore,
      currentScore: score,
      highScore: player.scores[gameMode],
      player: {
        id: player._id,
        name: player.name,
        email: player.email,
        scores: player.scores,
        gamesPlayed: player.gamesPlayed
      }
    });

  } catch (error) {
    console.error('Score submission error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during score submission' 
    });
  }
});

// Get leaderboard for specific game mode
router.get('/leaderboard/:gameMode', async (req, res) => {
  try {
    const { gameMode } = req.params;
    
    if (!['standard', 'timeAttack', 'precision'].includes(gameMode)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid game mode' 
      });
    }

    const sortField = `scores.${gameMode}`;
    const players = await Player.find({ [sortField]: { $gt: 0 } })
      .sort({ [sortField]: -1 })
      .limit(10)
      .select('name email scores gamesPlayed');
    
    const leaderboard = players.map((player, index) => ({
      rank: index + 1,
      name: player.name,
      email: player.email, // Include email for identification
      score: player.scores[gameMode],
      gamesPlayed: player.gamesPlayed
    }));
    
    res.json({
      success: true,
      gameMode,
      leaderboard
    });

  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching leaderboard' 
    });
  }
});

// Get current player profile (protected route)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const player = req.player;
    
    res.json({
      success: true,
      player: {
        id: player._id,
        name: player.name,
        email: player.email,
        scores: player.scores,
        gamesPlayed: player.gamesPlayed,
        createdAt: player.createdAt,
        lastPlayedAt: player.lastPlayedAt
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching profile' 
    });
  }
});

module.exports = router;
