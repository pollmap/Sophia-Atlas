# Sophia Atlas

> **인류 지성의 인드라망** — 철학·종교·과학·역사·문화를 하나의 인터랙티브 플랫폼에서 탐험하세요

[![Deploy](https://github.com/pollmap/Sophia-Atlas/actions/workflows/deploy.yml/badge.svg)](https://github.com/pollmap/Sophia-Atlas/actions/workflows/deploy.yml)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## 소개

**Sophia Atlas**는 인류의 사상과 지혜를 시각적으로 탐색할 수 있는 오픈소스 웹 플랫폼입니다.

- **Sophia** (Σοφία) — 그리스어 '지혜'. Philosophy(철학)의 어원 philosophia = '지혜를 사랑함'
- **Atlas** — 지도책. 그리스 신화의 거인 아틀라스에서 유래
- **인드라망** (Indra's Net) — 화엄경의 보석 그물. 모든 사상이 서로를 비추는 연결의 메타포

인물(Person), 주제(Entity), 관계(Relationship)의 3축으로 인류 지성사 전체를 그래프·타임라인·세계지도 위에 시각화합니다.

## 데이터 규모

| 항목 | 수량 |
|------|------|
| 인물 (철학자·종교인물·과학자·역사/문화) | 1,019명 |
| 주제 (사건·이념·운동·기관·경전·개념 등) | 712개 |
| 관계 (인물↔인물, 인물↔주제, 주제↔주제) | 8,500개+ |
| 종교/신화 전통 | 20개 |

## 주요 기능

### 인드라망 3D 시각화
3D 구체 위에서 1,700개 이상의 노드와 8,500개 이상의 연결을 인터랙티브하게 탐험합니다. 카테고리별 색상, 시대별 필터링, 노드 클릭 시 상세 정보를 제공합니다.

### 타임라인
BC 600년부터 현대까지 인류 지성사의 흐름을 시각적으로 탐색합니다. 철학·종교·과학·역사 영역별 필터링과 줌 기능을 지원합니다.

### 세계지도
지역별 인물과 종교 분포를 지도 위에서 탐색합니다. 클릭 시 해당 지역의 인물과 사상을 확인할 수 있습니다.

### 비교 엔진
인물·사상·종교 간 비교 분석을 제공합니다. 창조신화, 사후세계, 윤리관 등 테마별 비교 매트릭스를 포함합니다.

### 학습 경로
입문부터 심화까지 46개의 주제별 학습 가이드를 제공합니다. 철학, 종교, 과학, 역사, 예술, 통합 분야를 아우릅니다.

### Sophia Type 성향 테스트
25문항의 사상 성향 테스트를 통해 32가지 유형 중 나의 지적 성향을 발견하고, 관련 사상가와 학습 경로를 추천받습니다.

### 통합 검색
인물, 주제, 종교를 한 번에 검색합니다. 카테고리·시대·지역 필터와 자동완성을 지원합니다.

## 기술 스택

| 영역 | 기술 | 비고 |
|------|------|------|
| 프레임워크 | Next.js 14 (App Router) | Static Export |
| 언어 | TypeScript | 전체 타입 시스템 |
| 스타일 | Tailwind CSS + shadcn/ui | 다크/라이트 모드 |
| 시각화 | D3.js, Three.js, React-Leaflet | 3D 그래프, 지도 |
| 검색 | Fuse.js | 클라이언트 퍼지 검색 |
| 아이콘 | Lucide React | |
| 배포 | Vercel + GitHub Pages | CI/CD |

## 시작하기

### 요구사항
- Node.js 18+
- npm 또는 yarn

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/pollmap/Sophia-Atlas.git
cd Sophia-Atlas

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

http://localhost:3000/Sophia-Atlas 에서 확인하세요.

### 빌드

```bash
npm run build
```

`out/` 디렉토리에 정적 파일이 생성됩니다.

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── page.tsx            # 홈 대시보드
│   ├── connections/        # 인드라망 3D 시각화
│   ├── persons/            # 인물 탐색 (목록 + 개별 페이지)
│   ├── entities/           # 주제 탐색
│   ├── philosophy/         # 철학 (타임라인, 그래프, 질문)
│   ├── religion/           # 종교 (지도, 분파 트리, 비교)
│   ├── science/            # 과학 타임라인
│   ├── history/            # 역사 타임라인
│   ├── learn/              # 학습 경로 + 성향 테스트
│   ├── compare/            # 비교 엔진
│   ├── search/             # 통합 검색
│   └── themes/             # 테마별 비교
├── components/             # React 컴포넌트
├── data/                   # JSON 데이터
│   ├── persons/            # 인물 (4개 카테고리 파일)
│   ├── entities/           # 주제 (9개 타입 파일)
│   └── relationships/      # 관계 (PP, PE, EE)
├── lib/                    # 유틸리티, 데이터 로더
└── types/                  # TypeScript 타입 정의
```

## 데이터 구조

### 인물 (Person)
5개 카테고리: 철학자, 종교 인물, 과학자, 역사 인물, 문화 인물. 다국어 이름(한/영/원어), 시대, 위치, 주요 저작, 사상 요약을 포함합니다.

### 주제 (Entity)
9개 타입: 사건, 이념, 운동, 기관, 경전, 개념, 원형, 예술 운동, 기술.

### 관계 (Relationship)
23종의 관계 유형을 지원합니다:
- **인물↔인물** (8종): influenced, opposed, developed, parallel, contextual, teacher_student, collaborated, contemporary
- **인물↔주제** (9종): founded, member_of, participated, caused, affected_by, authored, advocated, criticized, belongs_to
- **주제↔주제** (6종): preceded, caused, part_of, opposed_to, evolved_into, influenced

## 로드맵

- [x] **v1** — 철학자 32명 + 종교 12개 + 기본 시각화
- [x] **v2** — 1,019명 인물 + 712개 주제 + 8,500개 관계 + 3D 인드라망
- [ ] **v3** — MDX 상세 페이지, 원전 인용, 동서양 사상 비교 심화
- [ ] **v4** — 1,000명+ 인물, 300개+ 주제, 커뮤니티 기여 시스템

## 기여하기

모든 형태의 기여를 환영합니다:

1. 이 저장소를 Fork 합니다
2. 새로운 브랜치를 생성합니다 (`git checkout -b feature/my-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'feat: add new feature'`)
4. 브랜치에 Push 합니다 (`git push origin feature/my-feature`)
5. Pull Request를 제출합니다

### 기여 영역
- **데이터 추가/수정**: 인물, 주제, 관계 데이터의 추가 또는 오류 수정
- **콘텐츠 검증**: AI 생성 데이터의 정확성 검증 및 원전 출처 추가
- **기능 개발**: 새로운 시각화, 검색 개선, UI/UX 향상
- **번역**: 영문 콘텐츠 추가, 다국어 지원 확장
- **버그 리포트**: [Issues](https://github.com/pollmap/Sophia-Atlas/issues)에 제보

## 데이터 출처 및 투명성

Sophia Atlas의 데이터는 아래 학술 자료를 참고하여 **AI 기반으로 생성·정리**되었습니다.
인물의 기본 정보(생몰년, 지역, 주요 저작)는 백과사전 기반이며, 관계 데이터와 사상 해설은 AI가 학술 문헌을 참고해 구조화한 것입니다.

**주의:** AI 생성 콘텐츠는 단순화, 편향, 부정확성을 포함할 수 있습니다. 학술 연구에는 반드시 원전과 전문 학술서를 참조하세요.

### 참고 자료
- [Stanford Encyclopedia of Philosophy](https://plato.stanford.edu/)
- [Internet Encyclopedia of Philosophy](https://iep.utm.edu/)
- [Encyclopedia Britannica](https://www.britannica.com/)
- [World History Encyclopedia](https://www.worldhistory.org/)
- [한국민족문화대백과사전](https://encykorea.aks.ac.kr/)

## 라이선스

[ISC License](LICENSE)

## 제작

**이찬희** — 기획, 설계, 개발

---

*"그물의 각 매듭마다 보석이 달려 있고, 각 보석은 다른 모든 보석을 비춘다."* — 화엄경
