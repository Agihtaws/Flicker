pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SomniaSpeedster is Ownable {
    // Game modes
    enum GameMode { STANDARD, SURVIVAL, TIME_ATTACK, PRECISION }
    
    // Structs
    struct Player {
        string name;
        mapping(uint8 => uint256) highScores; // Maps GameMode to high score
        uint256 gamesPlayed;
        uint256 lastPlayedAt;
    }

    struct PlayerInfo {
        string name;
        uint256 standardHighScore;
        uint256 survivalHighScore;
        uint256 timeAttackHighScore;
        uint256 precisionHighScore;
        uint256 gamesPlayed;
    }

    struct LeaderboardEntry {
        address playerAddress;
        string name;
        uint256 score;
    }

    // State variables
    mapping(address => Player) public players;
    address[] public registeredPlayers;
    uint256 public totalGamesPlayed;
    
    // Game configuration
    mapping(uint8 => uint256) public gameTimeSeconds;

    // Events
    event PlayerRegistered(address indexed player, string name);
    event GameCompleted(address indexed player, string name, uint256 score, uint8 gameMode);
    event NewHighScore(address indexed player, string name, uint256 score, uint8 gameMode);

    constructor() Ownable(msg.sender) {
        // Default game times for different modes
        gameTimeSeconds[uint8(GameMode.STANDARD)] = 60;
        gameTimeSeconds[uint8(GameMode.TIME_ATTACK)] = 30;
        gameTimeSeconds[uint8(GameMode.PRECISION)] = 60;
        // Survival mode doesn't use a timer
    }

    // Register a new player or update existing player's name
    function registerPlayer(string memory _name) external {
        if (players[msg.sender].gamesPlayed == 0) {
            registeredPlayers.push(msg.sender);
        }
        
        players[msg.sender].name = _name;
        
        emit PlayerRegistered(msg.sender, _name);
    }

    // Submit a game score with game mode
    function submitScore(uint256 _score, uint8 _gameMode) external {
        require(bytes(players[msg.sender].name).length > 0, "Player not registered");
        require(_gameMode <= uint8(GameMode.PRECISION), "Invalid game mode");
        
        players[msg.sender].gamesPlayed++;
        players[msg.sender].lastPlayedAt = block.timestamp;
        totalGamesPlayed++;
        
        emit GameCompleted(msg.sender, players[msg.sender].name, _score, _gameMode);
        
        // Update high score for this game mode if needed
        if (_score > players[msg.sender].highScores[_gameMode]) {
            players[msg.sender].highScores[_gameMode] = _score;
            emit NewHighScore(msg.sender, players[msg.sender].name, _score, _gameMode);
        }
    }

    // Get player info with scores for all game modes
    function getPlayerInfo(address _player) external view returns (PlayerInfo memory) {
        Player storage player = players[_player];
        return PlayerInfo({
            name: player.name,
            standardHighScore: player.highScores[uint8(GameMode.STANDARD)],
            survivalHighScore: player.highScores[uint8(GameMode.SURVIVAL)],
            timeAttackHighScore: player.highScores[uint8(GameMode.TIME_ATTACK)],
            precisionHighScore: player.highScores[uint8(GameMode.PRECISION)],
            gamesPlayed: player.gamesPlayed
        });
    }

    // Get leaderboard for a specific game mode (top 10 players)
    function getLeaderboard(uint8 _gameMode) external view returns (LeaderboardEntry[] memory) {
        require(_gameMode <= uint8(GameMode.PRECISION), "Invalid game mode");
        
        uint256 playerCount = registeredPlayers.length;
        uint256 resultSize = playerCount > 10 ? 10 : playerCount;
        
        LeaderboardEntry[] memory leaderboard = new LeaderboardEntry[](resultSize);
        
        // Create initial array with all players
        LeaderboardEntry[] memory allPlayers = new LeaderboardEntry[](playerCount);
        for (uint256 i = 0; i < playerCount; i++) {
            address playerAddress = registeredPlayers[i];
            Player storage player = players[playerAddress];
            allPlayers[i] = LeaderboardEntry({
                playerAddress: playerAddress,
                name: player.name,
                score: player.highScores[_gameMode]
            });
        }
        
        // Simple bubble sort to find top scores
        for (uint256 i = 0; i < resultSize; i++) {
            uint256 maxIndex = i;
            
            for (uint256 j = i + 1; j < playerCount; j++) {
                if (allPlayers[j].score > allPlayers[maxIndex].score) {
                    maxIndex = j;
                }
            }
            
            if (maxIndex != i) {
                LeaderboardEntry memory temp = allPlayers[i];
                allPlayers[i] = allPlayers[maxIndex];
                allPlayers[maxIndex] = temp;
            }
            
            leaderboard[i] = allPlayers[i];
        }
        
        return leaderboard;
    }
    
    // Owner can update game time for specific game modes
    function setGameTimeSeconds(uint8 _gameMode, uint256 _seconds) external onlyOwner {
        require(_gameMode <= uint8(GameMode.PRECISION), "Invalid game mode");
        gameTimeSeconds[_gameMode] = _seconds;
    }
    
    // Get the current high score for a player in a specific game mode
    function getPlayerHighScore(address _player, uint8 _gameMode) external view returns (uint256) {
        require(_gameMode <= uint8(GameMode.PRECISION), "Invalid game mode");
        return players[_player].highScores[_gameMode];
    }
}

