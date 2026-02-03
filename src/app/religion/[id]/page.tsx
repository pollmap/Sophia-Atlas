import Link from "next/link";
import {
  ArrowLeft,
  Landmark,
  Scroll,
  MapPin,
  Calendar,
  Globe,
  GitBranch,
  Sparkles,
  Skull,
  Sword,
  Scale,
  Tag,
} from "lucide-react";
import religionsData from "@/data/religions.json";
import { cn, formatYear } from "@/lib/utils";
import ExpandableSection from "@/components/common/ExpandableSection";

const BASE_PATH = "/Sophia-Atlas";

export function generateStaticParams() {
  return religionsData.map((religion) => ({
    id: religion.id,
  }));
}

const themeConfig: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  creation: {
    label: "창조신화",
    icon: <Sparkles className="w-5 h-5" />,
    color: "text-amber-400",
  },
  afterlife: {
    label: "사후세계",
    icon: <Skull className="w-5 h-5" />,
    color: "text-purple-400",
  },
  heroMyth: {
    label: "영웅서사",
    icon: <Sword className="w-5 h-5" />,
    color: "text-red-400",
  },
  ethics: {
    label: "윤리/계율",
    icon: <Scale className="w-5 h-5" />,
    color: "text-teal-400",
  },
};

export default async function ReligionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const religion = religionsData.find((r) => r.id === id);

  if (!religion) {
    return (
      <div className="section-container py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          페이지를 찾을 수 없습니다
        </h1>
        <Link
          href={`${BASE_PATH}/religion/map/`}
          className="text-purple-400 hover:text-purple-300 transition-colors"
        >
          종교/신화 지도로 돌아가기
        </Link>
      </div>
    );
  }

  const isReligion = religion.type === "religion";

  return (
    <div className="section-container py-8 md:py-12">
      {/* Back Button */}
      <Link
        href={`${BASE_PATH}/religion/map/`}
        className="inline-flex items-center gap-2 text-sm text-foreground-secondary hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        종교/신화 지도로 돌아가기
      </Link>

      {/* Hero Section */}
      <div className="border border-border rounded-2xl bg-background-secondary/30 p-6 md:p-8 mb-8">
        <div className="flex items-start gap-4 mb-4">
          <div
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0",
              isReligion
                ? "bg-amber-500/10 text-amber-400"
                : "bg-emerald-500/10 text-emerald-400"
            )}
          >
            {isReligion ? (
              <Landmark className="w-6 h-6" />
            ) : (
              <Scroll className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {religion.name.ko}
              </h1>
              <span className="text-lg text-foreground-muted">
                {religion.name.en}
              </span>
            </div>
            <span
              className={cn(
                "inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium",
                isReligion
                  ? "bg-amber-500/15 text-amber-400"
                  : "bg-emerald-500/15 text-emerald-400"
              )}
            >
              {isReligion ? "종교" : "신화"}
            </span>
          </div>
        </div>

        {/* Summary */}
        <p className="text-foreground-secondary leading-relaxed text-base">
          {religion.summary}
        </p>
      </div>

      {/* Detailed Section */}
      <div className="mb-8">
        <ExpandableSection title="상세 해설">
          <p className="whitespace-pre-line">{religion.detailed}</p>
        </ExpandableSection>
      </div>

      {/* Origin & Region */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Origin */}
        <div className="border border-border rounded-xl p-5 bg-background-secondary/20">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
            <Calendar className="w-4 h-4 text-foreground-muted" />
            기원
          </h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-foreground-muted">연도:</span>
              <span className="text-foreground font-medium">
                {formatYear(religion.origin.year)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-foreground-muted">장소:</span>
              <span className="text-foreground font-medium">
                {religion.origin.location}
              </span>
            </div>
          </div>
        </div>

        {/* Regions */}
        <div className="border border-border rounded-xl p-5 bg-background-secondary/20">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
            <Globe className="w-4 h-4 text-foreground-muted" />
            지역
          </h2>
          <div className="flex flex-wrap gap-2">
            {religion.region.map((reg) => (
              <span
                key={reg}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background-secondary text-sm text-foreground-secondary border border-border"
              >
                <MapPin className="w-3 h-3" />
                {reg}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Branches Mini-Tree */}
      {religion.branches && religion.branches.length > 0 && (
        <div className="mb-8">
          <div className="border border-border rounded-xl p-5 bg-background-secondary/20">
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground mb-4">
              <GitBranch className="w-4 h-4 text-foreground-muted" />
              주요 분파
              <span className="text-xs text-foreground-muted font-normal">
                ({religion.branches.length}개)
              </span>
            </h2>
            <div className="space-y-3">
              {religion.branches.map((branch, idx) => (
                <div
                  key={branch.name}
                  className="flex items-start gap-3 p-3 rounded-lg bg-background-secondary/50 border border-border/50"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-sm text-foreground">
                        {branch.name}
                      </span>
                      {branch.year !== undefined && (
                        <span className="text-xs text-foreground-muted">
                          {formatYear(branch.year)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-foreground-secondary leading-relaxed">
                      {branch.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border">
              <Link
                href={`${BASE_PATH}/religion/tree/`}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors"
              >
                <GitBranch className="w-3 h-3" />
                분파 트리에서 자세히 보기
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Themes Section */}
      <div className="mb-8">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
          <Tag className="w-5 h-5 text-foreground-muted" />
          주요 테마
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.entries(religion.themes) as [string, string | undefined][]).map(
            ([key, value]) => {
              if (!value) return null;
              const config = themeConfig[key];
              if (!config) return null;
              return (
                <div
                  key={key}
                  className="border border-border rounded-xl p-5 bg-background-secondary/20 hover:bg-background-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className={config.color}>{config.icon}</span>
                    <h3 className="font-semibold text-sm text-foreground">
                      {config.label}
                    </h3>
                  </div>
                  <p className="text-sm text-foreground-secondary leading-relaxed">
                    {value}
                  </p>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
        <Link
          href={`${BASE_PATH}/religion/map/`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-background-secondary text-sm text-foreground-secondary hover:text-foreground transition-colors border border-border"
        >
          <Globe className="w-4 h-4" />
          세계 지도
        </Link>
        <Link
          href={`${BASE_PATH}/religion/compare/`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-background-secondary text-sm text-foreground-secondary hover:text-foreground transition-colors border border-border"
        >
          <Scale className="w-4 h-4" />
          비교 매트릭스
        </Link>
      </div>
    </div>
  );
}
