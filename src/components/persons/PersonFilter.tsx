'use client';

import { cn, getCategoryBadgeClass, getCategoryLabel, getEraColor, getEraLabel } from '@/lib/utils';

interface PersonFilterProps {
  selectedCategory: string;
  selectedEra: string;
  searchQuery: string;
  onCategoryChange: (category: string) => void;
  onEraChange: (era: string) => void;
  onSearchChange: (query: string) => void;
  categoryCounts: Record<string, number>;
  eraCounts: Record<string, number>;
}

const categories = ['all', 'philosopher', 'religious_figure', 'scientist', 'historical_figure', 'cultural_figure'];
const eras = ['all', 'ancient', 'medieval', 'modern', 'contemporary'];

export default function PersonFilter({
  selectedCategory,
  selectedEra,
  searchQuery,
  onCategoryChange,
  onEraChange,
  onSearchChange,
  categoryCounts,
  eraCounts,
}: PersonFilterProps) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="인물 검색 (이름, 학파, 개념...)"
          className="w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={cn(
              'text-xs px-3 py-1.5 rounded-full border transition-all duration-200',
              selectedCategory === cat
                ? cat === 'all'
                  ? 'bg-white/10 text-white border-white/30'
                  : getCategoryBadgeClass(cat)
                : 'border-slate-700/50 text-slate-500 hover:text-slate-300 hover:border-slate-600'
            )}
          >
            {cat === 'all' ? '전체' : getCategoryLabel(cat)}
            <span className="ml-1 opacity-60">
              {cat === 'all'
                ? Object.values(categoryCounts).reduce((a, b) => a + b, 0)
                : categoryCounts[cat] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Era Filter */}
      <div className="flex flex-wrap gap-2">
        {eras.map((era) => (
          <button
            key={era}
            onClick={() => onEraChange(era)}
            className={cn(
              'text-xs px-3 py-1.5 rounded-full border transition-all duration-200',
              selectedEra === era
                ? era === 'all'
                  ? 'bg-white/10 text-white border-white/30'
                  : `${getEraColor(era)} border-current bg-current/10`
                : 'border-slate-700/50 text-slate-500 hover:text-slate-300 hover:border-slate-600'
            )}
          >
            {era === 'all' ? '전 시대' : getEraLabel(era)}
            <span className="ml-1 opacity-60">
              {era === 'all'
                ? Object.values(eraCounts).reduce((a, b) => a + b, 0)
                : eraCounts[era] || 0}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
