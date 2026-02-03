export type Era = "ancient" | "medieval" | "modern" | "contemporary";

export type ThemeKey = "creation" | "afterlife" | "ethics" | "heroMyth";

export interface Philosopher {
  id: string;
  name: { ko: string; en: string; original?: string };
  era: Era;
  period: { start: number; end: number };
  location: { lat: number; lng: number; region: string };
  school: string[];
  summary: string;
  detailed: string;
  keyWorks: { title: string; year?: number }[];
  quotes: { text: string; source: string }[];
  influences: string[];
  influenced: string[];
  concepts: string[];
  questions: string[];
}

export interface Branch {
  name: string;
  year?: number;
  description: string;
  children?: Branch[];
}

export interface Religion {
  id: string;
  name: { ko: string; en: string };
  type: "religion" | "mythology";
  region: string[];
  origin: { year: number; location: string };
  branches?: Branch[];
  themes: {
    creation?: string;
    afterlife?: string;
    ethics?: string;
    heroMyth?: string;
  };
  summary: string;
  detailed: string;
}

export interface Quote {
  id: string;
  text: string;
  source: string;
  philosopherId?: string;
  religionId?: string;
  category: string;
}

export type RelationshipType =
  | "influenced"   // 직접 영향 (스승-제자, 저작 읽음)
  | "opposed"      // 비판/반박
  | "developed"    // 사상을 발전/변형/종합
  | "parallel"     // 독립적 구조적 유사성 (스토아↔불교 등)
  | "contextual";  // 같은 역사적 맥락/사건 공유

export interface Relationship {
  source: string;
  target: string;
  type: RelationshipType;
  description: string;
  strength?: 1 | 2 | 3; // 1=약함, 2=보통, 3=강함
}

export interface GlossaryTerm {
  id: string;
  term: { ko: string; en: string };
  definition: string;
  relatedPhilosophers: string[];
  relatedReligions: string[];
  category: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  steps: LearningStep[];
  comingSoon?: boolean;
}

export interface LearningStep {
  title: string;
  description: string;
  link?: string;
  type: "philosopher" | "religion" | "concept";
}
