'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Clock,
  Copy,
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
    href: '/philosophy/timeline',
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
    href: '/religion/map',
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
    href: '/science',
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
    href: '/history',
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
    href: '/culture',
    description: '문학, 예술, 음악 — 인류 창의성의 결정체를 만납니다',
    data: (historicalFiguresData as any[]).filter((p: any) => p.category === 'cultural_figure'),
  },
];

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

// Indra's Net nodes — a cosmic web
const netNodes = Array.from({ length: 40 }, (_, i) => ({
  x: 10 + Math.random() * 80,
  y: 10 + Math.random() * 80,
  size: 0.8 + Math.random() * 2.2,
  category: ['philosopher', 'religious_figure', 'scientist', 'historical_figure', 'cultural_figure'][i % 5],
  speed: 2 + Math.random() * 4,
  phase: Math.random() * Math.PI * 2,
}));

// Pre-compute edges (connect nearby nodes)
const netEdges: [number, number][] = [];
for (let i = 0; i < netNodes.length; i++) {
  for (let j = i + 1; j < netNodes.length; j++) {
    const dx = netNodes[i].x - netNodes[j].x;
    const dy = netNodes[i].y - netNodes[j].y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 25) {
      netEdges.push([i, j]);
    }
  }
}

export default function HomePage() {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  // Animated Indra's Net background using canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const categoryColors: Record<string, string> = {
      philosopher: '#6366F1',
      religious_figure: '#F59E0B',
      scientist: '#10B981',
      historical_figure: '#EF4444',
      cultural_figure: '#EC4899',
    };

    let time = 0;
    function draw() {
      if (!ctx || !canvas) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      time += 0.008;

      ctx.clearRect(0, 0, w, h);

      // Draw edges
      netEdges.forEach(([i, j]) => {
        const a = netNodes[i];
        const b = netNodes[j];
        const ax = (a.x + Math.sin(time * a.speed * 0.1 + a.phase) * 1.5) * w / 100;
        const ay = (a.y + Math.cos(time * a.speed * 0.1 + a.phase) * 1) * h / 100;
        const bx = (b.x + Math.sin(time * b.speed * 0.1 + b.phase) * 1.5) * w / 100;
        const by = (b.y + Math.cos(time * b.speed * 0.1 + b.phase) * 1) * h / 100;

        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.06)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      // Draw nodes
      netNodes.forEach((node) => {
        const nx = (node.x + Math.sin(time * node.speed * 0.1 + node.phase) * 1.5) * w / 100;
        const ny = (node.y + Math.cos(time * node.speed * 0.1 + node.phase) * 1) * h / 100;
        const pulse = 0.5 + 0.5 * Math.sin(time * 2 + node.phase);

        ctx.beginPath();
        ctx.arc(nx, ny, node.size * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = categoryColors[node.category] || '#64748B';
        ctx.globalAlpha = 0.15 + pulse * 0.2;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
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
      {/* Hero Section with Indra's Net Canvas */}
      <section className="relative overflow-hidden py-28 md:py-40 px-4">
        <div className="absolute inset-0">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-[#0F172A]/60 to-[#0F172A]" />

        <div className="relative max-w-5xl mx-auto text-center">
          <p className="text-amber-400/60 text-xs font-light tracking-[0.5em] mb-8 uppercase">
            一卽多 &middot; 多卽一 &mdash; 하나가 곧 전체이고, 전체가 곧 하나
          </p>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">Sophia</span>
            {' '}
            <span className="text-white/90">Atlas</span>
          </h1>

          <p className="text-lg md:text-2xl text-slate-300 font-light max-w-3xl mx-auto leading-relaxed mb-2">
            인류 지성의 인드라망
          </p>
          <p className="text-sm md:text-base text-slate-500 font-light max-w-2xl mx-auto leading-relaxed">
            신화에서 AI까지 — 철학 · 종교 · 과학 · 역사 · 문화
            <br className="sm:hidden" />
            {' '}모든 사상의 연결을 탐험하세요
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/connections"
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-300 hover:from-amber-500/30 hover:to-amber-600/20 hover:border-amber-400/50 transition-all text-sm font-medium shadow-lg shadow-amber-900/20"
            >
              <Network className="w-5 h-5" />
              인드라망 탐험하기
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/persons"
              className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-slate-800/50 border border-slate-600/30 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500/50 transition-all text-sm font-medium"
            >
              <Users className="w-4 h-4" />
              {allPersons.length}명의 인물 탐색
            </Link>
          </div>

          <div className="mt-14 flex items-center justify-center gap-8 md:gap-12 text-center">
            {[
              { value: allPersons.length, label: '인물' },
              { value: totalEntities, label: '엔터티' },
              { value: totalRelationships, label: '연결' },
              { value: religionsData.length, label: '종교·신화' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl md:text-3xl font-bold text-white/90">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
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
                  <span className="text-2xl font-bold" style={{ color: cat.color }}>
                    {cat.data.length}
                  </span>
                </div>
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-white group-hover:text-white/90">
                    {cat.label}
                    <span className="ml-2 text-xs font-normal text-slate-500">{cat.labelEn}</span>
                  </h3>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">{cat.description}</p>
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
            href="/connections"
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
            <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-700" />
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
                  href={`/persons/${todayQuote.philosopherId}`}
                  className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                >
                  {todayQuote.philosopher}
                </Link>
                <span className="text-slate-500 ml-2">&mdash; {todayQuote.source}</span>
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

      {/* 시대별 Overview */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-400" />
          시대별 탐색
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {eras.map((era) => (
            <Link
              key={era}
              href={`/persons?era=${era}`}
              className="group relative rounded-xl border border-slate-700/50 bg-slate-800/20 p-5 hover:bg-slate-800/40 transition-all duration-200"
            >
              <div className={cn('w-3 h-3 rounded-full mb-3', getEraBgColor(era))} />
              <h3 className={cn('text-lg font-bold', getEraColor(era))}>{getEraLabel(era)}</h3>
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

      {/* Indra's Net philosophy quote */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="text-center py-12 border-t border-b border-slate-800/50">
          <p className="text-sm text-slate-600 tracking-widest uppercase mb-4">因陀羅網 &middot; Indra&apos;s Net</p>
          <p className="text-base md:text-lg text-slate-400 font-light leading-relaxed italic max-w-2xl mx-auto">
            &ldquo;제석천의 궁전에는 무한한 그물이 펼쳐져 있고,<br />
            그물의 각 매듭마다 보석이 달려 있다.<br />
            각 보석은 다른 모든 보석을 비추고,<br />
            그 반영 속에는 또다시 모든 보석의 반영이 담긴다.&rdquo;
          </p>
          <p className="text-xs text-slate-600 mt-4">— 화엄경 (華嚴經)</p>
        </div>
      </section>

      {/* Stats Dashboard */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-r from-slate-800/30 via-slate-800/20 to-slate-800/30 p-8">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-white">Sophia Atlas 데이터베이스</h2>
            <p className="text-xs text-slate-500 mt-1">인류 지성사의 디지털 아카이브</p>
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
