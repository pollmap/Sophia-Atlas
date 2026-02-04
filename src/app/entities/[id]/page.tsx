import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Lightbulb, BookOpen, Users, Tag, Layers } from 'lucide-react';
import { cn, getEraLabel, getEraColorClass, formatYear, getCategoryHexColor } from '@/lib/utils';
import ExpandableSection from '@/components/common/ExpandableSection';

import eventsData from '@/data/entities/events.json';
import ideologiesData from '@/data/entities/ideologies.json';
import movementsData from '@/data/entities/movements.json';
import institutionsData from '@/data/entities/institutions.json';
import textsData from '@/data/entities/texts.json';
import conceptsData from '@/data/entities/concepts.json';
import philosophersData from '@/data/persons/philosophers.json';
import religiousFiguresData from '@/data/persons/religious-figures.json';
import scientistsData from '@/data/persons/scientists.json';
import historicalFiguresData from '@/data/persons/historical-figures.json';

type EntityData = {
  id: string;
  type: string;
  name: { ko: string; en: string; original?: string };
  period?: { start: number; end: number; approximate?: boolean };
  location?: { lat: number; lng: number; region: string };
  era?: string;
  summary: string;
  detailed?: string;
  tags: string[];
  relatedPersons?: string[];
  relatedEntities?: string[];
  significance?: string;
  founders?: string[];
  keyPrinciples?: string[];
  author?: string;
  domain?: string;
  originPerson?: string;
  [key: string]: unknown;
};

type PersonBasic = { id: string; name: { ko: string; en: string }; category: string };

const allEntities: EntityData[] = [
  ...(eventsData as EntityData[]),
  ...(ideologiesData as EntityData[]),
  ...(movementsData as EntityData[]),
  ...(institutionsData as EntityData[]),
  ...(textsData as EntityData[]),
  ...(conceptsData as EntityData[]),
];

const allPersons: PersonBasic[] = [
  ...(philosophersData as PersonBasic[]),
  ...(religiousFiguresData as PersonBasic[]),
  ...(scientistsData as PersonBasic[]),
  ...(historicalFiguresData as PersonBasic[]),
];

const typeLabels: Record<string, string> = {
  event: '역사적 사건', ideology: '사상/이념', movement: '운동/학파',
  institution: '기관/조직', text: '경전/문헌', concept: '핵심 개념',
};
const typeColors: Record<string, string> = {
  event: 'bg-red-500/20 text-red-300 border-red-500/30',
  ideology: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  movement: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  institution: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  text: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  concept: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
};
const typeHex: Record<string, string> = {
  event: '#EF4444', ideology: '#A855F7', movement: '#3B82F6',
  institution: '#F59E0B', text: '#10B981', concept: '#06B6D4',
};

export function generateStaticParams() {
  return allEntities.map((e) => ({ id: e.id }));
}

function getPersonName(id: string): string {
  const p = allPersons.find((person) => person.id === id);
  return p ? p.name.ko : id;
}

function getEntityName(id: string): string {
  const e = allEntities.find((ent) => ent.id === id);
  return e ? e.name.ko : id;
}

export default async function EntityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entity = allEntities.find((e) => e.id === id);

  if (!entity) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">엔터티를 찾을 수 없습니다</h1>
          <Link href="/entities/" className="text-purple-400 hover:text-purple-300">엔터티 목록으로</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <Link href="/entities/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          엔터티 목록으로
        </Link>
      </div>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="relative rounded-2xl border border-slate-700/50 bg-slate-800/20 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: typeHex[entity.type] || '#64748B' }} />
          <div className="p-6 md:p-8 pt-8">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={cn('text-xs px-2.5 py-1 rounded-full border font-medium', typeColors[entity.type])}>
                {typeLabels[entity.type]}
              </span>
              {entity.era && (
                <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', getEraColorClass(entity.era))}>
                  {getEraLabel(entity.era)}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">{entity.name.ko}</h1>
            <p className="text-lg text-slate-400">{entity.name.en}</p>
            {entity.name.original && entity.name.original !== entity.name.en && (
              <p className="text-sm text-slate-500 italic">{entity.name.original}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-slate-400">
              {entity.period && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  {formatYear(entity.period.start)}
                  {entity.period.end !== entity.period.start && ` ~ ${formatYear(entity.period.end)}`}
                </span>
              )}
              {entity.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  {entity.location.region}
                </span>
              )}
              {entity.domain && <span className="text-cyan-400">{entity.domain}</span>}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {entity.tags.map((t) => (
                <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-slate-700/50 text-slate-300 border border-slate-600/30">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="max-w-4xl mx-auto px-4 pb-6">
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-6">
          <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-ancient" />요약
          </h2>
          <p className="text-slate-300 leading-relaxed">{entity.summary}</p>
        </div>
      </section>

      {/* Detailed */}
      {entity.detailed && (
        <section className="max-w-4xl mx-auto px-4 pb-6">
          <ExpandableSection title="상세 설명" icon={<BookOpen className="w-5 h-5 text-medieval" />}>
            <p className="leading-relaxed whitespace-pre-line">{entity.detailed}</p>
          </ExpandableSection>
        </section>
      )}

      {/* Significance (events) */}
      {entity.significance && (
        <section className="max-w-4xl mx-auto px-4 pb-6">
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-6">
            <h2 className="text-base font-semibold text-white mb-3">역사적 의의</h2>
            <p className="text-slate-300 leading-relaxed">{entity.significance}</p>
          </div>
        </section>
      )}

      {/* Key Principles (ideology/movement) */}
      {entity.keyPrinciples && entity.keyPrinciples.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 pb-6">
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-6">
            <h2 className="text-base font-semibold text-white mb-4">핵심 원리</h2>
            <ul className="space-y-2">
              {entity.keyPrinciples.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-300">
                  <span className="text-purple-400 mt-0.5">•</span>{p}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Related Persons */}
      {entity.relatedPersons && entity.relatedPersons.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 pb-6">
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-6">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />관련 인물
            </h2>
            <div className="flex flex-wrap gap-2">
              {entity.relatedPersons.map((pid) => {
                const p = allPersons.find((person) => person.id === pid);
                return (
                  <Link key={pid} href={`/persons/${pid}/`}
                    className="text-sm px-3 py-1.5 rounded-full border border-slate-600/30 text-slate-300 bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                    {p ? p.name.ko : pid}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Related Entities */}
      {entity.relatedEntities && entity.relatedEntities.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 pb-20">
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-6">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />관련 엔터티
            </h2>
            <div className="flex flex-wrap gap-2">
              {entity.relatedEntities.map((eid) => (
                <Link key={eid} href={`/entities/${eid}/`}
                  className="text-sm px-3 py-1.5 rounded-full border border-slate-600/30 text-slate-300 bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                  {getEntityName(eid)}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
