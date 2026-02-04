'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Clock,
  Copy,
  Globe,
  Share2,
  Sparkles,
  Users,
  Quote,
  Network,
  ChevronRight,
  Atom,
  Crown,
  Palette,
  Scroll,
  ArrowRight,
  Zap,
} from 'lucide-react';
import philosophersData from '@/data/persons/philosophers.json';
import religiousFiguresData from '@/data/persons/religious-figures.json';
import scientistsData from '@/data/persons/scientists.json';
import historicalFiguresData from '@/data/persons/historical-figures.json';
import quotesData from '@/data/quotes.json';
import religionsData from '@/data/religions.json';
import ppRelData from '@/data/relationships/person-person.json';
import peRelData from '@/data/relationships/person-entity.json';
import eeRelData from '@/data/relationships/entity-entity.json';
import eventsData from '@/data/entities/events.json';
import ideologiesData from '@/data/entities/ideologies.json';
import movementsData from '@/data/entities/movements.json';
import institutionsData from '@/data/entities/institutions.json';
import textsData from '@/data/entities/texts.json';
import conceptsData from '@/data/entities/concepts.json';
import { cn, getEraColor, getEraBgColor, getEraLabel, formatYear, getCategoryHexColor } from '@/lib/utils';

const allPersons = [
  ...philosophersData,
  ...religiousFiguresData,
  ...scientistsData,
  ...historicalFiguresData,
] as any[];
const totalEntities = eventsData.length + ideologiesData.length + movementsData.length + institutionsData.length + textsData.length + conceptsData.length;
const totalRelationships = ppRelData.length + peRelData.length + eeRelData.length;

const eras = ['ancient', 'medieval', 'modern', 'contemporary'] as const;

const eraDescriptions: Record<string, string> = {
  ancient: 'BC 600 ~ AD 300',
  medieval: 'AD 300 ~ AD 1500',
  modern: 'AD 1500 ~ AD 1900',
  contemporary: 'AD 1900 ~ 현재',
};

// Category configuration
const categories = [
  {
    key: 'philosopher',
    label: '철학',
    labelEn: 'Philosophy',
    icon: BookOpen,
    color: '#6366F1',
    bgClass: 'from-indigo-500/20 to-indigo-600/5',
    borderClass: 'border-indigo-500/30 hover:border-indigo-400/50',
    textClass: 'text-indigo-400',
    href: '/philosophy/timeline/',
    description: '소크라테스에서 들뢰즈까지, 인류의 근본 질문을 탐구합니다',
    data: philosophersData,
  },
  {
    key: 'religious_figure',
    label: '종교',
    labelEn: 'Religion',
    icon: Scroll,
    color: '#F59E0B',
    bgClass: 'from-amber-500/20 to-amber-600/5',
    borderClass: 'border-amber-500/30 hover:border-amber-400/50',
    textClass: 'text-amber-400',
    href: '/religion/map/',
    description: '신앙과 영성의 다양한 전통을 비교하고 탐색합니다',
    data: religiousFiguresData,
  },
  {
    key: 'scientist',
    label: '과학',
    labelEn: 'Science',
    icon: Atom,
    color: '#10B981',
    bgClass: 'from-emerald-500/20 to-emerald-600/5',
    borderClass: 'border-emerald-500/30 hover:border-emerald-400/50',
    textClass: 'text-emerald-400',
    href: '/science/',
    description: '자연의 법칙을 밝혀낸 발견과 혁신의 역사입니다',
    data: scientistsData,
  },
  {
    key: 'historical_figure',
    label: '역사',
    labelEn: 'History',
    icon: Crown,
    color: '#EF4444',
    bgClass: 'from-red-500/20 to-red-600/5',
    borderClass: 'border-red-500/30 hover:border-red-400/50',
    textClass: 'text-red-400',
    href: '/history/',
    description: '문명의 흥망과 인류 역사의 대전환점을 따라갑니다',
    data: (historicalFiguresData as any[]).filter((p: any) => p.category === 'historical_figure'),
  },
  {
    key: 'cultural_figure',
    label: '문화',
    labelEn: 'Culture',
    icon: Palette,
    color: '#EC4899',
    bgClass: 'from-pink-500/20 to-pink-600/5',
    borderClass: 'border-pink-500/30 hover:border-pink-400/50',
    textClass: 'text-pink-400',
    href: '/culture/',
    description: '문학, 예술, 음악 — 인류 창의성의 결정체를 만납니다',
    data: (historicalFiguresData as any[]).filter((p: any) => p.category === 'cultural_figure'),
  },
];

