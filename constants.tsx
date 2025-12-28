
import React from 'react';
import { GameMode } from './types';

export const POKEMON_COUNT = 1010;

export const TYPE_COLORS: Record<string, string> = {
  normal: 'bg-gray-400',
  fire: 'bg-red-500',
  water: 'bg-blue-500',
  electric: 'bg-yellow-400',
  grass: 'bg-green-500',
  ice: 'bg-blue-300',
  fighting: 'bg-red-700',
  poison: 'bg-purple-500',
  ground: 'bg-yellow-700',
  flying: 'bg-indigo-400',
  psychic: 'bg-pink-500',
  bug: 'bg-lime-500',
  rock: 'bg-stone-600',
  ghost: 'bg-indigo-700',
  dragon: 'bg-indigo-600',
  dark: 'bg-gray-800',
  steel: 'bg-slate-400',
  fairy: 'bg-pink-300',
};

export const Icons = {
  Pokeball: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-.34.02-.67.06-1h4.07c.43 1.16 1.54 2 2.87 2s2.44-.84 2.87-2h4.07c.04.33.06.66.06 1 0 4.41-3.59 8-8 8zm0-10c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm7.94-1h-4.07c-.43-1.16-1.54-2-2.87-2s-2.44.84-2.87 2H4.06C4.82 5.63 8.08 3 12 3s7.18 2.63 7.94 5z"/>
    </svg>
  ),
  Shadow: ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a5 5 0 0 0-5 5v3a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z" />
      <path d="M17 14h.01" />
      <path d="M7 14h.01" />
      <path d="M12 18h.01" />
    </svg>
  ),
  Bolt: ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  Swords: ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
      <path d="M13 19l6-6" />
      <path d="M16 16l4 4" />
      <path d="M19 13l2 2" />
      <path d="M9.5 6.5L21 18v3h-3L6.5 9.5" />
    </svg>
  ),
  Brain: ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.54z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.54z" />
    </svg>
  ),
  Truth: ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  Scroll: ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  ),
  Chart: ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M18 17l-6-4-2 2-4-4" />
    </svg>
  ),
  Book: ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  User: ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Rocket: ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3.5 3.5L5 15l3.5-3.5L12 15z" />
      <path d="M2 2l.74 3.44a6.78 6.78 0 0 0 2.59 3.54l3.11 2.22c1.71 1.21 4.13 1.11 5.72-.24L22 2l-8.96 7.83c-1.35 1.59-1.45 4.01-.24 5.72l2.22 3.11a6.78 6.78 0 0 0 3.54 2.59L22 22" />
    </svg>
  )
};

export const CharacterIcons = {
  OAK: () => (
    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-400">
      <circle cx="50" cy="40" r="20" fill="currentColor" />
      <path d="M20 90 Q50 60 80 90" fill="none" stroke="currentColor" strokeWidth="8" />
    </svg>
  ),
  DEXTER: () => (
    <svg viewBox="0 0 100 100" className="w-full h-full text-red-500">
      <rect x="20" y="20" width="60" height="60" rx="10" fill="currentColor" />
      <circle cx="50" cy="50" r="15" fill="white" />
      <circle cx="50" cy="50" r="5" fill="blue" />
    </svg>
  ),
  ROCKET: () => (
    <svg viewBox="0 0 100 100" className="w-full h-full text-purple-600">
      <text x="50" y="75" fontSize="70" textAnchor="middle" fontWeight="black" fill="currentColor">R</text>
    </svg>
  )
};

// Fix for line 125: using React.ReactElement instead of JSX.Element to resolve namespace error
export const BadgeIcons: Record<GameMode, (props: { className?: string }) => React.ReactElement> = {
  [GameMode.SILHOUETTE]: (props) => <Icons.Shadow {...props} className={props.className || "w-16 h-16 text-slate-800"} />,
  [GameMode.SPEED_RUN]: (props) => <Icons.Bolt {...props} className={props.className || "w-16 h-16 text-yellow-500"} />,
  [GameMode.MOVE_MASTER]: (props) => <Icons.Swords {...props} className={props.className || "w-16 h-16 text-red-600"} />,
  [GameMode.REVERSE_GUESS]: (props) => <Icons.Brain {...props} className={props.className || "w-16 h-16 text-pink-500"} />,
  [GameMode.TWO_TRUTHS]: (props) => <Icons.Truth {...props} className={props.className || "w-16 h-16 text-green-600"} />,
  [GameMode.DEX_ENTRY]: (props) => <Icons.Scroll {...props} className={props.className || "w-16 h-16 text-amber-700"} />,
  [GameMode.STAT_RADAR]: (props) => <Icons.Chart {...props} className={props.className || "w-16 h-16 text-blue-600"} />,
  [GameMode.TYPE_DEDUCTION]: (props) => <Icons.Pokeball />, // Fallback
  [GameMode.EVOLUTION_MYSTERY]: (props) => <Icons.Pokeball />, // Fallback
};
