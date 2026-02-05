import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Lightbulb, BookOpen, Users, Tag, Layers, Network } from 'lucide-react';
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
const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  event: { bg: 'rgba(139, 64, 64, 0.1)', text: '#8B4040', border: 'rgba(139, 64, 64, 0.3)' },
  ideology: { bg: 'rgba(107, 78, 138, 0.1)', text: '#6B4E8A', border: 'rgba(107, 78, 138, 0.3)' },
  movement: { bg: 'rgba(74, 93, 138, 0.1)', text: '#4A5D8A', border: 'rgba(74, 93, 138, 0.3)' },
  institution: { bg: 'rgba(184, 134, 11, 0.1)', text: '#B8860B', border: 'rgba(184, 134, 11, 0.3)' },
  text: { bg: 'rgba(91, 115, 85, 0.1)', text: '#5B7355', border: 'rgba(91, 115, 85, 0.3)' },
  concept: { bg: 'rgba(74, 122, 107, 0.1)', text: '#4A7A6B', border: 'rgba(74, 122, 107, 0.3)' },
};
const typeHex: Record<string, string> = {
  event: '#8B4040', ideology: '#6B4E8A', movement: '#4A5D8A',
  institution: '#B8860B', text: '#5B7355', concept: '#4A7A6B',
};

