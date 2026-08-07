'use client';

import { useState, useCallback } from 'react';
import { Wand2, Plus, Trash2, GripVertical, Eye, RotateCcw, Sparkles, Timer, MousePointerClick, Loader, Disc, Gift, Bot, Smile, Gamepad2, HelpCircle, ClipboardList, Play, Image as ImageIcon, Zap, Type, Palette } from 'lucide-react';
import { CountdownExperience, MemeExperience, SpinWheelExperience, ScratchCardExperience, AIAvatarExperience, SmartCTAExperience, PollExperience, MiniGameExperience, LoadingExperience, QuizExperience, VideoExperience, ImageRevealExperience, ThemeExperience } from './experiences';
import { cn } from '@/lib/utils';

interface Block {
  id: string;
  type: string;
  label: string;
  icon: typeof Timer;
  config: Record<string, unknown>;
}

const BLOCK_LIBRARY = [
  { type: 'countdown', label: 'Countdown', icon: Timer },
  { type: 'cta', label: 'Smart CTA', icon: MousePointerClick },
  { type: 'loading', label: 'Loading', icon: Loader },
  { type: 'poll', label: 'Poll', icon: ClipboardList },
  { type: 'spin', label: 'Spin Wheel', icon: Disc },
  { type: 'quiz', label: 'Quiz', icon: HelpCircle },
  { type: 'scratch', label: 'Scratch Card', icon: Gift },
  { type: 'meme', label: 'Meme', icon: Smile },
  { type: 'video', label: 'Video', icon: Play },
  { type: 'reveal', label: 'Image Reveal', icon: ImageIcon },
  { type: 'avatar', label: 'AI Avatar', icon: Bot },
  { type: 'game', label: 'Mini Game', icon: Gamepad2 },
  { type: 'text', label: 'Text', icon: Type },
  { type: 'theme', label: 'Theme', icon: Palette },
];

