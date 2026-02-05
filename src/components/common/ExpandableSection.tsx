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
      className={cn('rounded overflow-hidden', className)}
      style={{
        border: '1px solid var(--fresco-shadow)',
        backgroundColor: 'var(--fresco-parchment)',
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-5 py-4 text-left transition-colors duration-200"
        style={{ color: 'var(--ink-dark)' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--fresco-aged)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ''; }}
      >
        <div className="flex items-center gap-2.5">
          {icon}
          <span className="font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{title}</span>
        </div>
        <ChevronDown
          className={cn(
            'w-5 h-5 transition-transform duration-300 flex-shrink-0',
            isOpen && 'rotate-180'
          )}
          style={{ color: 'var(--ink-faded)' }}
        />
      </button>
      <div
        className={cn(
          'transition-all duration-300 ease-in-out overflow-hidden',
          isOpen ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-5 pb-5 leading-relaxed" style={{ color: 'var(--ink-medium)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
