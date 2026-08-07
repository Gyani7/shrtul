export interface ExperienceTemplate {
  type: string;
  name: string;
  description: string;
  icon: string;
  category: 'engagement' | 'fun' | 'conversion' | 'informational';
  defaultDuration: number | null;
  defaultConfig: Record<string, unknown>;
}

export const EXPERIENCE_TEMPLATES: ExperienceTemplate[] = [
  {
    type: 'countdown',
    name: 'Countdown Timer',
    description: 'Show a countdown before redirecting.',
    icon: 'Timer',
    category: 'engagement',
    defaultDuration: 5,
    defaultConfig: { duration: 5, message: 'Redirecting soon...' },
  },
  {
    type: 'cta',
    name: 'Call to Action',
    description: 'Display a bold CTA button before redirect.',
    icon: 'MousePointerClick',
    category: 'conversion',
    defaultDuration: null,
    defaultConfig: { title: 'Continue?', description: 'You are being redirected.', buttonText: 'Go Now' },
  },
  {
    type: 'animation',
    name: 'Loading Animation',
    description: 'Play a loading animation before redirect.',
    icon: 'Loader',
    category: 'engagement',
    defaultDuration: 3,
    defaultConfig: { type: 'pulse', duration: 3, message: 'Loading...' },
  },
  {
    type: 'poll',
    name: 'Quick Poll',
    description: 'Ask a poll question before redirect.',
    icon: 'BarChart3',
    category: 'informational',
    defaultDuration: null,
    defaultConfig: { question: 'Did you find this useful?', options: ['Yes', 'No'] },
  },
  {
    type: 'spin-wheel',
    name: 'Spin the Wheel',
    description: 'Interactive spin wheel before redirect.',
    icon: 'Disc',
    category: 'fun',
    defaultDuration: null,
    defaultConfig: { segments: [{ label: 'Try Again', color: '#6366f1' }, { label: 'Winner!', color: '#10b981' }] },
  },
  {
    type: 'quiz',
    name: 'Quick Quiz',
    description: 'Single-question quiz before redirect.',
    icon: 'HelpCircle',
    category: 'informational',
    defaultDuration: null,
    defaultConfig: { question: 'What is 2+2?', options: ['3', '4', '5'], correctIndex: 1, revealText: 'The answer is 4!' },
  },
  {
    type: 'scratch-card',
    name: 'Scratch Card',
    description: 'Interactive scratch-to-reveal card.',
    icon: 'Gift',
    category: 'fun',
    defaultDuration: null,
    defaultConfig: { hiddenMessage: 'You found a surprise!', revealThreshold: 50 },
  },
  {
    type: 'survey',
    name: 'Mini Survey',
    description: 'Multi-question survey before redirect.',
    icon: 'ClipboardList',
    category: 'informational',
    defaultDuration: null,
    defaultConfig: { questions: [{ id: 'q1', text: 'How was your experience?', type: 'rating' }] },
  },
  {
    type: 'meme',
    name: 'Meme Screen',
    description: 'Show a funny meme before redirect.',
    icon: 'Smile',
    category: 'fun',
    defaultDuration: 4,
    defaultConfig: { imageUrl: '', caption: 'Loading... please wait', duration: 4 },
  },
  {
    type: 'video',
    name: 'Video Interstitial',
    description: 'Play a short video before redirect.',
    icon: 'Play',
    category: 'engagement',
    defaultDuration: 10,
    defaultConfig: { videoUrl: '', autoplay: true, skipAfter: 10 },
  },
  {
    type: 'image',
    name: 'Image Reveal',
    description: 'Display a full-screen image before redirect.',
    icon: 'Image',
    category: 'engagement',
    defaultDuration: 5,
    defaultConfig: { imageUrl: '', duration: 5, overlayText: '' },
  },
  {
    type: 'ai-avatar',
    name: 'AI Avatar',
    description: 'AI avatar delivers a message before redirect.',
    icon: 'Bot',
    category: 'conversion',
    defaultDuration: null,
    defaultConfig: { message: 'Welcome! Taking you to your destination...', avatarStyle: 'professional' },
  },
  {
    type: 'mini-game',
    name: 'Mini Game',
    description: 'Simple tap-based mini game before redirect.',
    icon: 'Gamepad2',
    category: 'fun',
    defaultDuration: 10,
    defaultConfig: { gameType: 'tap', duration: 10, targetScore: 10 },
  },
];

export function getTemplate(type: string): ExperienceTemplate | undefined {
  return EXPERIENCE_TEMPLATES.find((t) => t.type === type);
}

export function listTemplates(): ExperienceTemplate[] {
  return EXPERIENCE_TEMPLATES;
}
