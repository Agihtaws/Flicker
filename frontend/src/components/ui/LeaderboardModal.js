import React, { useState } from 'react';
import { useSpring, animated } from 'react-spring';

function LeaderboardModal({ show, onClose, leaderboards, account }) {
  const [activeTab, setActiveTab] = useState('standard');
  
  const modalAnimation = useSpring({
    opacity: show ? 1 : 0,
    transform: show ? 'scale(1)' : 'scale(0.9)',
    config: { tension: 300, friction: 30 }
  });

  const overlayAnimation = useSpring({
    opacity: show ? 1 : 0,
    config: { duration: 200 }
  });
  
  if (!show) return null;
  
  const currentLeaderboard = leaderboards[activeTab] || [];
  
  const getModeIcon = (mode) => {
    switch(mode) {
      case 'standard': return '🎯';
      case 'timeAttack': return '⚡';
      case 'precision': return '🎪';
      default: return '🏆';
    }
  };

  const getModeColor = (mode) => {
    switch(mode) {
      case 'standard': return '#4CAF50';
      case 'timeAttack': return '#FF9800';
      case 'precision': return '#9C27B0';
      default: return '#2196F3';
    }
  };
  
  return (
    <animated.div 
      className="modal-overlay" 
      style={overlayAnimation}
      onClick={onClose}
    >
      <animated.div 
        className="leaderboard-modal" 
        style={modalAnimation}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <h2>🏆 Leaderboards</h2>
          <button 
            className="close-button" 
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        {/* Tabs */}
        <div className="leaderboard-tabs">
          {['standard', 'timeAttack', 'precision'].map((mode) => (
            <button
              key={mode}
              className={`${activeTab === mode ? 'active' : ''}`}
              onClick={() => setActiveTab(mode)}
              data-mode={mode}
            >
              <span className="mode-icon">{getModeIcon(mode)}</span>
              <span>{mode === 'timeAttack' ? 'Time Attack' : mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
            </button>
          ))}
        </div>
        
        {/* Leaderboard Content */}
        <div className="leaderboard" data-mode={activeTab}>
          
          {currentLeaderboard.length > 0 ? (
            <div className="leaderboard-entries">
              {currentLeaderboard.map((entry, index) => (
                <LeaderboardEntry
                  key={index}
                  entry={entry}
                  rank={index + 1}
                  isCurrentPlayer={entry.email === account}
                  modeColor={getModeColor(activeTab)}
                />
              ))}
            </div>
          ) : (
            <div className="leaderboard-empty">
              <div className="leaderboard-empty-icon">🎮</div>
              <h4>No scores yet for this mode.</h4>
              <p>Be the first to set a record!</p>
            </div>
          )}
        </div>
      </animated.div>
    </animated.div>
  );
}

function LeaderboardEntry({ entry, rank, isCurrentPlayer, modeColor }) {
  const entryAnimation = useSpring({
    from: { opacity: 0, transform: 'translateX(-20px)' },
    to: { opacity: 1, transform: 'translateX(0px)' },
    delay: rank * 100,
    config: { tension: 300, friction: 25 }
  });

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  return (
    <animated.div
      className={`leaderboard-entry ${isCurrentPlayer ? 'current-player' : ''}`}
      style={{
        ...entryAnimation,
        '--mode-color': modeColor,
        '--mode-color-30': `${modeColor}30`,
        '--mode-color-20': `${modeColor}20`,
        '--mode-color-60': `${modeColor}60`,
      }}
    >
      <div className={`entry-rank ${rank <= 3 ? 'top-three' : 'regular'}`}>
        {getRankIcon(rank)}
      </div>
      
      <div className="entry-info">
        <div className={`entry-name ${isCurrentPlayer ? 'current-player' : ''}`}>
          {entry.name}
          {isCurrentPlayer && <span>👤</span>}
        </div>
        {entry.gamesPlayed && (
          <div className="entry-games">
            {entry.gamesPlayed} games played
          </div>
        )}
      </div>
      
      <div className="entry-score">
        {entry.score.toLocaleString()}
      </div>
    </animated.div>
  );
}

export default LeaderboardModal;
