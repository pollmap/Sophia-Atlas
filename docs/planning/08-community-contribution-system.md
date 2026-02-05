# 08. 커뮤니티 & 기여 시스템 (Community & Contribution System)

> Sophia Atlas를 개방형 지식 플랫폼으로 발전시키기 위한 커뮤니티 참여 설계

---

## 1. 설계 철학

### 1.1 왜 커뮤니티인가

Sophia Atlas는 **인류 지성사 전체**를 다룬다. 이 규모의 지식을 소수의 개발자만으로 채울 수 없다.
위키피디아가 증명했듯, 체계적 구조 + 열린 기여 = 살아있는 지식 생태계.

그러나 위키피디아와 다른 점:
- **구조화된 데이터**: 자유 텍스트가 아닌 JSON 스키마 준수
- **시각화 중심**: 데이터는 그래프/타임라인/지도로 렌더링됨
- **품질 게이팅**: 모든 기여는 검증 파이프라인 통과 필수
- **학술적 수준**: 대중 백과사전이 아닌 사상사 전문 플랫폼

### 1.2 기여 스펙트럼

```
난이도 낮음 ◀──────────────────────────────▶ 난이도 높음

오타 수정   번역 기여   데이터 보강   새 인물 추가   상세 해설(MDX)   시각화 기여
  │           │           │              │               │              │
  └─ 누구나   └─ 초급     └─ 중급        └─ 고급         └─ 전문가      └─ 개발자
```

---

## 2. 기여 유형 상세

### 2.1 데이터 기여 (Data Contribution)

#### A. 기존 인물 데이터 보강

```yaml
기여 유형: data-enhancement
대상: 이미 등록된 Person/Entity
예시:
  - summary 개선 (더 정확한 설명)
  - keyWorks 추가 (누락된 저작)
  - quotes 추가 (명언 + 출처)
  - tags 추가 (검색 개선)
  - location 보정 (좌표 오류 수정)
  - period 보정 (생몰년 오류 수정)
난이도: 중급
검증: 자동 스키마 검증 + 관리자 리뷰
```

#### B. 새 인물 추가

```yaml
기여 유형: new-person
요구사항:
  - 필수 필드 전체 작성 (id, name, era, period, location, category, summary)
  - 최소 3개 이상의 관계(Relationship) 함께 제출
  - summary 100자 이상
  - 참고 자료/출처 1개 이상 명시
난이도: 고급
검증: 스키마 검증 + 중복 체크 + 관리자 리뷰
```

#### C. 관계 추가

```yaml
기여 유형: new-relationship
요구사항:
  - source/target이 이미 존재하는 ID여야 함
  - type은 정의된 23종 중 하나
  - description 50자 이상
  - 근거/출처 권장
난이도: 중급
검증: 참조 무결성 자동 검증 + 중복 체크
```

#### D. 엔터티 추가

```yaml
기여 유형: new-entity
요구사항:
  - 필수 필드 전체 작성
  - 최소 2개 이상의 관련 인물(relatedPersons) 명시
  - 기존 엔터티와 중복 여부 확인
난이도: 고급
검증: 스키마 검증 + 관리자 리뷰
```

### 2.2 콘텐츠 기여 (Content Contribution)

#### A. 상세 해설 (MDX)

```yaml
기여 유형: mdx-article
대상: Person 또는 Entity의 상세 페이지
형식: MDX (Markdown + JSX components)
요구사항:
  - 최소 1,000자 이상
  - 출처/참고문헌 3개 이상
  - Sophia Atlas 내 다른 인물/개념 링크 5개 이상
  - 중립적 학술적 어조
  - 한국어 기본 (영문 병기 권장)
난이도: 전문가
검증: 편집 위원회 리뷰
```

MDX 기여 템플릿:

