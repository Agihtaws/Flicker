import React from 'react';
import { animated } from 'react-spring';
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
  difficultyFactor,
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
  return (
  <div className="game-setup">
    {!isRegistered ? (
      <div className="registration">
        <h2>Register to Play</h2>
        <input
          type="text"
          placeholder="Enter your name"
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
        />
        <animated.button 
          onClick={registerPlayer}
          style={buttonAnimation}
        >
          Register
        </animated.button>
      </div>
    ) : showPlayAgain ? (
      <div className="game-end">
        <h2>Game Over!</h2>
        <p>Your score: {score}</p>
        <p>Game Mode: {gameMode.charAt(0).toUpperCase() + gameMode.slice(1)}</p>
        {gameMode === 'precision' && <p>Misclicks: {missedClicks}</p>}
        {gameMode === 'survival' && <p>Difficulty Reached: {difficultyFactor.toFixed(1)}x</p>}
        <p>Your best score this session: {sessionHighScore}</p>
        {storedHighScore > 0 && (
          <p>Your all-time high score: {storedHighScore}</p>
        )}
        <div className="button-group">
          <animated.button 
            className="start-button"
            onClick={startGame}
            style={buttonAnimation}
          >
            Play Again
          </animated.button>
          
          {!scoreSubmitted && sessionHighScore > 0 && sessionHighScore > storedHighScore ? (
            <animated.button 
              className="update-button"
              onClick={updateScore}
              style={buttonAnimation}
            >
              Update Score
            </animated.button>
          ) : (
            <animated.button 
              className="mode-select-button"
              onClick={() => setShowPlayAgain(false)}
              style={buttonAnimation}
            >
              Select Mode
            </animated.button>
          )}
        </div>
      </div>
    ) : (
      <div className="game-start">
        <h2>Welcome, {playerName}!</h2>
        {storedHighScore > 0 && (
          <p>Your all-time high score: {storedHighScore}</p>
        )}
        
        <div className="game-modes">
          <h3>Select Game Mode</h3>
          <div className="mode-buttons">
            <button 
              className={`mode-button ${gameMode === 'standard' ? 'active' : ''}`}
              onClick={() => selectGameMode('standard')}
            >
              Standard
              <span className="mode-description">60 seconds to score as high as possible</span>
            </button>
            
            <button 
              className={`mode-button ${gameMode === 'survival' ? 'active' : ''}`}
              onClick={() => selectGameMode('survival')}
            >
              Survival
              <span className="mode-description">Targets get smaller and faster until you miss</span>
            </button>
            
            <button 
              className={`mode-button ${gameMode === 'timeAttack' ? 'active' : ''}`}
              onClick={() => selectGameMode('timeAttack')}
            >
              Time Attack
              <span className="mode-description">Score as much as possible in 30 seconds</span>
            </button>
            
            <button 
              className={`mode-button ${gameMode === 'precision' ? 'active' : ''}`}
              onClick={() => selectGameMode('precision')}
            >
              Precision
              <span className="mode-description">Misclicks reduce your score</span>
            </button>
          </div>
        </div>
        
        <animated.button 
          className="start-button"
          onClick={startGame}
          style={buttonAnimation}
        >
          Start Game
        </animated.button>
      </div>
    )}
  </div>
);

}
export default GameSetup;
