'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Clock,
  Copy,
  GitBranch,
  Globe,
  Grid3X3,
  HelpCircle,
  MapPin,
  Quote,
  Share2,
  Sparkles,
  TreePine,
  Users,
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
import { cn, getEraColor, getEraBgColor, getEraLabel, formatYear } from '@/lib/utils';

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

const navItems = [
  { title: '인물 탐색기', description: '471명의 사상가·과학자·종교인물 탐색', href: '/persons/', icon: Users },
  { title: '엔터티', description: '사건·사상·기관·경전 탐색', href: '/entities/', icon: Grid3X3 },
  { title: '타임라인', description: '철학의 역사를 시간순으로 탐색', href: '/philosophy/timeline/', icon: Clock },
  { title: '영향 관계 그래프', description: '사상가들의 연결 관계', href: '/philosophy/graph/', icon: GitBranch },
  { title: '근본 질문', description: '질문으로 철학 탐색하기', href: '/philosophy/questions/', icon: HelpCircle },
  { title: '세계지도', description: '사상과 종교의 지리적 분포', href: '/religion/map/', icon: Globe },
  { title: '분파 트리', description: '종교와 학파의 분기 역사', href: '/religion/tree/', icon: TreePine },
  { title: '비교표', description: '종교와 신화의 테마 비교', href: '/religion/compare/', icon: Grid3X3 },
];

export default function HomePage() {
  const [copied, setCopied] = useState(false);

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
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-ancient/5 via-medieval/5 to-transparent" />
        <div className="relative max-w-5xl mx-auto text-center">
          <p className="text-ancient/80 text-lg font-light tracking-[0.3em] mb-4">
            Σοφία
          </p>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
            Sophia Atlas
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 font-light">
            인류 사상의 시공간 지도
          </p>
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500">
            <BookOpen className="w-4 h-4" />
            <span>철학 &middot; 신화 &middot; 종교의 연결고리를 탐험하세요</span>
          </div>
        </div>
      </section>

      {/* 오늘의 명언 */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="relative rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-8 md:p-10">
          <div className="absolute top-4 left-4 flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-ancient" />
            오늘의 명언
          </div>

          <div className="mt-6">
            <Quote className="w-8 h-8 text-ancient/40 mb-4" />
            <blockquote className="text-xl md:text-2xl text-white font-light leading-relaxed mb-6">
              &ldquo;{todayQuote.text}&rdquo;
            </blockquote>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <Link
                  href={`/philosophy/${todayQuote.philosopherId}/`}
                  className="text-ancient hover:text-ancient/80 font-medium transition-colors"
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

      {/* 시대별 Overview */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-400" />
          시대별 철학
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {eras.map((era) => (
            <Link
              key={era}
              href={`/philosophy/timeline/`}
              className={cn(
                'group relative rounded-xl border border-slate-700/50 bg-slate-800/20 p-5 hover:bg-slate-800/40 transition-all duration-200'
              )}
            >
              <div className={cn('w-3 h-3 rounded-full mb-3', getEraBgColor(era))} />
              <h3 className={cn('text-lg font-bold', getEraColor(era))}>
                {getEraLabel(era)}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{eraDescriptions[era]}</p>
              <div className="mt-3 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-sm text-slate-400">{eraCounts[era]}명의 사상가</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-slate-400" />
          탐색하기
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-xl border border-slate-700/50 bg-slate-800/20 p-5 hover:bg-slate-800/40 hover:border-slate-600/50 transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-700/30 flex items-center justify-center group-hover:bg-slate-700/50 transition-colors">
                    <Icon className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium group-hover:text-ancient transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">{item.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Stats Bar */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-white">{allPersons.length}</p>
              <p className="text-sm text-slate-500 mt-1">인물</p>
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
