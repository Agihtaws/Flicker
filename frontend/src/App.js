import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import Confetti from 'react-confetti';
import './App.css';

// Import components
import ParticleExplosion from './components/effects/ParticleExplosion';
import LevelUpNotification from './components/ui/LevelUpNotification';
import FloatingText from './components/effects/FloatingText';
import AnimatedBubbles from './components/effects/AnimatedBubbles';
import useScreenShake from './hooks/useScreenShake';
import GameSetup from './components/game/GameSetup';
import GameArea from './components/game/GameArea';

import LoadingScreen from './components/ui/LoadingScreen';
import LeaderboardModal from './components/ui/LeaderboardModal';

// Import context and API
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { playerAPI } from './services/api';

// Import sound manager
import soundManager from './utils/SoundManager';

function GameApp() {
  const { player, isLoading, registerPlayer, loginPlayer, submitScore, logout } = usePlayer();
  
  // Auth input states
  const [inputName, setInputName] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [loginMode, setLoginMode] = useState(false);
  
  // Game state
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [level, setLevel] = useState(1);
  const [gameActive, setGameActive] = useState(false);
  const [targets, setTargets] = useState([]);
  const [sessionHighScore, setSessionHighScore] = useState(0);
  const [showPlayAgain, setShowPlayAgain] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  // Game mode states (only 3 modes now)
  const [gameMode, setGameMode] = useState('standard');
  const [missedClicks, setMissedClicks] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(null);
  
  // Power-up states
  const [powerUps, setPowerUps] = useState([]);
  const [scoreMultiplier, setScoreMultiplier] = useState(1);
  const [multiplierTimeLeft, setMultiplierTimeLeft] = useState(0);
  const [multiplierActive, setMultiplierActive] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState([]);
  
  // Visual effects states
  const [explosions, setExplosions] = useState([]);
  const [backgroundColor, setBackgroundColor] = useState('rgb(18, 18, 18)');
  const [shakeAnimation, shake] = useScreenShake();
  const [showLevelUp, setShowLevelUp] = useState(false);
  
  // FIXED: Separate cooldowns for targets and power-ups
  const [targetClickCooldown, setTargetClickCooldown] = useState(false);
  const [powerUpClickCooldown, setPowerUpClickCooldown] = useState(false);
  
  const [showConfetti, setShowConfetti] = useState(false);

  // Leaderboard states
  const [leaderboards, setLeaderboards] = useState({
    standard: [],
    timeAttack: [],
    precision: []
  });
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);

  // Score submission states
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  // Sound management states
  const [soundsEnabled, setSoundsEnabled] = useState(false);
  const [soundsInitialized, setSoundsInitialized] = useState(false);

  // Animations
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 1000 }
  });

  const buttonAnimation = useSpring({
    from: { transform: 'scale(1)' },
    to: { transform: 'scale(1.05)' },
    config: { duration: 300 },
    loop: { reverse: true }
  });

  // Initialize sounds on first user interaction
  const initializeSounds = () => {
    if (!soundsInitialized) {
      soundManager.enable();
      setSoundsEnabled(true);
      setSoundsInitialized(true);
      console.log('🔊 Sounds initialized and enabled');
    }
  };

  // Load all leaderboards on component mount
  useEffect(() => {
    loadAllLeaderboards();
  }, []);

  // Auto-submit score when game ends and we have a new session high score
  useEffect(() => {
    const autoSubmitScore = async () => {
      if (showPlayAgain && sessionHighScore > 0 && player && !scoreSubmitted && !isSubmittingScore) {
        setIsSubmittingScore(true);
        
        try {
          const result = await submitScore(gameMode, sessionHighScore);
          
          if (result.success) {
            console.log('Score auto-submitted successfully!');
            setScoreSubmitted(true);
            
            if (result.isNewHighScore) {
              setShowConfetti(true);
              setTimeout(() => setShowConfetti(false), 5000);
              showFloatingText('NEW HIGH SCORE!', '#FFD700');
              // Play high score sound
              if (soundsEnabled) {
                soundManager.playHighScore();
              }
            }
            
            // Reload leaderboards
            await loadAllLeaderboards();
          }
        } catch (error) {
          console.error('Failed to auto-submit score:', error);
          // Show a subtle notification instead of alert
          showFloatingText('Score save failed', '#FF0000');
        } finally {
          setIsSubmittingScore(false);
        }
      }
    };

    autoSubmitScore();
  }, [showPlayAgain, sessionHighScore, player, gameMode, scoreSubmitted, isSubmittingScore, submitScore, soundsEnabled]);

  // Load leaderboards for all game modes
  const loadAllLeaderboards = async () => {
    const modes = ['standard', 'timeAttack', 'precision'];
    const newLeaderboards = {};
    
    for (const mode of modes) {
      try {
        const result = await playerAPI.getLeaderboard(mode);
        if (result.success) {
          newLeaderboards[mode] = result.leaderboard;
        } else {
          newLeaderboards[mode] = [];
        }
      } catch (error) {
        console.error(`Failed to load ${mode} leaderboard:`, error);
        newLeaderboards[mode] = [];
      }
    }
    
    setLeaderboards(newLeaderboards);
  };

  // Handle player registration
  const handleRegisterPlayer = async () => {
    if (!inputName.trim() || !inputEmail.trim() || !inputPassword.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const result = await registerPlayer({
      name: inputName.trim(),
      email: inputEmail.trim(),
      password: inputPassword
    });
    
    if (!result.success) {
      alert(result.message);
    } else {
      // Clear form on success
      setInputName('');
      setInputEmail('');
      setInputPassword('');
    }
  };

  // Handle player login
  const handleLoginPlayer = async () => {
    if (!inputEmail.trim() || !inputPassword.trim()) {
      alert('Please enter email and password');
      return;
    }

    const result = await loginPlayer({
      email: inputEmail.trim(),
      password: inputPassword
    });
    
    if (!result.success) {
      alert(result.message);
    } else {
      // Clear form on success
      setInputEmail('');
      setInputPassword('');
    }
  };

  // Handle game mode selection
  const selectGameMode = (mode) => {
    // Initialize sounds on first interaction
    initializeSounds();
    
    setGameMode(mode);
    setScore(0);
    setLevel(1);
    setMissedClicks(0);
    
    if (mode === 'timeAttack') {
      setTimeLeft(30);
    } else {
      setTimeLeft(60);
    }
  };

  // Start a new game
  const startGame = () => {
    if (!player) {
      alert('Please login or register first!');
      return;
    }

    // Initialize sounds on first interaction
    initializeSounds();

    console.log('🎮 Starting new game');
    setGameActive(true);
    setScore(0);
    setTargets([]);
    setPowerUps([]);
    setShowPlayAgain(false);
    setExplosions([]);
    setMissedClicks(0);
    setLevel(1);
    setGameStartTime(Date.now());
    setScoreMultiplier(1);
    setMultiplierActive(false);
    setMultiplierTimeLeft(0);
    setFloatingTexts([]);
    setScoreSubmitted(false);
    
    if (gameMode === 'timeAttack') {
      setTimeLeft(30);
    } else {
      setTimeLeft(60);
    }
  };

  // Generate random power-ups during gameplay
  const generatePowerUp = () => {
    if (!gameActive) return;
    
    console.log('💎 Generating power-up at level', level);
    
    // FIXED: Removed the 'time' power-up from the game
    const powerUpTypes = [
      {
        type: 'points',
        color: '#FFD700',
        size: 40,
        effect: () => {
          const bonusPoints = Math.floor(Math.random() * 51) + 50;
          console.log(`💰 Points power-up: +${bonusPoints}`);
          setScore(prev => prev + bonusPoints);
        }
      },
      // Removed the 'time' power-up from here
      {
        type: 'multiplier',
        color: '#FF00FF',
        size: 40,
        effect: () => {
          const multiplier = Math.floor(Math.random() * 2) + 2;
          console.log(`🔥 Multiplier power-up: ${multiplier}x`);
          setScoreMultiplier(multiplier);
          setMultiplierActive(true);
          setMultiplierTimeLeft(10);
          
          // Play multiplier activation sound
          if (soundsEnabled) {
            soundManager.playMultiplierActivate();
          }
        }
      }
    ];
    
    // Ensure there are power-up types to select from
    if (powerUpTypes.length === 0) return;

    const powerUpType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    const id = `powerup-${Date.now()}`;
    const powerUp = {
      id,
      type: powerUpType.type,
      x: Math.random() * (windowSize.width - powerUpType.size - 100) + 50,
      y: Math.random() * (windowSize.height - powerUpType.size - 200) + 100,
      size: powerUpType.size,
      color: powerUpType.color,
      effect: powerUpType.effect
    };
    
    console.log(`✨ Created ${powerUpType.type} power-up at (${powerUp.x}, ${powerUp.y})`);
    setPowerUps(prev => {
      const newPowerUps = [...prev, powerUp];
      console.log(`📦 Total power-ups on screen: ${newPowerUps.length}`);
      return newPowerUps;
    });
    
    setTimeout(() => {
      setPowerUps(prev => prev.filter(p => p.id !== id));
      console.log(`⏰ Power-up ${id} expired`);
    }, 5000);
  };

  // FIXED: Handle power-up collection with separate cooldown
  const handlePowerUpClick = (id) => {
    if (!gameActive || powerUpClickCooldown) return;
    
    // Initialize sounds on first interaction
    initializeSounds();
    
    console.log(`🎯 Power-up clicked: ${id}`);
    
    // FIXED: Only power-up cooldown, doesn't affect targets
    setPowerUpClickCooldown(true);
    setTimeout(() => setPowerUpClickCooldown(false), 50);
    
    const powerUp = powerUps.find(p => p.id === id);
    if (!powerUp) {
      console.log('❌ Power-up not found!');
      return;
    }
    
    console.log(`✅ Found power-up: ${powerUp.type} at (${powerUp.x}, ${powerUp.y})`);
    
    // Play power-up collection sound (gentle, not irritating)
    if (soundsEnabled) {
      soundManager.playPowerUpCollect();
    }
    
    // Execute the power-up effect first
    powerUp.effect();
    
    // Show floating text at the power-up position
    const textX = powerUp.x + powerUp.size / 2;
    const textY = powerUp.y + powerUp.size / 2;
    console.log(`📝 Creating floating text at (${textX}, ${textY})`);
    
    // Create floating text with the actual values from the effect
    let text;
    switch(powerUp.type) {
      case 'points':
        const bonusPoints = Math.floor(Math.random() * 51) + 50;
        text = `+${bonusPoints}`;
        break;
      // Removed 'time' case
      case 'multiplier':
        const multiplier = Math.floor(Math.random() * 2) + 2;
        text = `${multiplier}x Score`;
        break;
      default:
        text = 'Bonus!';
    }
    
    const floatingTextId = `text-${Date.now()}-${Math.random()}`;
    console.log(`💬 Adding floating text: "${text}" with ID: ${floatingTextId}`);
    
    setFloatingTexts(prev => {
      const newTexts = [...prev, { id: floatingTextId, text, color: powerUp.color, x: textX, y: textY }];
      console.log(`📋 Total floating texts: ${newTexts.length}`);
      return newTexts;
    });
    
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== floatingTextId));
      console.log(`🗑️ Removed floating text: ${floatingTextId}`);
    }, 2000);
    
    const explosion = {
      id: `explosion-${Date.now()}`,
      x: powerUp.x + powerUp.size / 2,
      y: powerUp.y + powerUp.size / 2,
      color: powerUp.color
    };
    
    setExplosions(prev => [...prev, explosion]);
    setPowerUps(prev => prev.filter(p => p.id !== id));
  };

  // UPDATED: Display floating text (for center screen messages like high score)
  const showFloatingText = (text, color) => {
    const id = `text-${Date.now()}`;
    const x = windowSize.width / 2 - 50;
    const y = windowSize.height / 2 - 50;
    
    console.log(`💬 Center floating text: "${text}" at (${x}, ${y})`);
    setFloatingTexts(prev => [...prev, { id, text, color, x, y }]);
    
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 2000);
  };

  // Remove floating text
  const removeFloatingText = (id) => {
    console.log(`🗑️ Manually removing floating text: ${id}`);
    setFloatingTexts(prev => prev.filter(t => t.id !== id));
  };

  // Remove explosion effect
  const removeExplosion = (explosionId) => {
    setExplosions(prev => prev.filter(explosion => explosion.id !== explosionId));
  };

  // FIXED: Handle background clicks (for precision mode) - better event detection
  const handleBackgroundClick = (e) => {
    if (gameMode === 'precision' && gameActive) {
      // FIXED: Check if click was on game area background (not on targets or power-ups)
      const clickedElement = e.target;
      const isGameAreaBackground = clickedElement.classList.contains('game-area') || 
                                  clickedElement.classList.contains('game-stats') ||
                                  clickedElement.classList.contains('stat-card') ||
                                  clickedElement.classList.contains('stat-icon') ||
                                  clickedElement.classList.contains('stat-value') ||
                                  clickedElement.classList.contains('stat-label');
      
      // Only penalize if clicking on actual background, not on targets or power-ups
      if (isGameAreaBackground) {
        console.log('❌ Precision mode: Background click penalty');
        setMissedClicks(prev => prev + 1);
        setScore(prev => Math.max(0, prev - 5));
        
        const misclickExplosion = {
          id: `misclick-${Date.now()}`,
          x: e.clientX,
          y: e.clientY,
          color: '#FF0000'
        };
        setExplosions(prev => [...prev, misclickExplosion]);
      }
    }
  };

  // FIXED: Handle target click with separate cooldown and prevent event bubbling
  const handleTargetClick = (id, event) => {
    if (!gameActive || targetClickCooldown) return;
    
    // FIXED: Prevent event bubbling to background click handler
    if (event) {
      event.stopPropagation();
    }
    
    // Initialize sounds on first interaction
    initializeSounds();
    
    // FIXED: Only target cooldown, doesn't affect power-ups
    setTargetClickCooldown(true);
    setTimeout(() => setTargetClickCooldown(false), 50);

    const target = targets.find(t => t.id === id);
    if (!target) return;

    console.log(`🎯 Target hit: ${id} (Precision mode: ${gameMode === 'precision'})`);

    // Play target hit sound (soft pop, not irritating)
    if (soundsEnabled) {
      soundManager.playTargetHit();
    }

    const explosion = {
      id: `explosion-${Date.now()}-${Math.random()}`,
      x: target.x + target.size / 2,
      y: target.y + target.size / 2,
      color: target.color
    };
    
    setExplosions(prev => [...prev, explosion]);

    // Calculate score based on game mode
    let pointsGained;
    switch(gameMode) {
      case 'timeAttack':
        const timeSinceStart = (Date.now() - gameStartTime) / 1000;
        const timeBonus = Math.max(1, 2 - (timeSinceStart / 30));
        pointsGained = Math.round((10 * level) * timeBonus);
        break;
      case 'precision':
        pointsGained = 10 * level;
        break;
      default: // standard mode
        pointsGained = 10 * level;
    }

    if (multiplierActive) {
      pointsGained = Math.round(pointsGained * scoreMultiplier);
    }

    const newScore = score + pointsGained;
    setScore(newScore);
    setTargets(targets.filter(target => target.id !== id));

    // Level up logic - requires 1000 points per level
    const pointsNeededForNextLevel = level * 1000;
    console.log(`📊 Score: ${newScore}, Next level at: ${pointsNeededForNextLevel}`);
    if (newScore >= pointsNeededForNextLevel) {
      console.log(`🎉 Level up! New level: ${level + 1}`);
      setLevel(prev => prev + 1);
    }
  };

  // Update background color and screen shake based on level
  useEffect(() => {
    if (gameActive) {
      const hue = (level * 20) % 360;
      setBackgroundColor(`hsl(${hue}, 40%, 10%)`);
      
      if (level > 1) {
        shake(1.5, 500);
      }
    } else {
      setBackgroundColor('rgb(18, 18, 18)');
    }
  }, [level, gameActive, shake]);
  
  // Show level up notification with sound
  useEffect(() => {
    if (level > 1 && gameActive) {
      console.log(`📢 Showing level up notification for level ${level}`);
      setShowLevelUp(true);
      
      // Play level up sound
      if (soundsEnabled) {
        soundManager.playLevelUp();
      }
      
      setTimeout(() => {
        setShowLevelUp(false);
      }, 1500);
    }
  }, [level, gameActive, soundsEnabled]);

  // Update window size for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Game timer and target spawning
  useEffect(() => {
    let timer;
    let spawnTimer;
    let powerUpTimer;
    let multiplierTimer;

    if (gameActive) {
      // Timer countdown
      timer = setInterval(() => {
        setTimeLeft(prev => {
          // Play timer warning sound when 10 seconds left
          if (prev === 11 && soundsEnabled) {
            soundManager.playTimerWarning();
          }
          
          if (prev <= 1) {
            clearInterval(timer);
            clearInterval(spawnTimer);
            clearInterval(powerUpTimer);
            clearInterval(multiplierTimer);
            setGameActive(false);
            
            // FIXED: Precision mode final score calculation
            let finalScore = score;
            if (gameMode === 'precision') {
              // In precision mode, misses are already deducted during gameplay (-5 per miss)
              // Don't apply additional penalty at the end
              console.log(`🎪 Precision mode final score: ${finalScore} (${missedClicks} misses already deducted)`);
            }
            
            // Update session high score if this is better
            if (finalScore > sessionHighScore) {
              setSessionHighScore(finalScore);
            }
            
            setScore(finalScore);
            setShowPlayAgain(true);
            
            // Play game over sound (will be handled by auto-submit effect)
            if (soundsEnabled && finalScore <= sessionHighScore) {
              soundManager.playGameOver();
            }
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Spawn targets
      const spawnTarget = () => {
        const id = Date.now();
        let size;
        let lifetime;
        
        switch(gameMode) {
          case 'timeAttack':
            size = Math.max(20, 50 - (level * 2));
            lifetime = 1500;
            break;
          case 'precision':
            size = Math.max(25, 55 - (level * 2));
            lifetime = 1800;
            break;
          default: // standard mode
            size = Math.max(30, 60 - (level * 3));
            lifetime = 2000;
        }
        
        const colors = ['#FF5733', '#33FF57', '#3357FF', '#FFFF33', '#FF33FF'];
        
        setTargets(prev => [...prev, {
          id,
          x: Math.random() * (windowSize.width - size - 100) + 50,
          y: Math.random() * (windowSize.height - size - 200) + 100,
          size,
          color: colors[Math.floor(Math.random() * colors.length)]
        }]);

        setTimeout(() => {
          setTargets(prev => prev.filter(target => target.id !== id));
        }, lifetime);
      };

      spawnTarget();

      let spawnInterval;
      switch(gameMode) {
        case 'timeAttack':
          spawnInterval = Math.max(200, 800 - (level * 50));
          break;
        case 'precision':
          spawnInterval = Math.max(300, 1000 - (level * 70));
          break;
        default: // standard mode
          spawnInterval = Math.max(300, 1000 - (level * 100));
      }
      
      spawnTimer = setInterval(() => {
        spawnTarget();
      }, spawnInterval);

      // Power-up generation
      powerUpTimer = setInterval(() => {
        const powerUpChance = 0.8; // 80% chance every 2 seconds
        console.log(`🎲 Power-up chance: ${(powerUpChance * 100).toFixed(1)}%`);
        if (Math.random() < powerUpChance) {
          generatePowerUp();
        } else {
          console.log('🎲 Power-up chance missed');
        }
      }, 2000);

      // Multiplier countdown
      if (multiplierActive) {
        multiplierTimer = setInterval(() => {
          setMultiplierTimeLeft(prev => {
            if (prev <= 1) {
              setMultiplierActive(false);
              setScoreMultiplier(1);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }

      return () => {
        clearInterval(timer);
        clearInterval(spawnTimer);
        clearInterval(powerUpTimer);
        clearInterval(multiplierTimer);
      };
    }
  }, [gameActive, level, score, sessionHighScore, gameMode, windowSize, missedClicks, multiplierActive, soundsEnabled]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <animated.div className="app" style={{
      ...fadeIn,
      backgroundColor: backgroundColor,
      transition: 'background-color 1s ease'
    }}>
      {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} />}
      
      <header className="header">
        <h1>🎯 Speedster Arena</h1>
        <div className="header-actions">
          {player && (
            <button 
              className="leaderboard-button"
              onClick={() => setShowLeaderboardModal(true)}
            >
              🏆 Leaderboard
            </button>
          )}
          {player ? (
            <div className="player-info">
              <span>Welcome, {player.name}!</span>
              <button onClick={logout}>Logout</button>
            </div>
          ) : null}
        </div>
      </header>

      <main className="main">
        {player && !gameActive ? (
          <GameSetup 
            isRegistered={true}
            inputName={inputName}
            setInputName={setInputName}
            registerPlayer={handleRegisterPlayer}
            showPlayAgain={showPlayAgain}
            setShowPlayAgain={setShowPlayAgain}
            score={score}
            gameMode={gameMode}
            missedClicks={missedClicks}
            sessionHighScore={sessionHighScore}
            storedHighScore={player.scores[gameMode] || 0}
            startGame={startGame}
            scoreSubmitted={scoreSubmitted}
            isSubmittingScore={isSubmittingScore}
            playerName={player.name}
            selectGameMode={selectGameMode}
            buttonAnimation={buttonAnimation}
            account={player.id}
          />
        ) : gameActive ? (
          <GameArea
            gameMode={gameMode}
            shakeAnimation={shakeAnimation}
            handleBackgroundClick={handleBackgroundClick}
            score={score}
            timeLeft={timeLeft}
            level={level}
            missedClicks={missedClicks}
            multiplierActive={multiplierActive}
            scoreMultiplier={scoreMultiplier}
            multiplierTimeLeft={multiplierTimeLeft}
            showLevelUp={showLevelUp}
            targets={targets}
            handleTargetClick={handleTargetClick}
            powerUps={powerUps}
            handlePowerUpClick={handlePowerUpClick}
            floatingTexts={floatingTexts}
            removeFloatingText={removeFloatingText}
            explosions={explosions}
            removeExplosion={removeExplosion}
            soundsEnabled={soundsEnabled}
            setSoundsEnabled={setSoundsEnabled}
            soundManager={soundManager}
          />
        ) : !player ? (
          <div className="auth-screen">
            <AnimatedBubbles explosions={explosions} isGameActive={gameActive} />
            <h2>Welcome to Speedster Arena!</h2>
            <p>Test your reflexes and compete for high scores!</p>
            
            <div className="auth-form">
              {!loginMode && (
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                />
              )}
              
              <input
                type="email"
                placeholder="Enter your email"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
              />
              
              <input
                type="password"
                placeholder="Enter your password"
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (loginMode ? handleLoginPlayer() : handleRegisterPlayer())}
              />
              
              <div className="auth-buttons">
                <animated.button 
                  onClick={loginMode ? handleLoginPlayer : handleRegisterPlayer}
                  style={buttonAnimation}
                  className="primary-button"
                >
                  {loginMode ? '🚀 Login' : '🎮 Register & Play'}
                </animated.button>
                
                <button 
                  onClick={() => setLoginMode(!loginMode)}
                  className="secondary-button"
                >
                  {loginMode ? 'Need to register?' : 'Already have an account?'}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>
      
      <LeaderboardModal 
        show={showLeaderboardModal}
        onClose={() => setShowLeaderboardModal(false)}
        leaderboards={leaderboards}
        account={player?.email}
      />
      
        {/* Score submission indicator */}
      {isSubmittingScore && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'rgba(255, 107, 53, 0.9)',
          color: '#fff',
          padding: '15px 25px',
          borderRadius: '25px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 0 20px rgba(255, 107, 53, 0.5)'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderTop: '2px solid #fff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          Saving score...
        </div>
      )}
    </animated.div>
  );
}

function App() {
  return (
    <PlayerProvider>
      <GameApp />
    </PlayerProvider>
  );
}

export default App;
