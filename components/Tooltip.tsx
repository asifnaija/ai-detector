import React from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
  side?: 'top' | 'bottom';
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, className = '', side = 'top' }) => {
  return (
    <div className={`group relative flex items-center justify-center ${className}`}>
      {children}
      <div 
        className={`
          absolute z-50 px-2.5 py-1.5 
          bg-[#1d1d1f]/90 backdrop-blur-md 
          text-white text-[11px] font-medium tracking-wide
          rounded-lg shadow-xl border border-white/5
          opacity-0 invisible group-hover:opacity-100 group-hover:visible 
          transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]
          whitespace-nowrap pointer-events-none
          ${side === 'top' 
            ? 'bottom-full mb-2 translate-y-1 group-hover:translate-y-0' 
            : 'top-full mt-2 -translate-y-1 group-hover:translate-y-0'
          }
        `}
      >
        {content}
      </div>
    </div>
  );
};