// Key milestones for mini-timeline
const milestones = [
  { year: -600, label: '탈레스 — 철학의 탄생', category: 'philosopher' },
  { year: -500, label: '석가모니 — 불교의 시작', category: 'religious_figure' },
  { year: -470, label: '소크라테스', category: 'philosopher' },
  { year: -300, label: '유클리드 — 기하학 원론', category: 'scientist' },
  { year: -221, label: '진시황 — 중국 통일', category: 'historical_figure' },
  { year: 30, label: '예수 그리스도', category: 'religious_figure' },
  { year: 622, label: '무함마드 — 이슬람의 시작', category: 'religious_figure' },
  { year: 1225, label: '토마스 아퀴나스', category: 'philosopher' },
  { year: 1453, label: '콘스탄티노플 함락', category: 'historical_figure' },
  { year: 1543, label: '코페르니쿠스 — 지동설', category: 'scientist' },
  { year: 1687, label: '뉴턴 — 프린키피아', category: 'scientist' },
  { year: 1789, label: '프랑스 혁명', category: 'historical_figure' },
  { year: 1804, label: '베토벤 — 교향곡 3번', category: 'cultural_figure' },
  { year: 1859, label: '다윈 — 종의 기원', category: 'scientist' },
  { year: 1905, label: '아인슈타인 — 상대성이론', category: 'scientist' },
  { year: 1945, label: '2차 세계대전 종전', category: 'historical_figure' },
  { year: 1953, label: 'DNA 이중나선 발견', category: 'scientist' },
];

// Constellation node positions (fixed for consistency)
const constellationNodes = [
  { x: 15, y: 20, category: 'philosopher', size: 3 },
  { x: 85, y: 15, category: 'scientist', size: 2.5 },
  { x: 50, y: 10, category: 'religious_figure', size: 2 },
  { x: 25, y: 70, category: 'historical_figure', size: 2.5 },
  { x: 75, y: 75, category: 'cultural_figure', size: 3 },
  { x: 40, y: 35, category: 'philosopher', size: 1.5 },
  { x: 60, y: 45, category: 'scientist', size: 1.5 },
  { x: 30, y: 50, category: 'religious_figure', size: 1.5 },
  { x: 70, y: 30, category: 'historical_figure', size: 1.5 },
  { x: 10, y: 45, category: 'cultural_figure', size: 1.5 },
  { x: 90, y: 50, category: 'philosopher', size: 1.5 },
  { x: 55, y: 65, category: 'scientist', size: 1.5 },
  { x: 20, y: 85, category: 'philosopher', size: 1.5 },
  { x: 80, y: 85, category: 'religious_figure', size: 1.5 },
  { x: 45, y: 80, category: 'historical_figure', size: 1.5 },
];

const constellationEdges = [
  [0, 5], [5, 2], [2, 8], [8, 1], [1, 6], [6, 7], [7, 3], [3, 9],
  [9, 0], [5, 6], [6, 11], [11, 14], [14, 4], [4, 13], [0, 12],
  [12, 3], [3, 14], [7, 12], [10, 1], [10, 8],
];