export function StudioBuilder() {
  const [blocks, setBlocks] = useState<Block[]>([
    { id: '1', type: 'countdown', label: 'Countdown', icon: Timer, config: { duration: 5, message: 'Something awesome is coming...' } },
  ]);
  const [selectedBlock, setSelectedBlock] = useState<string | null>('1');
  const [previewKey, setPreviewKey] = useState(0);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  const addBlock = (type: string) => {
    const def = BLOCK_LIBRARY.find((b) => b.type === type);
    if (!def) return;
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      label: def.label,
      icon: def.icon,
      config: type === 'countdown' ? { duration: 5, message: 'Redirecting soon...' } : type === 'cta' ? { title: 'Before you go...', subtitle: 'Check out this offer' } : {},
    };
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlock(newBlock.id);
    setPreviewKey((k) => k + 1);
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    if (selectedBlock === id) setSelectedBlock(null);
    setPreviewKey((k) => k + 1);
  };

  const updateConfig = (id: string, key: string, value: unknown) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, config: { ...b.config, [key]: value } } : b)));
    setPreviewKey((k) => k + 1);
  };

  const moveBlock = (id: string, dir: -1 | 1) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
    setPreviewKey((k) => k + 1);
  };

  const generateWithAI = () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    setTimeout(() => {
      const p = aiPrompt.toLowerCase();
      const newBlocks: Block[] = [];
      if (p.includes('countdown') || p.includes('timer')) {
        newBlocks.push({ id: Date.now().toString(), type: 'countdown', label: 'Countdown', icon: Timer, config: { duration: 5, message: 'Get ready...' } });
      }
      if (p.includes('meme') || p.includes('funny')) {
        newBlocks.push({ id: (Date.now() + 1).toString(), type: 'meme', label: 'Meme', icon: Smile, config: {} });
      }
      if (p.includes('game') || p.includes('play')) {
        newBlocks.push({ id: (Date.now() + 2).toString(), type: 'game', label: 'Mini Game', icon: Gamepad2, config: {} });
      }
      if (p.includes('poll') || p.includes('vote')) {
        newBlocks.push({ id: (Date.now() + 3).toString(), type: 'poll', label: 'Poll', icon: ClipboardList, config: {} });
      }
      if (p.includes('spin') || p.includes('wheel')) {
        newBlocks.push({ id: (Date.now() + 4).toString(), type: 'spin', label: 'Spin Wheel', icon: Disc, config: {} });
      }
      if (p.includes('cyber') || p.includes('neon') || p.includes('futur')) {
        newBlocks.push({ id: (Date.now() + 5).toString(), type: 'theme', label: 'Theme', icon: Palette, config: { theme: 'cyber' } });
      }
      if (p.includes('festival') || p.includes('celebrat')) {
        newBlocks.push({ id: (Date.now() + 6).toString(), type: 'theme', label: 'Theme', icon: Palette, config: { theme: 'festival' } });
      }
      if (newBlocks.length === 0) {
        newBlocks.push({ id: Date.now().toString(), type: 'countdown', label: 'Countdown', icon: Timer, config: { duration: 5, message: 'AI generated this for you...' } });
      }
      setBlocks(newBlocks);
      setSelectedBlock(newBlocks[0].id);
      setPreviewKey((k) => k + 1);
      setAiGenerating(false);
      setAiPrompt('');
    }, 1500);
  };

  const renderPreview = useCallback(() => {
    const onComplete = () => setPreviewKey((k) => k + 1);
    const firstBlock = blocks[0];
    if (!firstBlock) return <p className="text-sm text-muted-foreground">Add a block to see preview</p>;

    switch (firstBlock.type) {
      case 'countdown': return <CountdownExperience key={previewKey} duration={(firstBlock.config.duration as number) || 5} message={(firstBlock.config.message as string) || 'Redirecting...'} onComplete={onComplete} />;
      case 'cta': return <SmartCTAExperience key={previewKey} title={(firstBlock.config.title as string) || 'Before you go...'} subtitle={(firstBlock.config.subtitle as string) || 'Check out this offer'} onComplete={onComplete} onSkip={onComplete} />;
      case 'loading': return <LoadingExperience key={previewKey} onComplete={onComplete} />;
      case 'poll': return <PollExperience key={previewKey} onComplete={onComplete} />;
      case 'spin': return <SpinWheelExperience key={previewKey} onComplete={onComplete} />;
      case 'quiz': return <QuizExperience key={previewKey} onComplete={onComplete} />;
      case 'scratch': return <ScratchCardExperience key={previewKey} onComplete={onComplete} />;
      case 'meme': return <MemeExperience key={previewKey} onComplete={onComplete} />;
      case 'video': return <VideoExperience key={previewKey} onComplete={onComplete} />;
      case 'reveal': return <ImageRevealExperience key={previewKey} imageUrl="https://images.pexels.com/photos/799443/pexels-photo-799443.jpeg?auto=compress&cs=tinysrgb&w=600" onComplete={onComplete} />;
      case 'avatar': return <AIAvatarExperience key={previewKey} onComplete={onComplete} />;
      case 'game': return <MiniGameExperience key={previewKey} onComplete={onComplete} />;
      case 'theme': return <ThemeExperience key={previewKey} theme={(firstBlock.config.theme as 'festival' | 'gaming' | 'cyber' | 'business') || 'cyber'} onComplete={onComplete} />;
      default: return <p className="text-sm text-muted-foreground">Preview not available for this block</p>;
    }
  }, [blocks, previewKey]);

  const selected = blocks.find((b) => b.id === selectedBlock);

  return (
    <div className="glass-strong rounded-2xl overflow-hidden">
      {/* AI Prompt Bar */}
      <div className="border-b border-border p-4 bg-muted/30">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">AI Experience Generator</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generateWithAI()}
            placeholder="Describe your experience... e.g., 'Create a cyberpunk countdown with a meme'"
            className="flex-1 rounded-lg border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            onClick={generateWithAI}
            disabled={aiGenerating || !aiPrompt.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all"
          >
            {aiGenerating ? <Loader className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {aiGenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr_300px] min-h-[500px]">
        {/* Block Library */}
        <div className="border-r border-border p-4 bg-muted/20">
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3">Blocks</h4>
          <div className="grid grid-cols-2 gap-2">
            {BLOCK_LIBRARY.map((block) => (
              <button
                key={block.type}
                onClick={() => addBlock(block.type)}
                className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card p-2.5 text-xs font-medium hover:border-primary hover:bg-primary/5 transition-all"
              >
                <block.icon className="h-4 w-4 text-primary" />
                {block.label}
              </button>
            ))}
          </div>
        </div>

        {/* Canvas / Block List */}
        <div className="p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground">Experience Flow</h4>
            <button onClick={() => setPreviewKey((k) => k + 1)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <RotateCcw className="h-3 w-3" /> Replay
            </button>
          </div>
          <div className="space-y-2 flex-1">
            {blocks.map((block, i) => (
              <div
                key={block.id}
                onClick={() => setSelectedBlock(block.id)}
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all',
                  selectedBlock === block.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                )}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <block.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{block.label}</p>
                  <p className="text-xs text-muted-foreground">Step {i + 1}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, -1); }} className="p-1 text-muted-foreground hover:text-foreground" disabled={i === 0}>↑</button>
                  <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 1); }} className="p-1 text-muted-foreground hover:text-foreground" disabled={i === blocks.length - 1}>↓</button>
                  <button onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }} className="p-1 text-muted-foreground hover:text-error">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {blocks.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Plus className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Add blocks from the library</p>
              </div>
            )}
          </div>
        </div>

        {/* Properties + Preview */}
        <div className="border-l border-border flex flex-col">
          {/* Properties */}
          <div className="p-4 border-b border-border">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3">Properties</h4>
            {selected ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Type</label>
                  <p className="text-sm font-medium">{selected.label}</p>
                </div>
                {selected.type === 'countdown' && (
                  <>
                    <div>
                      <label className="text-xs text-muted-foreground">Message</label>
                      <input type="text" value={(selected.config.message as string) || ''} onChange={(e) => updateConfig(selected.id, 'message', e.target.value)} className="w-full rounded-lg border border-input bg-card px-2 py-1.5 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Duration: {(selected.config.duration as number) || 5}s</label>
                      <input type="range" min="3" max="10" value={(selected.config.duration as number) || 5} onChange={(e) => updateConfig(selected.id, 'duration', Number(e.target.value))} className="w-full" />
                    </div>
                  </>
                )}
                {selected.type === 'cta' && (
                  <>
                    <div>
                      <label className="text-xs text-muted-foreground">Title</label>
                      <input type="text" value={(selected.config.title as string) || ''} onChange={(e) => updateConfig(selected.id, 'title', e.target.value)} className="w-full rounded-lg border border-input bg-card px-2 py-1.5 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Subtitle</label>
                      <input type="text" value={(selected.config.subtitle as string) || ''} onChange={(e) => updateConfig(selected.id, 'subtitle', e.target.value)} className="w-full rounded-lg border border-input bg-card px-2 py-1.5 text-sm" />
                    </div>
                  </>
                )}
                {selected.type === 'theme' && (
                  <div>
                    <label className="text-xs text-muted-foreground">Theme</label>
                    <select value={(selected.config.theme as string) || 'cyber'} onChange={(e) => updateConfig(selected.id, 'theme', e.target.value)} className="w-full rounded-lg border border-input bg-card px-2 py-1.5 text-sm">
                      <option value="cyber">Cyber</option>
                      <option value="festival">Festival</option>
                      <option value="gaming">Gaming</option>
                      <option value="business">Business</option>
                    </select>
                  </div>
                )}
                {!['countdown', 'cta', 'theme'].includes(selected.type) && (
                  <p className="text-xs text-muted-foreground">This block uses default configuration. More properties coming soon.</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Select a block to edit properties</p>
            )}
          </div>

          {/* Live Preview */}
          <div className="p-4 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold uppercase text-muted-foreground">Live Preview</span>
            </div>
            <div className="rounded-xl bg-muted/30 border border-border min-h-[200px] flex items-center justify-center p-3">
              {renderPreview()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
