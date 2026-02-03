"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Globe,
  MapPin,
  Filter,
  ChevronRight,
  Landmark,
  Scroll,
  Snowflake,
  TreePine,
  Pyramid,
  Mountain,
  Waves,
  Sunrise,
  Compass,
} from "lucide-react";
import religionsData from "@/data/religions.json";
import { cn, formatYear } from "@/lib/utils";

type FilterType = "all" | "religion" | "mythology";

interface RegionConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  regions: string[];
  gridArea: string;
}

const regionGrid: RegionConfig[][] = [
  [
    {
      id: "northern-europe",
      name: "북유럽",
      icon: <Snowflake className="w-6 h-6" />,
      regions: ["북유럽"],
      gridArea: "",
    },
    {
      id: "celtic",
      name: "켈트",
      icon: <TreePine className="w-6 h-6" />,
      regions: ["켈트"],
      gridArea: "",
    },
  ],
  [
    {
      id: "europe",
      name: "유럽 (그리스)",
      icon: <Landmark className="w-6 h-6" />,
      regions: ["유럽"],
      gridArea: "",
    },
    {
      id: "middle-east",
      name: "중동 / 메소포타미아",
      icon: <Sunrise className="w-6 h-6" />,
      regions: ["중동", "메소포타미아"],
      gridArea: "",
    },
    {
      id: "east-asia",
      name: "동아시아 (일본)",
      icon: <Mountain className="w-6 h-6" />,
      regions: ["동아시아"],
      gridArea: "",
    },
  ],
  [
    {
      id: "north-africa",
      name: "북아프리카 (이집트)",
      icon: <Pyramid className="w-6 h-6" />,
      regions: ["북아프리카"],
      gridArea: "",
    },
    {
      id: "south-asia",
      name: "남아시아 (인도)",
      icon: <Waves className="w-6 h-6" />,
      regions: ["남아시아"],
      gridArea: "",
    },
  ],
];

export default function ReligionMapPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedRegion, setSelectedRegion] = useState<RegionConfig | null>(null);

  const filteredReligions = useMemo(() => {
    if (!selectedRegion) return [];
    return religionsData.filter((r) => {
      const typeMatch = filter === "all" || r.type === filter;
      const regionMatch = r.region.some((reg) =>
        selectedRegion.regions.some(
          (sr) => reg.includes(sr) || sr.includes(reg)
        )
      );
      return typeMatch && regionMatch;
    });
  }, [filter, selectedRegion]);

  const getRegionCount = (region: RegionConfig) => {
    return religionsData.filter((r) => {
      const typeMatch = filter === "all" || r.type === filter;
      const regionMatch = r.region.some((reg) =>
        region.regions.some((sr) => reg.includes(sr) || sr.includes(reg))
      );
      return typeMatch && regionMatch;
    }).length;
  };

  return (
    <div className="section-container py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400">
            <Globe className="w-5 h-5" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            세계 신화/종교 지도
          </h1>
        </div>
        <p className="text-foreground-secondary max-w-2xl">
          지역을 클릭하면 해당 지역에서 발생한 종교와 신화를 탐색할 수 있습니다.
        </p>
      </div>

      {/* Type Filter */}
      <div className="flex items-center gap-2 mb-8">
        <Filter className="w-4 h-4 text-foreground-muted" />
        <span className="text-sm text-foreground-muted mr-2">유형:</span>
        {(
          [
            { key: "all", label: "전체" },
            { key: "religion", label: "종교" },
            { key: "mythology", label: "신화" },
          ] as const
        ).map((item) => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              filter === item.key
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                : "bg-background-secondary text-foreground-secondary hover:text-foreground hover:bg-background-secondary/80 border border-transparent"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Region Grid - Stylized World Map */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 max-w-4xl mx-auto">
          {regionGrid.map((row, rowIdx) => (
            <div
              key={rowIdx}
              className={cn(
                "flex gap-4 justify-center flex-wrap",
                rowIdx === 0 && "pl-0 md:pl-8",
                rowIdx === 2 && "pr-0 md:pr-16"
              )}
            >
              {row.map((region) => {
                const count = getRegionCount(region);
                const isSelected = selectedRegion?.id === region.id;
                return (
                  <button
                    key={region.id}
                    onClick={() =>
                      setSelectedRegion(isSelected ? null : region)
                    }
                    className={cn(
                      "relative flex flex-col items-center gap-2 px-6 py-5 rounded-2xl",
                      "border-2 transition-all duration-300 min-w-[140px] flex-1 max-w-[200px]",
                      "group hover:scale-[1.02]",
                      isSelected
                        ? "bg-purple-500/15 border-purple-500/50 shadow-lg shadow-purple-500/10"
                        : "bg-background-secondary/50 border-border hover:border-purple-500/30 hover:bg-background-secondary"
                    )}
                  >
                    <div
                      className={cn(
                        "transition-colors duration-200",
                        isSelected
                          ? "text-purple-400"
                          : "text-foreground-muted group-hover:text-purple-400"
                      )}
                    >
                      {region.icon}
                    </div>
                    <span
                      className={cn(
                        "text-sm font-medium transition-colors duration-200",
                        isSelected
                          ? "text-foreground"
                          : "text-foreground-secondary"
                      )}
                    >
                      {region.name}
                    </span>
                    {count > 0 && (
                      <span
                        className={cn(
                          "absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center",
                          isSelected
                            ? "bg-purple-500 text-white"
                            : "bg-background-secondary text-foreground-muted border border-border"
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Compass Indicator */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-2 text-foreground-muted text-xs">
          <Compass className="w-4 h-4" />
          <span>지역을 선택하여 탐색하세요</span>
        </div>
      </div>

      {/* Results Panel */}
      {selectedRegion && (
        <div className="border border-border rounded-2xl bg-background-secondary/30 overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-background-secondary/50">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-400" />
              <h2 className="text-lg font-semibold text-foreground">
                {selectedRegion.name}
              </h2>
              <span className="text-sm text-foreground-muted">
                ({filteredReligions.length}개)
              </span>
            </div>
          </div>

          {filteredReligions.length === 0 ? (
            <div className="px-6 py-12 text-center text-foreground-muted">
              해당 지역에 일치하는 결과가 없습니다.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredReligions.map((religion) => (
                <Link
                  key={religion.id}
                  href={`/religion/${religion.id}/`}
                  className="flex items-start gap-4 px-6 py-5 hover:bg-background-secondary/50 transition-colors duration-200 group"
                >
                  <div className="flex-shrink-0 mt-1">
                    {religion.type === "religion" ? (
                      <Landmark className="w-5 h-5 text-amber-400" />
                    ) : (
                      <Scroll className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-foreground group-hover:text-purple-300 transition-colors">
                        {religion.name.ko}
                      </h3>
                      <span className="text-xs text-foreground-muted">
                        {religion.name.en}
                      </span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          religion.type === "religion"
                            ? "bg-amber-500/15 text-amber-400"
                            : "bg-emerald-500/15 text-emerald-400"
                        )}
                      >
                        {religion.type === "religion" ? "종교" : "신화"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2 text-xs text-foreground-muted">
                      <span>{formatYear(religion.origin.year)}</span>
                      <span>|</span>
                      <span>{religion.origin.location}</span>
                    </div>
                    <p className="text-sm text-foreground-secondary line-clamp-2">
                      {religion.summary}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-foreground-muted flex-shrink-0 mt-2 group-hover:text-purple-400 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
