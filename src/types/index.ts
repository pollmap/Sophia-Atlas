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

export interface Relationship {
  source: string;
  target: string;
  type: "influenced" | "opposed" | "developed";
  description: string;
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
