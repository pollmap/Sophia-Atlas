'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Crown,
  Flag,
  Globe,
  Landmark,
  MapPin,
  Shield,
  Sword,
} from 'lucide-react';
import historicalFiguresData from '@/data/persons/historical-figures.json';
import eventsData from '@/data/entities/events.json';
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

interface CivilizationRegion {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  keywords: string[];
}

const civilizationRegions: CivilizationRegion[] = [
  {
    id: 'greece-rome',
    name: '그리스/로마',
    icon: <Landmark className="w-5 h-5" />,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/30',
    keywords: ['그리스', '로마', '아테네', '스파르타', '마케도니아', '비잔틴', '콘스탄티노', '니케아'],
  },
  {
    id: 'islamic',
    name: '이슬람 세계',
    icon: <Globe className="w-5 h-5" />,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/30',
    keywords: ['이슬람', '아랍', '오스만', '페르시아', '바그다드', '이란', '터키', '메카'],
  },
  {
    id: 'east-asia',
    name: '동아시아',
    icon: <Crown className="w-5 h-5" />,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
    keywords: ['중국', '일본', '한국', '조선', '몽골', '베트남', '제나라', '진나라'],
  },
  {
    id: 'europe',
    name: '유럽',
    icon: <Shield className="w-5 h-5" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
    keywords: ['프랑스', '영국', '독일', '스페인', '포르투갈', '이탈리아', '네덜란드', '러시아', '오스트리아', '폴란드', '스웨덴', '덴마크', '스위스', '유럽', '비텐베르크', '마인츠', '맨체스터', '런던', '피렌체', '케임브리지', '코펜하겐', '베를린', '필라델피아', '북아메리카', '레반트'],
  },
  {
    id: 'india',
    name: '인도',
    icon: <Globe className="w-5 h-5" />,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/30',
    keywords: ['인도', '무굴', '벵골', '델리'],
  },
  {
    id: 'americas',
    name: '아메리카',
    icon: <Flag className="w-5 h-5" />,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    borderColor: 'border-cyan-500/30',
    keywords: ['아메리카', '미국', '브라질', '멕시코', '잉카', '아즈텍', '마야', '워싱턴'],
  },
  {
    id: 'africa',
    name: '아프리카',
    icon: <Sword className="w-5 h-5" />,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30',
    keywords: ['아프리카', '이집트', '에티오피아', '남아프리카', '나이지리아', '케냐'],
  },
];

function matchRegion(region: string, keywords: string[]): boolean {
  return keywords.some((kw) => region.includes(kw));
}

