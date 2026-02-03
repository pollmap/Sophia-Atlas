'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpandableSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export default function ExpandableSection({
  title,
  children,
  defaultOpen = false,
  icon,
  className,
}: ExpandableSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        'border border-slate-700/50 rounded-xl overflow-hidden bg-slate-800/20',
        className
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-5 py-4 text-left hover:bg-slate-800/40 transition-colors duration-200"
      >
        <div className="flex items-center gap-2.5">
          {icon}
          <span className="font-semibold text-white">{title}</span>
        </div>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-slate-400 transition-transform duration-300 flex-shrink-0',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'transition-all duration-300 ease-in-out overflow-hidden',
          isOpen ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-5 pb-5 text-slate-300 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