export function generateStaticParams() {
  return allEntities.map((e) => ({ id: e.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const entity = allEntities.find((e) => e.id === id);
  if (!entity) return { title: 'Sophia Atlas' };
  const typeLabel = typeLabels[entity.type] || entity.type;
  return {
    title: `${entity.name.ko} (${entity.name.en}) — Sophia Atlas`,
    description: entity.summary,
    keywords: [entity.name.ko, entity.name.en, typeLabel, ...entity.tags],
    openGraph: {
      title: `${entity.name.ko} — ${typeLabel} | Sophia Atlas`,
      description: entity.summary,
      type: 'article',
      locale: 'ko_KR',
    },
  };
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--fresco-ivory)' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>주제를 찾을 수 없습니다</h1>
          <Link href="/entities" className="hover:opacity-80" style={{ color: '#6B4E8A' }}>주제 목록으로</Link>
        </div>
      </div>
    );
  }

  const tc = typeColors[entity.type];

  return (
    <div className="min-h-screen" style={{ background: 'var(--fresco-ivory)' }}>
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <Link href="/entities" className="inline-flex items-center gap-1.5 text-sm hover:opacity-80 transition-colors" style={{ color: 'var(--ink-light)' }}>
          <ArrowLeft className="w-4 h-4" />
          주제 목록으로
        </Link>
      </div>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="relative rounded border overflow-hidden" style={{ borderColor: 'var(--fresco-shadow)', background: 'var(--fresco-parchment)' }}>
          <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: typeHex[entity.type] || '#6B6358' }} />
          <div className="p-6 md:p-8 pt-8">
            <div className="flex flex-wrap gap-2 mb-4">
              <span
                className="text-xs px-2.5 py-1 rounded-full border font-medium"
                style={{ background: tc?.bg, color: tc?.text, borderColor: tc?.border, fontFamily: "'Pretendard', sans-serif" }}
              >
                {typeLabels[entity.type]}
              </span>
              {entity.era && (
                <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', getEraColorClass(entity.era))} style={{ fontFamily: "'Pretendard', sans-serif" }}>
                  {getEraLabel(entity.era)}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-1" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>{entity.name.ko}</h1>
            <p className="text-lg" style={{ color: 'var(--ink-light)' }}>{entity.name.en}</p>
            {entity.name.original && entity.name.original !== entity.name.en && (
              <p className="text-sm italic" style={{ color: 'var(--ink-light)' }}>{entity.name.original}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm" style={{ color: 'var(--ink-light)' }}>
              {entity.period && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" style={{ color: 'var(--ink-light)' }} />
                  {formatYear(entity.period.start)}
                  {entity.period.end !== entity.period.start && ` ~ ${formatYear(entity.period.end)}`}
                </span>
              )}
              {entity.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" style={{ color: 'var(--ink-light)' }} />
                  {entity.location.region}
                </span>
              )}
              {entity.domain && <span style={{ color: '#4A7A6B' }}>{entity.domain}</span>}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {entity.tags.map((t) => (
                <span key={t} className="text-xs px-2.5 py-1 rounded-full border" style={{ background: 'var(--fresco-aged)', color: 'var(--ink-medium)', borderColor: 'var(--fresco-shadow)' }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* IndraNet Link */}
      <section className="max-w-4xl mx-auto px-4 pb-4">
        <Link
          href="/connections"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors hover:opacity-80"
          style={{
            backgroundColor: 'rgba(184,134,11,0.08)',
            color: 'var(--gold)',
            borderRadius: '4px',
            border: '1px solid rgba(184,134,11,0.2)',
            fontFamily: "'Pretendard', sans-serif",
          }}
        >
          <Network className="w-4 h-4" />
          인드라망에서 연결 관계 보기
        </Link>
      </section>

      {/* Summary */}
      <section className="max-w-4xl mx-auto px-4 pb-6">
        <div className="rounded-xl border p-6" style={{ borderColor: 'var(--fresco-shadow)', background: 'var(--fresco-parchment)' }}>
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
            <Lightbulb className="w-5 h-5" style={{ color: '#B8860B' }} />요약
          </h2>
          <p className="leading-relaxed" style={{ color: 'var(--ink-medium)' }}>{entity.summary}</p>
        </div>
      </section>

      {/* Detailed */}
      {entity.detailed && (
        <section className="max-w-4xl mx-auto px-4 pb-6">
          <ExpandableSection title="상세 설명" icon={<BookOpen className="w-5 h-5" style={{ color: '#6B4E8A' }} />}>
            <p className="leading-relaxed whitespace-pre-line" style={{ color: 'var(--ink-medium)' }}>{entity.detailed}</p>
          </ExpandableSection>
        </section>
      )}

      {/* Significance (events) */}
      {entity.significance && (
        <section className="max-w-4xl mx-auto px-4 pb-6">
          <div className="rounded-xl border p-6" style={{ borderColor: 'var(--fresco-shadow)', background: 'var(--fresco-parchment)' }}>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>역사적 의의</h2>
            <p className="leading-relaxed" style={{ color: 'var(--ink-medium)' }}>{entity.significance}</p>
          </div>
        </section>
      )}

      {/* Key Principles (ideology/movement) */}
      {entity.keyPrinciples && entity.keyPrinciples.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 pb-6">
          <div className="rounded-xl border p-6" style={{ borderColor: 'var(--fresco-shadow)', background: 'var(--fresco-parchment)' }}>
            <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>핵심 원리</h2>
            <ul className="space-y-2">
              {entity.keyPrinciples.map((p, i) => (
                <li key={i} className="flex items-start gap-2" style={{ color: 'var(--ink-medium)' }}>
                  <span style={{ color: '#6B4E8A' }} className="mt-0.5">&#8226;</span>{p}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Related Persons */}
      {entity.relatedPersons && entity.relatedPersons.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 pb-6">
          <div className="rounded-xl border p-6" style={{ borderColor: 'var(--fresco-shadow)', background: 'var(--fresco-parchment)' }}>
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
              <Users className="w-5 h-5" style={{ color: '#4A5D8A' }} />관련 인물
            </h2>
            <div className="flex flex-wrap gap-2">
              {entity.relatedPersons.map((pid) => {
                const p = allPersons.find((person) => person.id === pid);
                return (
                  <Link key={pid} href={`/persons/${pid}`}
                    className="text-sm px-3 py-1.5 rounded-full border hover:opacity-80 transition-colors"
                    style={{ borderColor: 'var(--fresco-shadow)', color: 'var(--ink-medium)', background: 'var(--fresco-aged)' }}>
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
          <div className="rounded-xl border p-6" style={{ borderColor: 'var(--fresco-shadow)', background: 'var(--fresco-parchment)' }}>
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
              <Layers className="w-5 h-5" style={{ color: '#6B4E8A' }} />관련 주제
            </h2>
            <div className="flex flex-wrap gap-2">
              {entity.relatedEntities.map((eid) => (
                <Link key={eid} href={`/entities/${eid}`}
                  className="text-sm px-3 py-1.5 rounded-full border hover:opacity-80 transition-colors"
                  style={{ borderColor: 'var(--fresco-shadow)', color: 'var(--ink-medium)', background: 'var(--fresco-aged)' }}>
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
