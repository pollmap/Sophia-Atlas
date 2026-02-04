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

export function generateStaticParams() {
  return allPersons.map((p) => ({ id: p.id }));
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
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">인물을 찾을 수 없습니다</h1>
          <Link href="/persons" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            인물 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const era = person.era;
  const allCategories = person.categories || [person.category];

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Back Navigation */}
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <Link
          href="/persons"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          인물 목록으로
        </Link>
      </div>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="relative rounded-2xl border border-slate-700/50 bg-slate-800/20 overflow-hidden">
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{ backgroundColor: getCategoryHexColor(person.category) }}
          />
          <div className="p-6 md:p-8 pt-8">
            {/* Category badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {allCategories.map((cat) => (
                <span
                  key={cat}
                  className={cn(
                    'text-xs px-2.5 py-1 rounded-full border font-medium',
                    getCategoryBadgeClass(cat)
                  )}
                >
                  {getCategoryLabel(cat)}
                </span>
              ))}
              <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', getEraColorClass(era))}>
                {getEraLabel(era)}
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {person.name.ko}
                </h1>
                <p className="text-lg text-slate-400 mb-1">{person.name.en}</p>
                {person.name.original && person.name.original !== person.name.en && (
                  <p className="text-sm text-slate-500 italic">{person.name.original}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-5 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-500" />
                {formatYear(person.period.start)} ~ {formatYear(person.period.end)}
                {person.period.approximate && <span className="text-xs text-slate-600">(추정)</span>}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-500" />
                {person.location.region}
              </span>
              {person.role && (
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-500" />
                  {person.role}
                </span>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {(person.school || []).map((s) => (
                <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {s}
                </span>
              ))}
              {(person.field || []).map((f) => (
                <span key={f} className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {f}
                </span>
              ))}
              {person.tags.map((t) => (
                <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-slate-700/50 text-slate-300 border border-slate-600/30">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="max-w-4xl mx-auto px-4 pb-6">
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-6">
          <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-ancient" />
            요약
          </h2>
          <p className="text-slate-300 leading-relaxed">{person.summary}</p>
        </div>
      </section>

      {/* Detailed */}
      <section className="max-w-4xl mx-auto px-4 pb-6">
        <ExpandableSection title="상세 해설" icon={<BookOpen className="w-5 h-5 text-medieval" />} defaultOpen>
          <div className="leading-relaxed whitespace-pre-line text-slate-300 space-y-3">
            {person.detailed.split('\n').filter(Boolean).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </ExpandableSection>
      </section>

      {/* Key Works */}
      {person.keyWorks && person.keyWorks.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 pb-6">
          <ExpandableSection title="주요 저작/업적" icon={<Scroll className="w-5 h-5 text-modern" />} defaultOpen>
            <ul className="space-y-3">
              {person.keyWorks.map((work, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/30">
                  <BookOpen className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">{work.title}</p>
                    {work.year && <p className="text-xs text-slate-500 mt-0.5">{formatYear(work.year)}</p>}
                    {work.type && <p className="text-xs text-slate-600 mt-0.5">{work.type}</p>}
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
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-6">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Atom className="w-5 h-5 text-emerald-400" />
              주요 발견/발명
            </h2>
            <div className="flex flex-wrap gap-2">
              {person.discoveries.map((d) => (
                <span key={d} className="text-sm px-3 py-1.5 rounded-full border border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
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
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-6">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-red-400" />
              주요 업적
            </h2>
            <div className="flex flex-wrap gap-2">
              {person.achievements.map((a) => (
                <span key={a} className="text-sm px-3 py-1.5 rounded-full border border-red-500/30 text-red-300 bg-red-500/10">
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
          <ExpandableSection title="명언" icon={<MessageSquareQuote className="w-5 h-5 text-ancient" />} defaultOpen>
            <div className="space-y-4">
              {person.quotes.map((quote, idx) => (
                <blockquote key={idx} className="border-l-[3px] pl-4 py-2" style={{ borderLeftColor: getCategoryHexColor(person.category) }}>
                  <p className="text-white text-lg font-light italic leading-relaxed">&ldquo;{quote.text}&rdquo;</p>
                  <footer className="mt-2 text-sm text-slate-500">&mdash; {quote.source}</footer>
                </blockquote>
              ))}
            </div>
          </ExpandableSection>
        </section>
      )}

      {/* Influence Relationships */}
      {((person.influences && person.influences.length > 0) || (person.influenced && person.influenced.length > 0)) && (
        <section className="max-w-4xl mx-auto px-4 pb-6">
          <ExpandableSection title="영향 관계" icon={<GitBranch className="w-5 h-5 text-contemporary" />} defaultOpen>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">영향 받은 인물</h4>
                {person.influences && person.influences.length > 0 ? (
                  <div className="space-y-2">
                    {person.influences.map((infId) => {
                      const cat = getPersonCategory(infId);
                      return (
                        <Link key={infId} href={`/persons/${infId}`} className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-slate-700/30 transition-colors group">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat ? getCategoryHexColor(cat) : '#64748B' }} />
                          <span className="text-slate-300 group-hover:text-white transition-colors">{getPersonName(infId)}</span>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-600 italic">기록된 영향 관계 없음</p>
                )}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">영향을 준 인물</h4>
                {person.influenced && person.influenced.length > 0 ? (
                  <div className="space-y-2">
                    {person.influenced.map((infId) => {
                      const cat = getPersonCategory(infId);
                      return (
                        <Link key={infId} href={`/persons/${infId}`} className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-slate-700/30 transition-colors group">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat ? getCategoryHexColor(cat) : '#64748B' }} />
                          <span className="text-slate-300 group-hover:text-white transition-colors">{getPersonName(infId)}</span>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-600 italic">기록된 영향 관계 없음</p>
                )}
              </div>
            </div>
          </ExpandableSection>
        </section>
      )}

      {/* Concepts */}
      {person.concepts && person.concepts.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 pb-6">
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-6">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-modern" />
              관련 개념
            </h2>
            <div className="flex flex-wrap gap-2">
              {person.concepts.map((concept) => (
                <span key={concept} className={cn('text-sm px-3 py-1.5 rounded-full border', getEraBorderClass(era), getEraColor(era), 'bg-slate-900/30')}>
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
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-6">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-medieval" />
              다룬 질문
            </h2>
            <div className="space-y-2">
              {person.questions.map((question) => (
                <div key={question} className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/30">
                  <HelpCircle className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span className="text-slate-300">{question}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
