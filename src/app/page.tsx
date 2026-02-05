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
import { formatYear, getCategoryHexColor, getCSSVar } from '@/lib/utils';

const allPersons = [
  ...philosophersData,
  ...religiousFiguresData,
  ...scientistsData,
  ...historicalFiguresData,
] as any[];
const totalEntities = eventsData.length + ideologiesData.length + movementsData.length + institutionsData.length + textsData.length + conceptsData.length;
const totalRelationships = ppRelData.length + peRelData.length + eeRelData.length;

const eras = ['ancient', 'medieval', 'modern', 'contemporary'] as const;

const eraLabels: Record<string, string> = {
  ancient: '고대',
  medieval: '중세',
  modern: '근대',
  contemporary: '현대',
};

const eraDescriptions: Record<string, string> = {
  ancient: 'BC 600 ~ AD 300',
  medieval: 'AD 300 ~ AD 1500',
  modern: 'AD 1500 ~ AD 1900',
  contemporary: 'AD 1900 ~ 현재',
};

const eraColors: Record<string, string> = {
  ancient: '#B8860B',
  medieval: '#6B4E8A',
  modern: '#4A7A6B',
  contemporary: '#6B6358',
};

// Fresco category colors (warm-shifted pigments)
const categoryColors: Record<string, string> = {
  philosopher: '#4A5D8A',
  religious_figure: '#B8860B',
  scientist: '#5B7355',
  historical_figure: '#8B4040',
  cultural_figure: '#7A5478',
};

