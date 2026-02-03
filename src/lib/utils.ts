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
    ancient: "bg-ancient text-black",
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
    ancient: "#D4AF37",
    medieval: "#7C3AED",
    modern: "#14B8A6",
    contemporary: "#64748B",
  };
  return colors[era] || "#64748B";
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

// ── Category Utilities ──

export type PersonCategory = "philosopher" | "religious_figure" | "scientist" | "historical_figure" | "cultural_figure";

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    philosopher: "text-indigo-400",
    religious_figure: "text-amber-400",
    scientist: "text-emerald-400",
    historical_figure: "text-red-400",
    cultural_figure: "text-pink-400",
  };
  return colors[category] || "text-slate-400";
}

export function getCategoryBgColor(category: string): string {
  const colors: Record<string, string> = {
    philosopher: "bg-indigo-500/20",
    religious_figure: "bg-amber-500/20",
    scientist: "bg-emerald-500/20",
    historical_figure: "bg-red-500/20",
    cultural_figure: "bg-pink-500/20",
  };
  return colors[category] || "bg-slate-500/20";
}

export function getCategoryHexColor(category: string): string {
  const colors: Record<string, string> = {
    philosopher: "#6366F1",
    religious_figure: "#F59E0B",
    scientist: "#10B981",
    historical_figure: "#EF4444",
    cultural_figure: "#EC4899",
  };
  return colors[category] || "#64748B";
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
    philosopher: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    religious_figure: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    scientist: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    historical_figure: "bg-red-500/20 text-red-300 border-red-500/30",
    cultural_figure: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  };
  return classes[category] || "bg-slate-500/20 text-slate-300 border-slate-500/30";
}
