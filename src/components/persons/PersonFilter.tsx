'use client';

import { cn, getCategoryLabel, getCategoryHexColor, getEraLabel, getEraHexColor } from '@/lib/utils';

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
          className="w-full px-4 py-2.5 rounded transition-colors"
          style={{
            background: 'var(--fresco-parchment)',
            border: '1px solid var(--fresco-shadow)',
            color: 'var(--ink-dark)',
            fontFamily: "'Pretendard', sans-serif",
            outline: 'none',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--fresco-shadow)'; }}
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          const catColor = cat !== 'all' ? getCategoryHexColor(cat) : '';
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className="text-xs px-3 py-1.5 rounded-full border transition-all duration-200"
              style={
                isActive
                  ? cat === 'all'
                    ? {
                        background: 'var(--gold-muted)',
                        color: 'var(--gold)',
                        borderColor: 'var(--gold)',
                        fontFamily: "'Pretendard', sans-serif",
                      }
                    : {
                        backgroundColor: `${catColor}18`,
                        color: catColor,
                        borderColor: `${catColor}40`,
                        fontFamily: "'Pretendard', sans-serif",
                      }
                  : {
                      background: 'transparent',
                      color: 'var(--ink-light)',
                      borderColor: 'var(--fresco-shadow)',
                      fontFamily: "'Pretendard', sans-serif",
                    }
              }
            >
              {cat === 'all' ? '전체' : getCategoryLabel(cat)}
              <span className="ml-1 opacity-60">
                {cat === 'all'
                  ? Object.values(categoryCounts).reduce((a, b) => a + b, 0)
                  : categoryCounts[cat] || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Era Filter */}
      <div className="flex flex-wrap gap-2">
        {eras.map((era) => {
          const isActive = selectedEra === era;
          const eraColor = era !== 'all' ? getEraHexColor(era) : '';
          return (
            <button
              key={era}
              onClick={() => onEraChange(era)}
              className="text-xs px-3 py-1.5 rounded-full border transition-all duration-200"
              style={
                isActive
                  ? era === 'all'
                    ? {
                        background: 'var(--gold-muted)',
                        color: 'var(--gold)',
                        borderColor: 'var(--gold)',
                        fontFamily: "'Pretendard', sans-serif",
                      }
                    : {
                        backgroundColor: `${eraColor}18`,
                        color: eraColor,
                        borderColor: `${eraColor}40`,
                        fontFamily: "'Pretendard', sans-serif",
                      }
                  : {
                      background: 'transparent',
                      color: 'var(--ink-light)',
                      borderColor: 'var(--fresco-shadow)',
                      fontFamily: "'Pretendard', sans-serif",
                    }
              }
            >
              {era === 'all' ? '전 시대' : getEraLabel(era)}
              <span className="ml-1 opacity-60">
                {era === 'all'
                  ? Object.values(eraCounts).reduce((a, b) => a + b, 0)
                  : eraCounts[era] || 0}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