```mdx
---
person: "kant"
author: "기여자 이름"
date: "2025-01-15"
version: 1
---

## 생애와 시대적 배경

{/* 인물의 역사적 맥락 */}

## 핵심 사상

### 순수이성비판

{/* 주요 저작/사상 해설 */}

<ConceptLink id="categorical-imperative">정언명령</ConceptLink>은...

## 영향과 유산

<PersonLink id="hegel">헤겔</PersonLink>은 칸트의 이율배반을 발전시켜...

## 현대적 의의

{/* 현대에서의 재해석 */}

## 참고문헌

1. 『순수이성비판』, 임마누엘 칸트, 백종현 역, 아카넷
2. ...
```

#### B. 번역 기여 (i18n)

```yaml
기여 유형: translation
지원 언어 (v2): 한국어 (기본), 영어
계획 언어 (v3+): 일본어, 중국어(간/번), 독일어, 프랑스어
대상 필드:
  - Person.name.{lang}
  - Person.summary (lang별)
  - Entity.name.{lang}
  - Entity.summary (lang별)
  - UI 문자열
난이도: 초급~중급
검증: 네이티브 스피커 리뷰
```

### 2.3 시각화 기여 (Visualization Contribution)

```yaml
기여 유형: visualization
예시:
  - 새로운 그래프 레이아웃 알고리즘
  - 특정 도메인 전용 시각화 (예: 과학 분야별 발견 타임라인)
  - 접근성 개선 (색맹 모드 등)
  - 애니메이션/전환 효과
요구사항:
  - React + D3.js/SVG 기반
  - Fresco Design System 준수
  - 모바일 반응형
  - 성능 벤치마크 제출
난이도: 개발자
검증: 코드 리뷰 + 성능 테스트
```

---

## 3. 기여 워크플로

### 3.1 GitHub 기반 워크플로

```
기여자                        자동화                       관리자
──────                        ──────                       ──────
1. Fork & Clone
2. 데이터/콘텐츠 작성
3. 로컬 검증 실행
   (npm run validate)
4. PR 생성                →  5. CI 자동 검증
                              ├─ 스키마 검증
                              ├─ 참조 무결성
                              ├─ 중복 체크
                              ├─ 빌드 테스트
                              └─ 미리보기 배포
                                                    →  6. 관리자 리뷰
                                                         ├─ 사실 확인
                                                         ├─ 품질 확인
                                                         └─ 승인/수정 요청
                          ←  7. 머지 & 자동 배포
8. 기여자 크레딧 갱신
```

### 3.2 기여 PR 템플릿

```markdown
## 기여 유형
<!-- 해당하는 항목에 체크 -->
- [ ] 데이터 보강 (data-enhancement)
- [ ] 새 인물 추가 (new-person)
- [ ] 관계 추가 (new-relationship)
- [ ] 엔터티 추가 (new-entity)
- [ ] 상세 해설 (mdx-article)
- [ ] 번역 (translation)
- [ ] 시각화 (visualization)
- [ ] 버그 수정 (bugfix)
- [ ] 기타

## 변경 내용
<!-- 무엇을 추가/수정했는지 간략히 설명 -->

## 관련 인물/엔터티 ID
<!-- 이 PR에서 다루는 인물/엔터티의 id 목록 -->
-

## 참고 자료/출처
<!-- 데이터의 근거가 되는 자료 -->
1.

## 자체 검증
- [ ] `npm run validate` 통과
- [ ] `npm run build` 통과
- [ ] 관련 페이지 로컬 미리보기 확인
```

### 3.3 CI/CD 파이프라인

```yaml
# .github/workflows/contribution-check.yml

name: Contribution Validation
on:
  pull_request:
    paths:
      - 'src/data/**'
      - 'content/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Validate data schemas
        run: npm run validate

      - name: Check for duplicates
        run: npm run check-duplicates

      - name: Verify cross-references
        run: npm run check-refs

      - name: Build test
        run: npm run build

      - name: Comment validation results
        uses: actions/github-script@v7
        with:
          script: |
            // PR에 검증 결과 코멘트 작성
```

