/**
 * Onderbalk Navigatie Component
 * Conform specificatie [K-3]:
 * Drie bestemmingen: Onderweg, Overzicht, Instellingen
 */

import React from 'react';
import { Navigation, ListFilter, Sliders } from 'lucide-react';

export type ActiveTab = 'onderweg' | 'overzicht' | 'instellingen';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'onderweg' as const,
      label: 'Onderweg',
      icon: Navigation
    },
    {
      id: 'overzicht' as const,
      label: 'Overzicht',
      icon: ListFilter
    },
    {
      id: 'instellingen' as const,
      label: 'Instellingen',
      icon: Sliders
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 safe-area-bottom">
      <div className="max-w-xl mx-auto grid grid-cols-3 h-16 items-center px-4">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                isActive ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              <span className={`text-[11px] mt-1 font-medium tracking-tight ${isActive ? 'font-bold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
