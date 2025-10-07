import React from 'react';
import { useSpring, animated } from 'react-spring';

function LevelUpNotification({ level }) {
  const notificationAnimation = useSpring({
    from: { 
      opacity: 0, 
      transform: 'translateY(-20px) scale(0.8)',
      filter: 'blur(3px)'
    },
    to: async (next) => {
      await next({ 
        opacity: 1, 
        transform: 'translateY(0px) scale(1)',
        filter: 'blur(0px)'
      });
      await next({ 
        opacity: 0, 
        transform: 'translateY(-10px) scale(0.9)',
        filter: 'blur(2px)'
      });
    },
    config: { tension: 200, friction: 25 }
  });

  return (
    <animated.div 
      className="level-up-notification"
      style={notificationAnimation}
    >
      <div className="level-up-content">
        <span className="level-up-icon">⭐</span>
        <span className="level-up-text">Level {level}</span>
      </div>
    </animated.div>
  );
}

export default LevelUpNotification;