export default function CivilizationsPage() {
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);

  const historicalPersons = useMemo(
    () =>
      historicalFiguresData
        .filter((p) => p.category === 'historical_figure')
        .sort((a, b) => a.period.start - b.period.start),
    []
  );

  const events = useMemo(
    () => [...eventsData].sort((a, b) => a.period.start - b.period.start),
    []
  );

  const getRegionPersons = (region: CivilizationRegion) =>
    historicalPersons.filter((p) => matchRegion(p.location.region, region.keywords));

  const getRegionEvents = (region: CivilizationRegion) =>
    events.filter((e) => e.location && matchRegion(e.location.region, region.keywords));

  const toggleRegion = (regionId: string) => {
    setExpandedRegion((prev) => (prev === regionId ? null : regionId));
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/20 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 pt-8 pb-10 relative">
          <Link
            href="/history"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            역사 허브로
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Landmark className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                문명과 제국
              </h1>
              <p className="text-slate-400 mt-1">
                지역별 역사 탐색
              </p>
            </div>
          </div>

          <div className="flex gap-4 mt-4 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <Globe className="w-4 h-4 text-red-400" />
              {civilizationRegions.length}개 문명권
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-red-400" />
              {historicalPersons.length}명의 역사 인물
            </span>
          </div>
        </div>
      </div>

      {/* Civilization Region Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="space-y-4">
          {civilizationRegions.map((region) => {
            const regionPersons = getRegionPersons(region);
            const regionEvents = getRegionEvents(region);
            const isExpanded = expandedRegion === region.id;
            const keyFigures = regionPersons.slice(0, 4);
            const keyEvents = regionEvents.slice(0, 3);

            return (
              <div
                key={region.id}
                className={cn(
                  'rounded-xl border bg-slate-800/30 overflow-hidden transition-all duration-300',
                  region.borderColor,
                  isExpanded ? 'border-2' : 'border'
                )}
              >
                {/* Region Header */}
                <button
                  onClick={() => toggleRegion(region.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-slate-800/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        region.bgColor,
                        region.color
                      )}
                    >
                      {region.icon}
                    </div>
                    <div>
                      <h3 className={cn('text-xl font-bold', region.color)}>
                        {region.name}
                      </h3>
                      <div className="flex gap-4 mt-1 text-sm text-slate-400">
                        <span>{regionPersons.length}명의 인물</span>
                        <span>{regionEvents.length}개의 사건</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Preview key figures */}
                    <div className="hidden md:flex gap-2">
                      {keyFigures.map((p) => (
                        <span
                          key={p.id}
                          className="text-xs px-2 py-1 rounded-full bg-slate-700/50 text-slate-300"
                        >
                          {p.name.ko}
                        </span>
                      ))}
                      {regionPersons.length > 4 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-700/50 text-slate-500">
                          +{regionPersons.length - 4}
                        </span>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Collapsed preview: key events */}
                {!isExpanded && keyEvents.length > 0 && (
                  <div className="px-6 pb-4 flex gap-2 flex-wrap">
                    {keyEvents.map((event) => (
                      <Link
                        key={event.id}
                        href={`/entities/${event.id}`}
                        className="text-xs px-2 py-1 rounded-full bg-slate-700/30 text-amber-300 hover:bg-slate-700/60 transition-colors"
                      >
                        <Flag className="w-2.5 h-2.5 inline mr-1" />
                        {event.name.ko} ({formatYear(event.period.start)})
                      </Link>
                    ))}
                  </div>
                )}

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-slate-700/50">
                    {/* Key Events */}
                    {regionEvents.length > 0 && (
                      <div className="p-6 border-b border-slate-700/30">
                        <h4 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                          <Flag className="w-4 h-4" />
                          주요 사건
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {regionEvents.map((event) => (
                            <Link
                              key={event.id}
                              href={`/entities/${event.id}`}
                              className="group rounded-lg border border-slate-700/50 bg-slate-800/20 p-4 hover:bg-slate-800/40 transition-all"
                            >
                              <h5 className="text-sm font-medium text-amber-200 group-hover:text-amber-300 transition-colors">
                                {event.name.ko}
                              </h5>
                              <p className="text-xs text-slate-500 mt-1">
                                {event.name.en}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                                <Calendar className="w-3 h-3" />
                                {formatYear(event.period.start)}
                                {event.period.end !== event.period.start &&
                                  ` ~ ${formatYear(event.period.end)}`}
                              </div>
                              <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                                {event.summary}
                              </p>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Full Person List */}
                    <div className="p-6">
                      <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                        <Crown className="w-4 h-4" />
                        역사 인물 ({regionPersons.length}명)
                      </h4>
                      {regionPersons.length === 0 ? (
                        <p className="text-sm text-slate-500 italic">
                          이 지역의 역사 인물 데이터가 아직 없습니다.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {regionPersons.map((p) => (
                            <Link
                              key={p.id}
                              href={`/persons/${p.id}`}
                              className={cn(
                                'group rounded-lg border border-slate-700/50 bg-slate-800/20 p-4 hover:bg-slate-800/40 transition-all border-l-4',
                                getEraBorderClass(p.era)
                              )}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h5 className="text-sm font-semibold text-white group-hover:text-red-400 transition-colors">
                                    {p.name.ko}
                                  </h5>
                                  <p className="text-xs text-slate-500">{p.name.en}</p>
                                </div>
                                <span
                                  className={cn(
                                    'text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0',
                                    getEraColorClass(p.era)
                                  )}
                                >
                                  {getEraLabel(p.era as Era)}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                                <Calendar className="w-3 h-3" />
                                {formatYear(p.period.start)} ~ {formatYear(p.period.end)}
                              </div>

                              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                                <MapPin className="w-3 h-3" />
                                {p.location.region}
                              </div>

                              <p className="text-xs text-slate-400 line-clamp-2">
                                {p.summary}
                              </p>

                              <div className="mt-2 flex items-center text-xs text-slate-500 group-hover:text-red-400 transition-colors">
                                자세히 보기
                                <ChevronRight className="w-3 h-3 ml-0.5" />
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
