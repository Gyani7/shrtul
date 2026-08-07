'use client';

import { useState, useEffect, useCallback } from 'react';
import { Play, RotateCcw, ArrowRight, MousePointerClick, Sparkles, Timer, Gift, Disc, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type DemoStage = 'idle' | 'clicking' | 'experience' | 'redirecting' | 'done';

const EXPERIENCES = [
  { icon: Timer, label: 'Countdown', color: 'text-primary', bg: 'bg-primary/10' },
  { icon: Disc, label: 'Spin Wheel', color: 'text-accent', bg: 'bg-accent/10' },
  { icon: Gift, label: 'Scratch Card', color: 'text-success', bg: 'bg-success/10' },
  { icon: Sparkles, label: 'AI Avatar', color: 'text-primary', bg: 'bg-primary/10' },
];

export function InteractiveDemo() {
  const [stage, setStage] = useState<DemoStage>('idle');
  const [selectedExp, setSelectedExp] = useState(0);
  const [countdown, setCountdown] = useState(3);

  const runDemo = useCallback(() => {
    setStage('clicking');
    setTimeout(() => setStage('experience'), 600);
  }, []);

  useEffect(() => {
    if (stage === 'experience') {
      setCountdown(3);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setStage('redirecting');
            setTimeout(() => setStage('done'), 800);
            return 0;
          }
          return prev - 1;
        });
      }, 800);
      return () => clearInterval(interval);
    }
  }, [stage]);

  function reset() {
    setStage('idle');
    setSelectedExp((prev) => (prev + 1) % EXPERIENCES.length);
  }

  return (
    <div className="glass-strong rounded-2xl p-6 md:p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex h-2 w-2 rounded-full bg-success" />
          Live Demo
        </div>
        {stage !== 'idle' && (
          <button onClick={reset} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        )}
      </div>

      <div className="relative h-64 flex items-center justify-center">
        {stage === 'idle' && (
          <div className="text-center space-y-4 animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-4">
              {EXPERIENCES.map((exp, i) => (
                <div
                  key={exp.label}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg transition-all',
                    i === selectedExp ? `${exp.bg} ${exp.color} scale-110` : 'bg-muted text-muted-foreground opacity-50'
                  )}
                >
                  <exp.icon className="h-5 w-5" />
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Click below to experience a <span className="font-medium text-foreground">{EXPERIENCES[selectedExp].label}</span> redirect
            </p>
            <button
              onClick={runDemo}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 hover:scale-105"
            >
              <Play className="h-4 w-4" />
              Try it now
            </button>
          </div>
        )}

        {stage === 'clicking' && (
          <div className="text-center animate-scale-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-3">
              <MousePointerClick className="h-8 w-8 animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground">Clicking link...</p>
          </div>
        )}

        {stage === 'experience' && (() => {
          const ExpIcon = EXPERIENCES[selectedExp].icon;
          return (
            <div className="text-center w-full animate-scale-in">
              <div className={cn('flex h-16 w-16 items-center justify-center rounded-full mx-auto mb-4', EXPERIENCES[selectedExp].bg, EXPERIENCES[selectedExp].color)}>
                <ExpIcon className="h-8 w-8 animate-pulse" />
              </div>
              <p className="text-lg font-semibold mb-2">{EXPERIENCES[selectedExp].label}</p>
              <div className="text-5xl font-bold gradient-text tabular-nums">{countdown}</div>
              <p className="text-xs text-muted-foreground mt-2">Experience running...</p>
            </div>
          );
        })()}

        {stage === 'redirecting' && (
          <div className="text-center animate-fade-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent mx-auto mb-3">
              <ArrowRight className="h-8 w-8 animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground">Redirecting to destination...</p>
          </div>
        )}

        {stage === 'done' && (
          <div className="text-center space-y-3 animate-scale-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success mx-auto">
              <Check className="h-8 w-8" />
            </div>
            <p className="text-lg font-semibold">Redirect complete!</p>
            <p className="text-sm text-muted-foreground">The user reached their destination after an engaging experience.</p>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Try another
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        {(['idle', 'clicking', 'experience', 'redirecting', 'done'] as DemoStage[]).map((s) => (
          <div
            key={s}
            className={cn(
              'h-1.5 rounded-full transition-all',
              stage === s ? 'w-8 bg-primary' : 'w-1.5 bg-muted-foreground/30'
            )}
          />
        ))}
      </div>
    </div>
  );
}