---

## 4. 품질 관리 체계

### 4.1 데이터 품질 등급

```
Grade A (완전): 모든 필드 작성, 상세 해설(MDX) 있음, 관계 5개+
Grade B (양호): 필수 필드 + 주요 선택 필드, 관계 3개+
Grade C (기본): 필수 필드만, 관계 1개+
Grade D (미완): 필수 필드 일부 누락 → 비공개 처리

MVP 인물: Grade B 이상 필수
비-MVP 인물: Grade C 이상
```

### 4.2 팩트 체크 가이드라인

```markdown
## 팩트 체크 체크리스트

### 기본 정보
- [ ] 생몰년이 학술적 합의와 일치하는가?
- [ ] 지역/국적이 정확한가?
- [ ] 이름 표기(한/영/원어)가 학술 관례를 따르는가?

### 사상/업적
- [ ] summary가 학술적으로 정확한가?
- [ ] 주요 저작 목록이 완전한가?
- [ ] 명언의 출처가 확인되었는가? (오귀인 주의)

### 관계
- [ ] 영향 관계의 방향이 맞는가?
- [ ] 관계 설명이 역사적 사실에 부합하는가?
- [ ] strength 값이 적절한가?

### 주의 사항
- 위키피디아 단독 출처 지양 → 학술 자료 교차 확인
- 논쟁적 관계는 description에 다양한 관점 병기
- 생몰년이 불확실한 경우 approximate: true 설정
```

### 4.3 편집 위원회

```
편집 위원회 구조 (v3+)
─────────────────────
총괄 편집장 (1명)
├── 서양철학 편집위원 (2명)
├── 동양철학 편집위원 (2명)
├── 종교학 편집위원 (2명)
├── 과학사 편집위원 (1명)
├── 역사/문화 편집위원 (1명)
└── 기술 편집위원 (1명) — 스키마/시각화 검증

역할:
- PR 리뷰 (해당 분야)
- 분기별 데이터 품질 감사
- 기여 가이드라인 업데이트
- 논쟁적 콘텐츠 중재
```

---

## 5. 기여자 인센티브

### 5.1 기여자 프로필

```typescript
interface Contributor {
  id: string;              // GitHub username
  displayName: string;
  joinedAt: string;        // ISO date
  contributions: {
    persons: number;       // 추가/보강한 인물 수
    entities: number;
    relationships: number;
    articles: number;      // MDX 기고 수
    translations: number;
    visualizations: number;
    bugfixes: number;
  };
  totalScore: number;      // 가중 합산
  rank: ContributorRank;
  specialties: string[];   // 전문 분야 태그
}

type ContributorRank =
  | 'newcomer'      // 첫 기여
  | 'contributor'   // 5회+
  | 'regular'       // 20회+
  | 'expert'        // 50회+ 또는 MDX 5편+
  | 'maintainer';   // 편집 위원
```

### 5.2 기여 점수 시스템

```
기여 유형별 점수
─────────────────
오타/오류 수정     : 1점
태그/필드 추가     : 2점
번역 기여          : 3점 (필드당)
새 관계 추가       : 5점
기존 인물 보강     : 5점
새 엔터티 추가     : 8점
새 인물 추가       : 10점
MDX 상세 해설      : 20점
시각화 컴포넌트    : 25점
```

### 5.3 크레딧 시스템

```
기여자 표시 위치
├── About 페이지: 전체 기여자 목록 (점수순)
├── Person 페이지 하단: "이 페이지 기여자" 표시
├── GitHub README: Top Contributors 배지
├── 릴리즈 노트: 해당 릴리즈의 기여자 목록
└── 연간 리포트: 기여 통계 및 감사 인사
```

