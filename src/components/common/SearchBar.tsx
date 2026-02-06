'use client';

import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = '검색...',
  className = '',
}: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--ink-faded)' }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 rounded border transition-colors"
        style={{
          background: 'var(--fresco-parchment)',
          borderColor: 'var(--fresco-shadow)',
          color: 'var(--ink-dark)',
          fontFamily: "'Pretendard', sans-serif",
          outline: 'none',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--fresco-shadow)'; }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--ink-faded)' }}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
