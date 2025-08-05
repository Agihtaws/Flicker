# Somnia Speedster

A blockchain-based arcade game built on the Somnia Network where players can test their reflexes, earn high scores, and compete on global leaderboards.

🎮 [Live Demo](https://somnia-speedster.vercel.app/)

## 🎥 Demo Video ⭐

[![Watch the video](https://img.youtube.com/vi/2ZC7TquCAqc/0.jpg)](https://youtu.be/2ZC7TquCAqc)


✨ Features
- **Blockchain Integration**: Game scores permanently recorded on the Somnia Testnet
- **Multiple Game Modes**: Standard, Survival, Time Attack, and Precision modes
- **Power-ups System**: Collect special items for bonuses during gameplay
- **Dynamic Difficulty**: Game adapts to your skill level as you progress
- **Global Leaderboards**: Compete with players worldwide across all game modes
- **Visual Effects**: Engaging particle explosions, screen shake, and level-up notifications
- **Wallet Connection**: Seamless integration with Web3 wallets
- **Responsive Design**: Play on desktop or mobile devices

🛠️ Tech Stack
- **Smart Contract**: Solidity 0.8.19
- **Blockchain**: Somnia Testnet
- **Frontend**: React.js
- **Web3 Integration**: ethers.js
- **Wallet Connection**: Web3Modal
- **Animations**: react-spring
- **Styling**: CSS with responsive design

🏆 Game Modes
- **Standard**: 60 seconds to score as high as possible
- **Survival**: Targets get smaller and faster until you miss one
- **Time Attack**: Score as much as possible in 30 seconds
- **Precision**: Misclicks reduce your score

📋 Project Structure
```
somnia-speedster/
├── contracts/
│   └── SomniaSpeedster.sol    # Main smart contract
├── scripts/
│   └── deploy.js              # Deployment script
├── somnia-speedster-frontend/
│   ├── components/
│   │   ├── effects/
│   │   │   ├── AnimatedBubbles.js
│   │   │   ├── FloatingText.js
│   │   │   └── ParticleExplosion.js
│   │   ├── game/
│   │   │   ├── GameArea.js
│   │   │   └── GameSetup.js
│   │   └── ui/
│   │       ├── LeaderboardModal.js
│   │       ├── LevelUpNotification.js
│   │       ├── LoadingScreen.js
│   │       └── Welcome.js
│   ├── contracts/
│   │   └── contractABI.js     # Contract ABI and address
│   ├── hooks/
│   │   └── useScreenShake.js  # Custom hook for screen shake effect
│   ├── App.js                 # Main application component
│   └── index.js               # Application entry point
└── test/
    └── Lock.js                # Test file
```

🚀 Getting Started

Prerequisites
- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- Web3 wallet (MetaMask recommended)
- Somnia Testnet tokens (for contract interaction)

Installation

Smart Contract Deployment
1. Clone the repository:
```
git clone https://github.com/Agihtaws/Somnia-Speedster.git
cd Somnia-Speedster
```

2. Install dependencies:
```
npm install
```

3. Create a `.env` file in the root directory with:
```
PRIVATE_KEY=your_wallet_private_key
SOMNIA_RPC_URL=https://rpc.somnia.network
```

4. Compile and deploy the contract:
```
npx hardhat clean
npx hardhat compile
npx hardhat run scripts/deploy.js --network somnia
```

5. Note the deployed contract address for frontend configuration.

Frontend Setup
1. Navigate to the frontend directory:
```
cd somnia-speedster-frontend
```

2. Install frontend dependencies:
```
npm install
```

3. Update the contract address in `src/contracts/contractABI.js` with your deployed contract address.

4. Start the development server:
```
npm start
```

5. For production build:
```
npm run build
```

Getting Somnia Testnet Tokens
- Visit the [Somnia Testnet Faucet](https://faucet.somnia.network)
- Join the [Somnia Discord](https://discord.gg/somnia) for support

🎮 How to Play
1. Connect your Web3 wallet to Somnia Testnet
2. Register with a player name (one-time transaction)
3. Select a game mode
4. Click targets as they appear to earn points
5. Collect power-ups for special bonuses
6. Submit your high score to the blockchain

Game Controls
- **Click/Tap**: Hit targets and collect power-ups
- In Precision mode, misclicks will reduce your score

🏆 Leaderboard System
- Scores are permanently recorded on the blockchain
- View global rankings for each game mode
- See your personal best scores
- Compete for the top position

🔗 Smart Contract
The Somnia Speedster contract is deployed on Somnia Testnet at:
`0xaf9307544bBC8240B0FdDa22c7e5AAc930aF476C`

Key Contract Functions
- `registerPlayer(string name)`: Register a new player
- `submitScore(uint256 score, uint8 gameMode)`: Submit a score for a specific game mode
- `getPlayerInfo(address player)`: Get player information and high scores
- `getLeaderboard(uint8 gameMode)`: Get the top players for a specific game mode

🎯 Future Enhancements
- Player vs. Player mode
- Daily challenges with special rewards
- NFT rewards for top scores
- Mobile app version
- More power-ups and game mechanics
- Tournament system

📄 License
This project is licensed under the Apache License - see the LICENSE file for details.

👥 Contributors
- Swathiga Agihtaws - Developer

🙏 Acknowledgements
- [Somnia Network](https://somnia.network) for the blockchain infrastructure
- [ethers.js](https://docs.ethers.io/) for blockchain interaction
- [react-spring](https://react-spring.io/) for animations
- [react-confetti](https://github.com/alampros/react-confetti) for celebration effects
- [Web3Modal](https://github.com/Web3Modal/web3modal) for wallet connection
