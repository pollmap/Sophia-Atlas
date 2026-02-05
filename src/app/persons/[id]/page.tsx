import type { Metadata } from 'next';
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
  Scroll,
  Tag,
  Atom,
  Crown,
  Users,
} from 'lucide-react';
import {
  cn,
  getEraColor,
  getEraLabel,
  getEraHexColor,
  getEraColorClass,
  getEraBorderClass,
  getCategoryLabel,
  getCategoryBadgeClass,
  getCategoryHexColor,
  formatYear,
} from '@/lib/utils';
import ExpandableSection from '@/components/common/ExpandableSection';

import philosophersData from '@/data/persons/philosophers.json';
import religiousFiguresData from '@/data/persons/religious-figures.json';
import scientistsData from '@/data/persons/scientists.json';
import historicalFiguresData from '@/data/persons/historical-figures.json';

type PersonData = {
  id: string;
  name: { ko: string; en: string; original?: string };
  era: string;
  period: { start: number; end: number; approximate?: boolean };
  location: { lat: number; lng: number; region: string };
  category: string;
  categories?: string[];
  subcategory: string;
  tags: string[];
  mvp: boolean;
  summary: string;
  detailed: string;
  keyWorks?: { title: string; year?: number; type?: string }[];
  quotes?: { text: string; source: string }[];
  influences?: string[];
  influenced?: string[];
  school?: string[];
  concepts?: string[];
  questions?: string[];
  religionId?: string;
  role?: string;
  field?: string[];
  discoveries?: string[];
  domain?: string;
  achievements?: string[];
};

const allPersons: PersonData[] = [
  ...(philosophersData as PersonData[]),
  ...(religiousFiguresData as PersonData[]),
  ...(scientistsData as PersonData[]),
  ...(historicalFiguresData as PersonData[]),
];

/* ── Category/Era color helpers (these are identity colors, not theme-dependent) ── */

const frescoCategory: Record<string, string> = {
  philosopher: '#4A5D8A',
  religious_figure: '#B8860B',
  scientist: '#5B7355',
  historical_figure: '#8B4040',
  cultural_figure: '#7A5478',
};

const frescoEra: Record<string, string> = {
  ancient: '#B8860B',
  medieval: '#6B4E8A',
  modern: '#4A7A6B',
  contemporary: '#6B6358',
};

function frescoCategoryColor(cat: string): string {
  return frescoCategory[cat] ?? '#6B6358';
}

function frescoEraColor(era: string): string {
  return frescoEra[era] ?? '#6B6358';
}

export function generateStaticParams() {
  return allPersons.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const person = allPersons.find((p) => p.id === id);
  if (!person) return { title: 'Sophia Atlas' };
  const catLabel = getCategoryLabel(person.category);
  const eraLabel = getEraLabel(person.era);
  return {
    title: `${person.name.ko} (${person.name.en}) — Sophia Atlas`,
    description: person.summary,
    keywords: [person.name.ko, person.name.en, catLabel, eraLabel, ...(person.tags || [])],
    openGraph: {
      title: `${person.name.ko} — ${catLabel} | Sophia Atlas`,
      description: person.summary,
      type: 'profile',
      locale: 'ko_KR',
    },
  };
}

function getPersonName(id: string): string {
  const p = allPersons.find((person) => person.id === id);
  return p ? p.name.ko : id;
}

function getPersonCategory(id: string): string | undefined {
  const p = allPersons.find((person) => person.id === id);
  return p?.category;
}

