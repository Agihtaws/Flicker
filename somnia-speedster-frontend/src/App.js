import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { useSpring, animated } from 'react-spring';
import Confetti from 'react-confetti';
import { contractABI, contractAddress } from './contracts/contractABI';
import './App.css';

// Import components
import ParticleExplosion from './components/effects/ParticleExplosion';
import LevelUpNotification from './components/ui/LevelUpNotification';
import FloatingText from './components/effects/FloatingText';
import AnimatedBubbles from './components/effects/AnimatedBubbles';
import useScreenShake from './hooks/useScreenShake';
import GameSetup from './components/game/GameSetup';
import GameArea from './components/game/GameArea';
import Welcome from './components/ui/Welcome';
import LoadingScreen from './components/ui/LoadingScreen';
import LeaderboardModal from './components/ui/LeaderboardModal';

function App() {
  // Blockchain connection states
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("0");
  
  // Player states
  const [playerName, setPlayerName] = useState('');
  const [inputName, setInputName] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Game state
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [level, setLevel] = useState(1);
  const [gameActive, setGameActive] = useState(false);
  const [targets, setTargets] = useState([]);
  const [sessionHighScore, setSessionHighScore] = useState(0);
  const [showPlayAgain, setShowPlayAgain] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [storedHighScore, setStoredHighScore] = useState(0);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  // Game mode states
  const [gameMode, setGameMode] = useState('standard'); // 'standard', 'survival', 'timeAttack', 'precision'
  const [missedClicks, setMissedClicks] = useState(0); // For precision mode
  const [difficultyFactor, setDifficultyFactor] = useState(1); // For survival mode
  const [gameStartTime, setGameStartTime] = useState(null); // For tracking when game started
  
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
  const [clickCooldown, setClickCooldown] = useState(false); // To prevent rapid clicks
  const [showConfetti, setShowConfetti] = useState(false);

  // Leaderboard states
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [leaderboards, setLeaderboards] = useState({
    standard: [],
    survival: [],
    timeAttack: [],
    precision: []
  });

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

  // Convert game mode string to contract enum value
  const getGameModeValue = (mode) => {
    switch(mode) {
      case 'standard': return 0;
      case 'survival': return 1;
      case 'timeAttack': return 2;
      case 'precision': return 3;
      default: return 0;
    }
  };

  // Initialize Web3Modal for wallet connection
  const web3Modal = new Web3Modal({
    network: "somnia",
    cacheProvider: true,
    providerOptions: {}
  });

  // Check for saved wallet connection when app loads
  useEffect(() => {
    const checkSavedConnection = async () => {
      try {
        // Check if we have a saved connection timestamp
        const savedConnectionData = localStorage.getItem('somniaSpeedsterConnection');
        
        if (savedConnectionData) {
          const { timestamp } = JSON.parse(savedConnectionData);
          const currentTime = new Date().getTime();
          const daysSinceConnection = (currentTime - timestamp) / (1000 * 60 * 60 * 24);
          
          // If connection is less than 20 days old
          if (daysSinceConnection < 20) {
            // Check if provider is cached
            if (web3Modal.cachedProvider) {
              await reconnectWallet();
            }
          } else {
            // Connection too old, clear it
            localStorage.removeItem('somniaSpeedsterConnection');
            await web3Modal.clearCachedProvider();
          }
        }
      } catch (error) {
        console.error("Error checking saved connection:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSavedConnection();
  }, []);

  // Update background color and screen shake based on level
  useEffect(() => {
    if (gameActive) {
      // Create a dynamic background color based on level
      const hue = (level * 20) % 360;
      setBackgroundColor(`hsl(${hue}, 40%, 10%)`);
      
      // Screen shake when leveling up (except first level)
      if (level > 1) {
        shake(1.5, 500);
      }
    } else {
      // Reset background color when game ends
      setBackgroundColor('rgb(18, 18, 18)');
    }
  }, [level, gameActive, shake]);
  
  // Show level up notification
  useEffect(() => {
    if (level > 1 && gameActive) {
      setShowLevelUp(true);
      setTimeout(() => {
        setShowLevelUp(false);
      }, 1500);
    }
  }, [level, gameActive]);

  // Update high score and leaderboard when game mode changes
  useEffect(() => {
    if (contract && account && isRegistered) {
      const updateHighScore = async () => {
        try {
          const playerInfo = await contract.getPlayerInfo(account);
          updateStoredHighScore(playerInfo);
          loadLeaderboard(contract, gameMode);
        } catch (error) {
          console.error("Error updating high score for game mode:", error);
        }
      };
      
      updateHighScore();
    }
  }, [gameMode, contract, account, isRegistered]);

  // Load all leaderboards when contract is available
  useEffect(() => {
    if (contract) {
      loadAllLeaderboards();
    }
  }, [contract]);

  // Load leaderboards for all game modes
  const loadAllLeaderboards = async () => {
    if (!contract) return;
    
    const modes = ['standard', 'survival', 'timeAttack', 'precision'];
    for (const mode of modes) {
      await loadLeaderboard(contract, mode);
    }
  };

  // Update stored high score based on current game mode
  const updateStoredHighScore = (playerInfo) => {
    if (!playerInfo) return;
    
    switch(gameMode) {
      case 'standard':
        setStoredHighScore(playerInfo.standardHighScore.toNumber());
        break;
      case 'survival':
        setStoredHighScore(playerInfo.survivalHighScore.toNumber());
        break;
      case 'timeAttack':
        setStoredHighScore(playerInfo.timeAttackHighScore.toNumber());
        break;
      case 'precision':
        setStoredHighScore(playerInfo.precisionHighScore.toNumber());
        break;
      default:
        setStoredHighScore(playerInfo.standardHighScore.toNumber());
    }
  };

  // Handle game mode selection
  const selectGameMode = (mode) => {
    setGameMode(mode);
    
    // Reset game state
    setScore(0);
    setLevel(1);
    setDifficultyFactor(1);
    setMissedClicks(0);
    
    // Set time based on mode
    if (mode === 'timeAttack') {
      setTimeLeft(30); // 30 seconds for Time Attack
    } else {
      setTimeLeft(60); // 60 seconds for Standard and Precision
    }
    
    // For survival mode, we don't use a timer
    if (mode === 'survival') {
      setTimeLeft(null);
    }
  };

  // Generate random power-ups during gameplay
  const generatePowerUp = () => {
    // Don't generate power-ups in survival mode
    if (gameMode === 'survival' || !gameActive) return;
    
    // Define power-up types
    const powerUpTypes = [
      {
        type: 'points',
        color: '#FFD700', // Gold
        size: 40,
        effect: () => {
          // Add bonus points (50-100 points)
          const bonusPoints = Math.floor(Math.random() * 51) + 50;
          setScore(prev => prev + bonusPoints);
          
          // Show floating text
          showFloatingText(`+${bonusPoints}`, '#FFD700');
        }
      },
      {
        type: 'time',
        color: '#00FFFF', // Cyan
        size: 40,
        effect: () => {
          // Only add time in timed modes
          if (gameMode !== 'survival') {
            // Add 5-10 seconds
            const bonusTime = Math.floor(Math.random() * 6) + 5;
            setTimeLeft(prev => prev + bonusTime);
            
            // Show floating text
            showFloatingText(`+${bonusTime}s`, '#00FFFF');
          }
        }
      },
      {
        type: 'multiplier',
        color: '#FF00FF', // Magenta
        size: 40,
        effect: () => {
          // Set multiplier (2x-3x)
          const multiplier = Math.floor(Math.random() * 2) + 2;
          setScoreMultiplier(multiplier);
          setMultiplierActive(true);
          setMultiplierTimeLeft(10); // 10 seconds of multiplier
          
          // Show floating text
          showFloatingText(`${multiplier}x Score`, '#FF00FF');
        }
      }
    ];
    
    // Select a random power-up type
    const powerUpType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    
    // Create power-up object
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
    
    // Add to power-ups array
    setPowerUps(prev => [...prev, powerUp]);
    
    // Auto-remove power-up after delay
    setTimeout(() => {
      setPowerUps(prev => prev.filter(p => p.id !== id));
    }, 3000); // Power-ups last for 3 seconds
  };

  // Handle player collecting a power-up
  const handlePowerUpClick = (id) => {
    if (!gameActive || clickCooldown) return;
    
    setClickCooldown(true);
    setTimeout(() => setClickCooldown(false), 100);
    
    // Find power-up
    const powerUp = powerUps.find(p => p.id === id);
    if (!powerUp) return;
    
    // Apply power-up effect
    powerUp.effect();
    
    // Create explosion at power-up position
    const explosion = {
      id: `explosion-${Date.now()}`,
      x: powerUp.x + powerUp.size / 2,
      y: powerUp.y + powerUp.size / 2,
      color: powerUp.color
    };
    
    setExplosions(prev => [...prev, explosion]);
    
    // Remove power-up
    setPowerUps(prev => prev.filter(p => p.id !== id));
  };

  // Display floating text on screen
  const showFloatingText = (text, color) => {
    const id = `text-${Date.now()}`;
    const x = windowSize.width / 2 - 50;
    const y = windowSize.height / 2 - 50;
    
    setFloatingTexts(prev => [...prev, { id, text, color, x, y }]);
    
    // Remove text after animation
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 2000);
  };

  // Remove floating text
  const removeFloatingText = (id) => {
    setFloatingTexts(prev => prev.filter(t => t.id !== id));
  };

  // Reconnect to previously connected wallet
  const reconnectWallet = async () => {
    try {
      const web3Provider = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(web3Provider);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      
      setProvider(provider);
      setSigner(signer);
      setContract(contract);
      setAccount(address);

      // Check if player is registered
      try {
        const playerInfo = await contract.getPlayerInfo(address);
        if (playerInfo && playerInfo.name) {
          setPlayerName(playerInfo.name);
          setInputName(playerInfo.name);
          setIsRegistered(true);
          updateStoredHighScore(playerInfo);
        }
      } catch (error) {
        console.log("Player not registered yet");
      }

      // Load leaderboard for current game mode
      loadLeaderboard(contract, gameMode);

      // Get wallet balance
      getBalance(address, provider);
      
      // Handle wallet account changes
      web3Provider.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          window.location.reload();
        }
      });

    } catch (error) {
      console.error("Could not reconnect to wallet:", error);
      await web3Modal.clearCachedProvider();
      localStorage.removeItem('somniaSpeedsterConnection');
    }
  };

  // Connect to wallet
  const connectWallet = async () => {
    try {
      const web3Provider = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(web3Provider);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      // Reset player state for new wallet
      setPlayerName('');
      setInputName('');
      setIsRegistered(false);
      setStoredHighScore(0);
      
      setProvider(provider);
      setSigner(signer);
      setContract(contract);
      setAccount(address);

      // Save connection timestamp
      localStorage.setItem('somniaSpeedsterConnection', JSON.stringify({
        timestamp: new Date().getTime()
      }));

      // Check if player is registered
      try {
        const playerInfo = await contract.getPlayerInfo(address);
        if (playerInfo && playerInfo.name) {
          setPlayerName(playerInfo.name);
          setInputName(playerInfo.name);
          setIsRegistered(true);
          updateStoredHighScore(playerInfo);
        }
      } catch (error) {
        console.log("Player not registered yet");
      }

      // Load leaderboard for current game mode
      loadLeaderboard(contract, gameMode);

      // Get wallet balance
      getBalance(address, provider);
      
      // Handle wallet account changes
      web3Provider.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          window.location.reload();
        }
      });

    } catch (error) {
      console.error("Could not connect to wallet:", error);
    }
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    await web3Modal.clearCachedProvider();
    localStorage.removeItem('somniaSpeedsterConnection');
    window.localStorage.removeItem("walletconnect"); // Clear WalletConnect cache if using it
    setProvider(null);
    setSigner(null);
    setContract(null);
    setAccount(null);
    setPlayerName('');
    setInputName('');
    setIsRegistered(false);
    setStoredHighScore(0);
  };

  // Get wallet balance
  const getBalance = async (address, provider) => {
    if (!provider) return;
    
    try {
      // Get token balance
      const balanceWei = await provider.getBalance(address);
      const balanceEth = ethers.utils.formatEther(balanceWei);
      setBalance(parseFloat(balanceEth).toFixed(4));
    } catch (error) {
      console.error("Error getting balance:", error);
    }
  };

  // Register new player
  const registerPlayer = async () => {
    if (!contract || !inputName) return;

    try {
      const tx = await contract.registerPlayer(inputName);
      await tx.wait();
      setPlayerName(inputName);
      setIsRegistered(true);
      alert("Registration successful!");
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Registration failed. See console for details.");
    }
  };

  // Load leaderboard for a specific game mode
  const loadLeaderboard = async (contractInstance, mode = gameMode) => {
    try {
      const currentGameModeValue = getGameModeValue(mode);
      const leaderboardData = await contractInstance.getLeaderboard(currentGameModeValue);
      
      const formattedLeaderboard = leaderboardData
        .filter(entry => entry.score.gt(0))
        .map(entry => ({
          address: entry.playerAddress,
          name: entry.name,
          score: entry.score.toNumber()
        }));
      
      // Store in leaderboards object by mode
      setLeaderboards(prev => ({
        ...prev,
        [mode]: formattedLeaderboard
      }));
      
      // If this is the current game mode, also update the main leaderboard state
      if (mode === gameMode) {
        setLeaderboard(formattedLeaderboard);
      }
      
      // Update stored high score if player is in the leaderboard
      if (account && mode === gameMode) {
        const playerEntry = formattedLeaderboard.find(entry => 
          entry.address.toLowerCase() === account.toLowerCase()
        );
        if (playerEntry) {
          setStoredHighScore(playerEntry.score);
        }
      }
    } catch (error) {
      console.error(`Failed to load ${mode} leaderboard:`, error);
    }
  };

  // Start a new game
  const startGame = () => {
    if (!isRegistered) {
      alert("Please register before playing!");
      return;
    }

    setGameActive(true);
    setScore(0);
    setTargets([]);
    setPowerUps([]);
    setShowPlayAgain(false);
    setScoreSubmitted(false);
    setExplosions([]);
    setMissedClicks(0);
    setDifficultyFactor(1);
    setLevel(1);
    setGameStartTime(Date.now());
    setScoreMultiplier(1);
    setMultiplierActive(false);
    setMultiplierTimeLeft(0);
    setFloatingTexts([]);
    
    // Set time based on game mode
    if (gameMode === 'timeAttack') {
      setTimeLeft(30);
    } else if (gameMode === 'standard' || gameMode === 'precision') {
      setTimeLeft(60);
    }
    // For survival mode, we don't set a timer
  };

  // Submit high score to blockchain
  const submitScore = async () => {
    if (!contract) return;

    try {
      const currentGameModeValue = getGameModeValue(gameMode);
      const tx = await contract.submitScore(sessionHighScore, currentGameModeValue);
      await tx.wait();
      
      console.log("Score submitted successfully!");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      
      // Reload leaderboards
      loadAllLeaderboards();
      setScoreSubmitted(true); // Mark the score as submitted
      
      // Update stored high score if this is a new high score
      if (sessionHighScore > storedHighScore) {
        setStoredHighScore(sessionHighScore);
      }
      
      setSessionHighScore(0);
    } catch (error) {
      console.error("Failed to submit score:", error);
    }
  };

  // Update score (for non-high scores)
  const updateScore = async () => {
    if (!contract) return;

    try {
      const currentGameModeValue = getGameModeValue(gameMode);
      const tx = await contract.submitScore(sessionHighScore, currentGameModeValue);
      await tx.wait();
      
      console.log("Score updated successfully!");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      
      // Reload leaderboards
      loadAllLeaderboards();
      setScoreSubmitted(true);
      setSessionHighScore(0);
    } catch (error) {
      console.error("Failed to update score:", error);
    }
  };

  // Remove explosion effect after animation completes
  const removeExplosion = (id) => {
    setExplosions(prev => prev.filter(explosion => explosion.id !== id));
  };

  // Handle background clicks (for precision mode)
  const handleBackgroundClick = (e) => {
    // Only penalize if in precision mode and game is active
    if (gameMode === 'precision' && gameActive) {
      // Make sure we're not clicking on a target or power-up
      if (e.target.className !== 'target' && !e.target.className.includes('power-up')) {
        setMissedClicks(prev => prev + 1);
        setScore(prev => Math.max(0, prev - 5)); // Subtract 5 points for misclick
        
        // Visual feedback for misclick
        const misclickExplosion = {
          id: `misclick-${Date.now()}`,
          x: e.clientX,
          y: e.clientY,
          color: '#FF0000' // Red for misclick
        };
        setExplosions(prev => [...prev, misclickExplosion]);
      }
    }
  };

  // Handle target click
  const handleTargetClick = (id) => {
    if (!gameActive || clickCooldown) return;
    
    setClickCooldown(true);
    setTimeout(() => setClickCooldown(false), 100);

    // Find target for position
    const target = targets.find(t => t.id === id);
    if (!target) return;

    // Create explosion at target position
    const explosion = {
      id: `explosion-${Date.now()}`,
      x: target.x + target.size / 2,
      y: target.y + target.size / 2,
      color: target.color
    };
    
    setExplosions(prev => [...prev, explosion]);

    // Calculate score based on game mode
    let pointsGained;
    switch(gameMode) {
      case 'survival':
        // In survival, smaller targets are worth more
        pointsGained = Math.round(20 * (1 + (difficultyFactor * 0.1)));
        // Increase difficulty after each hit
        setDifficultyFactor(prev => prev + 0.1);
        break;
      case 'timeAttack':
        // More points for faster clicks in time attack
        const timeSinceStart = (Date.now() - gameStartTime) / 1000;
        const timeBonus = Math.max(1, 2 - (timeSinceStart / 30)); // Higher bonus early in the game
        pointsGained = Math.round((10 * level) * timeBonus);
        break;
      case 'precision':
        // Standard scoring for precision (penalties come from misclicks)
        pointsGained = 10 * level;
        break;
      default: // standard mode
        pointsGained = 10 * level;
    }

    // Apply multiplier if active
    if (multiplierActive) {
      pointsGained = Math.round(pointsGained * scoreMultiplier);
    }

    // Increase score
    const newScore = score + pointsGained;
    setScore(newScore);

    // Remove target
    setTargets(targets.filter(target => target.id !== id));

    // Level up logic based on game mode
    if (gameMode !== 'survival') {
      if (newScore >= level * 100 && newScore < (level + 1) * 100) {
        setLevel(prev => prev + 1);
      }
    } else {
      // In survival, level is based on difficulty
      const newLevel = Math.floor(difficultyFactor / 2) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
      }
    }
  };

  // Update window size for confetti and responsive design
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
      // Timer countdown for standard, timeAttack and precision modes
      if (gameMode !== 'survival' && timeLeft !== null) {
        timer = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              clearInterval(spawnTimer);
              clearInterval(powerUpTimer);
              clearInterval(multiplierTimer);
              setGameActive(false);
              
              // Calculate final score for precision mode
              let finalScore = score;
              if (gameMode === 'precision') {
                finalScore = Math.max(0, score - (missedClicks * 10)); // Additional penalty for total misclicks
              }
              
              // Update session high score if current score is higher
              if (finalScore > sessionHighScore) {
                setSessionHighScore(finalScore);
              }
              
              setScore(finalScore); // Update the displayed score
              setShowPlayAgain(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }

      // Spawn targets with different logic based on game mode
      const spawnTarget = () => {
        const id = Date.now();
        
        // Base size calculation - different for each mode
        let size;
        let lifetime;
        
        switch(gameMode) {
          case 'survival':
            // Targets get progressively smaller in survival mode
            size = Math.max(15, 60 - (difficultyFactor * 5));
            lifetime = Math.max(500, 2000 - (difficultyFactor * 100));
            break;
          case 'timeAttack':
            // Slightly smaller targets in time attack for challenge
            size = Math.max(20, 50 - (level * 2));
            lifetime = 1500;
            break;
          case 'precision':
            // Normal sized targets but they disappear faster
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

        // Auto-remove target after delay
        setTimeout(() => {
          setTargets(prev => {
            // In survival mode, missing a target ends the game
            if (gameMode === 'survival') {
              const targetExists = prev.find(target => target.id === id);
              if (targetExists) {
                // Target timed out - game over
                clearInterval(spawnTimer);
                clearInterval(powerUpTimer);
                clearInterval(multiplierTimer);
                setGameActive(false);
                
                // Update session high score
                if (score > sessionHighScore) {
                  setSessionHighScore(score);
                }
                
                setShowPlayAgain(true);
              }
            }
            return prev.filter(target => target.id !== id);
          });
        }, lifetime);
      };

      // Initial target spawn
      spawnTarget();

      // Continuous target spawning with different intervals based on mode
      let spawnInterval;
      switch(gameMode) {
        case 'survival':
          spawnInterval = Math.max(200, 1000 - (difficultyFactor * 50));
          break;
        case 'timeAttack':
          spawnInterval = Math.max(200, 800 - (level * 50)); // Faster spawning in time attack
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

      // Power-up generation timer
      powerUpTimer = setInterval(() => {
        // Higher chance of power-up at higher levels
        const powerUpChance = 0.15 + (level * 0.02);
        if (Math.random() < powerUpChance) {
          generatePowerUp();
        }
      }, 5000); // Check every 5 seconds

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

      // Clean up timers when game ends or component unmounts
      return () => {
        clearInterval(timer);
        clearInterval(spawnTimer);
        clearInterval(powerUpTimer);
        clearInterval(multiplierTimer);
      };
    }
  }, [gameActive, level, score, sessionHighScore, gameMode, difficultyFactor, windowSize, missedClicks, multiplierActive]);

  // Show loading screen while checking connection
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
        <h1>Somnia Speedster</h1>
        <div className="header-actions">
          {isRegistered && (
            <button 
              className="leaderboard-button"
              onClick={() => setShowLeaderboardModal(true)}
            >
              Leaderboard
            </button>
          )}
          {account ? (
            <div className="wallet-info">
              <span>{account.substring(0, 6)}...{account.substring(account.length - 4)}</span>
              <span className="balance">{balance} SOMNIA</span>
              <button onClick={disconnectWallet}>Disconnect</button>
            </div>
          ) : (
            <button className="connect-button" onClick={connectWallet}>Connect Wallet</button>
          )}
        </div>
      </header>

      <main className="main">
        {account && !gameActive ? (
          <GameSetup 
            isRegistered={isRegistered}
            inputName={inputName}
            setInputName={setInputName}
            registerPlayer={registerPlayer}
            showPlayAgain={showPlayAgain}
            setShowPlayAgain={setShowPlayAgain}
            score={score}
            gameMode={gameMode}
            missedClicks={missedClicks}
            difficultyFactor={difficultyFactor}
            sessionHighScore={sessionHighScore}
            storedHighScore={storedHighScore}
            startGame={startGame}
            scoreSubmitted={scoreSubmitted}
            submitScore={submitScore}
            updateScore={updateScore}
            playerName={playerName}
            selectGameMode={selectGameMode}
            buttonAnimation={buttonAnimation}
            account={account}
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
            difficultyFactor={difficultyFactor}
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
          />
        ) : !account ? (
          <Welcome 
            connectWallet={connectWallet}
            buttonAnimation={buttonAnimation}
          />
        ) : null}
      </main>
      
      {/* Leaderboard Modal */}
      <LeaderboardModal 
        show={showLeaderboardModal}
        onClose={() => setShowLeaderboardModal(false)}
        leaderboards={leaderboards}
        account={account}
      />
    </animated.div>
  );
}

export default App;
