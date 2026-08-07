'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

// ============ COUNTDOWN EXPERIENCE ============
export function CountdownExperience({ duration = 5, message = 'Redirecting soon...', onComplete }: { duration?: number; message?: string; onComplete?: () => void }) {
  const [count, setCount] = useState(duration);

  useEffect(() => {
    if (count <= 0) { onComplete?.(); return; }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <p className="text-lg font-medium text-muted-foreground">{message}</p>
      <div className="text-7xl font-bold gradient-text tabular-nums">{count}</div>
      <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary transition-all duration-1000 ease-linear" style={{ width: `${((duration - count) / duration) * 100}%` }} />
      </div>
    </div>
  );
}

// ============ MEME EXPERIENCE ============
export function MemeExperience({ onComplete }: { onComplete?: () => void }) {
  const memes = [
    { top: 'ME WAITING FOR THIS PAGE TO LOAD', bottom: 'AND IT WAS WORTH EVERY SECOND', bg: 'from-orange-500 to-yellow-500' },
    { top: 'YOU CLICKED A LINK', bottom: 'AND GOT AN EXPERIENCE', bg: 'from-pink-500 to-purple-500' },
    { top: 'THIS REDIRECT', bottom: 'FEELS PERSONAL', bg: 'from-blue-500 to-cyan-500' },
    { top: 'WHEN THE LINK HAS MORE PERSONALITY', bottom: 'THAN YOUR EX', bg: 'from-green-500 to-teal-500' },
  ];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % memes.length), 2500);
    return () => clearInterval(t);
  }, [memes.length]);

  const m = memes[idx];
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-6">
      <div className={cn('relative w-full max-w-sm aspect-square rounded-2xl bg-gradient-to-br flex flex-col items-center justify-between p-6 text-white font-bold text-center overflow-hidden', m.bg)}>
        <div className="absolute inset-0 bg-black/10" />
        <p className="relative text-xl md:text-2xl uppercase leading-tight" style={{ textShadow: '2px 2px 0 #000' }}>{m.top}</p>
        <p className="relative text-xl md:text-2xl uppercase leading-tight" style={{ textShadow: '2px 2px 0 #000' }}>{m.bottom}</p>
      </div>
      <button onClick={() => onComplete?.()} className="text-sm text-primary hover:underline">Skip to destination &rarr;</button>
    </div>
  );
}

// ============ SCRATCH CARD EXPERIENCE ============
export function ScratchCardExperience({ onComplete }: { onComplete?: () => void }) {
  const [revealed, setRevealed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#475569';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Scratch to reveal!', canvas.width / 2, canvas.height / 2);
  }, []);

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(clientX - rect.left, clientY - rect.top, 25, 0, Math.PI * 2);
    ctx.fill();
  };

  const checkReveal = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const cleared = imageData.data.filter((_, i) => i % 4 === 3 && imageData.data[i] === 0).length;
    if (cleared > (canvas.width * canvas.height * 0.3)) {
      setRevealed(true);
      setTimeout(() => onComplete?.(), 1500);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-6">
      <div className="relative w-full max-w-xs aspect-video rounded-2xl overflow-hidden border-2 border-primary/30">
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 text-center p-4">
          <p className="text-2xl font-bold gradient-text">You won!</p>
          <p className="text-sm text-muted-foreground mt-1">50% off your next purchase</p>
        </div>
        {!revealed && (
          <canvas
            ref={canvasRef}
            width={320}
            height={180}
            className="absolute inset-0 w-full h-full cursor-pointer touch-none"
            onMouseDown={(e) => { setIsDrawing(true); draw(e); }}
            onMouseMove={draw}
            onMouseUp={() => { setIsDrawing(false); checkReveal(); }}
            onMouseLeave={() => setIsDrawing(false)}
            onTouchStart={(e) => { setIsDrawing(true); draw(e); }}
            onTouchMove={draw}
            onTouchEnd={() => { setIsDrawing(false); checkReveal(); }}
          />
        )}
      </div>
      {revealed && <p className="text-sm text-success font-medium animate-fade-in">Prize revealed! Redirecting...</p>}
      {!revealed && <p className="text-xs text-muted-foreground">Use your mouse or finger to scratch</p>}
    </div>
  );
}

