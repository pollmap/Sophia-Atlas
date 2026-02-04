'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  Search,
  Users,
  X,
  BookOpen,
  Quote,
} from 'lucide-react';
import philosophersData from '@/data/persons/philosophers.json';
import {
  cn,
  getEraColor,
  getEraBgColor,
  getEraLabel,
  formatYear,
  getEraColorClass,
  getEraBorderClass,
} from '@/lib/utils';

type Era = 'ancient' | 'medieval' | 'modern' | 'contemporary';

export default function QuestionsPage() {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const philosopherListRef = useRef<HTMLDivElement>(null);

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

  // On mobile, scroll to philosopher list when question is selected
  const handleSelectQuestion = useCallback((question: string) => {
    setSelectedQuestion((prev) => {
      const next = prev === question ? null : question;
      if (next && philosopherListRef.current) {
        // Delay to let state update and render
        setTimeout(() => {
          philosopherListRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }, 100);
      }
      return next;
    });
  }, []);

  const handleBackToQuestions = useCallback(() => {
    setSelectedQuestion(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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
          <div className={cn(
            'flex-1',
            // On mobile, hide question list when a question is selected
            selectedQuestion ? 'hidden lg:block' : 'block'
          )}>
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
                    onClick={() => handleSelectQuestion(q.question)}
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
                      <ChevronRight className={cn(
                        'w-4 h-4 flex-shrink-0 mt-1 transition-colors',
                        isActive ? 'text-modern' : 'text-slate-600 group-hover:text-slate-400'
                      )} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Question - Philosophers */}
          <div
            ref={philosopherListRef}
            className={cn(
              'w-full lg:w-[480px] flex-shrink-0',
              // On mobile, show full width when question is selected
              selectedQuestion ? 'block' : 'hidden lg:block'
            )}
          >
            {selectedQuestion ? (
              <div>
                {/* Mobile back button */}
                <button
                  onClick={handleBackToQuestions}
                  className="lg:hidden flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-4"
                >
                  <ChevronLeft className="w-4 h-4" />
                  질문 목록으로 돌아가기
                </button>

                {/* Selected question header */}
                <div className="rounded-xl border border-modern/30 bg-modern/5 p-5 mb-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">
                        {questionIcons[selectedQuestion] || '?'}
                      </span>
                      <h2 className="text-xl font-bold text-modern">
                        {selectedQuestion}
                      </h2>
                    </div>
                    <button
                      onClick={() => setSelectedQuestion(null)}
                      className="text-slate-500 hover:text-white transition-colors hidden lg:block"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm text-slate-400 mt-2">
                    이 질문을 탐구한 사상가 <span className="text-modern font-semibold">{selectedPhilosophers.length}</span>명
                  </p>
                </div>

                {/* Philosopher cards */}
                <div className="space-y-3">
                  {selectedPhilosophers.map((p) => (
                    <Link
                      key={p.id}
                      href={`/persons/${p.id}/`}
                      className={cn(
                        'group block rounded-xl border bg-slate-800/20 hover:bg-slate-800/40 transition-all duration-200 border-l-4 overflow-hidden',
                        getEraBorderClass(p.era)
                      )}
                    >
                      <div className="p-4 sm:p-5">
                        {/* Name and era badge */}
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-white font-semibold text-base group-hover:text-modern transition-colors">
                              {p.name.ko}
                            </h3>
                            <p className="text-xs text-slate-500">{p.name.en}</p>
                          </div>
                          <span
                            className={cn(
                              'text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ml-2',
                              getEraColorClass(p.era)
                            )}
                          >
                            {getEraLabel(p.era as Era)}
                          </span>
                        </div>

                        {/* Period and region */}
                        <p className="text-xs text-slate-500 mb-3">
                          {formatYear(p.period.start)} ~ {formatYear(p.period.end)}
                          {p.location?.region && (
                            <span className="ml-2 text-slate-600">| {p.location.region}</span>
                          )}
                        </p>

                        {/* Schools */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {p.school.map((s) => (
                            <span
                              key={s}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400"
                            >
                              {s}
                            </span>
                          ))}
                        </div>

                        {/* Summary */}
                        <p className="text-sm text-slate-400 leading-relaxed mb-3">
                          {p.summary}
                        </p>

                        {/* Concepts related to this question */}
                        {p.concepts && p.concepts.length > 0 && (
                          <div className="mb-3">
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-1.5">
                              <BookOpen className="w-3 h-3" />
                              주요 개념
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {p.concepts.slice(0, 5).map((c) => (
                                <span
                                  key={c}
                                  className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                                >
                                  {c}
                                </span>
                              ))}
                              {p.concepts.length > 5 && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/30 text-slate-500">
                                  +{p.concepts.length - 5}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Quote if available */}
                        {p.quotes && p.quotes.length > 0 && (
                          <div className="bg-slate-900/50 rounded-lg p-3 mb-3 border border-slate-700/30">
                            <div className="flex items-start gap-2">
                              <Quote className="w-3 h-3 text-slate-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-slate-400 italic leading-relaxed">
                                  &ldquo;{p.quotes[0].text}&rdquo;
                                </p>
                                {p.quotes[0].source && (
                                  <p className="text-[10px] text-slate-600 mt-1">
                                    - {p.quotes[0].source}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center text-xs text-slate-500 group-hover:text-modern transition-colors">
                          상세 페이지
                          <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-8 text-center sticky top-8">
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
