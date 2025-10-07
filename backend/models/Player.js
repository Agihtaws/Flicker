const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  scores: {
    standard: { type: Number, default: 0 },
    timeAttack: { type: Number, default: 0 },
    precision: { type: Number, default: 0 }
  },
  gamesPlayed: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  lastPlayedAt: { type: Date, default: Date.now }
});

// Hash password before saving
playerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
playerSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Remove password from JSON output
playerSchema.methods.toJSON = function() {
  const playerObject = this.toObject();
  delete playerObject.password;
  return playerObject;
};

// Index for faster queries
playerSchema.index({ email: 1 });
playerSchema.index({ 'scores.standard': -1 });
playerSchema.index({ 'scores.timeAttack': -1 });
playerSchema.index({ 'scores.precision': -1 });

module.exports = mongoose.model('Player', playerSchema);
