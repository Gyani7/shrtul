'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';

export interface LiveClick {
  id: string;
  country: string;
  countryCode: string;
  city: string;
  lat: number;
  lng: number;
  destination: string;
  experienceType: string;
  timestamp: number;
}

export interface LiveActivity {
  id: string;
  type: 'click' | 'create' | 'install' | 'publish' | 'ai' | 'signup';
  message: string;
  detail: string;
  timestamp: number;
}

export interface LiveAIInsight {
  id: string;
  icon: string;
  message: string;
  detail: string;
  confidence: number;
}

export interface LiveTemplate {
  id: string;
  name: string;
  category: string;
  installs: number;
  rating: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

interface LiveEngineState {
  activeUsers: number;
  clicksLastMinute: number;
  totalClicks: number;
  totalLinks: number;
  aiExperiencesToday: number;
  countriesActive: number;
  clicks: LiveClick[];
  activity: LiveActivity[];
  insights: LiveAIInsight[];
  trendingTemplates: LiveTemplate[];
  isLive: boolean;
}

const LiveEngineContext = createContext<LiveEngineState | null>(null);

const COUNTRIES = [
  { country: 'United States', countryCode: 'US', city: 'New York', lat: 40.71, lng: -74.01 },
  { country: 'United States', countryCode: 'US', city: 'San Francisco', lat: 37.77, lng: -122.41 },
  { country: 'United Kingdom', countryCode: 'GB', city: 'London', lat: 51.51, lng: -0.13 },
  { country: 'India', countryCode: 'IN', city: 'Mumbai', lat: 19.08, lng: 72.88 },
  { country: 'India', countryCode: 'IN', city: 'Bangalore', lat: 12.97, lng: 77.59 },
  { country: 'Germany', countryCode: 'DE', city: 'Berlin', lat: 52.52, lng: 13.40 },
  { country: 'Japan', countryCode: 'JP', city: 'Tokyo', lat: 35.68, lng: 139.69 },
  { country: 'Brazil', countryCode: 'BR', city: 'São Paulo', lat: -23.55, lng: -46.63 },
  { country: 'Australia', countryCode: 'AU', city: 'Sydney', lat: -33.87, lng: 151.21 },
  { country: 'Canada', countryCode: 'CA', city: 'Toronto', lat: 43.65, lng: -79.38 },
  { country: 'France', countryCode: 'FR', city: 'Paris', lat: 48.85, lng: 2.35 },
  { country: 'Singapore', countryCode: 'SG', city: 'Singapore', lat: 1.35, lng: 103.82 },
  { country: 'Netherlands', countryCode: 'NL', city: 'Amsterdam', lat: 52.37, lng: 4.90 },
  { country: 'Spain', countryCode: 'ES', city: 'Madrid', lat: 40.42, lng: -3.70 },
  { country: 'South Korea', countryCode: 'KR', city: 'Seoul', lat: 37.55, lng: 126.97 },
  { country: 'Mexico', countryCode: 'MX', city: 'Mexico City', lat: 19.43, lng: -99.13 },
  { country: 'UAE', countryCode: 'AE', city: 'Dubai', lat: 25.20, lng: 55.27 },
  { country: 'Sweden', countryCode: 'SE', city: 'Stockholm', lat: 59.33, lng: 18.07 },
];

const DESTINATIONS = [
  'youtube.com/watch', 'shop.example.com', 'event-registration.com',
  'product-launch.io', 'newsletter.signup', 'app.download',
  'blog.latest-post', 'portfolio.example.com', 'conference-2026.com',
];

const EXPERIENCE_TYPES = [
  'Countdown', 'Spin Wheel', 'AI Avatar', 'Mini Game', 'Smart CTA',
  'Poll', 'Scratch Card', 'Meme', 'Quiz', 'Video Ad',
];

const ACTIVITY_TEMPLATES = [
  { type: 'click' as const, message: 'New click from {city}', detail: '{experience} → {destination}' },
  { type: 'create' as const, message: 'New link created', detail: '{experience} experience' },
  { type: 'install' as const, message: 'Template installed', detail: '{template} by {user}' },
  { type: 'publish' as const, message: 'Experience published', detail: '{template} is now live' },
  { type: 'ai' as const, message: 'AI generated experience', detail: 'Optimized for {audience}' },
  { type: 'signup' as const, message: 'New user joined', detail: 'From {country}' },
];

const TEMPLATE_NAMES = [
  'Countdown Timer', 'Spin the Wheel', 'AI Avatar Pro', 'Mini Game Pack',
  'Smart CTA Builder', 'Quick Poll', 'Scratch Card', 'Meme Generator',
  'Quiz Master', 'Video Interstitial', 'Image Reveal', 'Loading Premium',
];

const AUDIENCES = ['mobile users', 'returning visitors', 'US audience', 'weekend traffic', 'first-time visitors'];

const USERS = ['Sarah K.', 'Marcus R.', 'Priya P.', 'Tom L.', 'Emma W.', 'Diego F.', 'Yuki T.', 'Nora B.'];

const AI_INSIGHTS: Omit<LiveAIInsight, 'id'>[] = [
  { icon: 'trending-up', message: 'Your best performing experience changed', detail: 'Spin Wheel now outperforms Countdown by 23%', confidence: 92 },
  { icon: 'smartphone', message: 'Traffic increased from mobile', detail: 'Mobile clicks up 34% in the last hour', confidence: 88 },
  { icon: 'sparkles', message: 'New template matches your audience', detail: 'AI Avatar Pro fits 89% of your visitor profile', confidence: 85 },
  { icon: 'target', message: 'AI optimized your campaign', detail: 'Completion rate improved by 12% after auto-tuning', confidence: 94 },
  { icon: 'zap', message: 'Fastest growing experience detected', detail: 'Mini Game installs up 156% this week', confidence: 79 },
  { icon: 'globe', message: 'New geographic trend emerging', detail: 'Brazilian traffic growing 3x faster than average', confidence: 81 },
  { icon: 'bar-chart', message: 'Engagement peak predicted', detail: 'Expect 2.3x normal traffic between 2-4pm UTC', confidence: 76 },
  { icon: 'brain', message: 'AI suggests a workflow improvement', detail: 'Add a Poll block before Smart CTA for 18% better conversion', confidence: 83 },
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateClick(): LiveClick {
  const c = randomItem(COUNTRIES);
  return {
    id: Math.random().toString(36).slice(2),
    country: c.country,
    countryCode: c.countryCode,
    city: c.city,
    lat: c.lat,
    lng: c.lng,
    destination: randomItem(DESTINATIONS),
    experienceType: randomItem(EXPERIENCE_TYPES),
    timestamp: Date.now(),
  };
}

function generateActivity(): LiveActivity {
  const template = randomItem(ACTIVITY_TEMPLATES);
  const country = randomItem(COUNTRIES);
  let message = template.message;
  let detail = template.detail;

  message = message.replace('{city}', country.city).replace('{country}', country.country);
  detail = detail
    .replace('{experience}', randomItem(EXPERIENCE_TYPES))
    .replace('{destination}', randomItem(DESTINATIONS))
    .replace('{template}', randomItem(TEMPLATE_NAMES))
    .replace('{user}', randomItem(USERS))
    .replace('{audience}', randomItem(AUDIENCES))
    .replace('{country}', country.country);

  return {
    id: Math.random().toString(36).slice(2),
    type: template.type,
    message,
    detail,
    timestamp: Date.now(),
  };
}

const INITIAL_TEMPLATES: LiveTemplate[] = [
  { id: 't1', name: 'Countdown Timer', category: 'Engagement', installs: 12400, rating: 4.8, trend: 'up', change: 234 },
  { id: 't2', name: 'Spin the Wheel', category: 'Fun', installs: 8900, rating: 4.9, trend: 'up', change: 412 },
  { id: 't3', name: 'Meme Generator', category: 'Fun', installs: 11200, rating: 4.7, trend: 'up', change: 189 },
  { id: 't4', name: 'AI Avatar Pro', category: 'Conversion', installs: 2900, rating: 4.6, trend: 'up', change: 67 },
  { id: 't5', name: 'Smart CTA', category: 'Conversion', installs: 9800, rating: 4.7, trend: 'stable', change: 0 },
  { id: 't6', name: 'Mini Game Pack', category: 'Fun', installs: 6100, rating: 4.8, trend: 'up', change: 156 },
];

export function LiveEngineProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LiveEngineState>({
    activeUsers: 2431,
    clicksLastMinute: 145,
    totalClicks: 2480000,
    totalLinks: 51000,
    aiExperiencesToday: 248,
    countriesActive: 190,
    clicks: [],
    activity: [],
    insights: [],
    trendingTemplates: INITIAL_TEMPLATES,
    isLive: true,
  });

  const insightRotation = useRef(0);

  useEffect(() => {
    const seedClicks: LiveClick[] = Array.from({ length: 5 }, generateClick);
    const seedActivity: LiveActivity[] = Array.from({ length: 6 }, generateActivity);
    const seedInsights: LiveAIInsight[] = AI_INSIGHTS.slice(0, 3).map((ins, i) => ({ ...ins, id: `ins-${i}` }));

    setState((prev) => ({
      ...prev,
      clicks: seedClicks,
      activity: seedActivity,
      insights: seedInsights,
    }));
  }, []);

  useEffect(() => {
    const clickInterval = setInterval(() => {
      const newClick = generateClick();
      setState((prev) => ({
        ...prev,
        clicks: [newClick, ...prev.clicks].slice(0, 30),
        clicksLastMinute: prev.clicksLastMinute + Math.floor(Math.random() * 5) - 2,
        totalClicks: prev.totalClicks + 1,
        activeUsers: Math.max(2000, Math.min(3500, prev.activeUsers + Math.floor(Math.random() * 21) - 10)),
        aiExperiencesToday: prev.aiExperiencesToday + (Math.random() > 0.7 ? 1 : 0),
      }));
    }, 1500 + Math.random() * 2000);

    return () => clearInterval(clickInterval);
  }, []);

  useEffect(() => {
    const activityInterval = setInterval(() => {
      const newActivity = generateActivity();
      setState((prev) => ({
        ...prev,
        activity: [newActivity, ...prev.activity].slice(0, 20),
        totalLinks: prev.totalLinks + (newActivity.type === 'create' ? 1 : 0),
      }));
    }, 3000 + Math.random() * 3000);

    return () => clearInterval(activityInterval);
  }, []);

  useEffect(() => {
    const insightInterval = setInterval(() => {
      insightRotation.current = (insightRotation.current + 1) % AI_INSIGHTS.length;
      const newInsight: LiveAIInsight = {
        ...AI_INSIGHTS[insightRotation.current],
        id: `ins-${Date.now()}`,
      };
      setState((prev) => ({
        ...prev,
        insights: [newInsight, ...prev.insights].slice(0, 4),
      }));
    }, 6000);

    return () => clearInterval(insightInterval);
  }, []);

  useEffect(() => {
    const templateInterval = setInterval(() => {
      setState((prev) => ({
        ...prev,
        trendingTemplates: prev.trendingTemplates.map((t) => ({
          ...t,
          installs: t.installs + Math.floor(Math.random() * 5),
          change: t.change + Math.floor(Math.random() * 3),
        })),
      }));
    }, 5000);

    return () => clearInterval(templateInterval);
  }, []);

  return (
    <LiveEngineContext.Provider value={state}>
      {children}
    </LiveEngineContext.Provider>
  );
}

export function useLiveEngine() {
  const ctx = useContext(LiveEngineContext);
  if (!ctx) {
    return {
      activeUsers: 2431,
      clicksLastMinute: 145,
      totalClicks: 2480000,
      totalLinks: 51000,
      aiExperiencesToday: 248,
      countriesActive: 190,
      clicks: [],
      activity: [],
      insights: [],
      trendingTemplates: INITIAL_TEMPLATES,
      isLive: false,
    };
  }
  return ctx;
}
