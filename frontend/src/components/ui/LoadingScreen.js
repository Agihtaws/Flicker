import React from 'react';
import { useSpring, animated } from 'react-spring';

function LoadingScreen() {
  const fadeAnimation = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 800 }
  });

  const pulseAnimation = useSpring({
    from: { transform: 'scale(1)' },
    to: { transform: 'scale(1.1)' },
    config: { duration: 1000 },
    loop: { reverse: true }
  });

  return (
    <animated.div 
      className="loading-screen"
      style={{
        ...fadeAnimation,
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        color: '#fff',
        zIndex: 10000
      }}
    >
      <animated.div style={pulseAnimation}>
        <div style={{
          width: '80px',
          height: '80px',
          border: '4px solid rgba(255, 107, 53, 0.3)',
          borderTop: '4px solid #FF6B35',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '30px',
          boxShadow: '0 0 30px rgba(255, 107, 53, 0.5)'
        }} />
      </animated.div>
      
      <div style={{
        textAlign: 'center',
        maxWidth: '300px'
      }}>
        <h2 style={{
          fontSize: '1.8rem',
          marginBottom: '15px',
          background: 'linear-gradient(45deg, #FF6B35, #FFD700)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🎯 Loading Arena
        </h2>
        
        <p style={{
          fontSize: '1.1rem',
          color: '#ccc',
          marginBottom: '20px',
          opacity: 0.8
        }}>
          Preparing your gaming experience...
        </p>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px'
        }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#FF6B35',
                animation: `loadingDots 1.4s infinite ease-in-out both`,
                animationDelay: `${i * 0.16}s`
              }}
            />
          ))}
        </div>
      </div>
    </animated.div>
  );
}

export default LoadingScreen;
