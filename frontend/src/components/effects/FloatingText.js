import React from 'react';
import { useSpring, animated } from 'react-spring';

function FloatingText({ text, color, x, y, id, onComplete }) {
  const textAnimation = useSpring({
    from: { 
      opacity: 0, 
      transform: 'translateY(0px) scale(0.5) rotate(-10deg)',
      filter: 'blur(4px)'
    },
    to: async (next) => {
      await next({ 
        opacity: 1, 
        transform: 'translateY(-20px) scale(1.2) rotate(0deg)',
        filter: 'blur(0px)'
      });
      await next({ 
        opacity: 0.8, 
        transform: 'translateY(-60px) scale(1.5) rotate(5deg)',
        filter: 'blur(1px)'
      });
      await next({ 
        opacity: 0, 
        transform: 'translateY(-100px) scale(0.8) rotate(-5deg)',
        filter: 'blur(3px)'
      });
    },
    config: { 
      tension: 200, 
      friction: 20,
      duration: 1500 
    },
    onRest: onComplete
  });
  
  return (
    <animated.div
      className="floating-text"
      style={{
        ...textAnimation,
        position: 'absolute',
        left: x,
        top: y,
        fontSize: '28px',
        fontWeight: '900',
        fontFamily: 'Arial, sans-serif',
        background: `linear-gradient(45deg, ${color}, ${adjustBrightness(color, 50)})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textShadow: `
          0 0 10px ${color}40,
          0 0 20px ${color}30,
          0 0 30px ${color}20,
          2px 2px 4px rgba(0, 0, 0, 0.8)
        `,
        zIndex: 1000,
        pointerEvents: 'none',
        userSelect: 'none',
        letterSpacing: '1px',
        textTransform: 'uppercase'
      }}
    >
      <span style={{
        display: 'inline-block',
        padding: '8px 16px',
        borderRadius: '20px',
        background: `rgba(${hexToRgb(color)}, 0.1)`,
        border: `2px solid ${color}40`,
        backdropFilter: 'blur(10px)'
      }}>
        {text}
      </span>
    </animated.div>
  );
}

// Helper function to adjust color brightness
function adjustBrightness(color, amount) {
  const usePound = color[0] === '#';
  const col = usePound ? color.slice(1) : color;
  const num = parseInt(col, 16);
  let r = (num >> 16) + amount;
  let g = (num >> 8 & 0x00FF) + amount;
  let b = (num & 0x0000FF) + amount;
  r = r > 255 ? 255 : r < 0 ? 0 : r;
  g = g > 255 ? 255 : g < 0 ? 0 : g;
  b = b > 255 ? 255 : b < 0 ? 0 : b;
  return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16);
}

// Helper function to convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
    '255, 255, 255';
}

export default FloatingText;
