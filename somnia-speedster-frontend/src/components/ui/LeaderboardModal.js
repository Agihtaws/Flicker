import React, { useState } from 'react';

function LeaderboardModal({ show, onClose, leaderboards, account }) {
  const [activeTab, setActiveTab] = useState('standard');
  
  if (!show) return null;
  
  const currentLeaderboard = leaderboards[activeTab] || [];
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="leaderboard-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Leaderboards</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="leaderboard-tabs">
          <button 
            className={activeTab === 'standard' ? 'active' : ''} 
            onClick={() => setActiveTab('standard')}
          >
            Standard
          </button>
          <button 
            className={activeTab === 'survival' ? 'active' : ''} 
            onClick={() => setActiveTab('survival')}
          >
            Survival
          </button>
          <button 
            className={activeTab === 'timeAttack' ? 'active' : ''} 
            onClick={() => setActiveTab('timeAttack')}
          >
            Time Attack
          </button>
          <button 
            className={activeTab === 'precision' ? 'active' : ''} 
            onClick={() => setActiveTab('precision')}
          >
            Precision
          </button>
        </div>
        
        <div className="leaderboard">
          <h3>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Mode</h3>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {currentLeaderboard.length > 0 ? (
                currentLeaderboard.map((entry, index) => (
                  <tr 
                    key={index}
                    className={entry.address.toLowerCase() === account?.toLowerCase() ? 'current-player' : ''}
                  >
                    <td>{index + 1}</td>
                    <td>{entry.name}</td>
                    <td>{entry.score}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No scores yet. Be the first to play!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default LeaderboardModal;