export default async function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const person = allPersons.find((p) => p.id === id);

  if (!person) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--fresco-ivory)' }}
      >
        <div className="text-center">
          <h1
            className="text-2xl font-bold mb-4"
            style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}
          >
            인물을 찾을 수 없습니다
          </h1>
          <Link
            href="/persons"
            style={{ color: 'var(--gold)' }}
            className="hover:opacity-80 transition-opacity"
          >
            인물 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const era = person.era;
  const allCategories = person.categories || [person.category];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--fresco-ivory)' }}>
      {/* Back Navigation */}
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <Link
          href="/persons"
          className="inline-flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity"
          style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}
        >
          <ArrowLeft className="w-4 h-4" />
          인물 목록으로
        </Link>
      </div>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div
          className="fresco-card relative overflow-hidden"
          style={{
            backgroundColor: 'var(--fresco-parchment)',
            borderColor: 'var(--fresco-shadow)',
            borderRadius: '4px',
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{ backgroundColor: frescoCategoryColor(person.category) }}
          />
          <div className="p-6 md:p-8 pt-8">
            {/* Category badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {allCategories.map((cat) => (
                <span
                  key={cat}
                  className="text-xs px-2.5 py-1 border font-medium"
                  style={{
                    borderRadius: '4px',
                    backgroundColor: `${frescoCategoryColor(cat)}18`,
                    borderColor: `${frescoCategoryColor(cat)}40`,
                    color: frescoCategoryColor(cat),
                    fontFamily: "'Pretendard', sans-serif",
                  }}
                >
                  {getCategoryLabel(cat)}
                </span>
              ))}
              <span
                className="text-xs px-2.5 py-1 font-medium"
                style={{
                  borderRadius: '4px',
                  backgroundColor: `${frescoEraColor(era)}18`,
                  color: frescoEraColor(era),
                  fontFamily: "'Pretendard', sans-serif",
                }}
              >
                {getEraLabel(era)}
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1
                  className="text-3xl md:text-4xl font-bold mb-1"
                  style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {person.name.ko}
                </h1>
                <p
                  className="text-lg mb-1"
                  style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}
                >
                  {person.name.en}
                </p>
                {person.name.original && person.name.original !== person.name.en && (
                  <p
                    className="text-sm italic"
                    style={{ color: 'var(--ink-faded)', fontFamily: "'Pretendard', sans-serif" }}
                  >
                    {person.name.original}
                  </p>
                )}
              </div>
            </div>

            <div
              className="flex flex-wrap items-center gap-4 mt-5 text-sm"
              style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}
            >
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" style={{ color: 'var(--ink-faded)' }} />
                {formatYear(person.period.start)} ~ {formatYear(person.period.end)}
                {person.period.approximate && (
                  <span className="text-xs" style={{ color: 'var(--ink-faded)' }}>(추정)</span>
                )}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" style={{ color: 'var(--ink-faded)' }} />
                {person.location.region}
              </span>
              {person.role && (
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" style={{ color: 'var(--ink-faded)' }} />
                  {person.role}
                </span>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {(person.school || []).map((s) => (
                <span
                  key={s}
                  className="text-xs px-2.5 py-1 border"
                  style={{
                    borderRadius: '4px',
                    backgroundColor: '#4A5D8A18',
                    color: '#4A5D8A',
                    borderColor: '#4A5D8A30',
                    fontFamily: "'Pretendard', sans-serif",
                  }}
                >
                  {s}
                </span>
              ))}
              {(person.field || []).map((f) => (
                <span
                  key={f}
                  className="text-xs px-2.5 py-1 border"
                  style={{
                    borderRadius: '4px',
                    backgroundColor: '#5B735518',
                    color: '#5B7355',
                    borderColor: '#5B735530',
                    fontFamily: "'Pretendard', sans-serif",
                  }}
                >
                  {f}
                </span>
              ))}
              {person.tags.map((t) => (
                <span
                  key={t}
                  className="text-xs px-2.5 py-1 border"
                  style={{
                    borderRadius: '4px',
                    backgroundColor: 'var(--fresco-aged)',
                    color: 'var(--ink-medium)',
                    borderColor: 'var(--fresco-shadow)',
                    fontFamily: "'Pretendard', sans-serif",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="max-w-4xl mx-auto px-4 pb-6">
        <div
          className="fresco-card border p-6"
          style={{
            backgroundColor: 'var(--fresco-parchment)',
            borderColor: 'var(--fresco-shadow)',
            borderRadius: '4px',
          }}
        >
          <h2
            className="text-base font-semibold mb-3 flex items-center gap-2"
            style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}
          >
            <Lightbulb className="w-5 h-5" style={{ color: 'var(--gold)' }} />
            요약
          </h2>
          <p
            className="leading-relaxed"
            style={{ color: 'var(--ink-medium)', fontFamily: "'Pretendard', sans-serif" }}
          >
            {person.summary}
          </p>
        </div>
      </section>

      {/* Detailed */}
      <section className="max-w-4xl mx-auto px-4 pb-6">
        <ExpandableSection title="상세 해설" icon={<BookOpen className="w-5 h-5" style={{ color: '#6B4E8A' }} />} defaultOpen>
          <div
            className="leading-relaxed whitespace-pre-line space-y-3"
            style={{ color: 'var(--ink-medium)', fontFamily: "'Pretendard', sans-serif" }}
          >
            {person.detailed.split('\n').filter(Boolean).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </ExpandableSection>
      </section>

      {/* Key Works */}
      {person.keyWorks && person.keyWorks.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 pb-6">
          <ExpandableSection title="주요 저작/업적" icon={<Scroll className="w-5 h-5" style={{ color: '#4A7A6B' }} />} defaultOpen>
            <ul className="space-y-3">
              {person.keyWorks.map((work, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 p-3"
                  style={{
                    backgroundColor: 'var(--fresco-aged)',
                    borderRadius: '4px',
                  }}
                >
                  <BookOpen className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--ink-faded)' }} />
                  <div>
                    <p
                      className="font-medium"
                      style={{ color: 'var(--ink-dark)', fontFamily: "'Pretendard', sans-serif" }}
                    >
                      {work.title}
                    </p>
                    {work.year && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--ink-light)' }}>
                        {formatYear(work.year)}
                      </p>
                    )}
                    {work.type && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--ink-faded)' }}>
                        {work.type}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </ExpandableSection>
        </section>
      )}

      {/* Discoveries (scientists) */}
      {person.discoveries && person.discoveries.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 pb-6">
          <div
            className="fresco-card border p-6"
            style={{
              backgroundColor: 'var(--fresco-parchment)',
              borderColor: 'var(--fresco-shadow)',
              borderRadius: '4px',
            }}
          >
            <h2
              className="text-base font-semibold mb-4 flex items-center gap-2"
              style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}
            >
              <Atom className="w-5 h-5" style={{ color: '#5B7355' }} />
              주요 발견/발명
            </h2>
            <div className="flex flex-wrap gap-2">
              {person.discoveries.map((d) => (
                <span
                  key={d}
                  className="text-sm px-3 py-1.5 border"
                  style={{
                    borderRadius: '4px',
                    borderColor: '#5B735540',
                    color: '#5B7355',
                    backgroundColor: '#5B735512',
                    fontFamily: "'Pretendard', sans-serif",
                  }}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Achievements (historical) */}
      {person.achievements && person.achievements.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 pb-6">
          <div
            className="fresco-card border p-6"
            style={{
              backgroundColor: 'var(--fresco-parchment)',
              borderColor: 'var(--fresco-shadow)',
              borderRadius: '4px',
            }}
          >
            <h2
              className="text-base font-semibold mb-4 flex items-center gap-2"
              style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}
            >
              <Crown className="w-5 h-5" style={{ color: '#8B4040' }} />
              주요 업적
            </h2>
            <div className="flex flex-wrap gap-2">
              {person.achievements.map((a) => (
                <span
                  key={a}
                  className="text-sm px-3 py-1.5 border"
                  style={{
                    borderRadius: '4px',
                    borderColor: '#8B404040',
                    color: '#8B4040',
                    backgroundColor: '#8B404012',
                    fontFamily: "'Pretendard', sans-serif",
                  }}
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quotes */}
      {person.quotes && person.quotes.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 pb-6">
          <ExpandableSection title="명언" icon={<MessageSquareQuote className="w-5 h-5" style={{ color: 'var(--gold)' }} />} defaultOpen>
            <div className="space-y-4">
              {person.quotes.map((quote, idx) => (
                <blockquote
                  key={idx}
                  className="fresco-quote border-l-[3px] pl-4 py-2"
                  style={{ borderLeftColor: 'var(--gold)' }}
                >
                  <p
                    className="text-lg font-light italic leading-relaxed"
                    style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    &ldquo;{quote.text}&rdquo;
                  </p>
                  <footer
                    className="mt-2 text-sm"
                    style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}
                  >
                    &mdash; {quote.source}
                  </footer>
                </blockquote>
              ))}
            </div>
          </ExpandableSection>
        </section>
      )}

      {/* Influence Relationships */}
      {((person.influences && person.influences.length > 0) || (person.influenced && person.influenced.length > 0)) && (
        <section className="max-w-4xl mx-auto px-4 pb-6">
          <ExpandableSection title="영향 관계" icon={<GitBranch className="w-5 h-5" style={{ color: 'var(--ink-faded)' }} />} defaultOpen>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4
                  className="text-sm font-semibold uppercase tracking-wider mb-3"
                  style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}
                >
                  영향 받은 인물
                </h4>
                {person.influences && person.influences.length > 0 ? (
                  <div className="space-y-2">
                    {person.influences.map((infId) => {
                      const cat = getPersonCategory(infId);
                      return (
                        <Link
                          key={infId}
                          href={`/persons/${infId}`}
                          className="flex items-center gap-2.5 p-2.5 transition-colors group"
                          style={{ borderRadius: '4px' }}
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: cat ? frescoCategoryColor(cat) : '#6B6358' }}
                          />
                          <span
                            className="group-hover:opacity-80 transition-opacity"
                            style={{ color: 'var(--ink-medium)', fontFamily: "'Pretendard', sans-serif" }}
                          >
                            {getPersonName(infId)}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p
                    className="text-sm italic"
                    style={{ color: 'var(--ink-faded)', fontFamily: "'Pretendard', sans-serif" }}
                  >
                    기록된 영향 관계 없음
                  </p>
                )}
              </div>
              <div>
                <h4
                  className="text-sm font-semibold uppercase tracking-wider mb-3"
                  style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}
                >
                  영향을 준 인물
                </h4>
                {person.influenced && person.influenced.length > 0 ? (
                  <div className="space-y-2">
                    {person.influenced.map((infId) => {
                      const cat = getPersonCategory(infId);
                      return (
                        <Link
                          key={infId}
                          href={`/persons/${infId}`}
                          className="flex items-center gap-2.5 p-2.5 transition-colors group"
                          style={{ borderRadius: '4px' }}
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: cat ? frescoCategoryColor(cat) : '#6B6358' }}
                          />
                          <span
                            className="group-hover:opacity-80 transition-opacity"
                            style={{ color: 'var(--ink-medium)', fontFamily: "'Pretendard', sans-serif" }}
                          >
                            {getPersonName(infId)}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p
                    className="text-sm italic"
                    style={{ color: 'var(--ink-faded)', fontFamily: "'Pretendard', sans-serif" }}
                  >
                    기록된 영향 관계 없음
                  </p>
                )}
              </div>
            </div>
          </ExpandableSection>
        </section>
      )}

      {/* Concepts */}
      {person.concepts && person.concepts.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 pb-6">
          <div
            className="fresco-card border p-6"
            style={{
              backgroundColor: 'var(--fresco-parchment)',
              borderColor: 'var(--fresco-shadow)',
              borderRadius: '4px',
            }}
          >
            <h2
              className="text-base font-semibold mb-4 flex items-center gap-2"
              style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}
            >
              <Tag className="w-5 h-5" style={{ color: '#4A7A6B' }} />
              관련 개념
            </h2>
            <div className="flex flex-wrap gap-2">
              {person.concepts.map((concept) => (
                <span
                  key={concept}
                  className="text-sm px-3 py-1.5 border"
                  style={{
                    borderRadius: '4px',
                    borderColor: `${frescoEraColor(era)}40`,
                    color: frescoEraColor(era),
                    backgroundColor: 'var(--fresco-aged)',
                    fontFamily: "'Pretendard', sans-serif",
                  }}
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Questions */}
      {person.questions && person.questions.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 pb-20">
          <div
            className="fresco-card border p-6"
            style={{
              backgroundColor: 'var(--fresco-parchment)',
              borderColor: 'var(--fresco-shadow)',
              borderRadius: '4px',
            }}
          >
            <h2
              className="text-base font-semibold mb-4 flex items-center gap-2"
              style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}
            >
              <HelpCircle className="w-5 h-5" style={{ color: '#6B4E8A' }} />
              다룬 질문
            </h2>
            <div className="space-y-2">
              {person.questions.map((question) => (
                <div
                  key={question}
                  className="flex items-center gap-3 p-3"
                  style={{
                    backgroundColor: 'var(--fresco-aged)',
                    borderRadius: '4px',
                  }}
                >
                  <HelpCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--ink-faded)' }} />
                  <span style={{ color: 'var(--ink-medium)', fontFamily: "'Pretendard', sans-serif" }}>
                    {question}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
