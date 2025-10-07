import React, { useState, useEffect, useCallback } from 'react';
import { animated, useSpring } from 'react-spring';

function AnimatedBubbles({ explosions = [], isGameActive = false }) {
  const [bubbles, setBubbles] = useState([]);
  
  useEffect(() => {
    // Only create bubbles when not in game mode
    if (isGameActive) {
      setBubbles([]);
      return;
    }

    // Create 20 random bubbles with varied properties
    const newBubbles = [];
    for (let i = 0; i < 20; i++) {
      newBubbles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 80 + 30,
        color: `hsl(${Math.random() * 360}, ${60 + Math.random() * 40}%, ${50 + Math.random() * 30}%, ${0.15 + Math.random() * 0.25})`,
        duration: Math.random() * 25000 + 15000,
        delay: Math.random() * 5000,
        direction: Math.random() > 0.5 ? 1 : -1,
        speed: 0.5 + Math.random() * 1.5,
        visible: true,
        exploded: false
      });
    }
    setBubbles(newBubbles);
    
    // Recreate bubbles every 30 seconds (only when not in game)
    const interval = setInterval(() => {
      if (!isGameActive) {
        setBubbles(prevBubbles => {
          return prevBubbles.map(bubble => ({
            ...bubble,
            x: Math.random() * 100,
            y: Math.random() * 100,
            color: `hsl(${Math.random() * 360}, ${60 + Math.random() * 40}%, ${50 + Math.random() * 30}%, ${0.15 + Math.random() * 0.25})`,
            duration: Math.random() * 25000 + 15000,
            direction: Math.random() > 0.5 ? 1 : -1,
            speed: 0.5 + Math.random() * 1.5,
            visible: true,
            exploded: false
          }));
        });
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [isGameActive]);

  // Check for explosions and hide nearby bubbles
  useEffect(() => {
    if (explosions.length === 0 || isGameActive) return;

    explosions.forEach(explosion => {
      setBubbles(prevBubbles => {
        return prevBubbles.map(bubble => {
          if (bubble.exploded) return bubble;

          // Convert bubble percentage position to pixel position
          const bubbleX = (bubble.x / 100) * window.innerWidth;
          const bubbleY = (bubble.y / 100) * window.innerHeight;
          
          // Calculate distance from explosion
          const distance = Math.sqrt(
            Math.pow(bubbleX - explosion.x, 2) + 
            Math.pow(bubbleY - explosion.y, 2)
          );
          
          // If bubble is within explosion radius
          const explosionRadius = 150;
          if (distance < explosionRadius) {
            return {
              ...bubble,
              visible: false,
              exploded: true
            };
          }
          
          return bubble;
        });
      });
    });
  }, [explosions, isGameActive]);

  // Regenerate exploded bubbles after a delay
  useEffect(() => {
    if (isGameActive) return;

    const timer = setTimeout(() => {
      setBubbles(prevBubbles => {
        return prevBubbles.map(bubble => {
          if (bubble.exploded && !bubble.visible) {
            // Create new bubble at random position
            return {
              ...bubble,
              x: Math.random() * 100,
              y: Math.random() * 100,
              color: `hsl(${Math.random() * 360}, ${60 + Math.random() * 40}%, ${50 + Math.random() * 30}%, ${0.15 + Math.random() * 0.25})`,
              visible: true,
              exploded: false,
              delay: Math.random() * 2000
            };
          }
          return bubble;
        });
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [bubbles, isGameActive]);

  // Don't render bubbles during gameplay
  if (isGameActive) {
    return null;
  }
  
  return (
    <div className="bubbles-container">
      {bubbles.map(bubble => (
        <BubbleComponent 
          key={bubble.id} 
          bubble={bubble}
        />
      ))}
    </div>
  );
}

function BubbleComponent({ bubble }) {
  const bubbleAnimation = useSpring({
    from: { 
      transform: `translate(${bubble.x}%, ${bubble.y}%) scale(0)`,
      opacity: 0
    },
    to: bubble.visible ? async (next) => {
      await next({ 
        transform: `translate(${bubble.x}%, ${bubble.y}%) scale(1)`,
        opacity: 1
      });
      // Continuous floating animation
      while (bubble.visible) {
        await next({
          transform: `translate(${bubble.x + (bubble.direction * 10)}%, ${bubble.y - 20}%) scale(1.1)`,
          opacity: 0.8
        });
        await next({
          transform: `translate(${bubble.x - (bubble.direction * 5)}%, ${bubble.y + 10}%) scale(0.9)`,
          opacity: 1
        });
      }
    } : {
      transform: `translate(${bubble.x}%, ${bubble.y}%) scale(0)`,
      opacity: 0
    },
    config: { 
      tension: 50, 
      friction: 25,
      duration: bubble.duration 
    },
    delay: bubble.delay
  });

  // Pop animation when bubble gets exploded
  const popAnimation = useSpring({
    from: { transform: 'scale(1)' },
    to: !bubble.visible && bubble.exploded ? [
      { transform: 'scale(1.3)' },
      { transform: 'scale(0)' }
    ] : { transform: 'scale(1)' },
    config: { tension: 300, friction: 10 }
  });
  
  return (
    <animated.div
      className="bubble"
      style={{
        ...bubbleAnimation,
        ...popAnimation,
        '--bubble-color': bubble.color,
        '--bubble-color-light': bubble.color.replace(/,\s*[\d.]+\)/, ', 0.4)'),
        '--bubble-color-border': bubble.color.replace(/,\s*[\d.]+\)/, ', 0.6)'),
        width: bubble.size,
        height: bubble.size
      }}
    />
  );
}

export default AnimatedBubbles;