const categories = [
  {
    key: 'philosopher',
    label: '철학',
    labelEn: 'Philosophy',
    icon: BookOpen,
    color: categoryColors.philosopher,
    href: '/philosophy/timeline',
    description: '소크라테스에서 들뢰즈까지, 인류의 근본 질문을 탐구합니다',
    data: philosophersData,
  },
  {
    key: 'religious_figure',
    label: '종교',
    labelEn: 'Religion',
    icon: Scroll,
    color: categoryColors.religious_figure,
    href: '/religion/map',
    description: '신앙과 영성의 다양한 전통을 비교하고 탐색합니다',
    data: religiousFiguresData,
  },
  {
    key: 'scientist',
    label: '과학',
    labelEn: 'Science',
    icon: Atom,
    color: categoryColors.scientist,
    href: '/science',
    description: '자연의 법칙을 밝혀낸 발견과 혁신의 역사입니다',
    data: scientistsData,
  },
  {
    key: 'historical_figure',
    label: '역사',
    labelEn: 'History',
    icon: Crown,
    color: categoryColors.historical_figure,
    href: '/history',
    description: '문명의 흥망과 인류 역사의 대전환점을 따라갑니다',
    data: (historicalFiguresData as any[]).filter((p: any) => p.category === 'historical_figure'),
  },
  {
    key: 'cultural_figure',
    label: '문화',
    labelEn: 'Culture',
    icon: Palette,
    color: categoryColors.cultural_figure,
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

// Indra's Net nodes
const netNodes = Array.from({ length: 40 }, (_, i) => ({
  x: 10 + Math.random() * 80,
  y: 10 + Math.random() * 80,
  size: 0.8 + Math.random() * 2.2,
  category: ['philosopher', 'religious_figure', 'scientist', 'historical_figure', 'cultural_figure'][i % 5],
  speed: 2 + Math.random() * 4,
  phase: Math.random() * Math.PI * 2,
}));

const netEdges: [number, number][] = [];
for (let i = 0; i < netNodes.length; i++) {
  for (let j = i + 1; j < netNodes.length; j++) {
    const dx = netNodes[i].x - netNodes[j].x;
    const dy = netNodes[i].y - netNodes[j].y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 25) netEdges.push([i, j]);
  }
}

export default function HomePage() {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  // Animated Indra's Net background — warm fresco style
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

    // Read theme-aware colors for canvas
    const goldHex = getCSSVar('--gold') || '#B8860B';
    const catColorsThemed: Record<string, string> = {
      philosopher: getCSSVar('--cat-philosopher') || '#4A5D8A',
      religious_figure: getCSSVar('--cat-religious') || '#B8860B',
      scientist: getCSSVar('--cat-scientist') || '#5B7355',
      historical_figure: getCSSVar('--cat-historical') || '#8B4040',
      cultural_figure: getCSSVar('--cat-cultural') || '#7A5478',
    };

    let time = 0;
    function draw() {
      if (!ctx || !canvas) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      time += 0.006;

      ctx.clearRect(0, 0, w, h);

      // Draw edges — theme-aware gold
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
        ctx.strokeStyle = goldHex;
        ctx.globalAlpha = 0.08;
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.globalAlpha = 1;
      });

      // Draw nodes — theme-aware pigment colors
      netNodes.forEach((node) => {
        const nx = (node.x + Math.sin(time * node.speed * 0.1 + node.phase) * 1.5) * w / 100;
        const ny = (node.y + Math.cos(time * node.speed * 0.1 + node.phase) * 1) * h / 100;
        const pulse = 0.5 + 0.5 * Math.sin(time * 2 + node.phase);

        ctx.beginPath();
        ctx.arc(nx, ny, node.size * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = catColorsThemed[node.category] || '#6B6358';
        ctx.globalAlpha = 0.15 + pulse * 0.15;
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
    } catch { /* fallback */ }
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`"${todayQuote.text}" — ${todayQuote.philosopher}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--fresco-ivory)' }}>
      {/* ═══════════════════ Hero Section ═══════════════════ */}
      <section className="relative overflow-hidden px-4" style={{ paddingTop: '6rem', paddingBottom: '5rem' }}>
        {/* Subtle parchment texture + canvas */}
        <div className="absolute inset-0 parchment-texture" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--gold-muted) 0%, transparent 100%)', opacity: 0.4 }} />
        <div className="absolute inset-0">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Ornamental subtitle */}
          <p
            className="text-xs tracking-[0.5em] mb-8 uppercase"
            style={{ fontFamily: "'Pretendard', sans-serif", color: 'var(--ink-faded)' }}
          >
            一卽多 &middot; 多卽一 &mdash; 하나가 곧 전체이고, 전체가 곧 하나
          </p>

          {/* Title — Cormorant Garamond */}
          <h1
            className="mb-6 tracking-[0.06em] uppercase leading-[1.1]"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              fontWeight: 700,
            }}
          >
            <span className="gradient-text">Sophia</span>
            {' '}
            <span style={{ color: 'var(--ink-dark)' }}>Atlas</span>
          </h1>

          <p
            className="text-xl md:text-2xl font-light max-w-3xl mx-auto leading-relaxed mb-2"
            style={{ fontFamily: "'Noto Serif KR', Georgia, serif", color: 'var(--ink-medium)' }}
          >
            인류 지성의 인드라망
          </p>
          <p
            className="text-sm md:text-base font-light max-w-2xl mx-auto leading-relaxed"
            style={{ fontFamily: "'Noto Serif KR', Georgia, serif", color: 'var(--ink-light)' }}
          >
            신화에서 AI까지 — 철학 · 종교 · 과학 · 역사 · 문화
            <br className="sm:hidden" />
            {' '}모든 사상의 연결을 탐험하세요
          </p>

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/connections" className="btn-primary group">
              <Network className="w-5 h-5" />
              인드라망 탐험하기
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/persons" className="btn-secondary">
              <Users className="w-4 h-4" />
              {allPersons.length}명의 인물 탐색
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-14 flex items-center justify-center gap-8 md:gap-12 text-center">
            {[
              { value: allPersons.length, label: '인물' },
              { value: totalEntities, label: '주제' },
              { value: totalRelationships, label: '연결' },
              { value: religionsData.length, label: '종교·신화' },
            ].map((stat) => (
              <div key={stat.label}>
                <p
                  className="text-2xl md:text-3xl font-bold"
                  style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--ink-dark)' }}
                >
                  {stat.value}
                </p>
                <p className="text-xs mt-1" style={{ fontFamily: "'Pretendard', sans-serif", color: 'var(--ink-faded)' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ornament divider */}
      <div className="ornament-divider max-w-lg mx-auto px-4 mb-12">
        <span style={{ color: 'var(--gold)', fontSize: '18px' }}>&#9674;</span>
      </div>

      {/* ═══════════════════ 5 Category Cards ═══════════════════ */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="text-center mb-10">
          <h2
            className="text-2xl mb-2"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: 'var(--ink-dark)' }}
          >
            다섯 개의 영역
          </h2>
          <p className="text-sm" style={{ color: 'var(--ink-light)' }}>인류 지성사의 다섯 기둥을 탐험합니다</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const topPersons = cat.data.slice(0, 3) as any[];
            return (
              <Link
                key={cat.key}
                href={cat.href}
                className="group fresco-card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded flex items-center justify-center"
                    style={{ backgroundColor: `${cat.color}15` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: cat.color }} />
                  </div>
                  <span
                    className="text-2xl font-bold"
                    style={{ fontFamily: "'Cormorant Garamond', serif", color: cat.color }}
                  >
                    {cat.data.length}
                  </span>
                </div>
                <div className="mb-3">
                  <h3
                    className="text-lg font-semibold"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: 'var(--ink-dark)' }}
                  >
                    {cat.label}
                    <span className="ml-2 text-xs font-normal" style={{ color: 'var(--ink-faded)', fontFamily: "'Pretendard', sans-serif" }}>
                      {cat.labelEn}
                    </span>
                  </h3>
                  <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--ink-light)' }}>{cat.description}</p>
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--ink-faded)' }}>
                  {topPersons.map((p: any) => (
                    <span
                      key={p.id}
                      className="px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: `${cat.color}10`,
                        color: cat.color,
                        fontFamily: "'Pretendard', sans-serif",
                        fontSize: '11px',
                      }}
                    >
                      {p.name.ko}
                    </span>
                  ))}
                </div>
                <div
                  className="mt-4 flex items-center text-xs font-medium group-hover:translate-x-1 transition-transform"
                  style={{ color: cat.color, fontFamily: "'Pretendard', sans-serif" }}
                >
                  탐색하기 <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </div>
              </Link>
            );
          })}

          {/* Indra Net Card */}
          <Link
            href="/connections"
            className="group fresco-card p-6 sm:col-span-2 lg:col-span-1"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-12 h-12 rounded flex items-center justify-center"
                style={{ backgroundColor: 'rgba(184, 134, 11, 0.1)' }}
              >
                <Network className="w-6 h-6" style={{ color: 'var(--gold)' }} />
              </div>
              <span
                className="text-2xl font-bold"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--gold)' }}
              >
                {totalRelationships}
              </span>
            </div>
            <h3
              className="text-lg font-semibold mb-1"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: 'var(--ink-dark)' }}
            >
              인드라망
              <span className="ml-2 text-xs font-normal" style={{ color: 'var(--ink-faded)', fontFamily: "'Pretendard', sans-serif" }}>
                Indra&apos;s Net
              </span>
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-light)' }}>
              모든 사상과 인물이 서로를 비추는 관계의 그물을 시각화합니다
            </p>
            <div
              className="mt-4 flex items-center text-xs font-medium group-hover:translate-x-1 transition-transform"
              style={{ color: 'var(--gold)', fontFamily: "'Pretendard', sans-serif" }}
            >
              시각화 보기 <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </div>
          </Link>
        </div>
      </section>

      {/* ═══════════════════ Featured Persons Spotlight ═══════════════════ */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="text-center mb-10">
          <h2
            className="text-2xl mb-2"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: 'var(--ink-dark)' }}
          >
            시대를 만든 사상가들
          </h2>
          <p className="text-sm" style={{ color: 'var(--ink-light)' }}>인류 지성사의 핵심 인물을 만나보세요</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {(() => {
            const featured = [
              { id: 'socrates', name: '소크라테스', en: 'Socrates', era: 'ancient', category: 'philosopher' },
              { id: 'buddha', name: '석가모니', en: 'Buddha', era: 'ancient', category: 'religious_figure' },
              { id: 'newton', name: '뉴턴', en: 'Newton', era: 'modern', category: 'scientist' },
              { id: 'kant', name: '칸트', en: 'Kant', era: 'modern', category: 'philosopher' },
              { id: 'darwin', name: '다윈', en: 'Darwin', era: 'modern', category: 'scientist' },
              { id: 'nietzsche', name: '니체', en: 'Nietzsche', era: 'contemporary', category: 'philosopher' },
            ];
            return featured.map((person) => {
              const eraColor = eraColors[person.era] || '#6B6358';
              const catColor = categoryColors[person.category] || '#6B6358';
              return (
                <Link
                  key={person.id}
                  href={`/persons/${person.id}`}
                  className="group fresco-card p-4 text-center"
                >
                  <div
                    className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-lg font-bold"
                    style={{
                      background: `linear-gradient(135deg, ${catColor}25, ${eraColor}25)`,
                      color: catColor,
                      fontFamily: "'Cormorant Garamond', serif",
                      border: `2px solid ${catColor}30`,
                    }}
                  >
                    {person.name.charAt(0)}
                  </div>
                  <h3
                    className="text-sm font-semibold group-hover:opacity-80 transition-opacity"
                    style={{ color: 'var(--ink-dark)', fontFamily: "'Noto Serif KR', serif" }}
                  >
                    {person.name}
                  </h3>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--ink-faded)', fontFamily: "'Pretendard', sans-serif" }}>
                    {person.en}
                  </p>
                  <div
                    className="w-2 h-2 rounded-full mx-auto mt-2"
                    style={{ backgroundColor: eraColor }}
                  />
                </Link>
              );
            });
          })()}
        </div>
      </section>

      {/* ═══════════════════ Mini Timeline ═══════════════════ */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2
          className="text-lg font-semibold mb-6 flex items-center gap-2"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: 'var(--ink-dark)' }}
        >
          <Zap className="w-5 h-5" style={{ color: 'var(--gold)' }} />
          인류 지성사의 이정표
        </h2>
        <div className="relative overflow-x-auto pb-4" style={{ scrollbarColor: 'var(--fresco-shadow) var(--fresco-parchment)' }}>
          <div className="relative min-w-[1200px] h-32">
            <div className="absolute top-1/2 left-0 right-0 h-px" style={{ background: 'var(--fresco-shadow)' }} />
            {[-600, -300, 0, 300, 600, 900, 1200, 1500, 1700, 1900, 2000].map((year) => {
              const pos = ((year + 600) / 2625) * 100;
              return (
                <div key={year} className="absolute top-1/2 -translate-y-1/2" style={{ left: `${pos}%` }}>
                  <div className="w-px h-3 -translate-x-1/2" style={{ background: 'var(--fresco-shadow)' }} />
                  <p className="text-[9px] mt-1 -translate-x-1/2 whitespace-nowrap" style={{ color: 'var(--ink-faded)' }}>
                    {formatYear(year)}
                  </p>
                </div>
              );
            })}
            {milestones.map((m, i) => {
              const pos = ((m.year + 600) / 2625) * 100;
              const isTop = i % 2 === 0;
              const catColor = categoryColors[m.category] || '#6B6358';
              return (
                <div
                  key={`${m.year}-${i}`}
                  className="absolute group"
                  style={{ left: `${pos}%`, top: isTop ? '10%' : '60%', transform: 'translateX(-50%)' }}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className="w-2.5 h-2.5 rounded-full group-hover:scale-150 transition-transform"
                      style={{
                        backgroundColor: catColor,
                        border: '2px solid var(--fresco-ivory)',
                        boxShadow: `0 0 0 1px ${catColor}40`,
                      }}
                    />
                    <div
                      className="mt-1 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap absolute z-10"
                      style={{
                        top: isTop ? '100%' : 'auto',
                        bottom: isTop ? 'auto' : '100%',
                        background: 'var(--fresco-parchment)',
                        border: '1px solid var(--fresco-shadow)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      }}
                    >
                      <p className="text-[10px] font-medium" style={{ color: 'var(--ink-dark)' }}>{m.label}</p>
                      <p className="text-[8px]" style={{ color: catColor }}>
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

      {/* ═══════════════════ Today's Quote ═══════════════════ */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="fresco-card p-8 md:p-10 relative">
          <div className="absolute top-4 left-4 flex items-center gap-2 text-xs uppercase tracking-wider" style={{ color: 'var(--ink-faded)', fontFamily: "'Pretendard', sans-serif" }}>
            <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
            오늘의 명언
          </div>

          {/* Decorative quote mark */}
          <div
            className="absolute top-2 right-6 leading-none pointer-events-none select-none"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '80px', color: 'var(--gold)', opacity: 0.12 }}
          >
            &ldquo;
          </div>

          <div className="mt-6">
            <Quote className="w-8 h-8 mb-4" style={{ color: 'var(--gold)', opacity: 0.25 }} />
            <blockquote
              className="text-xl md:text-2xl font-light leading-relaxed mb-6 italic"
              style={{ fontFamily: "'Noto Serif KR', Georgia, serif", color: 'var(--ink-dark)' }}
            >
              &ldquo;{todayQuote.text}&rdquo;
            </blockquote>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <Link
                  href={`/persons/${todayQuote.philosopherId}`}
                  className="font-medium transition-colors"
                  style={{ color: 'var(--gold)' }}
                >
                  {todayQuote.philosopher}
                </Link>
                <span style={{ color: 'var(--ink-faded)' }}> &mdash; {todayQuote.source}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="btn-ghost text-sm"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? '복사됨!' : '복사'}
                </button>
                <button
                  onClick={handleTwitterShare}
                  className="btn-ghost text-sm"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  공유
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ Era Overview ═══════════════════ */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2
          className="text-lg font-semibold mb-6 flex items-center gap-2"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: 'var(--ink-dark)' }}
        >
          <Clock className="w-5 h-5" style={{ color: 'var(--ink-light)' }} />
          시대별 탐색
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {eras.map((era) => (
            <Link
              key={era}
              href={`/persons?era=${era}`}
              className="group fresco-card p-5"
            >
              <div className="w-3 h-3 rounded-full mb-3" style={{ backgroundColor: eraColors[era] }} />
              <h3
                className="text-lg font-bold"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: eraColors[era] }}
              >
                {eraLabels[era]}
              </h3>
              <p className="text-xs mt-1 mb-3" style={{ color: 'var(--ink-faded)', fontFamily: "'Pretendard', sans-serif" }}>
                {eraDescriptions[era]}
              </p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <Users className="w-3 h-3" style={{ color: 'var(--ink-faded)' }} />
                  <span className="font-medium" style={{ color: 'var(--ink-medium)', fontFamily: "'Pretendard', sans-serif" }}>
                    {eraCounts[era]}명
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {Object.entries(categoryCounts[era] || {})
                    .filter(([, count]) => count > 0)
                    .map(([cat, count]) => {
                      const catColor = categoryColors[cat] || '#6B6358';
                      return (
                        <span
                          key={cat}
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: `${catColor}12`,
                            color: catColor,
                            fontFamily: "'Pretendard', sans-serif",
                          }}
                        >
                          {count}
                        </span>
                      );
                    })}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════ Indra's Net Quote ═══════════════════ */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="text-center py-12" style={{ borderTop: '1px solid var(--fresco-shadow)', borderBottom: '1px solid var(--fresco-shadow)' }}>
          <p className="text-sm tracking-widest uppercase mb-4" style={{ color: 'var(--ink-faded)', fontFamily: "'Pretendard', sans-serif" }}>
            因陀羅網 &middot; Indra&apos;s Net
          </p>
          <p
            className="text-base md:text-lg font-light leading-relaxed italic max-w-2xl mx-auto"
            style={{ fontFamily: "'Noto Serif KR', Georgia, serif", color: 'var(--ink-light)' }}
          >
            &ldquo;제석천의 궁전에는 무한한 그물이 펼쳐져 있고,<br />
            그물의 각 매듭마다 보석이 달려 있다.<br />
            각 보석은 다른 모든 보석을 비추고,<br />
            그 반영 속에는 또다시 모든 보석의 반영이 담긴다.&rdquo;
          </p>
          <p className="text-xs mt-4" style={{ color: 'var(--gold)' }}>— 화엄경 (華嚴經)</p>
        </div>
      </section>

      {/* ═══════════════════ Stats Dashboard ═══════════════════ */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div
          className="fresco-card p-8"
          style={{
            background: 'linear-gradient(135deg, var(--fresco-parchment), var(--fresco-aged))',
          }}
        >
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--ink-dark)' }}>
              Sophia Atlas 데이터베이스
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--ink-faded)', fontFamily: "'Pretendard', sans-serif" }}>
              인류 지성사의 디지털 아카이브
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--ink-dark)' }}>
                {allPersons.length}
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--ink-faded)', fontFamily: "'Pretendard', sans-serif" }}>인물</p>
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
              <p className="text-3xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--ink-dark)' }}>
                {totalEntities}
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--ink-faded)', fontFamily: "'Pretendard', sans-serif" }}>주제</p>
            </div>
            <div>
              <p className="text-3xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--ink-dark)' }}>
                {totalRelationships}
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--ink-faded)', fontFamily: "'Pretendard', sans-serif" }}>관계</p>
            </div>
            <div>
              <p className="text-3xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--ink-dark)' }}>
                {religionsData.length}
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--ink-faded)', fontFamily: "'Pretendard', sans-serif" }}>종교 &middot; 신화</p>
            </div>
            <div>
              <p className="text-3xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--ink-dark)' }}>
                {quotesData.length}
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--ink-faded)', fontFamily: "'Pretendard', sans-serif" }}>명언</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
