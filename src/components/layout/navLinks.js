import { BookOpen, Compass, GraduationCap, Home, Layers } from 'lucide-react';

export const NAV_LINKS = [
  { id: 'home', to: '/', end: true, icon: Home },
  { id: 'courses', to: '/courses', icon: BookOpen },
  { id: 'paths', to: '/paths', icon: Compass },
  { id: 'learning', to: '/learning', icon: GraduationCap },
  { id: 'review', to: '/review', icon: Layers },
];
export const MORE_LINKS = ['notes', 'stats', 'glossary', 'instructors', 'placement', 'privacy'];
