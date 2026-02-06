import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Lightbulb, BookOpen, Users, Tag, Layers, Network } from 'lucide-react';
import { cn, getEraLabel, getEraColorClass, formatYear, getCategoryHexColor, getEntityTypeLabel, getEntityTypeHexColor, getEntityTypeColors } from '@/lib/utils';
import ExpandableSection from '@/components/common/ExpandableSection';

import eventsData from '@/data/entities/events.json';
import ideologiesData from '@/data/entities/ideologies.json';
import movementsData from '@/data/entities/movements.json';
import institutionsData from '@/data/entities/institutions.json';
import textsData from '@/data/entities/texts.json';
import conceptsData from '@/data/entities/concepts.json';
import archetypesData from '@/data/entities/archetypes.json';
import artMovementsData from '@/data/entities/art-movements.json';
import technologiesData from '@/data/entities/technologies.json';
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
  ...(archetypesData as EntityData[]),
  ...(artMovementsData as EntityData[]),
  ...(technologiesData as EntityData[]),
];

const allPersons: PersonBasic[] = [
  ...(philosophersData as PersonBasic[]),
  ...(religiousFiguresData as PersonBasic[]),
  ...(scientistsData as PersonBasic[]),
  ...(historicalFiguresData as PersonBasic[]),
];


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
  const typeLabel = getEntityTypeLabel(entity.type) || entity.type;
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

  const tc = getEntityTypeColors(entity.type);

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
          <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: getEntityTypeHexColor(entity.type) }} />
          <div className="p-6 md:p-8 pt-8">
            <div className="flex flex-wrap gap-2 mb-4">
              <span
                className="text-xs px-2.5 py-1 rounded-full border font-medium"
                style={{ background: tc?.bg, color: tc?.text, borderColor: tc?.border, fontFamily: "'Pretendard', sans-serif" }}
              >
                {getEntityTypeLabel(entity.type)}
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
          href={`/connections?node=${entity.id}`}
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

      {/* Author (texts) */}
      {entity.author && (() => {
        const authorPerson = allPersons.find((p) => p.id === entity.author);
        return (
          <section className="max-w-4xl mx-auto px-4 pb-6">
            <div className="rounded-xl border p-6" style={{ borderColor: 'var(--fresco-shadow)', background: 'var(--fresco-parchment)' }}>
              <h2 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
                <BookOpen className="w-5 h-5" style={{ color: '#5B7355' }} />저자
              </h2>
              <Link href={`/persons/${entity.author}`} className="text-sm hover:underline" style={{ color: '#4A5D8A' }}>
                {authorPerson ? authorPerson.name.ko : entity.author}
              </Link>
            </div>
          </section>
        );
      })()}

      {/* Founders (institutions/movements) */}
      {entity.founders && entity.founders.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 pb-6">
          <div className="rounded-xl border p-6" style={{ borderColor: 'var(--fresco-shadow)', background: 'var(--fresco-parchment)' }}>
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
              <Users className="w-5 h-5" style={{ color: '#B8860B' }} />설립자/창시자
            </h2>
            <div className="flex flex-wrap gap-2">
              {entity.founders.map((fid) => {
                const p = allPersons.find((person) => person.id === fid);
                return (
                  <Link key={fid} href={`/persons/${fid}`}
                    className="text-sm px-3 py-1.5 rounded-full border hover:opacity-80 transition-colors"
                    style={{ borderColor: 'rgba(184,134,11,0.3)', color: '#B8860B', background: 'rgba(184,134,11,0.08)' }}>
                    {p ? p.name.ko : fid}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Domain + Origin Person (concepts) */}
      {(entity.domain || entity.originPerson) && (
        <section className="max-w-4xl mx-auto px-4 pb-6">
          <div className="rounded-xl border p-6" style={{ borderColor: 'var(--fresco-shadow)', background: 'var(--fresco-parchment)' }}>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>개념 정보</h2>
            <div className="space-y-2 text-sm" style={{ color: 'var(--ink-medium)' }}>
              {entity.domain && <p><span className="font-medium" style={{ color: 'var(--ink-dark)' }}>분야:</span> {entity.domain}</p>}
              {entity.originPerson && (() => {
                const op = allPersons.find((p) => p.id === entity.originPerson);
                return <p><span className="font-medium" style={{ color: 'var(--ink-dark)' }}>기원:</span> <Link href={`/persons/${entity.originPerson}`} className="hover:underline" style={{ color: '#4A5D8A' }}>{op ? op.name.ko : entity.originPerson}</Link></p>;
              })()}
            </div>
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
