import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  GitBranch,
  HelpCircle,
  Lightbulb,
  MapPin,
  MessageSquareQuote,
  Quote,
  Scroll,
  Tag,
} from 'lucide-react';
import rawPhilosophers from '@/data/philosophers.json';

const philosophersData = rawPhilosophers as {
  id: string;
  name: { ko: string; en: string; original?: string };
  era: string;
  period: { start: number; end: number };
  location: { lat: number; lng: number; region: string };
  school: string[];
  summary: string;
  detailed: string;
  keyWorks: { title: string; year?: number }[];
  quotes: { text: string; source: string }[];
  influences: string[];
  influenced: string[];
  concepts: string[];
  questions: string[];
}[];
import {
  cn,
  getEraColor,
  getEraLabel,
  formatYear,
} from '@/lib/utils';
import { getEraColorClass, getEraBorderClass, getEraHexColor } from '@/lib/utils';
import ExpandableSection from '@/components/common/ExpandableSection';

type Era = 'ancient' | 'medieval' | 'modern' | 'contemporary';

export function generateStaticParams() {
  return philosophersData.map((p) => ({
    id: p.id,
  }));
}

function getPhilosopherName(id: string): string {
  const p = philosophersData.find((ph) => ph.id === id);
  return p ? p.name.ko : id;
}

