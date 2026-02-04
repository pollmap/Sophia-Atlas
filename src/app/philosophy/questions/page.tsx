'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  Search,
  Tag,
  Users,
  X,
} from 'lucide-react';
import philosophersData from '@/data/persons/philosophers.json';
import {
  cn,
  getEraColor,
  getEraBgColor,
  getEraLabel,
  formatYear,
} from '@/lib/utils';
import { getEraColorClass, getEraBorderClass } from '@/lib/utils';

type Era = 'ancient' | 'medieval' | 'modern' | 'contemporary';

export default function QuestionsPage() {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Extract all unique questions
  const allQuestions = useMemo(() => {
    const qMap = new Map<string, string[]>();
    philosophersData.forEach((p) => {
      p.questions.forEach((q) => {
        if (!qMap.has(q)) qMap.set(q, []);
        qMap.get(q)!.push(p.id);
      });
    });
    return Array.from(qMap.entries())
      .map(([question, philosopherIds]) => ({ question, philosopherIds }))
      .sort((a, b) => b.philosopherIds.length - a.philosopherIds.length);
  }, []);

  const filteredQuestions = useMemo(() => {
    if (!searchTerm) return allQuestions;
    return allQuestions.filter((q) =>
      q.question.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allQuestions, searchTerm]);

  // Philosophers for selected question
  const selectedPhilosophers = useMemo(() => {
    if (!selectedQuestion) return [];
    const qData = allQuestions.find((q) => q.question === selectedQuestion);
    if (!qData) return [];
    return qData.philosopherIds
      .map((id) => philosophersData.find((p) => p.id === id))
      .filter(Boolean) as (typeof philosophersData)[number][];
  }, [selectedQuestion, allQuestions]);

  const questionIcons: Record<string, string> = {
    '존재란 무엇인가?': '🌌',
    '선이란 무엇인가?': '⚖️',
    '지식이란 무엇인가?': '📚',
    '아름다움이란?': '🎨',
    '신은 존재하는가?': '✨',
    '행복이란?': '☀️',
    '자유란?': '🕊️',
    '정의란?': '⚔️',
    '영혼은 있는가?': '💫',
    '진리란?': '🔍',
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          홈으로
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <HelpCircle className="w-8 h-8 text-modern" />
          근본 질문으로 탐색하기
        </h1>
        <p className="text-slate-400">
          인류가 던져온 근본적 질문들을 통해 사상가들의 사유를 탐색하세요
        </p>
      </div>

      {/* Search */}
      <div className="max-w-7xl mx-auto px-4 pb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="질문 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 transition-all"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Questions Grid */}
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-slate-400" />
              질문 목록
              <span className="text-sm font-normal text-slate-500">
                ({filteredQuestions.length}개)
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredQuestions.map((q) => {
                const isActive = selectedQuestion === q.question;
                const icon = questionIcons[q.question] || '?';
                return (
                  <button
                    key={q.question}
                    onClick={() =>
                      setSelectedQuestion(isActive ? null : q.question)
                    }
                    className={cn(
                      'group text-left rounded-xl border p-5 transition-all duration-200',
                      isActive
                        ? 'border-modern bg-modern/10'
                        : 'border-slate-700/50 bg-slate-800/20 hover:bg-slate-800/40 hover:border-slate-600/50'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">{icon}</span>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={cn(
                            'font-semibold transition-colors',
                            isActive ? 'text-modern' : 'text-white group-hover:text-modern'
                          )}
                        >
                          {q.question}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                          <Users className="w-3 h-3" />
                          <span>{q.philosopherIds.length}명의 사상가</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Question - Philosophers */}
          <div className="w-full lg:w-96 flex-shrink-0">
            {selectedQuestion ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-modern">
                    {selectedQuestion}
                  </h2>
                  <button
                    onClick={() => setSelectedQuestion(null)}
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-slate-500 mb-4">
                  이 질문을 탐구한 사상가 {selectedPhilosophers.length}명
                </p>
                <div className="space-y-3">
                  {selectedPhilosophers.map((p) => (
                    <Link
                      key={p.id}
                      href={`/philosophy/${p.id}/`}
                      className={cn(
                        'group block rounded-xl border bg-slate-800/20 p-4 hover:bg-slate-800/40 transition-all duration-200 border-l-4',
                        getEraBorderClass(p.era)
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-white font-semibold group-hover:text-ancient transition-colors">
                            {p.name.ko}
                          </h3>
                          <p className="text-xs text-slate-500">{p.name.en}</p>
                        </div>
                        <span
                          className={cn(
                            'text-[10px] px-2 py-0.5 rounded-full font-medium',
                            getEraColorClass(p.era)
                          )}
                        >
                          {getEraLabel(p.era as Era)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 mb-2">
                        {formatYear(p.period.start)} ~{' '}
                        {formatYear(p.period.end)}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {p.school.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400"
                          >
                            {s}
                          </span>
                        ))}
                      </div>

                      <p className="text-sm text-slate-400 line-clamp-2">
                        {p.summary}
                      </p>

                      <div className="mt-2 flex items-center text-xs text-slate-500 group-hover:text-ancient transition-colors">
                        상세 페이지
                        <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-8 text-center">
                <HelpCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">
                  왼쪽에서 질문을 선택하면
                  <br />
                  관련 사상가들이 표시됩니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