```typescript
// src/data/contributors.json
{
  "contributors": [
    {
      "github": "username",
      "name": "홍길동",
      "contributions": [
        { "type": "new-person", "target": "zhuxi", "date": "2025-03-15" },
        { "type": "data-enhancement", "target": "kant", "date": "2025-03-20" }
      ]
    }
  ]
}
```

---

## 6. 커뮤니티 소통 채널

### 6.1 채널 설계

```
GitHub (핵심)
├── Issues: 버그 리포트, 기능 요청, 데이터 오류 신고
├── Discussions: 일반 토론, Q&A, 아이디어
├── Pull Requests: 실제 기여
└── Projects: 로드맵, 진행 상황

Discord (실시간)
├── #general: 일반 대화
├── #contributions: 기여 관련 질문/논의
├── #philosophy: 철학 데이터 토론
├── #religion: 종교학 데이터 토론
├── #science: 과학사 데이터 토론
├── #dev: 개발 관련
└── #showcase: 흥미로운 발견 공유

블로그 (정기)
├── 월간 업데이트: 새 인물/기능 소개
├── 기여 하이라이트: 우수 기여 소개
└── 기술 블로그: 아키텍처/시각화 해설
```

### 6.2 Issue 템플릿

```markdown
<!-- .github/ISSUE_TEMPLATE/data-error.md -->
---
name: 데이터 오류 신고
about: 인물, 엔터티, 관계 데이터의 오류를 신고합니다
labels: ['data-error']
---

## 대상
<!-- 오류가 있는 인물/엔터티 ID 또는 URL -->
-

## 오류 내용
<!-- 어떤 필드에 어떤 오류가 있는지 -->
-

## 올바른 정보
<!-- 정확한 정보와 그 근거 -->
-

## 출처
<!-- 정확한 정보의 근거가 되는 자료 -->
1.
```

---

## 7. 기여 도구

### 7.1 데이터 편집기 (CLI)

```bash
# 로컬 개발 도구

# 새 인물 추가 (인터랙티브 프롬프트)
npm run add-person

# 새 관계 추가
npm run add-relationship

# 데이터 검증
npm run validate

# 중복 체크
npm run check-duplicates

# 통계
npm run stats
# → 인물: 573명 (MVP 200), 엔터티: 105개, 관계: 2,150개
# → 품질: A등급 45%, B등급 35%, C등급 20%
```

### 7.2 데이터 편집기 (웹 UI) — v3+

```typescript
// 브라우저 기반 데이터 편집 인터페이스 (읽기 전용 → 편집 → PR 생성)

interface DataEditor {
  // 인물 편집 폼
  personForm: {
    fields: PersonField[];
    validation: ValidationRule[];
    preview: PersonCardPreview;
    diffView: DataDiff;
  };

  // 관계 편집 (그래프 UI)
  relationshipEditor: {
    // 드래그&드롭으로 노드 연결
    sourceNode: PersonNode | EntityNode;
    targetNode: PersonNode | EntityNode;
    typeSelector: RelationType[];
    descriptionInput: string;
  };

  // PR 생성
  submitFlow: {
    changes: DataChange[];
    commitMessage: string;
    prDescription: string;
    // GitHub API를 통해 자동 PR 생성
    createPR: () => Promise<string>;  // returns PR URL
  };
}
```

### 7.3 기여자 온보딩

```markdown
## 첫 기여 가이드 (5분 안에 시작하기)

### 1. 프로젝트 포크
GitHub에서 Fork 버튼 클릭

### 2. 로컬 클론
git clone https://github.com/{your-username}/Sophia-Atlas.git
cd Sophia-Atlas
npm install

### 3. 가장 쉬운 첫 기여: 명언 추가
src/data/quotes.json을 열어 새 명언을 추가하세요:
{
  "text": "명언 내용",
  "person": "person-id",
  "source": "출처",
  "original": "원문 (선택)"
}

### 4. 검증 & 제출
npm run validate
git add -A && git commit -m "feat: add quote for {person}"
git push origin main
→ GitHub에서 PR 생성

### 5. 다음 단계
- 기존 인물의 tags 추가
- 누락된 관계(Relationship) 추가
- 새 인물 데이터 작성
```

