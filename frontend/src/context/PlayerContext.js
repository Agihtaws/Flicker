import React, { createContext, useContext, useState, useEffect } from 'react';
import { playerAPI } from '../services/api';

const PlayerContext = createContext();

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

export const PlayerProvider = ({ children }) => {
  const [player, setPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for saved player and token on app start
  useEffect(() => {
    const checkSavedPlayer = async () => {
      try {
        const token = localStorage.getItem('speedsterToken');
        const savedPlayer = localStorage.getItem('speedsterPlayer');
        
        if (token && savedPlayer) {
          // Try to get fresh profile data to verify token is still valid
          try {
            const result = await playerAPI.getProfile();
            if (result.success) {
              setPlayer(result.player);
              // Update stored player data with fresh data
              localStorage.setItem('speedsterPlayer', JSON.stringify(result.player));
            } else {
              throw new Error('Invalid session');
            }
          } catch (error) {
            // Token is invalid, clear storage
            console.error('Session expired:', error);
            playerAPI.logout();
            setPlayer(null);
          }
        }
      } catch (error) {
        console.error('Error checking saved player:', error);
        playerAPI.logout();
        setPlayer(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSavedPlayer();
  }, []);

  // Register a new player
  const registerPlayer = async ({ name, email, password }) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const result = await playerAPI.register({ name, email, password });
      
      if (result.success) {
        setPlayer(result.player);
        return { success: true };
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Login existing player
  const loginPlayer = async ({ email, password }) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const result = await playerAPI.login({ email, password });
      
      if (result.success) {
        setPlayer(result.player);
        return { success: true };
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Submit score
  const submitScore = async (gameMode, score) => {
    try {
      if (!player) throw new Error('No player logged in');
      
      const result = await playerAPI.submitScore(gameMode, score);
      
      if (result.success) {
        // Update local player data with new scores
        setPlayer(result.player);
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Refresh player data
  const refreshPlayer = async () => {
    try {
      if (!player) return;
      
      const result = await playerAPI.getProfile();
      if (result.success) {
        setPlayer(result.player);
      }
    } catch (error) {
      console.error('Error refreshing player data:', error);
      setError(error.message);
    }
  };

  // Logout player
  const logout = () => {
    playerAPI.logout();
    setPlayer(null);
    setError(null);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    player,
    isLoading,
    error,
    registerPlayer,
    loginPlayer,
    submitScore,
    refreshPlayer,
    logout,
    clearError,
    setError
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};
