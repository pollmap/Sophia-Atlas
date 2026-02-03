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
