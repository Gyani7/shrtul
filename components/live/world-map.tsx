'use client';

import { useEffect, useState } from 'react';
import { useLiveEngine, LiveClick } from '@/components/live-engine';

const COUNTRY_POSITIONS: Record<string, { x: number; y: number }> = {
  US: { x: 22, y: 38 }, GB: { x: 48, y: 30 }, IN: { x: 68, y: 48 },
  DE: { x: 51, y: 32 }, JP: { x: 84, y: 40 }, BR: { x: 35, y: 65 },
  AU: { x: 88, y: 72 }, CA: { x: 20, y: 25 }, FR: { x: 49, y: 33 },
  SG: { x: 76, y: 58 }, NL: { x: 50, y: 31 }, ES: { x: 46, y: 36 },
  KR: { x: 82, y: 41 }, MX: { x: 18, y: 45 }, AE: { x: 62, y: 48 }, SE: { x: 53, y: 28 },
};

interface Pulse {
  id: string;
  x: number;
  y: number;
  country: string;
  city: string;
  experience: string;
  destination: string;
  createdAt: number;
}

export function LiveWorldMap() {
  const { clicks } = useLiveEngine();
  const [pulses, setPulses] = useState<Pulse[]>([]);

  useEffect(() => {
    if (clicks.length === 0) return;
    const latest = clicks[0];
    const pos = COUNTRY_POSITIONS[latest.countryCode];
    if (!pos) return;

    const pulse: Pulse = {
      id: latest.id,
      x: pos.x,
      y: pos.y,
      country: latest.country,
      city: latest.city,
      experience: latest.experienceType,
      destination: latest.destination,
      createdAt: Date.now(),
    };

    setPulses((prev) => [...prev, pulse].slice(-6));

    const timeout = setTimeout(() => {
      setPulses((prev) => prev.filter((p) => p.id !== pulse.id));
    }, 4000);

    return () => clearTimeout(timeout);
  }, [clicks]);

  return (
    <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden glass-strong">
      <div className="absolute inset-0 mesh-bg opacity-30" />

      <div className="absolute inset-0 flex items-center justify-center">
        <svg viewBox="0 0 100 50" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="pulse-grad">
              <stop offset="0%" stopColor="rgb(14, 165, 233)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="rgb(14, 165, 233)" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="dot-grad">
              <stop offset="0%" stopColor="rgb(20, 184, 166)" stopOpacity="1" />
              <stop offset="100%" stopColor="rgb(20, 184, 166)" stopOpacity="0.3" />
            </radialGradient>
          </defs>

          {Object.entries(COUNTRY_POSITIONS).map(([code, pos]) => (
            <circle key={code} cx={pos.x} cy={pos.y} r="0.4" fill="rgba(148, 163, 184, 0.4)" />
          ))}

          {pulses.map((p) => (
            <g key={p.id}>
              <circle cx={p.x} cy={p.y} r="3" fill="url(#pulse-grad)">
                <animate attributeName="r" from="0.5" to="5" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.8" to="0" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx={p.x} cy={p.y} r="0.8" fill="url(#dot-grad)">
                <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
              </circle>
            </g>
          ))}
        </svg>
      </div>

      <div className="absolute top-3 left-3 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
        <span className="text-xs font-medium text-muted-foreground">Live World Map</span>
      </div>

      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2 max-h-20 overflow-hidden">
        {pulses.slice(-3).reverse().map((p) => (
          <div
            key={p.id}
            className="glass rounded-lg px-2.5 py-1.5 text-xs animate-fade-in flex items-center gap-2"
          >
            <span className="font-medium text-primary">{p.city}</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-accent">{p.experience}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