export default async function PhilosopherPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const philosopher = philosophersData.find((p) => p.id === id);

  if (!philosopher) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            사상가를 찾을 수 없습니다
          </h1>
          <Link
            href="/philosophy/timeline/"
            className="text-ancient hover:text-ancient/80 transition-colors"
          >
            타임라인으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const era = philosopher.era as Era;

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Back Navigation */}
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <Link
          href="/philosophy/timeline/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          타임라인으로
        </Link>
      </div>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="relative rounded-2xl border border-slate-700/50 bg-slate-800/20 overflow-hidden">
          {/* Era color accent bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{ backgroundColor: getEraHexColor(era) }}
          />

          <div className="p-6 md:p-8 pt-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {philosopher.name.ko}
                </h1>
                <p className="text-lg text-slate-400 mb-1">
                  {philosopher.name.en}
                </p>
                {philosopher.name.original &&
                  philosopher.name.original !== philosopher.name.en && (
                    <p className="text-sm text-slate-500 italic">
                      {philosopher.name.original}
                    </p>
                  )}
              </div>

              <span
                className={cn(
                  'inline-block text-sm px-3 py-1.5 rounded-full font-medium self-start',
                  getEraColorClass(era)
                )}
              >
                {getEraLabel(era)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-5 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-500" />
                {formatYear(philosopher.period.start)} ~{' '}
                {formatYear(philosopher.period.end)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-500" />
                {philosopher.location.region}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {philosopher.school.map((s) => (
                <span
                  key={s}
                  className="text-xs px-2.5 py-1 rounded-full bg-slate-700/50 text-slate-300 border border-slate-600/30"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Summary (always visible) */}
      <section className="max-w-4xl mx-auto px-4 pb-6">
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-6">
          <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-ancient" />
            요약
          </h2>
          <p className="text-slate-300 leading-relaxed">{philosopher.summary}</p>
        </div>
      </section>

      {/* Detailed (expandable) */}
      <section className="max-w-4xl mx-auto px-4 pb-6">
        <ExpandableSection
          title="상세 해설"
          icon={<BookOpen className="w-5 h-5 text-medieval" />}
        >
          <p className="leading-relaxed whitespace-pre-line">
            {philosopher.detailed}
          </p>
        </ExpandableSection>
      </section>

      {/* Key Works */}
      {philosopher.keyWorks.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 pb-6">
          <ExpandableSection
            title="핵심 저작"
            icon={<Scroll className="w-5 h-5 text-modern" />}
            defaultOpen
          >
            <ul className="space-y-3">
              {philosopher.keyWorks.map((work, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/30"
                >
                  <BookOpen className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">{work.title}</p>
                    {work.year && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatYear(work.year)}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </ExpandableSection>
        </section>
      )}

      {/* Quotes */}
      {philosopher.quotes.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 pb-6">
          <ExpandableSection
            title="명언"
            icon={<MessageSquareQuote className="w-5 h-5 text-ancient" />}
            defaultOpen
          >
            <div className="space-y-4">
              {philosopher.quotes.map((quote, idx) => (
                <blockquote
                  key={idx}
                  className={cn(
                    'border-l-3 pl-4 py-2',
                    getEraBorderClass(era)
                  )}
                  style={{ borderLeftWidth: 3 }}
                >
                  <p className="text-white text-lg font-light italic leading-relaxed">
                    &ldquo;{quote.text}&rdquo;
                  </p>
                  <footer className="mt-2 text-sm text-slate-500">
                    &mdash; {quote.source}
                  </footer>
                </blockquote>
              ))}
            </div>
          </ExpandableSection>
        </section>
      )}

      {/* Influence Relationships */}
      <section className="max-w-4xl mx-auto px-4 pb-6">
        <ExpandableSection
          title="영향 관계"
          icon={<GitBranch className="w-5 h-5 text-contemporary" />}
          defaultOpen
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Influenced by */}
            <div>
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                영향 받은 사상가
              </h4>
              {philosopher.influences.length > 0 ? (
                <div className="space-y-2">
                  {philosopher.influences.map((infId) => {
                    const inf = philosophersData.find((p) => p.id === infId);
                    return (
                      <Link
                        key={infId}
                        href={`/philosophy/${infId}/`}
                        className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-slate-700/30 transition-colors group"
                      >
                        {inf && (
                          <div
                            className={cn(
                              'w-2.5 h-2.5 rounded-full flex-shrink-0',
                              `bg-${inf.era === 'ancient' ? 'ancient' : inf.era === 'medieval' ? 'medieval' : inf.era === 'modern' ? 'modern' : 'contemporary'}`
                            )}
                            style={{ backgroundColor: getEraHexColor(inf.era) }}
                          />
                        )}
                        <span className="text-slate-300 group-hover:text-white transition-colors">
                          {getPhilosopherName(infId)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-600 italic">
                  기록된 영향 관계 없음
                </p>
              )}
            </div>

            {/* Influenced others */}
            <div>
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                영향을 준 사상가
              </h4>
              {philosopher.influenced.length > 0 ? (
                <div className="space-y-2">
                  {philosopher.influenced.map((infId) => {
                    const inf = philosophersData.find((p) => p.id === infId);
                    return (
                      <Link
                        key={infId}
                        href={`/philosophy/${infId}/`}
                        className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-slate-700/30 transition-colors group"
                      >
                        {inf && (
                          <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: getEraHexColor(inf.era) }}
                          />
                        )}
                        <span className="text-slate-300 group-hover:text-white transition-colors">
                          {getPhilosopherName(infId)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-600 italic">
                  기록된 영향 관계 없음
                </p>
              )}
            </div>
          </div>
        </ExpandableSection>
      </section>

      {/* Concepts */}
      {philosopher.concepts.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 pb-6">
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-6">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-modern" />
              관련 개념
            </h2>
            <div className="flex flex-wrap gap-2">
              {philosopher.concepts.map((concept) => (
                <span
                  key={concept}
                  className={cn(
                    'text-sm px-3 py-1.5 rounded-full border',
                    getEraBorderClass(era),
                    getEraColor(era),
                    'bg-slate-900/30'
                  )}
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Questions */}
      {philosopher.questions.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 pb-20">
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-6">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-medieval" />
              다룬 질문
            </h2>
            <div className="space-y-2">
              {philosopher.questions.map((question) => (
                <Link
                  key={question}
                  href="/philosophy/questions/"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/30 transition-colors group"
                >
                  <HelpCircle className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span className="text-slate-300 group-hover:text-white transition-colors">
                    {question}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
