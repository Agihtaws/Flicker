import React, { useRef } from 'react';
import { animated } from 'react-spring';
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
  difficultyFactor,
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

  return (
    <animated.div 
      className={`game-area ${gameMode === 'precision' ? 'precision-mode' : ''}`}
      style={shakeAnimation}
      ref={gameAreaRef}
      onClick={handleBackgroundClick}
    >
      {gameMode !== 'survival' ? (
        <div className="game-stats">
          <div className="stat">Score: {score}</div>
          {gameMode !== 'survival' && <div className="stat">Time: {timeLeft}</div>}
          <div className="stat">Level: {level}</div>
          {gameMode === 'precision' && <div className="stat misclick-indicator">Misses: {missedClicks}</div>}
        </div>
      ) : (
        <div className="survival-stats">
          <div className="stat">Score: {score}</div>
          <div className="stat">Level: {level}</div>
          <div className="difficulty-indicator">Difficulty: {difficultyFactor.toFixed(1)}x</div>
        </div>
      )}
      
      {/* Multiplier indicator */}
      {multiplierActive && (
        <div className="multiplier-indicator">
          <span>{scoreMultiplier}x</span>
          <div className="multiplier-timer" style={{ width: `${(multiplierTimeLeft / 10) * 100}%` }}></div>
        </div>
      )}
      
      {showLevelUp && <LevelUpNotification level={level} />}
      
      {/* Targets */}
      {targets.map(target => (
        <div
          key={target.id}
          className="target"
          style={{
            left: target.x,
            top: target.y,
            width: target.size,
            height: target.size,
            backgroundColor: target.color
          }}
          onClick={() => handleTargetClick(target.id)}
        />
      ))}
      
      {/* Power-ups */}
      {powerUps.map(powerUp => (
        <div
          key={powerUp.id}
          className={`power-up ${powerUp.type}`}
          style={{
            left: powerUp.x,
            top: powerUp.y,
            width: powerUp.size,
            height: powerUp.size,
            backgroundColor: powerUp.color,
            borderRadius: '50%',
            position: 'absolute',
            boxShadow: `0 0 20px ${powerUp.color}`,
            animation: 'pulse 1s infinite alternate'
          }}
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
          key={`explosion-${explosion.id}`} // Ensure unique key
          x={explosion.x}
          y={explosion.y}
          color={explosion.color}
          onComplete={() => removeExplosion(explosion.id)}
        />
      ))}
    </animated.div>
  );
}

export default GameArea;
