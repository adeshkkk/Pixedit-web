'use client';

import React from 'react';
import { SlidersHorizontal, Layers, Maximize2, Sparkles } from 'lucide-react';
import { ActiveTool } from '@/types/editor';

interface SidebarLeftProps {
  activeTool: ActiveTool;
  onSelectTool: (tool: ActiveTool) => void;
  theme: 'dark' | 'light';
}

export const SidebarLeft: React.FC<SidebarLeftProps> = ({
  activeTool,
  onSelectTool,
  theme,
}) => {
  const isLight = theme === 'light';

  const tools: Array<{
    id: ActiveTool;
    label: string;
    description: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'filters',
      label: 'Filters',
      description: 'Adjustments & Presets',
      icon: <SlidersHorizontal className="w-5 h-5" />,
    },
    {
      id: 'background',
      label: 'Background',
      description: 'Remove & Replace',
      icon: <Layers className="w-5 h-5" />,
    },
    {
      id: 'resize',
      label: 'Resize',
      description: 'Units & Presets',
      icon: <Maximize2 className="w-5 h-5" />,
    },
    {
      id: 'ai',
      label: 'AI Tools',
      description: 'Auto & Enhance',
      icon: <Sparkles className="w-5 h-5" />,
    },
  ];

  return (
    <aside
      id="sidebar-left-nav"
      className={`w-full md:w-20 lg:w-24 md:h-[calc(100vh-4rem)] border-b md:border-b-0 md:border-r flex md:flex-col items-center justify-around md:justify-start py-2 md:py-4 px-2 gap-2 md:gap-3 shrink-0 select-none z-20 ${
        isLight
          ? 'bg-white border-black text-black'
          : 'bg-[#11141a] border-[#222734] text-slate-300'
      }`}
    >
      {tools.map((tool) => {
        const isActive = activeTool === tool.id;
        return (
          <button
            key={tool.id}
            id={`btn-tool-${tool.id}`}
            onClick={() => onSelectTool(tool.id)}
            className={`w-full max-w-[80px] md:max-w-none flex flex-col items-center justify-center p-2 rounded-xl transition-all relative ${
              isActive
                ? isLight
                  ? 'bg-black text-white shadow-md border border-black font-semibold'
                  : 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm font-semibold'
                : isLight
                ? 'hover:bg-gray-100 text-black border border-transparent'
                : 'hover:bg-slate-800/70 text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
            title={tool.description}
          >
            <div className="relative mb-1">{tool.icon}</div>
            <span className="text-[11px] font-medium leading-none tracking-tight">
              {tool.label}
            </span>
          </button>
        );
      })}
    </aside>
  );
};
