'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
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
  Search,
  Box,
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
import { formatYear, getCSSVar } from '@/lib/utils';

const allPersons = [
  ...philosophersData,
  ...religiousFiguresData,
  ...scientistsData,
  ...historicalFiguresData,
] as any[];
const totalEntities = eventsData.length + ideologiesData.length + movementsData.length + institutionsData.length + textsData.length + conceptsData.length;
const totalRelationships = ppRelData.length + peRelData.length + eeRelData.length;

const categoryColors: Record<string, string> = {
  philosopher: '#4A5D8A',
  religious_figure: '#B8860B',
  scientist: '#5B7355',
  historical_figure: '#8B4040',
  cultural_figure: '#7A5478',
};

const categories = [
  { key: 'philosopher', label: '철학', icon: BookOpen, color: categoryColors.philosopher, href: '/philosophy/timeline', data: philosophersData },
  { key: 'religious_figure', label: '종교', icon: Scroll, color: categoryColors.religious_figure, href: '/religion/map', data: religiousFiguresData },
  { key: 'scientist', label: '과학', icon: Atom, color: categoryColors.scientist, href: '/science', data: scientistsData },
  { key: 'historical_figure', label: '역사', icon: Crown, color: categoryColors.historical_figure, href: '/history', data: (historicalFiguresData as any[]).filter((p: any) => p.category === 'historical_figure') },
  { key: 'cultural_figure', label: '문화', icon: Palette, color: categoryColors.cultural_figure, href: '/culture', data: (historicalFiguresData as any[]).filter((p: any) => p.category === 'cultural_figure') },
];

const milestones = [
  { year: -600, label: '탈레스 — 철학의 탄생', category: 'philosopher' },
  { year: -500, label: '석가모니 — 불교', category: 'religious_figure' },
  { year: -470, label: '소크라테스', category: 'philosopher' },
  { year: -300, label: '유클리드 — 기하학', category: 'scientist' },
  { year: 30, label: '예수 그리스도', category: 'religious_figure' },
  { year: 622, label: '무함마드 — 이슬람', category: 'religious_figure' },
  { year: 1225, label: '토마스 아퀴나스', category: 'philosopher' },
  { year: 1543, label: '코페르니쿠스 — 지동설', category: 'scientist' },
  { year: 1687, label: '뉴턴 — 프린키피아', category: 'scientist' },
  { year: 1789, label: '프랑스 혁명', category: 'historical_figure' },
  { year: 1859, label: '다윈 — 종의 기원', category: 'scientist' },
  { year: 1905, label: '아인슈타인 — 상대성이론', category: 'scientist' },
  { year: 1953, label: 'DNA 이중나선 발견', category: 'scientist' },
];

// Indra's Net decorative nodes
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
    if (Math.sqrt(dx * dx + dy * dy) < 25) netEdges.push([i, j]);
  }
}

