import React, { useState, useEffect } from 'react';
import { animated } from 'react-spring';

function AnimatedBubbles() {
  const [bubbles, setBubbles] = useState([]);
  
  useEffect(() => {
    // Create 15 random bubbles
    const newBubbles = [];
    for (let i = 0; i < 15; i++) {
      newBubbles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 60 + 20,
        color: `hsl(${Math.random() * 360}, 80%, 60%, 0.3)`,
        duration: Math.random() * 20000 + 10000
      });
    }
    setBubbles(newBubbles);
    
    // Recreate bubbles every 20 seconds
    const interval = setInterval(() => {
      setBubbles(prevBubbles => {
        return prevBubbles.map(bubble => ({
          ...bubble,
          x: Math.random() * 100,
          y: Math.random() * 100,
          duration: Math.random() * 20000 + 10000
        }));
      });
    }, 20000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="bubbles-container">
      {bubbles.map(bubble => (
        <animated.div
          key={bubble.id}
          className="bubble"
          style={{
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            width: bubble.size,
            height: bubble.size,
            backgroundColor: bubble.color,
            borderRadius: '50%',
            position: 'absolute',
            animation: `float ${bubble.duration}ms infinite alternate ease-in-out`
          }}
        />
      ))}
    </div>
  );
}

export default AnimatedBubbles;