// ============ SPIN WHEEL EXPERIENCE ============
export function SpinWheelExperience({ onComplete }: { onComplete?: () => void }) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const segments = [
    { label: '20% OFF', color: '#0ea5e9' },
    { label: 'Free Ship', color: '#14b8a6' },
    { label: 'Try Again', color: '#f59e0b' },
    { label: '50% OFF', color: '#ec4899' },
    { label: 'Premium', color: '#8b5cf6' },
    { label: 'Nothing', color: '#64748b' },
    { label: '10% OFF', color: '#22c55e' },
    { label: 'Bonus!', color: '#ef4444' },
  ];

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    const winner = Math.floor(Math.random() * segments.length);
    const angle = 360 * 5 + (360 / segments.length) * winner + 360 / segments.length / 2;
    setRotation((prev) => prev + angle);
    setTimeout(() => {
      setSpinning(false);
      setResult(segments[winner].label);
      setTimeout(() => onComplete?.(), 2000);
    }, 4000);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-4">
      <div className="relative w-56 h-56">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 w-0 h-0 border-l-8 border-r-8 border-t-[12px] border-l-transparent border-r-transparent border-t-foreground" />
        <div
          className="w-full h-full rounded-full border-4 border-foreground/20"
          style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none' }}
        >
          <svg viewBox="-100 -100 200 200" className="w-full h-full">
            {segments.map((seg, i) => {
              const start = (i / segments.length) * 360;
              const end = ((i + 1) / segments.length) * 360;
              const r = 95;
              const x1 = Math.cos((start - 90) * Math.PI / 180) * r;
              const y1 = Math.sin((start - 90) * Math.PI / 180) * r;
              const x2 = Math.cos((end - 90) * Math.PI / 180) * r;
              const y2 = Math.sin((end - 90) * Math.PI / 180) * r;
              const midAngle = (start + end) / 2 - 90;
              const tx = Math.cos(midAngle * Math.PI / 180) * 55;
              const ty = Math.sin(midAngle * Math.PI / 180) * 55;
              return (
                <g key={i}>
                  <path d={`M0,0 L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`} fill={seg.color} stroke="#fff" strokeWidth="1" />
                  <text x={tx} y={ty} fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle" transform={`rotate(${midAngle + 90}, ${tx}, ${ty})`}>{seg.label}</text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
      {result ? (
        <p className="text-lg font-bold text-success animate-scale-in">You got: {result}!</p>
      ) : (
        <button onClick={spin} disabled={spinning} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all shadow-lg shadow-primary/25">
          {spinning ? 'Spinning...' : 'Spin the wheel'}
        </button>
      )}
    </div>
  );
}

// ============ AI AVATAR EXPERIENCE ============
export function AIAvatarExperience({ onComplete }: { onComplete?: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-6">
      <div className={cn('relative transition-all duration-700', visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90')}>
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-5xl glow-primary">
          <span className="animate-float-slow">{'\uD83E\uDD16'}</span>
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-success border-2 border-background" />
      </div>
      <div className="glass rounded-2xl p-4 max-w-xs text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Hi! I&apos;m your AI guide. I personalized this redirect just for you based on your location and device. Enjoy your destination!
        </p>
      </div>
      <button onClick={() => onComplete?.()} className="text-sm text-primary hover:underline animate-fade-in" style={{ animationDelay: '1s' }}>
        Continue to destination &rarr;
      </button>
    </div>
  );
}

// ============ THEME EXPERIENCES ============
export function ThemeExperience({ theme, onComplete }: { theme: 'festival' | 'gaming' | 'cyber' | 'business'; onComplete?: () => void }) {
  const themes = {
    festival: { bg: 'from-yellow-400 via-orange-500 to-red-500', text: 'text-white', label: 'Festival', emoji: '\uD83C\uDF89', msg: 'Celebrate every click!' },
    gaming: { bg: 'from-purple-600 via-indigo-600 to-blue-600', text: 'text-white', label: 'Gaming', emoji: '\uD83C\uDFAE', msg: 'Level up your links!' },
    cyber: { bg: 'from-cyan-500 via-blue-600 to-purple-700', text: 'text-white', label: 'Cyber', emoji: '\u26A1', msg: 'Welcome to the future.' },
    business: { bg: 'from-slate-700 via-slate-800 to-slate-900', text: 'text-white', label: 'Business', emoji: '\uD83D\uDCBC', msg: 'Professional. Premium. Powerful.' },
  };
  const t = themes[theme];

  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 py-8 rounded-2xl bg-gradient-to-br p-8', t.bg, t.text)}>
      <div className="text-6xl animate-float-slow">{t.emoji}</div>
      <p className="text-2xl font-bold">{t.msg}</p>
      <p className="text-sm opacity-80">{t.label} Theme</p>
      <button onClick={() => onComplete?.()} className="mt-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium hover:bg-white/30 transition-colors backdrop-blur-sm">
        Continue &rarr;
      </button>
    </div>
  );
}

// ============ SMART CTA EXPERIENCE ============
export function SmartCTAExperience({ title = 'Before you go...', subtitle = 'Check out this exclusive offer', ctaText = 'Claim Offer', onComplete, onSkip }: { title?: string; subtitle?: string; ctaText?: string; onComplete?: () => void; onSkip?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-8 text-center">
      <h3 className="text-2xl font-bold">{title}</h3>
      <p className="text-muted-foreground max-w-sm">{subtitle}</p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button onClick={() => onComplete?.()} className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:scale-105">
          {ctaText}
        </button>
        <button onClick={() => onSkip?.()} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          No thanks, take me to my destination
        </button>
      </div>
    </div>
  );
}

// ============ POLL EXPERIENCE ============
export function PollExperience({ question = 'What\'s your favorite feature?', options: opts, onComplete }: { question?: string; options?: string[]; onComplete?: () => void }) {
  const options = opts || ['AI Experiences', 'Smart Analytics', 'Custom Domains', 'Template Marketplace'];
  const [voted, setVoted] = useState<number | null>(null);
  const [votes, setVotes] = useState(() => options.map(() => Math.floor(Math.random() * 50) + 10));

  const vote = (idx: number) => {
    if (voted !== null) return;
    setVoted(idx);
    setVotes((v) => v.map((count, i) => (i === idx ? count + 1 : count)));
    setTimeout(() => onComplete?.(), 2500);
  };

  const total = votes.reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-6 w-full max-w-sm mx-auto">
      <p className="text-lg font-semibold text-center">{question}</p>
      <div className="w-full space-y-2">
        {options.map((opt, i) => (
          <button
            key={opt}
            onClick={() => vote(i)}
            disabled={voted !== null}
            className={cn(
              'relative w-full overflow-hidden rounded-xl border border-border p-3 text-left text-sm transition-all',
              voted === null && 'hover:border-primary hover:bg-muted/50 cursor-pointer',
              voted !== null && 'cursor-default',
              voted === i && 'border-primary bg-primary/5'
            )}
          >
            {voted !== null && (
              <div className="absolute inset-0 bg-primary/10 transition-all duration-700" style={{ width: `${(votes[i] / total) * 100}%` }} />
            )}
            <div className="relative flex items-center justify-between">
              <span className="font-medium">{opt}</span>
              {voted !== null && <span className="text-muted-foreground">{Math.round((votes[i] / total) * 100)}%</span>}
            </div>
          </button>
        ))}
      </div>
      {voted !== null && <p className="text-xs text-muted-foreground animate-fade-in">Thanks for voting! Redirecting...</p>}
    </div>
  );
}

// ============ MINI GAME EXPERIENCE ============
export function MiniGameExperience({ onComplete }: { onComplete?: () => void }) {
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState({ x: 50, y: 50 });
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    if (timeLeft <= 0) { setTimeout(() => onComplete?.(), 1500); return; }
    const t = setTimeout(() => setTimeLeft((tl) => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  const hit = () => {
    setScore((s) => s + 1);
    setTarget({ x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-4">
      <div className="flex items-center gap-4 text-sm">
        <span className="font-semibold">Score: {score}</span>
        <span className="text-muted-foreground">Time: {timeLeft}s</span>
      </div>
      <div className="relative w-full max-w-sm h-48 rounded-xl bg-muted/50 border border-border overflow-hidden">
        {timeLeft > 0 ? (
          <button
            onClick={hit}
            className="absolute w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30 hover:scale-110 transition-transform"
            style={{ left: `${target.x}%`, top: `${target.y}%`, transform: 'translate(-50%, -50%)' }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-lg font-bold gradient-text">Game Over! Score: {score}</p>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">Tap the dots to score!</p>
    </div>
  );
}

// ============ LOADING ANIMATION EXPERIENCE ============
export function LoadingExperience({ message = 'Loading your destination...', onComplete }: { message?: string; onComplete?: () => void }) {
  useEffect(() => {
    const t = setTimeout(() => onComplete?.(), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-muted" />
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
      <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
    </div>
  );
}

// ============ IMAGE REVEAL EXPERIENCE ============
export function ImageRevealExperience({ imageUrl, onComplete }: { imageUrl: string; onComplete?: () => void }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-4">
      <div className="relative w-full max-w-sm aspect-video rounded-2xl overflow-hidden">
        <div className={cn('absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 backdrop-blur-xl flex items-center justify-center transition-all duration-700', revealed && 'opacity-0 pointer-events-none')}>
          <button onClick={() => { setRevealed(true); setTimeout(() => onComplete?.(), 2000); }} className="rounded-xl bg-white/20 px-6 py-3 text-sm font-medium text-white hover:bg-white/30 transition-colors backdrop-blur-sm">
            Tap to reveal
          </button>
        </div>
        <img src={imageUrl} alt="Reveal" className="w-full h-full object-cover" />
      </div>
    </div>
  );
}

// ============ QUIZ EXPERIENCE ============
export function QuizExperience({ onComplete }: { onComplete?: () => void }) {
  const questions = [
    { q: 'What makes Shrtul X different?', a: ['It just shortens URLs', 'It adds experiences to every click', 'It tracks page views', 'It is a social network'], correct: 1 },
    { q: 'Which is a valid experience type?', a: ['Countdown timer', 'Spin wheel', 'Mini game', 'All of the above'], correct: 3 },
  ];
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const answer = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === questions[idx].correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (idx < questions.length - 1) {
        setIdx(idx + 1);
        setSelected(null);
      } else {
        setTimeout(() => onComplete?.(), 1500);
      }
    }, 1500);
  };

  const q = questions[idx];
  const done = idx === questions.length - 1 && selected !== null;

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-4 w-full max-w-sm mx-auto">
      {!done ? (
        <>
          <p className="text-sm text-muted-foreground">Question {idx + 1} of {questions.length}</p>
          <p className="text-lg font-semibold text-center">{q.q}</p>
          <div className="w-full space-y-2">
            {q.a.map((opt, i) => (
              <button
                key={opt}
                onClick={() => answer(i)}
                disabled={selected !== null}
                className={cn(
                  'w-full rounded-xl border border-border p-3 text-left text-sm transition-all',
                  selected === null && 'hover:border-primary hover:bg-muted/50 cursor-pointer',
                  selected !== null && i === q.correct && 'border-success bg-success/10 text-success',
                  selected !== null && selected === i && i !== q.correct && 'border-error bg-error/10 text-error',
                  selected !== null && selected !== i && i !== q.correct && 'opacity-50'
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center">
          <p className="text-2xl font-bold gradient-text">Score: {score}/{questions.length}</p>
          <p className="text-sm text-muted-foreground mt-2">Redirecting...</p>
        </div>
      )}
    </div>
  );
}

// ============ VIDEO INTERSTITIAL EXPERIENCE ============
export function VideoExperience({ onComplete }: { onComplete?: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(interval); setTimeout(() => onComplete?.(), 500); return 100; }
        return p + 2;
      });
    }, 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-6">
      <div className="relative w-full max-w-sm aspect-video rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 mesh-bg" />
        <div className="relative text-center">
          <div className="text-5xl mb-2 animate-pulse">{'\u25B6'}</div>
          <p className="text-sm text-muted-foreground">Your ad could be here</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
          <div className="h-full bg-primary transition-all duration-75" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Video playing... {progress}%</p>
    </div>
  );
}
