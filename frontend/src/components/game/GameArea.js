import React, { useRef } from 'react';
import { animated, useSpring } from 'react-spring';
import LevelUpNotification from '../ui/LevelUpNotification';
import ParticleExplosion from '../effects/ParticleExplosion';
import FloatingText from '../effects/FloatingText';

function GameArea({
  gameMode,
  shakeAnimation,
  handleBackgroundClick,
  score,
  timeLeft,
  level,
  missedClicks,
  multiplierActive,
  scoreMultiplier,
  multiplierTimeLeft,
  showLevelUp,
  targets,
  handleTargetClick,
  powerUps,
  handlePowerUpClick,
  floatingTexts,
  removeFloatingText,
  explosions,
  removeExplosion
}) {
  const gameAreaRef = useRef(null);

  // Dynamic background animation based on level
  const backgroundAnimation = useSpring({
    background: `radial-gradient(circle at 50% 50%, 
      hsl(${(level * 30) % 360}, 60%, 8%) 0%, 
      hsl(${(level * 30 + 60) % 360}, 40%, 5%) 50%, 
      rgb(10, 10, 15) 100%)`,
    config: { duration: 2000 }
  });

  // Time warning animation when time is low
  const timeWarningStyle = useSpring({
    color: timeLeft <= 10 ? '#ff4444' : '#ffffff',
    transform: timeLeft <= 10 ? 'scale(1.1)' : 'scale(1)',
    textShadow: timeLeft <= 10 ? '0 0 20px #ff4444' : '0 0 10px rgba(255,255,255,0.5)',
    config: { tension: 300, friction: 10 }
  });

  return (
    <animated.div 
      className={`game-area ${gameMode === 'precision' ? 'precision-mode' : ''}`}
      style={{
        ...shakeAnimation,
        ...backgroundAnimation
      }}
      ref={gameAreaRef}
      onClick={handleBackgroundClick}
    >
      {/* Enhanced Game Stats */}
      <div className="game-stats">
        <StatCard 
          label="Score" 
          value={score.toLocaleString()} 
          color="#4CAF50"
          icon="🎯"
        />
        <animated.div style={timeWarningStyle}>
          <StatCard 
            label="Time" 
            value={timeLeft} 
            color={timeLeft <= 10 ? "#f44336" : "#2196F3"}
            icon="⏱️"
          />
        </animated.div>
        <StatCard 
          label="Level" 
          value={level} 
          color="#FF9800"
          icon="⭐"
        />
        {gameMode === 'precision' && (
          <StatCard 
            label="Misses" 
            value={missedClicks} 
            color="#f44336"
            icon="❌"
          />
        )}
      </div>
      
      {/* Enhanced Multiplier Indicator */}
      {multiplierActive && (
        <div className="multiplier-indicator">
          <div className="multiplier-text">
            🔥 {scoreMultiplier}x MULTIPLIER
          </div>
          <div 
            className="multiplier-timer" 
            style={{ width: `${(multiplierTimeLeft / 10) * 100}%` }}
          />
        </div>
      )}
      
      {/* Level Up Notification */}
      {showLevelUp && <LevelUpNotification level={level} />}
      
      {/* Enhanced Targets */}
{targets.map(target => (
  <EnhancedTarget
    key={target.id}
    target={target}
    onClick={(e) => handleTargetClick(target.id, e)} // FIXED: Pass event
    gameMode={gameMode}
  />
))}

      
      {/* Enhanced Power-ups */}
      {powerUps.map(powerUp => (
        <EnhancedPowerUp
          key={powerUp.id}
          powerUp={powerUp}
          onClick={() => handlePowerUpClick(powerUp.id)}
        />
      ))}
      
      {/* Floating texts */}
      {floatingTexts.map(text => (
        <FloatingText
          key={text.id}
          id={text.id}
          text={text.text}
          color={text.color}
          x={text.x}
          y={text.y}
          onComplete={() => removeFloatingText(text.id)}
        />
      ))}
      
      {/* Explosions */}
      {explosions.map(explosion => (
        <ParticleExplosion 
          key={`explosion-${explosion.id}`}
          x={explosion.x}
          y={explosion.y}
          color={explosion.color}
          onComplete={() => removeExplosion(explosion.id)}
        />
      ))}
    </animated.div>
  );
}

// Enhanced Stat Card Component
function StatCard({ label, value, color, icon }) {
  return (
    <div 
      className="stat-card" 
      style={{ '--stat-color': color }}
    >
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

// In GameArea.js - Enhanced Target Component
function EnhancedTarget({ target, onClick, gameMode }) {
  const targetAnimation = useSpring({
    from: { transform: 'scale(0) rotate(0deg)', opacity: 0 },
    to: { transform: 'scale(1) rotate(360deg)', opacity: 1 },
    config: { tension: 300, friction: 10 }
  });

  return (
    <animated.div
      className="target enhanced-target"
      style={{
        ...targetAnimation,
        left: target.x,
        top: target.y,
        width: target.size,
        height: target.size,
        '--target-color': target.color,
        '--target-light': lightenColor(target.color),
        '--target-dark': darkenColor(target.color)
      }}
      onClick={(e) => onClick(e)} // FIXED: Pass event parameter
    />
  );
}


// Enhanced Power-up Component
function EnhancedPowerUp({ powerUp, onClick }) {
  const powerUpAnimation = useSpring({
    from: { transform: 'scale(0) rotate(0deg)', opacity: 0 },
    to: { transform: 'scale(1) rotate(360deg)', opacity: 1 },
    config: { tension: 200, friction: 10 }
  });

  const getIcon = (type) => {
    switch(type) {
      case 'points': return '💎';
      case 'time': return '⏰';
      case 'multiplier': return '🔥';
      default: return '⭐';
    }
  };

  return (
    <animated.div
      className={`power-up enhanced-power-up ${powerUp.type}`}
      style={{
        ...powerUpAnimation,
        left: powerUp.x,
        top: powerUp.y,
        width: powerUp.size,
        height: powerUp.size,
        fontSize: `${powerUp.size * 0.4}px`,
        '--powerup-color': powerUp.color,
        '--powerup-light': lightenColor(powerUp.color),
        '--powerup-dark': darkenColor(powerUp.color)
      }}
      onClick={onClick}
    >
      {getIcon(powerUp.type)}
    </animated.div>
  );
}

// Helper functions
function lightenColor(color) {
  return color.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/, (match, r, g, b) => {
    return `rgb(${Math.min(255, parseInt(r) + 50)}, ${Math.min(255, parseInt(g) + 50)}, ${Math.min(255, parseInt(b) + 50)})`;
  });
}

function darkenColor(color) {
  return color.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/, (match, r, g, b) => {
    return `rgb(${Math.max(0, parseInt(r) - 50)}, ${Math.max(0, parseInt(g) - 50)}, ${Math.max(0, parseInt(b) - 50)})`;
  });
}

export default GameArea;
