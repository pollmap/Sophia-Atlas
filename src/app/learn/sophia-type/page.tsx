"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Brain, ChevronRight, RotateCcw, Share2, Users, BookOpen, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import testData from "@/data/sophia-type-test.json";

type Phase = "intro" | "test" | "result";

interface Scores {
  [key: string]: number; // axis id → score (negative = left, positive = right)
}

export default function SophiaTypePage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState<Scores>({});
  const [answers, setAnswers] = useState<Record<number, "A" | "B">>({});

  const questions = testData.questions;
  const axes = testData.axes;
  const types = testData.types;

  // Format code as MBTI-style "XXXX-X" (4 letters + hyphen + 1 letter)
  const formatCode = (code: string) => code.length === 5 ? `${code.slice(0, 4)}-${code[4]}` : code;

  // Calculate type code from scores
  const typeCode = useMemo(() => {
    return axes.map((axis) => {
      const score = scores[axis.id] || 0;
      return score <= 0 ? axis.left.code : axis.right.code;
    }).join("");
  }, [scores, axes]);

  // Find matching type
  const resultType = useMemo(() => {
    const exact = types.find((t) => t.code === typeCode);
    if (exact) return exact;
    // Closest match by code similarity
    let best = types[0];
    let bestScore = 0;
    for (const t of types) {
      let match = 0;
      for (let i = 0; i < t.code.length && i < typeCode.length; i++) {
        if (t.code[i] === typeCode[i]) match++;
      }
      if (match > bestScore) { bestScore = match; best = t; }
    }
    return best;
  }, [typeCode, types]);

  const handleAnswer = (choice: "A" | "B") => {
    const q = questions[currentQ];
    const delta = choice === "A" ? -1 : 1;
    setScores((prev) => ({
      ...prev,
      [q.axis]: (prev[q.axis] || 0) + delta,
    }));
    setAnswers((prev) => ({ ...prev, [currentQ]: choice }));

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setPhase("result");
    }
  };

  const restart = () => {
    setPhase("intro");
    setCurrentQ(0);
    setScores({});
    setAnswers({});
  };

  const progress = ((currentQ + 1) / questions.length) * 100;
  const currentAxis = questions[currentQ]?.axis;
  const axisLabel = axes.find((a) => a.id === currentAxis);

  // Intro screen
  if (phase === "intro") {
    return (
      <div className="section-container py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-medieval/10 flex items-center justify-center">
              <Brain className="w-10 h-10 text-medieval" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-ink-dark font-display mb-4">
            나의 사상 성향 테스트
          </h1>
          <p className="text-lg text-ink-medium mb-2">Sophia Type Indicator</p>
          <p className="text-ink-medium mb-8 leading-relaxed">
            20개의 질문에 답하고, 당신의 사상적 성향을 발견하세요.
            <br />
            나와 비슷한 생각을 가진 사상가, 전통, 학습 경로를 추천해드립니다.
          </p>

          <div className="grid grid-cols-5 gap-3 mb-8 max-w-lg mx-auto">
            {axes.map((axis) => (
              <div key={axis.id} className="text-center">
                <div className="text-xs font-medium text-ink-dark mb-1">{axis.left.label}</div>
                <div className="h-1 rounded bg-fresco-shadow" />
                <div className="text-xs font-medium text-ink-dark mt-1">{axis.right.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => setPhase("test")}
              className="px-8 py-3 rounded-xl bg-medieval text-white font-medium hover:bg-medieval/90 transition-colors"
            >
              테스트 시작하기
            </button>
            <span className="text-xs text-ink-faded">약 3~5분 소요 · 20문항 · 32가지 유형</span>
          </div>
        </div>
      </div>
    );
  }

  // Test screen
  if (phase === "test") {
    const q = questions[currentQ];
    return (
      <div className="section-container py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-ink-medium">
                Q{currentQ + 1} / {questions.length} · {axisLabel?.left.label} ↔ {axisLabel?.right.label}
              </span>
              <span className="text-sm text-ink-faded">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 rounded-full bg-fresco-shadow overflow-hidden">
              <div
                className="h-full rounded-full bg-medieval transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <h2 className="text-xl md:text-2xl font-semibold text-ink-dark font-display mb-8 text-center leading-relaxed">
            {q.text}
          </h2>

          {/* Options */}
          <div className="space-y-4">
            <button
              onClick={() => handleAnswer("A")}
              className={cn(
                "w-full p-5 rounded-xl border-2 text-left transition-all duration-200",
                "hover:border-medieval/50 hover:bg-medieval/5",
                answers[currentQ] === "A"
                  ? "border-medieval bg-medieval/10"
                  : "border-fresco-shadow"
              )}
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-medieval/10 text-medieval flex items-center justify-center text-sm font-bold">A</span>
                <span className="text-ink-dark leading-relaxed">{q.optionA}</span>
              </div>
            </button>

            <button
              onClick={() => handleAnswer("B")}
              className={cn(
                "w-full p-5 rounded-xl border-2 text-left transition-all duration-200",
                "hover:border-gold/50 hover:bg-gold/5",
                answers[currentQ] === "B"
                  ? "border-gold bg-gold/10"
                  : "border-fresco-shadow"
              )}
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gold/10 text-gold flex items-center justify-center text-sm font-bold">B</span>
                <span className="text-ink-dark leading-relaxed">{q.optionB}</span>
              </div>
            </button>
          </div>

          {/* Back */}
          {currentQ > 0 && (
            <button
              onClick={() => setCurrentQ(currentQ - 1)}
              className="mt-6 text-sm text-ink-faded hover:text-ink-medium transition-colors"
            >
              ← 이전 질문으로
            </button>
          )}
        </div>
      </div>
    );
  }

  // Result screen
  return (
    <div className="section-container py-8">
      <div className="max-w-2xl mx-auto">
        {/* Result Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-medieval/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-medieval" />
            </div>
          </div>
          <p className="text-sm text-ink-faded mb-2">당신의 사상 유형은</p>
          <h1 className="text-3xl font-bold text-ink-dark font-display mb-1">
            {resultType.name}
          </h1>
          <p className="text-lg text-medieval font-medium mb-1">{resultType.subtitle}</p>
          <p className="text-sm text-ink-faded font-mono">{formatCode(resultType.code)}</p>
        </div>

        {/* Type Description */}
        <div className="p-6 rounded-2xl border border-fresco-shadow bg-fresco-aged/20 mb-6">
          <p className="text-ink-dark leading-relaxed">{resultType.description}</p>
        </div>

        {/* Axis Breakdown */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-ink-dark mb-4">성향 분석</h3>
          <div className="space-y-3">
            {axes.map((axis) => {
              const score = scores[axis.id] || 0;
              const maxScore = questions.filter((q) => q.axis === axis.id).length;
              const pct = ((score + maxScore) / (maxScore * 2)) * 100;
              return (
                <div key={axis.id}>
                  <div className="flex justify-between text-xs text-ink-medium mb-1">
                    <span className={cn(score <= 0 && "font-bold text-medieval")}>{axis.left.label}</span>
                    <span className={cn(score > 0 && "font-bold text-gold")}>{axis.right.label}</span>
                  </div>
                  <div className="h-3 rounded-full bg-fresco-shadow overflow-hidden relative">
                    <div className="absolute inset-0 flex">
                      <div className="bg-medieval/60 rounded-l-full" style={{ width: `${100 - pct}%` }} />
                      <div className="bg-gold/60 rounded-r-full" style={{ width: `${pct}%` }} />
                    </div>
                    <div
                      className="absolute top-0 h-full w-1 bg-ink-dark rounded"
                      style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Matching Persons */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-ink-dark mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-medieval" />
            나와 비슷한 사상가
          </h3>
          <div className="flex flex-wrap gap-2">
            {resultType.persons.map((pid) => (
              <Link
                key={pid}
                href={`/persons/${pid}`}
                className="px-3 py-1.5 rounded-lg border border-fresco-shadow text-sm text-ink-dark hover:border-medieval/40 hover:bg-medieval/5 transition-colors"
              >
                {pid.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </Link>
            ))}
          </div>
        </div>

        {/* Matching Traditions */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-ink-dark mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-gold" />
            관련 전통·사상
          </h3>
          <div className="flex flex-wrap gap-2">
            {resultType.traditions.map((tid) => (
              <Link
                key={tid}
                href={`/entities/${tid}`}
                className="px-3 py-1.5 rounded-lg border border-fresco-shadow text-sm text-ink-dark hover:border-gold/40 hover:bg-gold/5 transition-colors"
              >
                {tid.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </Link>
            ))}
          </div>
        </div>

        {/* Recommended Learning Paths */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-ink-dark mb-3 flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-modern" />
            추천 학습 경로
          </h3>
          <div className="space-y-2">
            {resultType.learningPaths.map((lpid) => (
              <Link
                key={lpid}
                href="/learn"
                className="block p-3 rounded-xl border border-fresco-shadow hover:border-modern/40 hover:bg-modern/5 transition-colors"
              >
                <span className="text-sm text-ink-dark">{lpid.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={restart}
            className="px-5 py-2.5 rounded-xl border border-fresco-shadow text-sm text-ink-medium hover:bg-fresco-aged/30 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            다시 하기
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `나의 사상 유형: ${resultType.name}`,
                  text: `Sophia Type Test 결과 — ${resultType.name} (${formatCode(resultType.code)}): ${resultType.description}`,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(
                  `나의 사상 유형: ${resultType.name} (${formatCode(resultType.code)}) — ${resultType.subtitle}\n${window.location.href}`
                );
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-medieval text-white text-sm hover:bg-medieval/90 transition-colors flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            결과 공유
          </button>
          <Link
            href="/connections"
            className="px-5 py-2.5 rounded-xl border border-medieval/30 text-sm text-medieval hover:bg-medieval/5 transition-colors"
          >
            인드라망에서 탐색 →
          </Link>
        </div>
      </div>
    </div>
  );
}
