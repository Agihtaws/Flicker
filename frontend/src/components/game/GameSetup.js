import React from 'react';
import { animated, useSpring } from 'react-spring';

function GameSetup({
  isRegistered,
  inputName,
  setInputName,
  registerPlayer,
  showPlayAgain,
  setShowPlayAgain, 
  score,
  gameMode,
  missedClicks,
  sessionHighScore,
  storedHighScore,
  startGame,
  scoreSubmitted,
  submitScore,
  updateScore,
  playerName,
  selectGameMode,
  buttonAnimation,
  account
}) {

  const containerAnimation = useSpring({
    from: { opacity: 0, transform: 'scale(0.9)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: { tension: 200, friction: 20 }
  });

  const gameEndAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 200, friction: 20 }
  });

  return (
    <animated.div className="game-setup" style={containerAnimation}>
      {!isRegistered ? (
        <div className="registration">
          <h2>🎮 Join the Arena</h2>
          <input
            type="text"
            placeholder="Enter your player name"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
          />
          <animated.button 
            onClick={registerPlayer}
            style={buttonAnimation}
          >
            🚀 Register & Play
          </animated.button>
        </div>
      ) : showPlayAgain ? (
        <animated.div 
          className={`game-end ${score > storedHighScore ? 'new-high-score' : 'regular'}`} 
          style={gameEndAnimation}
        >
          <h2>
            {score > storedHighScore ? '🎉 NEW HIGH SCORE!' : '🎮 Game Over!'}
          </h2>
          
          <div className="score-cards">
            <ScoreCard label="Final Score" value={score.toLocaleString()} color="#4CAF50" />
            <ScoreCard label="Game Mode" value={gameMode.charAt(0).toUpperCase() + gameMode.slice(1)} color="#2196F3" />
            {gameMode === 'precision' && (
              <ScoreCard label="Misclicks" value={missedClicks} color="#f44336" />
            )}
          </div>

          <div className="score-summary">
            <p>
              Session Best: <span className="score-highlight session">{sessionHighScore.toLocaleString()}</span>
            </p>
            {storedHighScore > 0 && (
              <p>
                All-Time Best: <span className="score-highlight all-time">{storedHighScore.toLocaleString()}</span>
              </p>
            )}
          </div>

          <div className="button-group">
            <animated.button 
              className="start-button"
              onClick={startGame}
              style={buttonAnimation}
            >
              🔄 Play Again
            </animated.button>
            
            {!scoreSubmitted && sessionHighScore > 0 && sessionHighScore > storedHighScore ? (
              <animated.button 
                className="update-button"
                onClick={updateScore}
                style={buttonAnimation}
              >
                💾 Save Score
              </animated.button>
            ) : (
              <animated.button 
                className="mode-select-button"
                onClick={() => setShowPlayAgain(false)}
                style={buttonAnimation}
              >
                🎯 Select Mode
              </animated.button>
            )}
          </div>
        </animated.div>
      ) : (
        <div className="game-start">
          <h2>Welcome back, {playerName}! 👋</h2>
          
          {storedHighScore > 0 && (
            <p className="player-best">
              🏆 Your Best: {storedHighScore.toLocaleString()}
            </p>
          )}
          
          <div className="game-modes">
            <h3>🎮 Choose Your Challenge</h3>
            
            <div className="mode-buttons">
              <ModeButton
                active={gameMode === 'standard'}
                onClick={() => selectGameMode('standard')}
                title="Standard"
                icon="🎯"
                description="60 seconds to score as high as possible"
                color="#4CAF50"
                mode="standard"
              />
              
              <ModeButton
                active={gameMode === 'timeAttack'}
                onClick={() => selectGameMode('timeAttack')}
                title="Time Attack"
                icon="⚡"
                description="Score as much as possible in 30 seconds"
                color="#FF9800"
                mode="timeAttack"
              />
              
              <ModeButton
                active={gameMode === 'precision'}
                onClick={() => selectGameMode('precision')}
                title="Precision"
                icon="🎪"
                description="Misclicks reduce your score"
                color="#9C27B0"
                mode="precision"
              />
            </div>
          </div>
          
          <animated.button 
            className="start-game-button"
            onClick={startGame}
            style={buttonAnimation}
          >
            🚀 START GAME
          </animated.button>
        </div>
      )}
    </animated.div>
  );
}

function ScoreCard({ label, value, color }) {
  return (
    <div 
      className="score-card" 
      style={{ '--card-color': color }}
    >
      <div className="score-card-value">{value}</div>
      <div className="score-card-label">{label}</div>
    </div>
  );
}

function ModeButton({ active, onClick, title, icon, description, color, mode }) {
  const buttonAnimation = useSpring({
    transform: active ? 'scale(1.05)' : 'scale(1)',
    config: { tension: 300, friction: 10 }
  });

  return (
    <animated.button
      className={`mode-button ${active ? 'active' : ''}`}
      onClick={onClick}
      style={buttonAnimation}
      data-mode={mode}
    >
      <div className="mode-icon">{icon}</div>
      <div className="mode-title">{title}</div>
      <div className="mode-description">{description}</div>
    </animated.button>
  );
}

export default GameSetup;
