'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Palette,
  BookOpen,
  Music,
  ArrowLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Tag,
  Sparkles,
} from 'lucide-react';
import historicalFiguresData from '@/data/persons/historical-figures.json';
import movementsData from '@/data/entities/movements.json';
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

interface DomainConfig {
  subcategory: string;
  label: string;
  icon: typeof BookOpen;
  color: string;
  bgColor: string;
}

const domains: DomainConfig[] = [
  {
    subcategory: 'literary_figure',
    label: '문학',
    icon: BookOpen,
    color: '#6B4E8A',
    bgColor: 'rgba(107,78,138,0.12)',
  },
  {
    subcategory: 'artist',
    label: '미술',
    icon: Palette,
    color: '#7A5478',
    bgColor: 'rgba(122,84,120,0.12)',
  },
  {
    subcategory: 'musician',
    label: '음악',
    icon: Music,
    color: '#B8860B',
    bgColor: 'rgba(184,134,11,0.12)',
  },
];

export default function CulturePage() {
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);

  const culturalFigures = useMemo(() => {
    return historicalFiguresData.filter(
      (p: Record<string, unknown>) => p.category === 'cultural_figure'
    );
  }, []);

  const getDomainFigures = (subcategory: string) => {
    return culturalFigures.filter(
      (p: Record<string, unknown>) => p.subcategory === subcategory
    );
  };

  const featuredFigures = useMemo(() => {
    return culturalFigures
      .filter((p: Record<string, unknown>) => p.mvp === true)
      .slice(0, 8);
  }, [culturalFigures]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--fresco-ivory)' }}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom right, rgba(122,84,120,0.06), transparent, rgba(107,78,138,0.04))' }} />
        <div className="max-w-7xl mx-auto px-4 pt-8 pb-12 relative">
          <Link
            href="/"
            className="inline-flex items-center transition-colors mb-6"
            style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            홈으로 돌아가기
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded flex items-center justify-center" style={{ backgroundColor: 'rgba(122,84,120,0.15)' }}>
              <Palette className="w-7 h-7" style={{ color: '#7A5478' }} />
            </div>
            <div>
              <h1 className="text-4xl font-bold" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>문화와 예술</h1>
              <p className="text-lg mt-1" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>
                인류 창의성의 역사
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-6">
            <div className="rounded px-5 py-3" style={{ backgroundColor: 'var(--fresco-parchment)', border: '1px solid rgba(122,84,120,0.2)' }}>
              <div className="text-2xl font-bold" style={{ color: '#7A5478', fontFamily: "'Cormorant Garamond', serif" }}>
                {culturalFigures.length}
              </div>
              <div className="text-sm" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>문화/예술 인물</div>
            </div>
            <div className="rounded px-5 py-3" style={{ backgroundColor: 'var(--fresco-parchment)', border: '1px solid rgba(122,84,120,0.2)' }}>
              <div className="text-2xl font-bold" style={{ color: '#7A5478', fontFamily: "'Cormorant Garamond', serif" }}>
                {movementsData.length}
              </div>
              <div className="text-sm" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>사상/운동</div>
            </div>
            <div className="rounded px-5 py-3" style={{ backgroundColor: 'var(--fresco-parchment)', border: '1px solid rgba(122,84,120,0.2)' }}>
              <div className="text-2xl font-bold" style={{ color: '#7A5478', fontFamily: "'Cormorant Garamond', serif" }}>
                {domains.length}
              </div>
              <div className="text-sm" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>분야</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        {/* Domain Sections */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
            <Sparkles className="w-6 h-6" style={{ color: '#7A5478' }} />
            분야별 탐색
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {domains.map((domain) => {
              const figures = getDomainFigures(domain.subcategory);
              const isExpanded = expandedDomain === domain.subcategory;
              const Icon = domain.icon;
              const displayFigures = isExpanded
                ? figures
                : figures.slice(0, 3);

              return (
                <div
                  key={domain.subcategory}
                  className="rounded overflow-hidden transition-all"
                  style={{ backgroundColor: 'var(--fresco-parchment)', border: '1px solid var(--fresco-shadow)' }}
                >
                  {/* Domain Header */}
                  <div
                    className="p-5"
                    style={{
                      borderTopColor: domain.color,
                      borderTopWidth: '3px',
                      borderBottom: '1px solid var(--fresco-shadow)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded flex items-center justify-center"
                          style={{ backgroundColor: `${domain.color}20` }}
                        >
                          <Icon
                            className="w-5 h-5"
                            style={{ color: domain.color }}
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
                            {domain.label}
                          </h3>
                          <span className="text-sm" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>
                            {figures.length}명
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Figures List */}
                  <div className="p-4 space-y-2">
                    {displayFigures.map(
                      (figure: Record<string, unknown>) => {
                        const name = figure.name as {
                          ko: string;
                          en: string;
                        };
                        const period = figure.period as {
                          start: number;
                          end: number;
                        };
                        return (
                          <Link
                            key={figure.id as string}
                            href={`/persons/${figure.id as string}`}
                            className="flex items-center justify-between p-3 rounded transition-colors group"
                            style={{ fontFamily: "'Pretendard', sans-serif" }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor: getEraHexColor(
                                    figure.era as string
                                  ),
                                }}
                              />
                              <div>
                                <span className="font-medium transition-colors" style={{ color: 'var(--ink-dark)' }}>
                                  {name.ko}
                                </span>
                                <span className="text-sm ml-2" style={{ color: 'var(--ink-light)' }}>
                                  {name.en}
                                </span>
                              </div>
                            </div>
                            <span className="text-xs" style={{ color: 'var(--ink-light)' }}>
                              {formatYear(period.start)}~
                              {formatYear(period.end)}
                            </span>
                          </Link>
                        );
                      }
                    )}
                  </div>

                  {/* Expand/Collapse */}
                  {figures.length > 3 && (
                    <div className="px-4 pb-4">
                      <button
                        onClick={() =>
                          setExpandedDomain(
                            isExpanded ? null : domain.subcategory
                          )
                        }
                        className="w-full text-center py-2 text-sm rounded transition-all"
                        style={{ border: '1px solid var(--fresco-shadow)', color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}
                      >
                        {isExpanded
                          ? '접기'
                          : `나머지 ${figures.length - 3}명 더 보기`}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Cultural Movements Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
              <Calendar className="w-6 h-6" style={{ color: '#7A5478' }} />
              문화 사조와 운동
            </h2>
            <Link
              href="/culture/movements"
              className="inline-flex items-center gap-1 transition-colors text-sm font-medium"
              style={{ color: '#7A5478', fontFamily: "'Pretendard', sans-serif" }}
            >
              전체 보기
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {movementsData.slice(0, 6).map((movement: Record<string, unknown>) => {
              const name = movement.name as {
                ko: string;
                en: string;
              };
              const period = movement.period as {
                start: number;
                end: number;
              };
              const era = movement.era as string;
              return (
                <Link
                  key={movement.id as string}
                  href={`/entities/${movement.id as string}`}
                  className="rounded p-5 transition-all group"
                  style={{ backgroundColor: 'var(--fresco-parchment)', border: '1px solid var(--fresco-shadow)' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        getEraColorClass(era)
                      )}
                    >
                      {getEraLabel(era)}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>
                      {formatYear(period.start)} ~ {formatYear(period.end)}
                    </span>
                  </div>
                  <h3 className="font-bold transition-colors" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
                    {name.ko}
                  </h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>{name.en}</p>
                  <p className="text-sm mt-3 line-clamp-2" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>
                    {movement.summary as string}
                  </p>
                  {(movement.tags as string[])?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {(movement.tags as string[]).slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: 'var(--fresco-aged)', color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Featured Figures */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
            <Sparkles className="w-6 h-6" style={{ color: '#7A5478' }} />
            주요 문화/예술 인물
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredFigures.map((figure: Record<string, unknown>) => {
              const name = figure.name as { ko: string; en: string };
              const period = figure.period as {
                start: number;
                end: number;
              };
              const era = figure.era as string;
              const domain = figure.domain as string | undefined;
              const summary = figure.summary as string;
              const achievements = figure.achievements as
                | string[]
                | undefined;
              const subcategory = figure.subcategory as string;

              const domainConfig = domains.find(
                (d) => d.subcategory === subcategory
              );
              const DomainIcon = domainConfig?.icon || Palette;

              return (
                <Link
                  key={figure.id as string}
                  href={`/persons/${figure.id as string}`}
                  className="rounded p-5 transition-all group"
                  style={{ backgroundColor: 'var(--fresco-parchment)', border: '1px solid var(--fresco-shadow)' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center"
                        style={{
                          backgroundColor: `${domainConfig?.color || '#7A5478'}20`,
                        }}
                      >
                        <DomainIcon
                          className="w-4 h-4"
                          style={{
                            color: domainConfig?.color || '#7A5478',
                          }}
                        />
                      </div>
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-medium',
                          getEraColorClass(era)
                        )}
                      >
                        {getEraLabel(era)}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg transition-colors" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
                    {name.ko}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>{name.en}</p>

                  <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatYear(period.start)} ~ {formatYear(period.end)}
                    </span>
                  </div>

                  {domain && (
                    <div className="flex items-center gap-1 mt-2">
                      <Tag className="w-3 h-3" style={{ color: 'var(--ink-light)' }} />
                      <span className="text-xs" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>{domain}</span>
                    </div>
                  )}

                  <p className="text-sm mt-3 line-clamp-2" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>
                    {summary}
                  </p>

                  {achievements && achievements.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {achievements.slice(0, 2).map((a: string) => (
                        <span
                          key={a}
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: 'rgba(122,84,120,0.1)', color: '#7A5478', border: '1px solid rgba(122,84,120,0.2)', fontFamily: "'Pretendard', sans-serif" }}
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Quick Navigation */}
        <section>
          <div className="rounded p-6" style={{ backgroundColor: 'var(--fresco-parchment)', border: '1px solid var(--fresco-shadow)' }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
              더 탐색하기
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/culture/movements"
                className="flex items-center gap-3 p-4 rounded transition-colors group"
                style={{ backgroundColor: 'var(--fresco-aged)', fontFamily: "'Pretendard', sans-serif" }}
              >
                <div className="w-10 h-10 rounded flex items-center justify-center" style={{ backgroundColor: 'rgba(122,84,120,0.15)' }}>
                  <Calendar className="w-5 h-5" style={{ color: '#7A5478' }} />
                </div>
                <div>
                  <div className="font-medium transition-colors" style={{ color: 'var(--ink-dark)' }}>
                    문화 사조의 흐름
                  </div>
                  <div className="text-xs" style={{ color: 'var(--ink-light)' }}>
                    예술과 사상의 운동
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 ml-auto" style={{ color: 'var(--ink-light)' }} />
              </Link>
              <Link
                href="/persons"
                className="flex items-center gap-3 p-4 rounded transition-colors group"
                style={{ backgroundColor: 'var(--fresco-aged)', fontFamily: "'Pretendard', sans-serif" }}
              >
                <div className="w-10 h-10 rounded flex items-center justify-center" style={{ backgroundColor: 'rgba(74,93,138,0.15)' }}>
                  <Sparkles className="w-5 h-5" style={{ color: '#4A5D8A' }} />
                </div>
                <div>
                  <div className="font-medium transition-colors" style={{ color: 'var(--ink-dark)' }}>
                    전체 인물 탐색
                  </div>
                  <div className="text-xs" style={{ color: 'var(--ink-light)' }}>
                    통합 인물 목록
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 ml-auto" style={{ color: 'var(--ink-light)' }} />
              </Link>
              <Link
                href="/connections"
                className="flex items-center gap-3 p-4 rounded transition-colors group"
                style={{ backgroundColor: 'var(--fresco-aged)', fontFamily: "'Pretendard', sans-serif" }}
              >
                <div className="w-10 h-10 rounded flex items-center justify-center" style={{ backgroundColor: 'rgba(107,78,138,0.15)' }}>
                  <Palette className="w-5 h-5" style={{ color: '#6B4E8A' }} />
                </div>
                <div>
                  <div className="font-medium transition-colors" style={{ color: 'var(--ink-dark)' }}>
                    인드라망
                  </div>
                  <div className="text-xs" style={{ color: 'var(--ink-light)' }}>
                    사상의 연결 관계
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 ml-auto" style={{ color: 'var(--ink-light)' }} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
