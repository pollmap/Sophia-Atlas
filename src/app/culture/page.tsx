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
    color: '#8B5CF6',
    bgColor: 'bg-violet-500/20',
  },
  {
    subcategory: 'artist',
    label: '미술',
    icon: Palette,
    color: '#EC4899',
    bgColor: 'bg-pink-500/20',
  },
  {
    subcategory: 'musician',
    label: '음악',
    icon: Music,
    color: '#F59E0B',
    bgColor: 'bg-amber-500/20',
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
    <div className="min-h-screen bg-[#0F172A]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-violet-500/10" />
        <div className="max-w-7xl mx-auto px-4 pt-8 pb-12 relative">
          <Link
            href="/"
            className="inline-flex items-center text-slate-400 hover:text-pink-400 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            홈으로 돌아가기
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-pink-500/20 flex items-center justify-center">
              <Palette className="w-7 h-7 text-pink-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">문화와 예술</h1>
              <p className="text-slate-400 text-lg mt-1">
                인류 창의성의 역사
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-6">
            <div className="bg-slate-800/60 rounded-xl px-5 py-3 border border-pink-500/20">
              <div className="text-2xl font-bold text-pink-400">
                {culturalFigures.length}
              </div>
              <div className="text-sm text-slate-400">문화/예술 인물</div>
            </div>
            <div className="bg-slate-800/60 rounded-xl px-5 py-3 border border-pink-500/20">
              <div className="text-2xl font-bold text-pink-400">
                {movementsData.length}
              </div>
              <div className="text-sm text-slate-400">사상/운동</div>
            </div>
            <div className="bg-slate-800/60 rounded-xl px-5 py-3 border border-pink-500/20">
              <div className="text-2xl font-bold text-pink-400">
                {domains.length}
              </div>
              <div className="text-sm text-slate-400">분야</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        {/* Domain Sections */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-pink-400" />
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
                  className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden hover:border-pink-500/30 transition-all"
                >
                  {/* Domain Header */}
                  <div
                    className="p-5 border-b border-slate-700/50"
                    style={{
                      borderTopColor: domain.color,
                      borderTopWidth: '3px',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${domain.color}20` }}
                        >
                          <Icon
                            className="w-5 h-5"
                            style={{ color: domain.color }}
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">
                            {domain.label}
                          </h3>
                          <span className="text-sm text-slate-400">
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
                            href={`/persons/${figure.id as string}/`}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/50 transition-colors group"
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
                                <span className="text-white font-medium group-hover:text-pink-400 transition-colors">
                                  {name.ko}
                                </span>
                                <span className="text-slate-500 text-sm ml-2">
                                  {name.en}
                                </span>
                              </div>
                            </div>
                            <span className="text-xs text-slate-500">
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
                        className="w-full text-center py-2 text-sm rounded-lg border border-slate-600/50 text-slate-400 hover:text-pink-400 hover:border-pink-500/30 transition-all"
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
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-pink-400" />
              문화 사조와 운동
            </h2>
            <Link
              href="/culture/movements/"
              className="inline-flex items-center gap-1 text-pink-400 hover:text-pink-300 transition-colors text-sm font-medium"
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
                  href={`/entities/${movement.id as string}/`}
                  className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5 hover:border-pink-500/30 transition-all group"
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
                    <span className="text-xs text-slate-500">
                      {formatYear(period.start)} ~ {formatYear(period.end)}
                    </span>
                  </div>
                  <h3 className="text-white font-bold group-hover:text-pink-400 transition-colors">
                    {name.ko}
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">{name.en}</p>
                  <p className="text-slate-400 text-sm mt-3 line-clamp-2">
                    {movement.summary as string}
                  </p>
                  {(movement.tags as string[])?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {(movement.tags as string[]).slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400"
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
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-pink-400" />
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
                  href={`/persons/${figure.id as string}/`}
                  className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5 hover:border-pink-500/30 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: `${domainConfig?.color || '#EC4899'}20`,
                        }}
                      >
                        <DomainIcon
                          className="w-4 h-4"
                          style={{
                            color: domainConfig?.color || '#EC4899',
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

                  <h3 className="text-white font-bold text-lg group-hover:text-pink-400 transition-colors">
                    {name.ko}
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">{name.en}</p>

                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatYear(period.start)} ~ {formatYear(period.end)}
                    </span>
                  </div>

                  {domain && (
                    <div className="flex items-center gap-1 mt-2">
                      <Tag className="w-3 h-3 text-slate-500" />
                      <span className="text-xs text-slate-400">{domain}</span>
                    </div>
                  )}

                  <p className="text-slate-400 text-sm mt-3 line-clamp-2">
                    {summary}
                  </p>

                  {achievements && achievements.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {achievements.slice(0, 2).map((a: string) => (
                        <span
                          key={a}
                          className="text-xs px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20"
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
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
            <h2 className="text-lg font-bold text-white mb-4">
              더 탐색하기
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/culture/movements/"
                className="flex items-center gap-3 p-4 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <div className="text-white font-medium group-hover:text-pink-400 transition-colors">
                    문화 사조의 흐름
                  </div>
                  <div className="text-xs text-slate-500">
                    예술과 사상의 운동
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 ml-auto" />
              </Link>
              <Link
                href="/persons/"
                className="flex items-center gap-3 p-4 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <div className="text-white font-medium group-hover:text-indigo-400 transition-colors">
                    전체 인물 탐색
                  </div>
                  <div className="text-xs text-slate-500">
                    통합 인물 목록
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 ml-auto" />
              </Link>
              <Link
                href="/connections/"
                className="flex items-center gap-3 p-4 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <div className="text-white font-medium group-hover:text-violet-400 transition-colors">
                    인드라망
                  </div>
                  <div className="text-xs text-slate-500">
                    사상의 연결 관계
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 ml-auto" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
