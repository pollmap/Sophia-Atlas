# Sophia Atlas - 개발 지시안

## 프로젝트 개요
"인류 사상의 시공간 지도" — 철학 계보와 세계 신화/종교를 타임라인과 세계지도로 탐색하는 인터랙티브 웹 플랫폼

- **Sophia**: 그리스어 '지혜' (Philosophy의 어원 philosophia = 지혜를 사랑함)
- **Atlas**: 지도책

## 기술스택
- Next.js 14 (App Router, Static Export) → GitHub Pages 배포
- Tailwind CSS + shadcn/ui
- D3.js (그래프), React-Leaflet (지도)
- MDX (콘텐츠), Fuse.js (검색)
- 배포: GitHub Pages

## 디렉토리 구조
```
sophia-atlas/
├── app/
│   ├── page.tsx (홈 대시보드)
│   ├── layout.tsx (루트 레이아웃)
│   ├── philosophy/
│   │   ├── timeline/page.tsx
│   │   ├── graph/page.tsx
│   │   ├── questions/page.tsx
│   │   └── [id]/page.tsx
│   ├── religion/
│   │   ├── map/page.tsx
│   │   ├── tree/page.tsx
│   │   ├── compare/page.tsx
│   │   └── [id]/page.tsx
│   ├── search/page.tsx
│   └── learn/page.tsx
├── components/
│   ├── layout/ (Header, Sidebar, Footer)
│   ├── philosophy/ (Timeline, Graph, PhilosopherCard)
│   ├── religion/ (WorldMap, BranchTree, CompareMatrix)
│   └── common/ (Search, Glossary, Toggle)
├── content/
│   ├── philosophers/ (MDX 파일들)
│   ├── religions/ (MDX 파일들)
│   └── glossary/ (용어사전)
├── data/
│   ├── philosophers.json
│   ├── religions.json
│   └── relationships.json
└── lib/
    ├── mdx.ts
    ├── search.ts
    └── utils.ts
```

## 핵심 기능 요구사항

### 1. 이중축 네비게이션
- 타임라인: 가로 스크롤, 시대별 색상 구분, 줌 가능
- 세계지도: 클릭 시 해당 지역 신화/종교 표시

### 2. 영향 관계 그래프
- 노드: 철학자/학파
- 엣지: 영향 관계 (방향성 있음)
- 클릭 시 상세 페이지 이동
- 필터: 시대별, 학파별

### 3. 콘텐츠 구조
- 모든 페이지: 요약(기본 표시) + 상세(펼치기)
- 상세 해설: MDX로 작성, 인용/출처 포함
- 상호참조: 개념/인물 클릭 시 해당 페이지로

### 4. 종교 분파 트리
- 수직 트리 구조
- 분기점에 연도/사건 표시
- 지도와 연동 (해당 지역 하이라이트)

### 5. 비교 매트릭스
- 행: 신화/종교
- 열: 테마 (창조, 사후세계, 윤리 등)
- 셀 클릭 시 상세 비교

### 6. 오늘의 명언
- 홈 화면에 랜덤 명언 + 출처(사상가/경전)
- 공유 버튼 (트위터, 링크 복사)
- 클릭 시 해당 사상가/종교 페이지로 이동
- 날짜 기반 선택 (매일 다른 명언)

## 디자인 가이드
- 다크모드 기본, 라이트모드 지원
- 폰트: Pretendard (한글), Inter (영문)
- 시대별 컬러:
  - 고대: 황금(Gold) #D4AF37
  - 중세: 보라(Purple) #7C3AED
  - 근대: 청록(Teal) #14B8A6
  - 현대: 회색(Slate) #64748B
- 미니멀하지만 정보 밀도 높게
- 모바일 반응형 필수
- 한국어 기본, 영문 병기

## 데이터 스키마

### 철학자 (Philosopher)
```typescript
interface Philosopher {
  id: string;
  name: { ko: string; en: string; original?: string };
  era: "ancient" | "medieval" | "modern" | "contemporary";
  period: { start: number; end: number }; // BC는 음수
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
```

### 종교/신화 (Religion)
```typescript
interface Religion {
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
```

## 개발 순서
1. 프로젝트 초기화 + 기본 레이아웃
2. 데이터 스키마 + 샘플 데이터 3-5개
3. 철학 타임라인 뷰
4. 철학자 개별 페이지 (요약/상세)
5. 영향 관계 그래프
6. 세계지도 뷰
7. 종교 분파 트리
8. 검색 + 용어사전
9. 학습 경로
10. GitHub Pages 배포

## 주의사항
- 정적 빌드 (output: 'export') 필수
- 이미지는 public/ 폴더, 최적화 필수
- 모바일 반응형 필수
- 한국어 기본, 영문 병기
- GitHub Pages 배포를 위한 basePath 설정 필요