---

## 8. 거버넌스

### 8.1 의사결정 구조

```
Tier 1: 자동 승인
├── 오타/표기 수정 (CI 통과 시)
├── 태그 추가 (기존 태그 범위 내)
└── 좌표 미세 보정

Tier 2: 단일 관리자 승인
├── 기존 인물 데이터 보강
├── 새 관계 추가
├── 번역 기여

Tier 3: 편집 위원 2인 승인
├── 새 인물 추가
├── 새 엔터티 추가
├── MDX 상세 해설

Tier 4: 편집 위원회 합의
├── 스키마 변경
├── 카테고리/서브카테고리 추가
├── 논쟁적 콘텐츠
└── 핵심 관계 변경 (strength: 3)
```

### 8.2 논쟁 처리 정책

```markdown
## 논쟁적 콘텐츠 가이드라인

### 원칙
1. **중립성**: Sophia Atlas는 특정 사상/종교/정치적 입장을 취하지 않는다
2. **다관점**: 논쟁이 있는 경우 주요 관점을 모두 소개한다
3. **출처 기반**: 모든 서술은 학술적 출처에 근거한다
4. **존중**: 모든 사상/종교 전통을 동등한 존중으로 다룬다

### 논쟁 발생 시
1. Issue 또는 Discussion에서 토론
2. 관련 분야 편집 위원 의견 수렴
3. 학술적 합의가 있는 경우 → 합의에 따름
4. 합의가 없는 경우 → 복수 관점 병기
5. 해결되지 않는 경우 → 편집 위원회 투표 (과반수)

### 예시
- "니체는 반기독교적인가?" → "니체의 기독교 비판"이라는 중립적 서술
- "유물론과 관념론 중 어느 것이 옳은가?" → 두 입장을 모두 설명
- "이슬람의 지하드 개념" → 학술적 정의와 다양한 해석 소개
```

### 8.3 행동 강령

```markdown
## Sophia Atlas 행동 강령

### 우리의 약속
Sophia Atlas는 모든 참여자가 안전하고 존중받는 환경을 만듭니다.

### 장려하는 행동
- 학술적 정확성에 대한 헌신
- 건설적이고 구체적인 피드백
- 다양한 사상과 전통에 대한 존중
- 신규 기여자에 대한 환대

### 금지하는 행동
- 특정 사상/종교/문화에 대한 비하
- 학술적 근거 없는 주장의 반복
- 다른 기여자에 대한 인신공격
- 정치적 선전 목적의 데이터 왜곡

### 위반 시
1. 경고
2. PR/Issue 삭제
3. 임시 차단 (30일)
4. 영구 차단
```

---

## 9. 데이터 라이선스

### 9.1 라이선스 구조

```
Sophia Atlas 라이선스 구조
──────────────────────────
코드 (소프트웨어)  : MIT License
데이터 (JSON)      : CC BY-SA 4.0
콘텐츠 (MDX 해설)  : CC BY-SA 4.0
이미지             : 개별 라이선스 명시
```

### 9.2 기여자 라이선스 동의 (CLA)

```markdown
## 기여자 라이선스 동의

Sophia Atlas에 기여함으로써 다음에 동의합니다:

1. 귀하의 기여물은 프로젝트의 라이선스(MIT/CC BY-SA 4.0)로 배포됩니다
2. 귀하가 기여물의 원저작자이거나 기여할 권한이 있습니다
3. 기여자로서의 크레딧을 받을 권리가 있습니다
4. 기여물이 다른 저작물을 침해하지 않습니다

첫 PR에서 자동으로 CLA 봇이 동의를 요청합니다.
```

---

## 10. 커뮤니티 성장 전략

### 10.1 Phase별 커뮤니티 전략

