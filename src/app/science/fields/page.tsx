'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Atom,
  FlaskConical,
  Dna,
  Calculator,
  Stethoscope,
  Cpu,
  Telescope,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  MapPin,
  Tag,
  Microscope,
  Filter,
} from 'lucide-react';
import scientistsData from '@/data/persons/scientists.json';
import {
  cn,
  getEraColor,
  getEraBgColor,
  getEraLabel,
  getEraColorClass,
  getEraBorderClass,
  getEraHexColor,
  formatYear,
  getCategoryBadgeClass,
} from '@/lib/utils';

type Era = 'ancient' | 'medieval' | 'modern' | 'contemporary';

interface FieldInfo {
  key: string;
  label: string;
  color: string;
  icon: React.ReactNode;
  subcategories: string[];
}

const fields: FieldInfo[] = [
  { key: 'physics', label: '물리학', color: '#3B82F6', icon: <Atom className="w-5 h-5" />, subcategories: ['physics', 'classical_physics'] },
  { key: 'chemistry', label: '화학', color: '#F59E0B', icon: <FlaskConical className="w-5 h-5" />, subcategories: ['chemistry'] },
  { key: 'biology', label: '생물학', color: '#22C55E', icon: <Dna className="w-5 h-5" />, subcategories: ['biology'] },
  { key: 'mathematics', label: '수학', color: '#8B5CF6', icon: <Calculator className="w-5 h-5" />, subcategories: ['mathematics'] },
  { key: 'medicine', label: '의학', color: '#EF4444', icon: <Stethoscope className="w-5 h-5" />, subcategories: ['medicine'] },
  { key: 'computer_science', label: '컴퓨터과학', color: '#06B6D4', icon: <Cpu className="w-5 h-5" />, subcategories: ['computer_science'] },
  { key: 'astronomy', label: '천문학', color: '#6366F1', icon: <Telescope className="w-5 h-5" />, subcategories: ['astronomy'] },
  { key: 'scientific_revolution', label: '과학혁명', color: '#D4AF37', icon: <Sparkles className="w-5 h-5" />, subcategories: ['scientific_revolution'] },
  { key: 'ancient_medieval', label: '고대/중세', color: '#7C3AED', icon: <Microscope className="w-5 h-5" />, subcategories: ['ancient_medieval'] },
];

export default function FieldsPage() {
  const [selectedField, setSelectedField] = useState<string | 'all'>('all');
  const [expandedFields, setExpandedFields] = useState<Set<string>>(
    new Set(fields.map((f) => f.key))
  );

  const scientistsByField = useMemo(() => {
    const map: Record<string, typeof scientistsData> = {};
    for (const field of fields) {
      map[field.key] = scientistsData
        .filter((s) => field.subcategories.includes(s.subcategory))
        .sort((a, b) => a.period.start - b.period.start);
    }
    return map;
  }, []);

  const toggleField = (key: string) => {
    setExpandedFields((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const visibleFields = useMemo(() => {
    if (selectedField === 'all') return fields;
    return fields.filter((f) => f.key === selectedField);
  }, [selectedField]);

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-6">
        <Link
          href="/science/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          과학의 역사
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          분야별 과학자 탐색
        </h1>
        <p className="text-slate-400">
          {scientistsData.length}명의 과학자를 분야별로 탐색하세요
        </p>
      </div>

      {/* Filter Bar */}
      <div className="max-w-7xl mx-auto px-4 pb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-500 mr-1" />
          <button
            onClick={() => setSelectedField('all')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              selectedField === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300'
            )}
          >
            전체
          </button>
          {fields.map((field) => {
            const count = (scientistsByField[field.key] || []).length;
            return (
              <button
                key={field.key}
                onClick={() => setSelectedField(selectedField === field.key ? 'all' : field.key)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-1.5',
                  selectedField === field.key
                    ? 'text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300'
                )}
                style={
                  selectedField === field.key
                    ? { backgroundColor: field.color }
                    : undefined
                }
              >
                {field.label}
                <span className="text-xs opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Field Sections */}
      <div className="max-w-7xl mx-auto px-4 pb-20 space-y-6">
        {visibleFields.map((field) => {
          const scientists = scientistsByField[field.key] || [];
          const isExpanded = expandedFields.has(field.key);
          if (scientists.length === 0) return null;
          return (
            <div
              key={field.key}
              className="rounded-xl border border-slate-700/50 bg-slate-800/10 overflow-hidden"
            >
              {/* Field Header */}
              <button
                onClick={() => toggleField(field.key)}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${field.color}20`, color: field.color }}
                  >
                    {field.icon}
                  </div>
                  <div className="text-left">
                    <h2 className="text-lg font-semibold text-white">
                      {field.label}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {scientists.length}명의 과학자
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 text-slate-500 transition-transform',
                    isExpanded && 'rotate-180'
                  )}
                />
              </button>

              {/* Scientists Grid */}
              {isExpanded && (
                <div className="px-5 pb-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {scientists.map((s) => (
                      <Link
                        key={s.id}
                        href={`/persons/${s.id}/`}
                        className={cn(
                          'group rounded-xl border border-slate-700/50 bg-slate-800/20 p-5 hover:bg-slate-800/40 transition-all duration-200 border-l-4',
                          getEraBorderClass(s.era)
                        )}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-white font-semibold group-hover:text-emerald-400 transition-colors">
                              {s.name.ko}
                            </h3>
                            <p className="text-sm text-slate-500">{s.name.en}</p>
                          </div>
                          <span
                            className={cn(
                              'text-xs px-2 py-1 rounded-full font-medium',
                              getEraColorClass(s.era)
                            )}
                          >
                            {getEraLabel(s.era as Era)}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatYear(s.period.start)} ~ {formatYear(s.period.end)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {s.location.region}
                          </span>
                        </div>

                        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-3">
                          {s.summary}
                        </p>

                        {s.discoveries && s.discoveries.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {s.discoveries.slice(0, 3).map((d) => (
                              <span
                                key={d}
                                className="text-[11px] px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400"
                              >
                                <Tag className="w-2.5 h-2.5 inline mr-0.5" />
                                {d}
                              </span>
                            ))}
                            {s.discoveries.length > 3 && (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-700/30 text-slate-500">
                                +{s.discoveries.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="mt-3 flex items-center text-xs text-slate-500 group-hover:text-emerald-400 transition-colors">
                          자세히 보기
                          <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
