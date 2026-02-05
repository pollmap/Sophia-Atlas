# Sophia Atlas 기여 가이드

Sophia Atlas에 관심을 가져주셔서 감사합니다. 이 문서는 프로젝트에 기여하는 방법을 안내합니다.

---

## 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [개발 환경 설정](#개발-환경-설정)
3. [데이터 기여](#데이터-기여)
4. [코드 기여](#코드-기여)
5. [커밋 컨벤션](#커밋-컨벤션)
6. [PR 가이드](#pr-가이드)

---

## 프로젝트 개요

Sophia Atlas는 **"인류 사상의 시공간 지도"** 프로젝트입니다.

- **기술스택**: Next.js 14 (App Router), Tailwind CSS, D3.js, React-Leaflet
- **데이터**: 565명 인물, 115개 주제(엔터티), 1,200개+ 관계
- **배포**: Vercel (자동 배포)

---

## 개발 환경 설정

### 필수 요구사항

- Node.js 20+
- npm 9+

### 로컬 실행

```bash
# 1. 저장소 클론
git clone https://github.com/pollmap/Sophia-Atlas.git
cd Sophia-Atlas

# 2. 의존성 설치
npm install

# 3. 데이터 검증
npm run validate

# 4. 개발 서버 실행
npm run dev
```

`http://localhost:3000`에서 확인할 수 있습니다.

### 빌드 확인

```bash
npm run build
```

PR 제출 전 반드시 빌드가 성공하는지 확인하세요.

---

## 데이터 기여

데이터 기여는 가장 환영하는 기여 형태입니다. JSON 파일을 편집하여 인물, 주제, 관계, 명언, 용어 등을 추가/수정할 수 있습니다.

### 데이터 파일 위치

```
src/data/
├── persons/
│   ├── philosophers.json        # 철학자
│   ├── religious-figures.json   # 종교 인물
│   ├── scientists.json          # 과학자
│   └── historical-figures.json  # 역사/문화 인물
├── entities/
│   ├── events.json              # 역사적 사건
│   ├── ideologies.json          # 사상/이념
│   ├── movements.json           # 운동/학파
│   ├── institutions.json        # 기관/조직
│   ├── texts.json               # 경전/문헌
│   └── concepts.json            # 핵심 개념
├── relationships/
│   ├── person-person.json       # 인물 간 관계
│   ├── person-entity.json       # 인물-주제 관계
│   └── entity-entity.json       # 주제 간 관계
├── religions.json               # 종교/신화
├── quotes.json                  # 명언
└── glossary.json                # 용어사전
```

### 인물 추가 (Person)

`src/data/persons/` 아래 해당 카테고리 JSON 파일에 추가합니다.

```json
{
  "id": "kebab-case-id",
  "name": {
    "ko": "한국어 이름",
    "en": "English Name",
    "original": "원어 이름 (선택)"
  },
  "era": "ancient | medieval | modern | contemporary",
  "period": {
    "start": -470,
    "end": -399,
    "approximate": false
  },
  "location": {
    "lat": 37.97,
    "lng": 23.72,
    "region": "지역명 (한국어)"
  },
  "category": "philosopher | religious_figure | scientist | historical_figure | cultural_figure",
  "subcategory": "세부 분류",
  "tags": ["태그1", "태그2"],
  "mvp": false,
  "summary": "1~2문장 요약 (필수)",
  "detailed": "상세 설명 (3~5문단)"
}
```

**주의사항:**
- `id`는 URL에 사용되므로 영문 kebab-case를 사용합니다
- `id`는 전체 데이터에서 고유해야 합니다
- `era`와 `period.start`는 일관성이 있어야 합니다:
  - `ancient`: ~500년 이전
  - `medieval`: 500~1500년
  - `modern`: 1500~1900년
  - `contemporary`: 1900년 이후
- `summary`는 10자 이상이어야 합니다
- `location.lat`은 -90~90, `location.lng`은 -180~180 범위여야 합니다

### 주제(엔터티) 추가 (Entity)

`src/data/entities/` 아래 해당 유형 JSON 파일에 추가합니다.

```json
{
  "id": "kebab-case-id",
  "type": "event | ideology | movement | institution | text | concept",
  "name": {
    "ko": "한국어 이름",
    "en": "English Name"
  },
  "period": { "start": 1789, "end": 1799 },
  "location": { "lat": 48.86, "lng": 2.35, "region": "프랑스 파리" },
  "era": "modern",
  "summary": "1~2문장 요약 (필수)",
  "detailed": "상세 설명 (선택)",
  "tags": ["태그1", "태그2"],
  "relatedPersons": ["person-id-1", "person-id-2"],
  "relatedEntities": ["entity-id-1"]
}
```

### 관계 추가 (Relationship)

관계 유형은 총 23종입니다.

**인물 간 관계 (person-person.json)** — 8종:
| 유형 | 설명 | 방향 |
|------|------|------|
| `influenced` | 사상적 영향 | 단방향 |
| `opposed` | 비판/대립 | 단방향 |
| `developed` | 발전/계승 | 단방향 |
| `parallel` | 구조적 유사 | 양방향 |
| `contextual` | 시대적 맥락 공유 | 양방향 |
| `teacher_student` | 스승-제자 | 단방향 |
| `collaborated` | 협업 | 양방향 |
| `contemporary` | 동시대 활동 | 양방향 |

**인물-주제 관계 (person-entity.json)** — 9종:
| 유형 | 설명 |
|------|------|
| `founded` | 설립/창시 |
| `member_of` | 소속 |
| `participated` | 참여 |
| `caused` | 사상적 원인 제공 |
| `affected_by` | 영향 받음 |
| `authored` | 저술 |
| `advocated` | 옹호 |
| `criticized` | 비판 |
| `belongs_to` | 소속 사상 |

**주제 간 관계 (entity-entity.json)** — 6종:
| 유형 | 설명 |
|------|------|
| `preceded` | 선행 |
| `caused` | 원인 |
| `part_of` | 부분-전체 |
| `opposed_to` | 대립 |
| `evolved_into` | 진화/발전 |
| `influenced` | 영향 |

```json
{
  "source": "source-id",
  "target": "target-id",
  "sourceType": "person | entity",
  "targetType": "person | entity",
  "type": "관계 유형",
  "description": "관계 설명 (한국어)",
  "strength": 1,
  "direction": "directed | bidirectional"
}
```

- `strength`: 1(약), 2(중), 3(강)

### 명언 추가 (Quote)

`src/data/quotes.json`에 추가합니다.

```json
{
  "text": "명언 텍스트 (한국어)",
  "source": "출처 (저서명 등)",
  "philosopherId": "person-id",
  "philosopher": "인물 한국어 이름"
}
```

### 용어 추가 (Glossary)

`src/data/glossary.json`에 추가합니다.

```json
{
  "id": "kebab-case-id",
  "term": { "ko": "한국어 용어", "en": "English Term" },
  "definition": "용어 정의 (한국어, 2~3문장)",
  "relatedPhilosophers": ["person-id"],
  "relatedReligions": ["religion-id"],
  "category": "철학 분야 | 핵심 개념 | 사상/운동 | 종교 개념 | 과학 개념 | 논리/방법론 | 정치/사회 개념 | 미학/예술 개념"
}
```

### 데이터 검증

기여 전 반드시 검증 스크립트를 실행하세요:

```bash
npm run validate
```

이 스크립트는 다음을 검사합니다:
- 필수 필드 존재 여부
- ID 고유성
- 관계 참조 무결성 (존재하지 않는 ID 참조 감지)
- 시대-기간 일관성
- 고립 노드 감지
- 중복 관계 감지

**ERROR가 0개여야** PR을 제출할 수 있습니다. WARNING은 비차단이지만 가능하면 해결해주세요.

---

## 코드 기여

### 디렉토리 구조

```
src/
├── app/          # Next.js 페이지 (App Router)
├── components/   # 재사용 컴포넌트
├── data/         # JSON 데이터
├── lib/          # 유틸리티 함수
└── types/        # TypeScript 타입
```

### 스타일 가이드

- **CSS**: Tailwind CSS 유틸리티 클래스 + CSS 변수 (`var(--fresco-ivory)` 등)
- **다크모드**: `next-themes` 기반, CSS 변수 자동 전환. 하드코딩 색상 금지
- **컴포넌트**: Server Component 기본, 필요 시에만 `'use client'`
- **타입**: TypeScript strict 모드, `any` 최소화
- **한국어**: UI 텍스트는 한국어, 코드/변수명은 영문

### 다크모드 주의사항

절대로 인라인 스타일에 하드코딩된 색상값을 사용하지 마세요:

```tsx
// BAD
<div style={{ background: 'rgba(240,230,211,0.8)' }}>

// GOOD
<div style={{ background: 'var(--fresco-parchment)' }}>

// GOOD (Tailwind)
<div className="bg-fresco-parchment">
```

CSS 변수 목록은 `src/app/globals.css`의 `:root` 및 `.dark` 섹션을 참조하세요.

---

## 커밋 컨벤션

[Conventional Commits](https://www.conventionalcommits.org/) 형식을 사용합니다.

```
<type>: <description>
```

**타입:**
| 타입 | 설명 |
|------|------|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `data` | 데이터 추가/수정 |
| `docs` | 문서 변경 |
| `style` | 코드 포맷팅 (기능 변경 없음) |
| `refactor` | 리팩토링 |
| `chore` | 빌드, 설정 변경 |

**예시:**
```
feat: add timeline overlay for historical events
fix: resolve dark mode contrast issue on connections page
data: add 50 new philosopher quotes
docs: update CONTRIBUTING.md with data schema examples
```

---

## PR 가이드

### PR 제출 전 체크리스트

- [ ] `npm run validate` — 데이터 검증 통과 (ERROR 0)
- [ ] `npm run build` — 빌드 성공
- [ ] 다크모드에서 UI 확인
- [ ] 모바일 반응형 확인

### PR 템플릿

```markdown
## 변경 사항

- 변경 내용을 간략히 설명

## 변경 유형

- [ ] 데이터 추가/수정
- [ ] 새 기능
- [ ] 버그 수정
- [ ] 문서 변경
- [ ] 기타

## 검증

- [ ] `npm run validate` 통과
- [ ] `npm run build` 성공
- [ ] 다크모드 확인
```

### Branch 전략

```
main          ← 프로덕션 (자동 배포)
├── feat/*    ← 기능 개발
├── data/*    ← 데이터 추가
└── fix/*     ← 버그 수정
```

---

## 데이터 품질 기준

### 인물 데이터

| 항목 | 필수 | 비고 |
|------|------|------|
| id, name.ko, name.en | O | |
| era, period, location | O | |
| category, summary | O | summary 10자 이상 |
| detailed | 권장 | 3~5문단 |
| tags | 권장 | 2~5개 |
| quotes | 선택 | 유명 명언 |

### 관계 데이터

- **출처 기반**: 학술적으로 인정된 관계만 추가
- **설명 필수**: 관계의 구체적 맥락 기술
- **강도 구분**: 1(약), 2(중), 3(강) 적절히 사용
- **양방향 주의**: `parallel`, `contextual`, `collaborated`, `contemporary`는 양방향

### 명언 데이터

- 원전 또는 공인된 출처 명시
- 한국어 번역의 정확성 확인
- `philosopherId`는 반드시 존재하는 인물 ID

---

## 문의

- GitHub Issues: 버그 리포트, 기능 제안
- Discussions: 일반 질의, 데이터 토론

기여해주셔서 감사합니다!
