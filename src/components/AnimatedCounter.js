import React from 'react';
import useCounter from '../hooks/useCounter';
import './AnimatedCounter.css';

const AnimatedCounter = ({ end, duration = 2000, suffix = '', prefix = '', className = '' }) => {
  const [count, countRef] = useCounter(end, duration);

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  };

  return (
    <span ref={countRef} className={`animated-counter ${className}`}>
      {prefix}{suffix.includes('%') ? count : formatNumber(count)}{suffix}
    </span>
  );
};

export default AnimatedCounter;