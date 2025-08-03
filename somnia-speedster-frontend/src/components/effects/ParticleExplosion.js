import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';

// Particle Component
function Particle({ particle }) {
  const particleStyle = useSpring({
    from: { 
      transform: `translate(0px, 0px)`,
      opacity: 1,
      width: particle.size,
      height: particle.size
    },
    to: { 
      transform: `translate(${particle.vx * 40}px, ${particle.vy * 40}px)`,
      opacity: 0,
      width: particle.size / 2,
      height: particle.size / 2
    },
    config: { duration: particle.lifetime }
  });
  
  return (
    <animated.div
      key={particle.id}
      className="particle"
      style={{
        ...particleStyle,
        backgroundColor: particle.color,
        borderRadius: '50%',
        position: 'absolute',
        marginLeft: -particle.size / 2,
        marginTop: -particle.size / 2
      }}
    />
  );
}

function ParticleExplosion({ x, y, color, onComplete }) {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    // Create particles
    const newParticles = [];
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / particleCount) * i;
      const velocity = 2 + Math.random() * 3;
      const size = 5 + Math.random() * 10;
      const lifetime = 500 + Math.random() * 300;
      
      newParticles.push({
        id: i,
        x: 0,
        y: 0,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        size,
        color,
        opacity: 1,
        lifetime
      });
    }
    
    setParticles(newParticles);
    
    // Remove particles after animation
    const timer = setTimeout(() => {
      setParticles([]);
      if (onComplete) onComplete();
    }, 800);
    
    return () => clearTimeout(timer);
  }, [color, onComplete]);
  
  return (
    <div className="particles-container" style={{ position: 'absolute', left: x, top: y }}>
      {particles.map(particle => (
        <Particle key={particle.id} particle={particle} />
      ))}
    </div>
  );
}

export default ParticleExplosion;