export default function HomePage() {
  const [copied, setCopied] = useState(false);
  const [animOffset, setAnimOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimOffset((prev) => (prev + 0.5) % 360);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const todayQuote = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const index = dayOfYear % quotesData.length;
    return quotesData[index];
  }, []);

  const eraCounts = useMemo(() => {
    const counts: Record<string, number> = { ancient: 0, medieval: 0, modern: 0, contemporary: 0 };
    allPersons.forEach((p) => {
      if (counts[p.era] !== undefined) counts[p.era]++;
    });
    return counts;
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, Record<string, number>> = {};
    eras.forEach((era) => {
      counts[era] = { philosopher: 0, religious_figure: 0, scientist: 0, historical_figure: 0, cultural_figure: 0 };
    });
    allPersons.forEach((p) => {
      if (counts[p.era] && counts[p.era][p.category] !== undefined) {
        counts[p.era][p.category]++;
      }
    });
    return counts;
  }, []);

  const handleCopy = async () => {
    const text = `"${todayQuote.text}" — ${todayQuote.philosopher} (${todayQuote.source})`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`"${todayQuote.text}" — ${todayQuote.philosopher}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Hero Section with Constellation */}
      <section className="relative overflow-hidden py-24 md:py-32 px-4">
        {/* Constellation Background SVG */}
        <div className="absolute inset-0 opacity-30">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Edges */}
            {constellationEdges.map(([from, to], i) => (
              <line
                key={`edge-${i}`}
                x1={constellationNodes[from].x}
                y1={constellationNodes[from].y}
                x2={constellationNodes[to].x}
                y2={constellationNodes[to].y}
                stroke="rgba(148, 163, 184, 0.15)"
                strokeWidth="0.15"
              />
            ))}
            {/* Nodes */}
            {constellationNodes.map((node, i) => (
              <circle
                key={`node-${i}`}
                cx={node.x + Math.sin((animOffset + i * 40) * Math.PI / 180) * 0.5}
                cy={node.y + Math.cos((animOffset + i * 60) * Math.PI / 180) * 0.3}
                r={node.size * 0.3}
                fill={getCategoryHexColor(node.category)}
                opacity={0.6}
              >
                <animate
                  attributeName="opacity"
                  values="0.3;0.8;0.3"
                  dur={`${3 + i * 0.5}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ))}
          </svg>
        </div>

        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-[#0F172A]/50 to-[#0F172A]" />

        <div className="relative max-w-5xl mx-auto text-center">
          <p className="text-amber-400/70 text-sm font-light tracking-[0.4em] mb-6 uppercase">
            Σοφία &middot; Atlas
          </p>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
            인류 사상의<br className="md:hidden" /> 시공간 지도
          </h1>
          <p className="text-lg md:text-xl text-slate-400 font-light max-w-2xl mx-auto leading-relaxed">
            철학 · 종교 · 과학 · 역사 · 문화<br className="sm:hidden" />
            — 모든 지성의 연결을 탐험하세요
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/persons/"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30 hover:border-indigo-400/50 transition-all text-sm font-medium"
            >
              <Users className="w-4 h-4" />
              {allPersons.length}명의 인물 탐색
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/connections/"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-700/30 border border-slate-600/30 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500/50 transition-all text-sm font-medium"
            >
              <Network className="w-4 h-4" />
              인드라망 시각화
            </Link>
          </div>
        </div>
      </section>

      {/* 5 Category Cards */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">다섯 개의 영역</h2>
          <p className="text-slate-500">인류 지성사의 다섯 기둥을 탐험합니다</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const topPersons = cat.data.slice(0, 3) as any[];
            return (
              <Link
                key={cat.key}
                href={cat.href}
                className={cn(
                  'group relative rounded-2xl border p-6 transition-all duration-300',
                  'bg-gradient-to-br backdrop-blur-sm',
                  cat.bgClass,
                  cat.borderClass,
                  'hover:shadow-lg hover:shadow-black/20 hover:-translate-y-1'
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${cat.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: cat.color }} />
                  </div>
                  <span
                    className="text-2xl font-bold"
                    style={{ color: cat.color }}
                  >
                    {cat.data.length}
                  </span>
                </div>
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-white group-hover:text-white/90">
                    {cat.label}
                    <span className="ml-2 text-xs font-normal text-slate-500">{cat.labelEn}</span>
                  </h3>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  {topPersons.map((p: any) => (
                    <span key={p.id} className="px-2 py-0.5 rounded-full bg-slate-700/40">
                      {p.name.ko}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex items-center text-xs group-hover:translate-x-1 transition-transform" style={{ color: cat.color }}>
                  탐색하기 <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </div>
              </Link>
            );
          })}

          {/* Indra Net Card */}
          <Link
            href="/connections/"
            className="group relative rounded-2xl border border-slate-600/30 hover:border-slate-500/50 p-6 transition-all duration-300 bg-gradient-to-br from-slate-700/20 to-slate-800/5 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-1 sm:col-span-2 lg:col-span-1"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <Network className="w-6 h-6 text-cyan-400" />
              </div>
              <span className="text-2xl font-bold text-cyan-400">{totalRelationships}</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              인드라망
              <span className="ml-2 text-xs font-normal text-slate-500">Indra&apos;s Net</span>
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              모든 사상과 인물이 서로를 비추는 관계의 그물을 시각화합니다
            </p>
            <div className="mt-4 flex items-center text-xs text-cyan-400 group-hover:translate-x-1 transition-transform">
              시각화 보기 <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </div>
          </Link>
        </div>
      </section>

      {/* Mini Timeline */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          인류 지성사의 이정표
        </h2>
        <div className="relative overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900 pb-4">
          <div className="relative min-w-[1200px] h-32">
            {/* Timeline axis */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-700" />

            {/* Year markers */}
            {[-600, -300, 0, 300, 600, 900, 1200, 1500, 1700, 1900, 2000].map((year) => {
              const pos = ((year + 600) / 2625) * 100;
              return (
                <div key={year} className="absolute top-1/2 -translate-y-1/2" style={{ left: `${pos}%` }}>
                  <div className="w-px h-3 bg-slate-600 -translate-x-1/2" />
                  <p className="text-[9px] text-slate-600 mt-1 -translate-x-1/2 whitespace-nowrap">
                    {formatYear(year)}
                  </p>
                </div>
              );
            })}

            {/* Milestone dots */}
            {milestones.map((m, i) => {
              const pos = ((m.year + 600) / 2625) * 100;
              const isTop = i % 2 === 0;
              return (
                <div
                  key={`${m.year}-${i}`}
                  className="absolute group"
                  style={{ left: `${pos}%`, top: isTop ? '10%' : '60%', transform: 'translateX(-50%)' }}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className="w-2.5 h-2.5 rounded-full border-2 border-[#0F172A] group-hover:scale-150 transition-transform"
                      style={{ backgroundColor: getCategoryHexColor(m.category) }}
                    />
                    <div className="mt-1 px-2 py-1 rounded bg-slate-800/90 border border-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap absolute z-10"
                      style={{ top: isTop ? '100%' : 'auto', bottom: isTop ? 'auto' : '100%' }}
                    >
                      <p className="text-[10px] font-medium text-white">{m.label}</p>
                      <p className="text-[8px]" style={{ color: getCategoryHexColor(m.category) }}>
                        {formatYear(m.year)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 오늘의 명언 */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="relative rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/40 to-slate-900/20 backdrop-blur-sm p-8 md:p-10">
          <div className="absolute top-4 left-4 flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            오늘의 명언
          </div>

          <div className="mt-6">
            <Quote className="w-8 h-8 text-amber-400/30 mb-4" />
            <blockquote className="text-xl md:text-2xl text-white font-light leading-relaxed mb-6">
              &ldquo;{todayQuote.text}&rdquo;
            </blockquote>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <Link
                  href={`/persons/${todayQuote.philosopherId}/`}
                  className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                >
                  {todayQuote.philosopher}
                </Link>
                <span className="text-slate-500 ml-2">
                  &mdash; {todayQuote.source}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? '복사됨!' : '복사'}
                </button>
                <button
                  onClick={handleTwitterShare}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  공유
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 시대별 Overview - Enhanced */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-400" />
          시대별 탐색
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {eras.map((era) => (
            <Link
              key={era}
              href={`/persons/?era=${era}`}
              className="group relative rounded-xl border border-slate-700/50 bg-slate-800/20 p-5 hover:bg-slate-800/40 transition-all duration-200"
            >
              <div className={cn('w-3 h-3 rounded-full mb-3', getEraBgColor(era))} />
              <h3 className={cn('text-lg font-bold', getEraColor(era))}>
                {getEraLabel(era)}
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-3">{eraDescriptions[era]}</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <Users className="w-3 h-3 text-slate-500" />
                  <span className="text-slate-400 font-medium">{eraCounts[era]}명</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {Object.entries(categoryCounts[era] || {})
                    .filter(([, count]) => count > 0)
                    .map(([cat, count]) => (
                      <span
                        key={cat}
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: `${getCategoryHexColor(cat)}15`,
                          color: getCategoryHexColor(cat),
                        }}
                      >
                        {count}
                      </span>
                    ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats Dashboard */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-r from-slate-800/30 via-slate-800/20 to-slate-800/30 p-8">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-white">Sophia Atlas 데이터베이스</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-white">{allPersons.length}</p>
              <p className="text-sm text-slate-500 mt-1">인물</p>
              <div className="flex justify-center gap-1 mt-2">
                {categories.map((cat) => (
                  <div
                    key={cat.key}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: cat.color }}
                    title={`${cat.label}: ${cat.data.length}`}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{totalEntities}</p>
              <p className="text-sm text-slate-500 mt-1">엔터티</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{totalRelationships}</p>
              <p className="text-sm text-slate-500 mt-1">관계</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{religionsData.length}</p>
              <p className="text-sm text-slate-500 mt-1">종교 &middot; 신화</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{quotesData.length}</p>
              <p className="text-sm text-slate-500 mt-1">명언</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
