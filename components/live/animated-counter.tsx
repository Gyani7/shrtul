'use client';

import { useEffect, useRef, useState } from 'react';

export function AnimatedCounter({
  value,
  duration = 1000,
  format = 'number',
  className = '',
}: {
  value: number;
  duration?: number;
  format?: 'number' | 'compact' | 'decimal';
  className?: string;
}) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;
      setDisplay(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevRef.current = end;
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  let formatted: string;
  if (format === 'compact') {
    if (display >= 1_000_000) formatted = `${(display / 1_000_000).toFixed(1)}M`;
    else if (display >= 1_000) formatted = `${(display / 1_000).toFixed(1)}K`;
    else formatted = Math.round(display).toString();
  } else if (format === 'decimal') {
    formatted = display.toFixed(1);
  } else {
    formatted = Math.round(display).toLocaleString();
  }

  return <span className={className}>{formatted}</span>;
}
