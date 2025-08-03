import React from 'react';
import { animated } from 'react-spring';
import AnimatedBubbles from '../effects/AnimatedBubbles';

function Welcome({ connectWallet, buttonAnimation }) {
  return (
    <div className="welcome">
      <AnimatedBubbles />
      <h2>Welcome to Somnia Speedster!</h2>
      <p>Connect your wallet to play this exciting reaction game on the Somnia blockchain.</p>
      <p>Test your reflexes, compete with others, and climb the leaderboard!</p>
      <animated.button 
        className="connect-button-center"
        onClick={connectWallet}
        style={buttonAnimation}
      >
        Connect Wallet
      </animated.button>
    </div>
  );
}

export default Welcome;
