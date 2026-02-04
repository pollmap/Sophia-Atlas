import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Era = "ancient" | "medieval" | "modern" | "contemporary";

export function getEraColor(era: string): string {
  switch (era) {
    case "ancient": return "text-ancient";
    case "medieval": return "text-medieval";
    case "modern": return "text-modern";
    case "contemporary": return "text-contemporary";
    default: return "text-foreground";
  }
}

export function getEraBgColor(era: string): string {
  switch (era) {
    case "ancient": return "bg-ancient";
    case "medieval": return "bg-medieval";
    case "modern": return "bg-modern";
    case "contemporary": return "bg-contemporary";
    default: return "bg-background-secondary";
  }
}

export function getEraColorClass(era: string): string {
  const classes: Record<string, string> = {
    ancient: "bg-ancient text-white",
    medieval: "bg-medieval text-white",
    modern: "bg-modern text-white",
    contemporary: "bg-contemporary text-white",
  };
  return classes[era] || "bg-contemporary text-white";
}

export function getEraBorderClass(era: string): string {
  const classes: Record<string, string> = {
    ancient: "border-ancient",
    medieval: "border-medieval",
    modern: "border-modern",
    contemporary: "border-contemporary",
  };
  return classes[era] || "border-contemporary";
}

export function getEraTextClass(era: string): string {
  const classes: Record<string, string> = {
    ancient: "text-ancient",
    medieval: "text-medieval",
    modern: "text-modern",
    contemporary: "text-contemporary",
  };
  return classes[era] || "text-contemporary";
}

export function getEraHexColor(era: string): string {
  const colors: Record<string, string> = {
    ancient: "#B8860B",
    medieval: "#6B4E8A",
    modern: "#4A7A6B",
    contemporary: "#6B6358",
  };
  return colors[era] || "#6B6358";
}

export function getEraLabel(era: string): string {
  switch (era) {
    case "ancient": return "고대";
    case "medieval": return "중세";
    case "modern": return "근대";
    case "contemporary": return "현대";
    default: return "";
  }
}

export function getEraDescription(era: string): string {
  const descriptions: Record<string, string> = {
    ancient: "BC 600 ~ AD 300 | 철학의 탄생과 기초",
    medieval: "AD 300 ~ AD 1500 | 신앙과 이성의 조화",
    modern: "AD 1500 ~ AD 1900 | 이성의 시대",
    contemporary: "AD 1900 ~ 현재 | 다원적 사유",
  };
  return descriptions[era] || "";
}

export function formatYear(year: number): string {
  if (year < 0) return `BC ${Math.abs(year)}`;
  return `AD ${year}`;
}

export function formatPeriod(start: number, end: number): string {
  return `${formatYear(start)} ~ ${formatYear(end)}`;
}

// ── Category Utilities (Fresco pigment colors) ──

export type PersonCategory = "philosopher" | "religious_figure" | "scientist" | "historical_figure" | "cultural_figure";

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    philosopher: "text-cat-philosopher",
    religious_figure: "text-cat-religious",
    scientist: "text-cat-scientist",
    historical_figure: "text-cat-historical",
    cultural_figure: "text-cat-cultural",
  };
  return colors[category] || "text-ink-light";
}

export function getCategoryBgColor(category: string): string {
  const colors: Record<string, string> = {
    philosopher: "bg-cat-philosopher/15",
    religious_figure: "bg-cat-religious/15",
    scientist: "bg-cat-scientist/15",
    historical_figure: "bg-cat-historical/15",
    cultural_figure: "bg-cat-cultural/15",
  };
  return colors[category] || "bg-ink-faded/15";
}

export function getCategoryHexColor(category: string): string {
  const colors: Record<string, string> = {
    philosopher: "#4A5D8A",
    religious_figure: "#B8860B",
    scientist: "#5B7355",
    historical_figure: "#8B4040",
    cultural_figure: "#7A5478",
  };
  return colors[category] || "#6B6358";
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    philosopher: "철학자",
    religious_figure: "종교 인물",
    scientist: "과학자",
    historical_figure: "역사 인물",
    cultural_figure: "문화/예술",
  };
  return labels[category] || category;
}

export function getCategoryBadgeClass(category: string): string {
  const classes: Record<string, string> = {
    philosopher: "bg-cat-philosopher/12 text-cat-philosopher border-cat-philosopher/30",
    religious_figure: "bg-cat-religious/12 text-cat-religious border-cat-religious/30",
    scientist: "bg-cat-scientist/12 text-cat-scientist border-cat-scientist/30",
    historical_figure: "bg-cat-historical/12 text-cat-historical border-cat-historical/30",
    cultural_figure: "bg-cat-cultural/12 text-cat-cultural border-cat-cultural/30",
  };
  return classes[category] || "bg-ink-faded/12 text-ink-light border-ink-faded/30";
}
