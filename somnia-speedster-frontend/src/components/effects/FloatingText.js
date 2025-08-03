import React from 'react';
import { useSpring, animated } from 'react-spring';

function FloatingText({ text, color, x, y, id, onComplete }) {
  const textAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(0px) scale(1)' },
    to: { opacity: 1, transform: 'translateY(-50px) scale(1.5)' },
    config: { duration: 1000 },
    onRest: onComplete
  });
  
  return (
    <animated.div
      className="floating-text"
      style={{
        ...textAnimation,
        color,
        position: 'absolute',
        left: x,
        top: y,
        fontSize: '24px',
        fontWeight: 'bold',
        textShadow: '0 0 10px rgba(0, 0, 0, 0.7)',
        zIndex: 1000,
        pointerEvents: 'none'
      }}
    >
      {text}
    </animated.div>
  );
}

export default FloatingText;