```
Phase 2 (현재): 핵심 팀 중심
├── 3~5명의 핵심 기여자 확보
├── 기여 프로세스 확립
├── 문서화 완성
└── 첫 외부 기여 수용

Phase 3: 초기 커뮤니티
├── 10~20명 활성 기여자
├── Discord 채널 운영
├── 월간 기여 모임
├── 대학 연구실/동아리 협력
└── 편집 위원회 구성

Phase 4: 성숙 커뮤니티
├── 50명+ 활성 기여자
├── 자체 유지되는 기여 생태계
├── 국제화 (영어, 일본어, 중국어)
├── 학술 기관 파트너십
└── 연간 기여자 모임
```

### 10.2 대학/연구기관 협력

```
잠재 협력 모델
──────────────
1. 강의 연계: "동양철학사" 수업에서 학생들이 인물 데이터 작성
2. 연구 활용: 사상사 관계 네트워크 분석 데이터 제공
3. 번역 프로젝트: 외국어학과와 번역 기여 협력
4. 시각화 프로젝트: 디자인/CS 학과의 시각화 개선 기여
```

### 10.3 기여 이벤트

```
정기 이벤트
──────────
월간 기여 스프린트
├── 매월 첫째 주말
├── 특정 도메인/시대 집중 (예: "3월: 이슬람 황금시대")
├── Discord 실시간 소통
└── 우수 기여자 선정

Hacktoberfest 참여
├── 10월 한 달간 집중 기여
├── good-first-issue 라벨 30개+ 준비
├── 신규 기여자 온보딩 세션

반기 데이터 감사
├── 6개월마다 전체 데이터 품질 점검
├── Grade C → B 업그레이드 캠페인
└── 고아 노드(관계 없는 인물) 해소 캠페인
```

---

## 11. 기술적 구현

### 11.1 기여 관련 npm 스크립트

```json
{
  "scripts": {
    "validate": "ts-node scripts/validate-data.ts",
    "check-duplicates": "ts-node scripts/check-duplicates.ts",
    "check-refs": "ts-node scripts/check-references.ts",
    "stats": "ts-node scripts/data-stats.ts",
    "add-person": "ts-node scripts/add-person-interactive.ts",
    "add-relationship": "ts-node scripts/add-relationship.ts",
    "migrate": "ts-node scripts/migrate-v1-to-v2.ts",
    "quality-report": "ts-node scripts/quality-report.ts"
  }
}
```

### 11.2 GitHub Actions 워크플로

```yaml
# .github/workflows/data-quality.yml
name: Data Quality Report
on:
  schedule:
    - cron: '0 0 1 * *'  # 매월 1일
  workflow_dispatch:

jobs:
  report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run quality-report
      - name: Create Issue with Report
        uses: actions/github-script@v7
        with:
          script: |
            // 품질 리포트를 Issue로 생성
```

### 11.3 봇 자동화

```typescript
// 기여 관련 자동화 봇

// 1. 환영 봇: 첫 PR 시 환영 메시지
// 2. CLA 봇: 라이선스 동의 확인
// 3. 검증 봇: PR에 자동 검증 결과 코멘트
// 4. 라벨 봇: 변경 파일 기반 자동 라벨링
//    - src/data/persons/* → label: 'data:person'
//    - src/data/entities/* → label: 'data:entity'
//    - src/data/relationships/* → label: 'data:relationship'
//    - content/** → label: 'content'
// 5. 할당 봇: 분야별 편집 위원 자동 할당
```

---

## 12. 요약

```
커뮤니티 시스템 핵심 원칙
─────────────────────────
1. 낮은 진입장벽: 명언 추가부터 시작
2. 높은 품질 기준: 자동 검증 + 인간 리뷰
3. 투명한 프로세스: GitHub 기반 공개 워크플로
4. 공정한 인정: 점수 + 크레딧 시스템
5. 성장하는 구조: Phase별 커뮤니티 확장
```
