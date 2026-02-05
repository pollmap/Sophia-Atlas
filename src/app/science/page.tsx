'use client';

import { useMemo } from 'react';
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
  Calendar,
  MapPin,
  Microscope,
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

export default function SciencePage() {
  const scientistsByField = useMemo(() => {
    const map: Record<string, typeof scientistsData> = {};
    for (const field of fields) {
      map[field.key] = scientistsData.filter((s) =>
        field.subcategories.includes(s.subcategory)
      );
    }
    return map;
  }, []);

  const uniqueFields = useMemo(() => {
    const allFields = new Set<string>();
    scientistsData.forEach((s) => {
      if (s.field) s.field.forEach((f) => allFields.add(f));
    });
    return allFields.size;
  }, []);

  const featuredScientists = useMemo(() => {
    return scientistsData
      .filter((s) => s.mvp === true)
      .sort((a, b) => a.period.start - b.period.start)
      .slice(0, 8);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--fresco-ivory)' }}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom right, rgba(91,115,85,0.08), transparent, rgba(91,115,85,0.04))' }} />
        <div className="max-w-7xl mx-auto px-4 pt-8 pb-12 relative">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm transition-colors mb-6"
            style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}
          >
            <ArrowLeft className="w-4 h-4" />
            홈으로
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded flex items-center justify-center" style={{ backgroundColor: 'rgba(91,115,85,0.15)' }}>
              <Atom className="w-6 h-6" style={{ color: '#5B7355' }} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
                과학의 역사
              </h1>
              <p className="mt-1" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>
                인류의 발견과 혁신의 여정
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded" style={{ backgroundColor: 'var(--fresco-parchment)', border: '1px solid var(--fresco-shadow)' }}>
              <Microscope className="w-4 h-4" style={{ color: '#5B7355' }} />
              <span className="text-sm" style={{ color: 'var(--ink-medium)', fontFamily: "'Pretendard', sans-serif" }}>
                <span className="font-semibold" style={{ color: 'var(--ink-dark)' }}>{scientistsData.length}</span>명의 과학자
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded" style={{ backgroundColor: 'var(--fresco-parchment)', border: '1px solid var(--fresco-shadow)' }}>
              <FlaskConical className="w-4 h-4" style={{ color: '#5B7355' }} />
              <span className="text-sm" style={{ color: 'var(--ink-medium)', fontFamily: "'Pretendard', sans-serif" }}>
                <span className="font-semibold" style={{ color: 'var(--ink-dark)' }}>{uniqueFields}</span>개 연구 분야
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="flex items-center gap-3 mt-6">
            <Link
              href="/science/timeline"
              className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors"
              style={{ backgroundColor: 'rgba(91,115,85,0.12)', color: '#5B7355', border: '1px solid rgba(91,115,85,0.25)', fontFamily: "'Pretendard', sans-serif" }}
            >
              <Calendar className="w-4 h-4" />
              타임라인
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/science/fields"
              className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors"
              style={{ backgroundColor: 'rgba(91,115,85,0.12)', color: '#5B7355', border: '1px solid rgba(91,115,85,0.25)', fontFamily: "'Pretendard', sans-serif" }}
            >
              <Microscope className="w-4 h-4" />
              분야별 탐색
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Field Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
          <FlaskConical className="w-5 h-5" style={{ color: '#5B7355' }} />
          분야별 과학자
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map((field) => {
            const scientists = scientistsByField[field.key] || [];
            const top3 = scientists.slice(0, 3);
            return (
              <Link
                key={field.key}
                href="/science/fields"
                className="group rounded p-5 transition-all duration-200"
                style={{ border: '1px solid var(--fresco-shadow)', backgroundColor: 'var(--fresco-parchment)' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded flex items-center justify-center"
                    style={{ backgroundColor: `${field.color}20`, color: field.color }}
                  >
                    {field.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold transition-colors" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
                      {field.label}
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>{scientists.length}명</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {top3.map((s) => (
                    <span
                      key={s.id}
                      className="text-[11px] px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: 'var(--fresco-aged)', color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}
                    >
                      {s.name.ko}
                    </span>
                  ))}
                  {scientists.length > 3 && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--fresco-shadow)', color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>
                      +{scientists.length - 3}
                    </span>
                  )}
                </div>
                <div className="flex items-center text-xs transition-colors" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>
                  자세히 보기
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Featured Scientists */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
          <Sparkles className="w-5 h-5" style={{ color: '#5B7355' }} />
          주요 과학자
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredScientists.map((s) => (
            <Link
              key={s.id}
              href={`/persons/${s.id}`}
              className={cn(
                'group rounded p-5 transition-all duration-200 border-l-4',
                getEraBorderClass(s.era)
              )}
              style={{ border: '1px solid var(--fresco-shadow)', backgroundColor: 'var(--fresco-parchment)' }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold transition-colors" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
                    {s.name.ko}
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>{s.name.en}</p>
                </div>
                <span
                  className={cn(
                    'text-[10px] px-2 py-0.5 rounded-full font-medium',
                    getEraColorClass(s.era)
                  )}
                >
                  {getEraLabel(s.era as Era)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs mb-2" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatYear(s.period.start)} ~ {formatYear(s.period.end)}
                </span>
              </div>
              {s.field && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {s.field.slice(0, 2).map((f) => (
                    <span
                      key={f}
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: 'rgba(91,115,85,0.1)', color: '#5B7355', border: '1px solid rgba(91,115,85,0.2)', fontFamily: "'Pretendard', sans-serif" }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>
                {s.summary}
              </p>
              <div className="mt-2 flex items-center text-xs transition-colors" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>
                자세히 보기
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
