"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Brain, ChevronRight, RotateCcw, Share2, Users, BookOpen, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPersonById, getEntityById } from "@/lib/data-loader";
import testData from "@/data/sophia-type-test.json";

// 데이터에 없는 인물/엔터티 ID의 한국어 이름 매핑
const personNameFallback: Record<string, string> = {
  "karl-popper": "칼 포퍼",
  "bertrand-russell": "버트런드 러셀",
  "david-hume": "데이비드 흄",
  "simone-de-beauvoir": "시몬 드 보부아르",
  "durkheim": "에밀 뒤르켐",
  "john-dewey": "존 듀이",
  "jurgen-habermas": "위르겐 하버마스",
  "whitehead": "알프레드 노스 화이트헤드",
  "gustavo-gutierrez": "구스타보 구티에레스",
  "dorothy-day": "도로시 데이",
  "william-blake": "윌리엄 블레이크",
  "henry-david-thoreau": "헨리 데이비드 소로",
  "emma-goldman": "엠마 골드만",
  "gary-snyder": "게리 스나이더",
  "wendell-berry": "웬델 베리",
  "chief-seattle": "시애틀 추장",
  "ivan-illich": "이반 일리치",
  "bell-hooks": "벨 훅스",
  "antonio-gramsci": "안토니오 그람시",
  "alan-watts": "앨런 왓츠",
  "ram-dass": "람 다스",
  "george-gurdjieff": "게오르기 구르지예프",
  "osho": "오쇼 라즈니쉬",
  "ken-wilber": "켄 윌버",
  "terence-mckenna": "테렌스 매케나",
  "teresa-of-avila": "아빌라의 테레사",
  "martin-buber": "마르틴 부버",
  "teilhard-de-chardin": "테야르 드 샤르댕",
  "thomas-berry": "토머스 베리",
  "bede-griffiths": "비드 그리피스",
  "isaiah-berlin": "아이자이아 벌린",
  "murray-bookchin": "머레이 북친",
  "vandana-shiva": "반다나 시바",
  "joanna-macy": "조안나 메이시",
  "wangari-maathai": "왕가리 마타이",
  "slavoj-zizek": "슬라보예 지제크",
  "paul-tillich": "파울 틸리히",
  "carl-jung": "카를 융",
  "huston-smith": "휴스턴 스미스",
  "ilya-prigogine": "일리야 프리고진",
  "stuart-kauffman": "스튜어트 카우프만",
  "bruno-latour": "브뤼노 라투르",
  "gregory-bateson": "그레고리 베이트슨",
  "felix-guattari": "펠릭스 가타리",
  "aldo-leopold": "알도 레오폴드",
  "robin-wall-kimmerer": "로빈 월 키머러",
  "buckminster-fuller": "벅민스터 풀러",
  "steven-pinker": "스티븐 핑커",
  "sri-aurobindo": "스리 오로빈도",
  "jurgen-moltmann": "위르겐 몰트만",
  "hans-kung": "한스 큉",
  "tariq-ramadan": "타리크 라마단",
};

const entityNameFallback: Record<string, string> = {
  "analytic-philosophy": "분석철학",
  "critical-theory": "비판이론",
  "communitarianism": "공동체주의",
  "christian-mysticism": "기독교 신비주의",
  "perennial-philosophy": "영원의 철학",
  "liberation-theology": "해방신학",
  "nonviolence": "비폭력주의",
  "prophetic-tradition": "예언자적 전통",
  "indigenous-traditions": "토착 전통",
  "critical-pedagogy": "비판적 교육학",
  "integral-theory": "통합 이론",
  "contemplative-christianity": "관상 기독교",
  "interfaith-dialogue": "종교간 대화",
  "integral-yoga": "통합 요가",
  "process-theology": "과정신학",
  "social-ecology": "사회생태학",
  "systematic-theology": "조직신학",
  "depth-psychology": "심층심리학",
  "comparative-religion": "비교종교학",
  "systems-thinking": "시스템 사고",
  "progressivism": "진보주의",
  "poststructuralism": "후기구조주의",
  "new-materialism": "신유물론",
  "islamic-modernism": "이슬람 근대주의",
  "virtue-ethics": "덕 윤리학",
  "process-philosophy": "과정철학",
  "progressive-theology": "진보신학",
};

const learningPathNames: Record<string, string> = {
  "east-west-dialogue": "동서양 사상 대화",
  "eastern-philosophy": "동양철학의 세계",
  "existentialism": "실존주의 탐험",
  "influence-chains": "영향의 사슬 탐험",
  "logic-basics": "논리학의 모험",
  "philosophy-intro": "철학 입문",
  "scientific-revolution": "과학혁명의 여정",
  "western-philosophy": "서양철학사 여행",
  "world-religions": "세계 종교 이해",
};

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
            25개의 질문에 답하고, 당신의 사상적 성향을 발견하세요.
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
            <span className="text-xs text-ink-faded">약 3~5분 소요 · 25문항 · 32가지 유형</span>
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
              const leftPct = Math.round(100 - pct);
              const rightPct = Math.round(pct);
              const leftDominant = score <= 0;
              return (
                <div key={axis.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={cn(
                      "flex items-center gap-1.5",
                      leftDominant ? "font-bold text-medieval" : "text-ink-faded"
                    )}>
                      {axis.left.label}
                      <span className="tabular-nums text-[10px]">{leftPct}%</span>
                    </span>
                    <span className={cn(
                      "flex items-center gap-1.5",
                      !leftDominant ? "font-bold text-amber-500" : "text-ink-faded"
                    )}>
                      <span className="tabular-nums text-[10px]">{rightPct}%</span>
                      {axis.right.label}
                    </span>
                  </div>
                  <div className="h-5 rounded-full overflow-hidden flex gap-0.5">
                    <div
                      className={cn(
                        "rounded-l-full transition-all duration-500",
                        leftDominant ? "bg-medieval" : "bg-medieval/20"
                      )}
                      style={{ width: `${100 - pct}%` }}
                    />
                    <div
                      className={cn(
                        "rounded-r-full transition-all duration-500",
                        !leftDominant ? "bg-amber-500" : "bg-amber-500/20"
                      )}
                      style={{ width: `${pct}%` }}
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
            {resultType.persons.map((pid) => {
              const person = getPersonById(pid);
              return (
                <Link
                  key={pid}
                  href={`/persons/${pid}`}
                  className="px-3 py-1.5 rounded-lg border border-fresco-shadow text-sm text-ink-dark hover:border-medieval/40 hover:bg-medieval/5 transition-colors"
                >
                  {person?.name.ko || personNameFallback[pid] || pid.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Matching Traditions */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-ink-dark mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-gold" />
            관련 전통·사상
          </h3>
          <div className="flex flex-wrap gap-2">
            {resultType.traditions.map((tid) => {
              const entity = getEntityById(tid);
              return (
                <Link
                  key={tid}
                  href={`/entities/${tid}`}
                  className="px-3 py-1.5 rounded-lg border border-fresco-shadow text-sm text-ink-dark hover:border-gold/40 hover:bg-gold/5 transition-colors"
                >
                  {entity?.name.ko || entityNameFallback[tid] || tid.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </Link>
              );
            })}
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
                <span className="text-sm text-ink-dark">{learningPathNames[lpid] || lpid.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</span>
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
