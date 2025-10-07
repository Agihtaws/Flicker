import React, { useState, useEffect, useRef } from 'react';
import { useSpring, animated } from 'react-spring';

function Particle({ particle, onComplete }) {
  const [hasCompleted, setHasCompleted] = useState(false);
  
  const particleStyle = useSpring({
    from: { 
      transform: `translate(0px, 0px) rotate(0deg) scale(1)`,
      opacity: 1
    },
    to: { 
      transform: `translate(${particle.vx * 60}px, ${particle.vy * 60}px) rotate(${particle.rotation}deg) scale(0)`,
      opacity: 0
    },
    config: { 
      tension: 120, 
      friction: 14,
      duration: particle.lifetime 
    },
    onRest: () => {
      if (!hasCompleted) {
        setHasCompleted(true);
        onComplete(particle.id);
      }
    }
  });
  
  return (
    <animated.div
      className={`particle particle-${particle.shape}`}
      style={{
        ...particleStyle,
        position: 'absolute',
        width: particle.size,
        height: particle.size,
        background: `radial-gradient(circle, ${particle.color}, ${adjustParticleColor(particle.color)})`,
        borderRadius: particle.shape === 'circle' ? '50%' : '15%',
        marginLeft: -particle.size / 2,
        marginTop: -particle.size / 2,
        boxShadow: `0 0 ${particle.size}px ${particle.color}60`,
        border: `1px solid ${particle.color}`,
        pointerEvents: 'none'
      }}
    />
  );
}

function ParticleExplosion({ x, y, color, onComplete }) {
  const [particles, setParticles] = useState([]);
  const [burstComplete, setBurstComplete] = useState(false);
  const completedRef = useRef(false);
  
  // Central burst animation
  const burstAnimation = useSpring({
    from: { 
      transform: 'scale(0)',
      opacity: 1
    },
    to: [
      { transform: 'scale(2)', opacity: 0.8 },
      { transform: 'scale(4)', opacity: 0 }
    ],
    config: { tension: 200, friction: 15 },
    onRest: () => {
      setBurstComplete(true);
    }
  });
  
  useEffect(() => {
    const newParticles = [];
    const particleCount = 12;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / particleCount) * i;
      const velocity = 3 + Math.random() * 3;
      const size = 6 + Math.random() * 8;
      const lifetime = 500 + Math.random() * 200;
      const shapes = ['circle', 'square'];
      
      newParticles.push({
        id: `particle-${i}-${Date.now()}-${Math.random()}`,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        size,
        color: varyColor(color),
        lifetime,
        rotation: Math.random() * 360,
        shape: shapes[Math.floor(Math.random() * shapes.length)]
      });
    }
    
    setParticles(newParticles);
  }, [color]);

  // Remove individual particles
  const removeParticle = (particleId) => {
    setParticles(prev => prev.filter(p => p.id !== particleId));
  };

  // Check if explosion is complete
  useEffect(() => {
    if (burstComplete && particles.length === 0 && !completedRef.current) {
      completedRef.current = true;
      // Small delay to ensure visual completion
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 100);
    }
  }, [burstComplete, particles.length, onComplete]);

  // Force cleanup after timeout
  useEffect(() => {
    const forceCleanup = setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        if (onComplete) onComplete();
      }
    }, 1000);

    return () => clearTimeout(forceCleanup);
  }, [onComplete]);
  
  return (
    <div 
      className="particles-container" 
      style={{ 
        position: 'absolute', 
        left: x, 
        top: y,
        pointerEvents: 'none',
        zIndex: 999,
        width: 0,
        height: 0
      }}
    >
      {/* Central burst effect */}
      <animated.div
        className="particle-burst"
        style={{
          ...burstAnimation,
          position: 'absolute',
          width: 40,
          height: 40,
          marginLeft: -20,
          marginTop: -20,
          background: `radial-gradient(circle, ${color}80, transparent)`,
          borderRadius: '50%'
        }}
      />
      
      {/* Individual particles */}
      {particles.map(particle => (
        <Particle 
          key={particle.id} 
          particle={particle} 
          onComplete={removeParticle}
        />
      ))}
    </div>
  );
}

// Helper functions
function varyColor(baseColor) {
  const colors = [
    baseColor,
    adjustParticleColor(baseColor),
    lightenColor(baseColor)
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function adjustParticleColor(color) {
  return color.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/, (match, r, g, b) => {
    return `rgb(${Math.min(255, parseInt(r) + 30)}, ${Math.min(255, parseInt(g) + 20)}, ${Math.min(255, parseInt(b) + 40)})`;
  });
}

function lightenColor(color) {
  return color.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/, (match, r, g, b) => {
    return `rgb(${Math.min(255, parseInt(r) + 50)}, ${Math.min(255, parseInt(g) + 50)}, ${Math.min(255, parseInt(b) + 50)})`;
  });
}

export default ParticleExplosion;
