import { useState } from 'react';
import { useSpring } from 'react-spring';

function useScreenShake() {
  const [shaking, setShaking] = useState(false);
  
  const shake = (intensity = 0.6, duration = 200) => {
    if (shaking) return;
    setShaking(true);
    
    setTimeout(() => {
      setShaking(false);
    }, duration);
  };
  
  const shakeAnimation = useSpring({
    transform: shaking 
      ? `translate(${Math.random() * 6 - 3}px, ${Math.random() * 6 - 3}px)`
      : 'translate(0px, 0px)',
    config: { tension: 300, friction: 20 }
  });
  
  return [shakeAnimation, shake];
}

export default useScreenShake;
