'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  MapPin,
  Tag,
  Sparkles,
  Palette,
} from 'lucide-react';
import movementsData from '@/data/entities/movements.json';
import historicalFiguresData from '@/data/persons/historical-figures.json';
import philosophersData from '@/data/persons/philosophers.json';
import personEntityRelationships from '@/data/relationships/person-entity.json';
import {
  cn,
  getEraColor,
  getEraBgColor,
  getEraLabel,
  getEraColorClass,
  getEraBorderClass,
  getEraHexColor,
  formatYear,
  getCategoryBadgeClass,
} from '@/lib/utils';

type Era = 'ancient' | 'medieval' | 'modern' | 'contemporary';

const eras: { value: Era | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'ancient', label: '고대' },
  { value: 'medieval', label: '중세' },
  { value: 'modern', label: '근대' },
  { value: 'contemporary', label: '현대' },
];

export default function CulturalMovementsPage() {
  const [selectedEra, setSelectedEra] = useState<Era | 'all'>('all');

  // Build a lookup map for persons (by id)
  const personsMap = useMemo(() => {
    const map: Record<string, { ko: string; en: string }> = {};
    for (const p of historicalFiguresData) {
      map[p.id] = p.name as { ko: string; en: string };
    }
    for (const p of philosophersData) {
      map[(p as Record<string, unknown>).id as string] = (p as Record<string, unknown>).name as { ko: string; en: string };
    }
    return map;
  }, []);

  const filteredMovements = useMemo(() => {
    const list =
      selectedEra === 'all'
        ? [...movementsData]
        : movementsData.filter(
            (m: Record<string, unknown>) => m.era === selectedEra
          );
    return list.sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
      const periodA = a.period as { start: number };
      const periodB = b.period as { start: number };
      return periodA.start - periodB.start;
    });
  }, [selectedEra]);

  // For each movement, gather related persons from relatedPersons field + relationships
  const getRelatedPersons = (movementId: string, relatedPersonIds: string[]) => {
    const personIds = new Set(relatedPersonIds || []);

    // Also check person-entity relationships
    for (const rel of personEntityRelationships) {
      if (
        (rel as Record<string, unknown>).target === movementId &&
        (rel as Record<string, unknown>).sourceType === 'person'
      ) {
        personIds.add((rel as Record<string, unknown>).source as string);
      }
    }

    return Array.from(personIds)
      .map((id) => ({
        id,
        name: personsMap[id],
      }))
      .filter((p) => p.name);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--fresco-ivory)' }}>
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom right, rgba(122,84,120,0.06), transparent, rgba(107,78,138,0.04))' }} />
        <div className="max-w-5xl mx-auto px-4 pt-8 pb-10 relative">
          <Link
            href="/culture"
            className="inline-flex items-center transition-colors mb-6"
            style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            문화와 예술
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded flex items-center justify-center" style={{ backgroundColor: 'rgba(122,84,120,0.15)' }}>
              <Sparkles className="w-7 h-7" style={{ color: '#7A5478' }} />
            </div>
            <div>
              <h1 className="text-4xl font-bold" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
                문화 사조의 흐름
              </h1>
              <p className="text-lg mt-1" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>
                예술과 사상의 운동
              </p>
            </div>
          </div>

          <p className="max-w-2xl mt-4" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>
            고대부터 현대까지 인류의 사상과 문화를 이끌어온 주요 운동과 학파를
            시간순으로 탐색합니다. 각 운동이 어떤 인물과 사상에 영향을 주고받았는지
            확인해 보세요.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-16">
        {/* Era Filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          {eras.map((era) => (
            <button
              key={era.value}
              onClick={() => setSelectedEra(era.value)}
              className="px-4 py-2 rounded text-sm font-medium transition-all border"
              style={{
                backgroundColor: selectedEra === era.value ? 'rgba(122,84,120,0.15)' : 'var(--fresco-parchment)',
                color: selectedEra === era.value ? '#7A5478' : 'var(--ink-light)',
                borderColor: selectedEra === era.value ? 'rgba(122,84,120,0.3)' : 'var(--fresco-shadow)',
                fontFamily: "'Pretendard', sans-serif",
              }}
            >
              {era.label}
              {era.value !== 'all' && (
                <span className="ml-1.5 text-xs opacity-60">
                  (
                  {
                    movementsData.filter(
                      (m: Record<string, unknown>) => m.era === era.value
                    ).length
                  }
                  )
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Vertical Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px hidden md:block" style={{ background: 'linear-gradient(to bottom, rgba(122,84,120,0.3), var(--fresco-shadow), rgba(122,84,120,0.3))' }} />
          <div className="absolute left-6 top-0 bottom-0 w-px md:hidden" style={{ background: 'linear-gradient(to bottom, rgba(122,84,120,0.3), var(--fresco-shadow), rgba(122,84,120,0.3))' }} />

          <div className="space-y-8">
            {filteredMovements.map(
              (movement: Record<string, unknown>, index: number) => {
                const name = movement.name as {
                  ko: string;
                  en: string;
                  original?: string;
                };
                const period = movement.period as {
                  start: number;
                  end: number;
                };
                const era = movement.era as string;
                const summary = movement.summary as string;
                const location = movement.location as {
                  region: string;
                } | null;
                const tags = (movement.tags as string[]) || [];
                const relatedPersonIds =
                  (movement.relatedPersons as string[]) || [];
                const keyPrinciples =
                  (movement.keyPrinciples as string[]) || [];
                const relatedPersons = getRelatedPersons(
                  movement.id as string,
                  relatedPersonIds
                );

                const isLeft = index % 2 === 0;

                return (
                  <div
                    key={movement.id as string}
                    className={cn(
                      'relative flex items-start',
                      // Desktop alternating layout
                      'md:flex-row',
                      // Mobile always right-aligned
                      'flex-row'
                    )}
                  >
                    {/* Desktop: Left side content (even items) */}
                    <div
                      className={cn(
                        'hidden md:block md:w-1/2',
                        isLeft ? 'pr-12 text-right' : ''
                      )}
                    >
                      {isLeft && (
                        <MovementCard
                          name={name}
                          period={period}
                          era={era}
                          summary={summary}
                          location={location}
                          tags={tags}
                          relatedPersons={relatedPersons}
                          keyPrinciples={keyPrinciples}
                          movementId={movement.id as string}
                          align="right"
                        />
                      )}
                    </div>

                    {/* Timeline Node - Desktop */}
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 z-10 flex-col items-center">
                      <div
                        className="w-4 h-4 rounded-full border-2"
                        style={{
                          backgroundColor: getEraHexColor(era),
                          borderColor: 'var(--fresco-ivory)',
                        }}
                      />
                    </div>

                    {/* Timeline Node - Mobile */}
                    <div className="flex md:hidden absolute left-6 -translate-x-1/2 z-10 flex-col items-center">
                      <div
                        className="w-4 h-4 rounded-full border-2"
                        style={{
                          backgroundColor: getEraHexColor(era),
                          borderColor: 'var(--fresco-ivory)',
                        }}
                      />
                    </div>

                    {/* Desktop: Right side content (odd items) */}
                    <div
                      className={cn(
                        'hidden md:block md:w-1/2',
                        !isLeft ? 'pl-12' : ''
                      )}
                    >
                      {!isLeft && (
                        <MovementCard
                          name={name}
                          period={period}
                          era={era}
                          summary={summary}
                          location={location}
                          tags={tags}
                          relatedPersons={relatedPersons}
                          keyPrinciples={keyPrinciples}
                          movementId={movement.id as string}
                          align="left"
                        />
                      )}
                    </div>

                    {/* Mobile: Always right */}
                    <div className="md:hidden pl-10 w-full">
                      <MovementCard
                        name={name}
                        period={period}
                        era={era}
                        summary={summary}
                        location={location}
                        tags={tags}
                        relatedPersons={relatedPersons}
                        keyPrinciples={keyPrinciples}
                        movementId={movement.id as string}
                        align="left"
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {filteredMovements.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>
              해당 시대의 운동이 없습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function MovementCard({
  name,
  period,
  era,
  summary,
  location,
  tags,
  relatedPersons,
  keyPrinciples,
  movementId,
  align,
}: {
  name: { ko: string; en: string; original?: string };
  period: { start: number; end: number };
  era: string;
  summary: string;
  location: { region: string } | null;
  tags: string[];
  relatedPersons: { id: string; name: { ko: string; en: string } }[];
  keyPrinciples: string[];
  movementId: string;
  align: 'left' | 'right';
}) {
  return (
    <div
      className={cn(
        'rounded p-5 transition-all group',
        align === 'right' ? 'md:text-right' : ''
      )}
      style={{ backgroundColor: 'var(--fresco-parchment)', border: '1px solid var(--fresco-shadow)' }}
    >
      {/* Era Badge + Period */}
      <div
        className={cn(
          'flex items-center gap-2 mb-3 flex-wrap',
          align === 'right' ? 'md:justify-end' : ''
        )}
      >
        <span
          className={cn(
            'text-xs px-2 py-0.5 rounded-full font-medium',
            getEraColorClass(era)
          )}
        >
          {getEraLabel(era)}
        </span>
        <span className="text-xs flex items-center gap-1" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>
          <Calendar className="w-3 h-3" />
          {formatYear(period.start)} ~ {formatYear(period.end)}
        </span>
      </div>

      {/* Title */}
      <Link href={`/entities/${movementId}`}>
        <h3 className="text-lg font-bold transition-colors" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
          {name.ko}
        </h3>
      </Link>
      <p className="text-xs mt-0.5" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>
        {name.en}
        {name.original && name.original !== name.en && (
          <span className="ml-1" style={{ color: 'var(--ink-faded)' }}>({name.original})</span>
        )}
      </p>

      {/* Location */}
      {location && (
        <div
          className={cn(
            'flex items-center gap-1 mt-2 text-xs',
            align === 'right' ? 'md:justify-end' : ''
          )}
          style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}
        >
          <MapPin className="w-3 h-3" />
          {location.region}
        </div>
      )}

      {/* Summary */}
      <p
        className={cn(
          'text-sm mt-3 leading-relaxed',
          align === 'right' ? 'md:text-right' : ''
        )}
        style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}
      >
        {summary}
      </p>

      {/* Key Principles */}
      {keyPrinciples.length > 0 && (
        <div className="mt-3">
          <div
            className={cn(
              'flex flex-wrap gap-1',
              align === 'right' ? 'md:justify-end' : ''
            )}
          >
            {keyPrinciples.slice(0, 3).map((principle: string) => (
              <span
                key={principle}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'rgba(122,84,120,0.1)', color: '#7A5478', border: '1px solid rgba(122,84,120,0.2)', fontFamily: "'Pretendard', sans-serif" }}
              >
                {principle}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div
          className={cn(
            'flex flex-wrap gap-1 mt-2',
            align === 'right' ? 'md:justify-end' : ''
          )}
        >
          {tags.slice(0, 4).map((tag: string) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--fresco-aged)', color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Related Persons */}
      {relatedPersons.length > 0 && (
        <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--fresco-shadow)' }}>
          <div
            className={cn(
              'text-xs mb-2',
              align === 'right' ? 'md:text-right' : ''
            )}
            style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}
          >
            관련 인물
          </div>
          <div
            className={cn(
              'flex flex-wrap gap-2',
              align === 'right' ? 'md:justify-end' : ''
            )}
          >
            {relatedPersons.map(
              (person: { id: string; name: { ko: string; en: string } }) => (
                <Link
                  key={person.id}
                  href={`/persons/${person.id}`}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded transition-all border border-transparent"
                  style={{ backgroundColor: 'var(--fresco-aged)', color: 'var(--ink-medium)', fontFamily: "'Pretendard', sans-serif" }}
                >
                  <ChevronRight className="w-3 h-3" />
                  {person.name.ko}
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