export default function HomePage() {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const router = useRouter();

  // Animated canvas
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
    return quotesData[dayOfYear % quotesData.length];
  }, []);

  // Quick search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: any[] = [];
    allPersons.forEach((p: any) => {
      if (p.name.ko.toLowerCase().includes(q) || p.name.en.toLowerCase().includes(q)) {
        results.push({ ...p, nodeType: 'person' });
      }
    });
    return results.slice(0, 8);
  }, [searchQuery]);

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
      {/* ═══════ Hero ═══════ */}
      <section className="relative overflow-hidden px-4 pt-16 pb-12">
        <div className="absolute inset-0 parchment-texture" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--gold-muted) 0%, transparent 100%)', opacity: 0.4 }} />
        <div className="absolute inset-0">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <p
            className="text-xs tracking-[0.5em] mb-5 uppercase"
            style={{ fontFamily: "'Pretendard', sans-serif", color: 'var(--ink-faded)' }}
          >
            一卽多 &middot; 多卽一
          </p>

          <h1
            className="mb-4 tracking-[0.06em] uppercase leading-[1.1]"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              fontWeight: 700,
            }}
          >
            <span className="gradient-text">Sophia</span>
            {' '}
            <span style={{ color: 'var(--ink-dark)' }}>Atlas</span>
          </h1>

          <p
            className="text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed mb-1"
            style={{ fontFamily: "'Noto Serif KR', Georgia, serif", color: 'var(--ink-medium)' }}
          >
            인류 지성의 인드라망
          </p>
          <p
            className="text-sm font-light max-w-xl mx-auto leading-relaxed mb-8"
            style={{ fontFamily: "'Noto Serif KR', Georgia, serif", color: 'var(--ink-light)' }}
          >
            철학 · 종교 · 과학 · 역사 · 문화 — 모든 사상의 연결을 탐험하세요
          </p>

          {/* Search Bar — central */}
          <div className="relative max-w-lg mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--ink-faded)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              placeholder="인물, 사상, 사건을 검색하세요..."
              className="w-full pl-12 pr-4 py-3.5 rounded-lg bg-[var(--fresco-parchment)]/90 backdrop-blur border border-[var(--fresco-shadow)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40 transition-all"
              style={{ fontFamily: "'Pretendard', sans-serif", color: 'var(--ink-dark)' }}
            />
            {searchQuery && searchResults.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-[var(--fresco-parchment)] border border-[var(--fresco-shadow)] rounded-lg overflow-hidden z-50 shadow-lg max-h-72 overflow-y-auto">
                {searchResults.map((item: any) => {
                  const color = categoryColors[item.category] || '#6B6358';
                  return (
                    <Link
                      key={item.id}
                      href={`/persons/${item.id}`}
                      onClick={() => setSearchQuery('')}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--fresco-aged)]/50 transition-colors"
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ backgroundColor: color + '20', color }}
                      >
                        {item.name.ko[0]}
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-medium block truncate" style={{ color: 'var(--ink-dark)' }}>{item.name.ko}</span>
                        <span className="text-[11px]" style={{ color: 'var(--ink-faded)' }}>{item.name.en}</span>
                      </div>
                      <span className="text-[10px] ml-auto shrink-0 px-1.5 py-0.5 rounded" style={{ backgroundColor: color + '15', color }}>
                        {categories.find((c) => c.key === item.category)?.label || ''}
                      </span>
                    </Link>
                  );
                })}
                <Link
                  href={`/search?q=${encodeURIComponent(searchQuery)}`}
                  className="block px-4 py-2.5 text-center text-sm border-t border-[var(--fresco-shadow)]"
                  style={{ color: 'var(--gold)' }}
                >
                  &quot;{searchQuery}&quot; 전체 검색 &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* Compact Stats */}
          <div className="flex items-center justify-center gap-6 md:gap-10 text-center mb-8">
            {[
              { value: allPersons.length, label: '인물' },
              { value: totalEntities, label: '주제' },
              { value: totalRelationships, label: '연결' },
              { value: religionsData.length, label: '종교' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-xl md:text-2xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--ink-dark)' }}>
                  {stat.value}
                </p>
                <p className="text-[10px]" style={{ color: 'var(--ink-faded)' }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/connections" className="btn-primary group">
              <Network className="w-5 h-5" />
              인드라망 탐험하기
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/persons" className="btn-secondary">
              <Users className="w-4 h-4" />
              인물 탐색
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ IndraNet Banner ═══════ */}
      <section className="max-w-5xl mx-auto px-4 -mt-2 mb-10">
        <Link
          href="/connections"
          className="group block fresco-card overflow-hidden"
        >
          <div className="flex items-center gap-4 p-5 md:p-6" style={{ background: 'linear-gradient(135deg, rgba(184,134,11,0.06), rgba(184,134,11,0.02))' }}>
            <div className="w-14 h-14 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(184,134,11,0.1)' }}>
              <Box className="w-7 h-7" style={{ color: 'var(--gold)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold flex items-center gap-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--ink-dark)' }}>
                인드라망 &mdash; 3D 시각화
                <span className="text-[10px] px-1.5 py-0.5 rounded font-normal" style={{ backgroundColor: 'rgba(184,134,11,0.12)', color: 'var(--gold)', fontFamily: "'Pretendard', sans-serif" }}>
                  NEW
                </span>
              </h3>
              <p className="text-sm mt-0.5" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>
                {allPersons.length}명의 인물과 {totalEntities}개의 주제, {totalRelationships}개의 관계를 3D 구체 위에서 탐험하세요
              </p>
            </div>
            <ArrowRight className="w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform" style={{ color: 'var(--gold)' }} />
          </div>
        </Link>
      </section>

      {/* ═══════ Compact Category Row ═══════ */}
      <section className="max-w-5xl mx-auto px-4 mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--ink-dark)' }}>
            다섯 개의 영역
          </h2>
          <Link href="/persons" className="text-xs flex items-center gap-1" style={{ color: 'var(--gold)', fontFamily: "'Pretendard', sans-serif" }}>
            전체 보기 <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const topPersons = cat.data.slice(0, 3) as any[];
            return (
              <Link
                key={cat.key}
                href={cat.href}
                className="group fresco-card p-4"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: `${cat.color}12` }}>
                    <Icon className="w-4 h-4" style={{ color: cat.color }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--ink-dark)' }}>
                      {cat.label}
                    </h3>
                    <span className="text-[11px] font-medium" style={{ color: cat.color }}>{cat.data.length}명</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {topPersons.map((p: any) => (
                    <span
                      key={p.id}
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: `${cat.color}08`, color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}
                    >
                      {p.name.ko}
                    </span>
                  ))}
                </div>
                <div className="mt-2 text-[11px] font-medium group-hover:translate-x-0.5 transition-transform" style={{ color: cat.color, fontFamily: "'Pretendard', sans-serif" }}>
                  탐색 <ChevronRight className="w-3 h-3 inline" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══════ Featured Persons (compact) ═══════ */}
      <section className="max-w-5xl mx-auto px-4 mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--ink-dark)' }}>
            시대를 만든 사상가들
          </h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { id: 'socrates', name: '소크라테스', en: 'Socrates', category: 'philosopher' },
            { id: 'buddha', name: '석가모니', en: 'Buddha', category: 'religious_figure' },
            { id: 'newton', name: '뉴턴', en: 'Newton', category: 'scientist' },
            { id: 'kant', name: '칸트', en: 'Kant', category: 'philosopher' },
            { id: 'darwin', name: '다윈', en: 'Darwin', category: 'scientist' },
            { id: 'nietzsche', name: '니체', en: 'Nietzsche', category: 'philosopher' },
          ].map((p) => {
            const color = categoryColors[p.category] || '#6B6358';
            return (
              <Link key={p.id} href={`/persons/${p.id}`} className="group fresco-card p-3 text-center">
                <div
                  className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: `${color}15`, color, border: `1.5px solid ${color}25`, fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {p.name[0]}
                </div>
                <h3 className="text-xs font-medium truncate" style={{ color: 'var(--ink-dark)', fontFamily: "'Noto Serif KR', serif" }}>{p.name}</h3>
                <p className="text-[9px] truncate" style={{ color: 'var(--ink-faded)' }}>{p.en}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══════ Mini Timeline ═══════ */}
      <section className="max-w-5xl mx-auto px-4 mb-10">
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--ink-dark)' }}>
          <Sparkles className="w-4 h-4" style={{ color: 'var(--gold)' }} />
          인류 지성사의 이정표
        </h2>
        <div className="relative overflow-x-auto pb-3" style={{ scrollbarColor: 'var(--fresco-shadow) var(--fresco-parchment)' }}>
          <div className="relative min-w-[900px] h-24">
            <div className="absolute top-1/2 left-0 right-0 h-px" style={{ background: 'var(--fresco-shadow)' }} />
            {[-600, 0, 600, 1200, 1700, 2000].map((year) => {
              const pos = ((year + 600) / 2625) * 100;
              return (
                <div key={year} className="absolute top-1/2 -translate-y-1/2" style={{ left: `${pos}%` }}>
                  <div className="w-px h-2.5 -translate-x-1/2" style={{ background: 'var(--fresco-shadow)' }} />
                  <p className="text-[8px] mt-0.5 -translate-x-1/2 whitespace-nowrap" style={{ color: 'var(--ink-faded)' }}>{formatYear(year)}</p>
                </div>
              );
            })}
            {milestones.map((m, i) => {
              const pos = ((m.year + 600) / 2625) * 100;
              const isTop = i % 2 === 0;
              const catColor = categoryColors[m.category] || '#6B6358';
              return (
                <div key={`${m.year}-${i}`} className="absolute group" style={{ left: `${pos}%`, top: isTop ? '12%' : '60%', transform: 'translateX(-50%)' }}>
                  <div className="flex flex-col items-center">
                    <div
                      className="w-2 h-2 rounded-full group-hover:scale-150 transition-transform"
                      style={{ backgroundColor: catColor, border: '1.5px solid var(--fresco-ivory)', boxShadow: `0 0 0 1px ${catColor}40` }}
                    />
                    <div
                      className="mt-0.5 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap absolute z-10"
                      style={{ top: isTop ? '100%' : 'auto', bottom: isTop ? 'auto' : '100%', background: 'var(--fresco-parchment)', border: '1px solid var(--fresco-shadow)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                    >
                      <p className="text-[9px] font-medium" style={{ color: 'var(--ink-dark)' }}>{m.label}</p>
                      <p className="text-[7px]" style={{ color: catColor }}>{formatYear(m.year)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ Today's Quote ═══════ */}
      <section className="max-w-4xl mx-auto px-4 mb-10">
        <div className="fresco-card p-6 md:p-8 relative">
          <div className="absolute top-3 left-4 flex items-center gap-1.5 text-[10px] uppercase tracking-wider" style={{ color: 'var(--ink-faded)', fontFamily: "'Pretendard', sans-serif" }}>
            <Quote className="w-3 h-3" style={{ color: 'var(--gold)' }} />
            오늘의 명언
          </div>
          <div className="absolute top-1 right-5 leading-none pointer-events-none select-none" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '60px', color: 'var(--gold)', opacity: 0.1 }}>
            &ldquo;
          </div>
          <div className="mt-5">
            <blockquote
              className="text-lg md:text-xl font-light leading-relaxed mb-4 italic"
              style={{ fontFamily: "'Noto Serif KR', Georgia, serif", color: 'var(--ink-dark)' }}
            >
              &ldquo;{todayQuote.text}&rdquo;
            </blockquote>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm">
                <Link href={`/persons/${todayQuote.philosopherId}`} className="font-medium transition-colors" style={{ color: 'var(--gold)' }}>
                  {todayQuote.philosopher}
                </Link>
                <span style={{ color: 'var(--ink-faded)' }}> &mdash; {todayQuote.source}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleCopy} className="btn-ghost text-xs">
                  <Copy className="w-3 h-3" />
                  {copied ? '복사됨' : '복사'}
                </button>
                <button onClick={handleTwitterShare} className="btn-ghost text-xs">
                  <Share2 className="w-3 h-3" />
                  공유
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ Indra's Net closing ═══════ */}
      <section className="max-w-3xl mx-auto px-4 mb-16">
        <div className="text-center py-8" style={{ borderTop: '1px solid var(--fresco-shadow)' }}>
          <p className="text-xs tracking-widest uppercase mb-3" style={{ color: 'var(--ink-faded)', fontFamily: "'Pretendard', sans-serif" }}>
            因陀羅網 &middot; Indra&apos;s Net
          </p>
          <p className="text-sm font-light leading-relaxed italic max-w-xl mx-auto" style={{ fontFamily: "'Noto Serif KR', serif", color: 'var(--ink-light)' }}>
            &ldquo;그물의 각 매듭마다 보석이 달려 있고,<br />
            각 보석은 다른 모든 보석을 비춘다.&rdquo;
          </p>
          <p className="text-[10px] mt-2" style={{ color: 'var(--gold)' }}>— 화엄경</p>
        </div>
      </section>
    </div>
  );
}
