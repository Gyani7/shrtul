'use client';

import { useState } from 'react';
import {
  Timer, MousePointerClick, Loader, ClipboardList, Disc, Gift,
  Smile, Play, Image as ImageIcon, Bot, Gamepad2, HelpCircle,
  X, ArrowRight, type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CountdownExperience, MemeExperience, ScratchCardExperience,
  SpinWheelExperience, AIAvatarExperience, SmartCTAExperience,
  PollExperience, MiniGameExperience, LoadingExperience,
  QuizExperience, VideoExperience, ImageRevealExperience,
} from '@/components/demo/experiences';

interface ExperienceDef {
  id: string;
  name: string;
  icon: LucideIcon;
  category: string;
  desc: string;
  color: string;
  bg: string;
}

const EXPERIENCES: ExperienceDef[] = [
  { id: 'countdown', name: 'Countdown', icon: Timer, category: 'Engagement', desc: 'Build anticipation before redirect', color: 'text-primary', bg: 'bg-primary/10' },
  { id: 'cta', name: 'Smart CTA', icon: MousePointerClick, category: 'Conversion', desc: 'Bold call-to-action screen', color: 'text-accent', bg: 'bg-accent/10' },
  { id: 'spin', name: 'Spin Wheel', icon: Disc, category: 'Fun', desc: 'Interactive spin wheel with prizes', color: 'text-success', bg: 'bg-success/10' },
  { id: 'poll', name: 'Poll', icon: ClipboardList, category: 'Informational', desc: 'Quick poll with live results', color: 'text-warning', bg: 'bg-warning/10' },
  { id: 'scratch', name: 'Scratch Card', icon: Gift, category: 'Fun', desc: 'Scratch-to-reveal promotion', color: 'text-accent', bg: 'bg-accent/10' },
  { id: 'meme', name: 'Meme', icon: Smile, category: 'Fun', desc: 'Funny meme before redirect', color: 'text-success', bg: 'bg-success/10' },
  { id: 'game', name: 'Mini Game', icon: Gamepad2, category: 'Fun', desc: 'Tap-based mini game', color: 'text-primary', bg: 'bg-primary/10' },
  { id: 'quiz', name: 'Quiz', icon: HelpCircle, category: 'Informational', desc: 'Quick quiz with reveal', color: 'text-accent', bg: 'bg-accent/10' },
  { id: 'avatar', name: 'AI Avatar', icon: Bot, category: 'Conversion', desc: 'AI avatar delivers a message', color: 'text-primary', bg: 'bg-primary/10' },
  { id: 'loading', name: 'Loading', icon: Loader, category: 'Engagement', desc: 'Branded loading animation', color: 'text-muted-foreground', bg: 'bg-muted' },
  { id: 'video', name: 'Video Ad', icon: Play, category: 'Engagement', desc: 'Short video interstitial', color: 'text-warning', bg: 'bg-warning/10' },
  { id: 'reveal', name: 'Image Reveal', icon: ImageIcon, category: 'Engagement', desc: 'Tap-to-reveal image', color: 'text-accent', bg: 'bg-accent/10' },
];

export function LiveExperienceGallery() {
  const [active, setActive] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const activeExp = EXPERIENCES.find((e) => e.id === active);

  const renderExperience = (id: string) => {
    const onComplete = () => setActive(null);
    switch (id) {
      case 'countdown': return <CountdownExperience duration={5} onComplete={onComplete} />;
      case 'cta': return <SmartCTAExperience onComplete={onComplete} onSkip={onComplete} />;
      case 'spin': return <SpinWheelExperience onComplete={onComplete} />;
      case 'poll': return <PollExperience onComplete={onComplete} />;
      case 'scratch': return <ScratchCardExperience onComplete={onComplete} />;
      case 'meme': return <MemeExperience onComplete={onComplete} />;
      case 'game': return <MiniGameExperience onComplete={onComplete} />;
      case 'quiz': return <QuizExperience onComplete={onComplete} />;
      case 'avatar': return <AIAvatarExperience onComplete={onComplete} />;
      case 'loading': return <LoadingExperience onComplete={onComplete} />;
      case 'video': return <VideoExperience onComplete={onComplete} />;
      case 'reveal': return <ImageRevealExperience imageUrl="https://images.pexels.com/photos/270408/pexels-photo-270408.jpeg?auto=compress&cs=tinysrgb&w=600" onComplete={onComplete} />;
      default: return null;
    }
  };

  if (activeExp) {
    return (
      <div className="relative">
        <div className="glass-strong rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg', activeExp.bg, activeExp.color)}>
                <activeExp.icon className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-medium">{activeExp.name}</span>
              <span className="text-xs text-muted-foreground">· Live Demo</span>
            </div>
            <button
              onClick={() => setActive(null)}
              className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-6 min-h-[300px] flex items-center justify-center">
            {renderExperience(activeExp.id)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {EXPERIENCES.map((exp, i) => (
        <button
          key={exp.id}
          onClick={() => setActive(exp.id)}
          onMouseEnter={() => setHovered(exp.id)}
          onMouseLeave={() => setHovered(null)}
          className="glass rounded-xl p-4 text-left card-hover animate-slide-up group relative overflow-hidden"
          style={{ animationDelay: `${i * 0.04}s` }}
        >
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg mb-3 transition-transform group-hover:scale-110', exp.bg, exp.color)}>
            <exp.icon className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold mb-1">{exp.name}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{exp.desc}</p>
          <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {hovered === exp.id && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 text-xs font-medium text-primary animate-fade-in">
              Try it <ArrowRight className="h-3 w-3" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
