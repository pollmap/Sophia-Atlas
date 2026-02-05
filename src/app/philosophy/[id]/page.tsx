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
import rawPhilosophers from '@/data/persons/philosophers.json';
import religiousFiguresData from '@/data/persons/religious-figures.json';
import scientistsData from '@/data/persons/scientists.json';
import historicalFiguresData from '@/data/persons/historical-figures.json';

const philosophersData = (rawPhilosophers as any[]).map((p) => ({
  ...p,
  school: p.school || [],
  keyWorks: p.keyWorks || [],
  quotes: p.quotes || [],
  influences: p.influences || [],
  influenced: p.influenced || [],
  concepts: p.concepts || [],
  questions: p.questions || [],
})) as {
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

const allPersonsForLookup: { id: string; name: { ko: string; en: string }; era: string; category: string }[] = [
  ...(rawPhilosophers as any[]),
  ...(religiousFiguresData as any[]),
  ...(scientistsData as any[]),
  ...(historicalFiguresData as any[]),
];
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

function getPersonNameById(id: string): string {
  const p = allPersonsForLookup.find((ph) => ph.id === id);
  return p ? p.name.ko : id;
}

function getPersonEraById(id: string): string | undefined {
  const p = allPersonsForLookup.find((ph) => ph.id === id);
  return p?.era;
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--fresco-ivory)' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
            사상가를 찾을 수 없습니다
          </h1>
          <Link
            href="/philosophy/timeline"
            className="hover:opacity-80 transition-colors"
            style={{ color: '#B8860B' }}
          >
            타임라인으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const era = philosopher.era as Era;

  return (
    <div className="min-h-screen" style={{ background: 'var(--fresco-ivory)' }}>
      {/* Back Navigation */}
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <Link
          href="/philosophy/timeline"
          className="inline-flex items-center gap-1.5 text-sm hover:opacity-80 transition-colors"
          style={{ color: 'var(--ink-light)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          타임라인으로
        </Link>
      </div>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="relative rounded border overflow-hidden" style={{ borderColor: 'var(--fresco-shadow)', background: 'var(--fresco-parchment)' }}>
          {/* Era color accent bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{ backgroundColor: getEraHexColor(era) }}
          />

          <div className="p-6 md:p-8 pt-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-1" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
                  {philosopher.name.ko}
                </h1>
                <p className="text-lg mb-1" style={{ color: 'var(--ink-light)' }}>
                  {philosopher.name.en}
                </p>
                {philosopher.name.original &&
                  philosopher.name.original !== philosopher.name.en && (
                    <p className="text-sm italic" style={{ color: 'var(--ink-light)' }}>
                      {philosopher.name.original}
                    </p>
                  )}
              </div>

              <span
                className={cn(
                  'inline-block text-sm px-3 py-1.5 rounded-full font-medium self-start',
                  getEraColorClass(era)
                )}
                style={{ fontFamily: "'Pretendard', sans-serif" }}
              >
                {getEraLabel(era)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-5 text-sm" style={{ color: 'var(--ink-light)' }}>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" style={{ color: 'var(--ink-light)' }} />
                {formatYear(philosopher.period.start)} ~{' '}
                {formatYear(philosopher.period.end)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" style={{ color: 'var(--ink-light)' }} />
                {philosopher.location.region}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {philosopher.school.map((s) => (
                <span
                  key={s}
                  className="text-xs px-2.5 py-1 rounded-full border"
                  style={{ background: 'var(--fresco-aged)', color: 'var(--ink-medium)', borderColor: 'var(--fresco-shadow)' }}
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
        <div className="rounded-xl border p-6" style={{ borderColor: 'var(--fresco-shadow)', background: 'var(--fresco-parchment)' }}>
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
            <Lightbulb className="w-5 h-5" style={{ color: '#B8860B' }} />
            요약
          </h2>
          <p className="leading-relaxed" style={{ color: 'var(--ink-medium)' }}>{philosopher.summary}</p>
        </div>
      </section>

      {/* Detailed (expandable) */}
      <section className="max-w-4xl mx-auto px-4 pb-6">
        <ExpandableSection
          title="상세 해설"
          icon={<BookOpen className="w-5 h-5" style={{ color: '#6B4E8A' }} />}
          defaultOpen
        >
          <div className="leading-relaxed space-y-3" style={{ color: 'var(--ink-medium)' }}>
            {philosopher.detailed.split('\n').filter(Boolean).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </ExpandableSection>
      </section>

      {/* Key Works */}
      {philosopher.keyWorks.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 pb-6">
          <ExpandableSection
            title="핵심 저작"
            icon={<Scroll className="w-5 h-5" style={{ color: '#4A7A6B' }} />}
            defaultOpen
          >
            <ul className="space-y-3">
              {philosopher.keyWorks.map((work, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg"
                  style={{ background: 'var(--fresco-aged)' }}
                >
                  <BookOpen className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--ink-light)' }} />
                  <div>
                    <p className="font-medium" style={{ color: 'var(--ink-dark)' }}>{work.title}</p>
                    {work.year && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--ink-light)' }}>
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
            icon={<MessageSquareQuote className="w-5 h-5" style={{ color: '#B8860B' }} />}
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
                  <p className="text-lg font-light italic leading-relaxed" style={{ color: 'var(--ink-dark)' }}>
                    &ldquo;{quote.text}&rdquo;
                  </p>
                  <footer className="mt-2 text-sm" style={{ color: 'var(--ink-light)' }}>
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
          icon={<GitBranch className="w-5 h-5" style={{ color: '#6B6358' }} />}
          defaultOpen
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Influenced by */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>
                영향 받은 사상가
              </h4>
              {philosopher.influences.length > 0 ? (
                <div className="space-y-2">
                  {philosopher.influences.map((infId) => {
                    const inf = allPersonsForLookup.find((p) => p.id === infId);
                    return (
                      <Link
                        key={infId}
                        href={`/persons/${infId}`}
                        className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-[var(--fresco-aged)] transition-colors group"
                      >
                        {inf && (
                          <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: getEraHexColor(inf.era) }}
                          />
                        )}
                        <span className="group-hover:opacity-80 transition-colors" style={{ color: 'var(--ink-medium)' }}>
                          {getPersonNameById(infId)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm italic" style={{ color: 'var(--ink-faded)' }}>
                  기록된 영향 관계 없음
                </p>
              )}
            </div>

            {/* Influenced others */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>
                영향을 준 사상가
              </h4>
              {philosopher.influenced.length > 0 ? (
                <div className="space-y-2">
                  {philosopher.influenced.map((infId) => {
                    const inf = allPersonsForLookup.find((p) => p.id === infId);
                    return (
                      <Link
                        key={infId}
                        href={`/persons/${infId}`}
                        className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-[var(--fresco-aged)] transition-colors group"
                      >
                        {inf && (
                          <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: getEraHexColor(inf.era) }}
                          />
                        )}
                        <span className="group-hover:opacity-80 transition-colors" style={{ color: 'var(--ink-medium)' }}>
                          {getPersonNameById(infId)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm italic" style={{ color: 'var(--ink-faded)' }}>
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
          <div className="rounded-xl border p-6" style={{ borderColor: 'var(--fresco-shadow)', background: 'var(--fresco-parchment)' }}>
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
              <Tag className="w-5 h-5" style={{ color: '#4A7A6B' }} />
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
                  )}
                  style={{ background: 'var(--fresco-aged)' }}
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
          <div className="rounded-xl border p-6" style={{ borderColor: 'var(--fresco-shadow)', background: 'var(--fresco-parchment)' }}>
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
              <HelpCircle className="w-5 h-5" style={{ color: '#6B4E8A' }} />
              다룬 질문
            </h2>
            <div className="space-y-2">
              {philosopher.questions.map((question) => (
                <Link
                  key={question}
                  href="/philosophy/questions"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--fresco-aged)] transition-colors group"
                >
                  <HelpCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--ink-light)' }} />
                  <span className="group-hover:opacity-80 transition-colors" style={{ color: 'var(--ink-medium)' }}>
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
