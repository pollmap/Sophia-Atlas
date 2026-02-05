# Sophia Atlas — 인터랙션 & 애니메이션 설계서 v1.0

> **"발견의 여정 — 사용자가 탐험가처럼 사상의 세계를 탐색한다"**
> 작성일: 2026-02-05 | 버전: 1.0 | 상태: Draft

---

## 목차

1. [인터랙션 디자인 철학](#1-인터랙션-디자인-철학)
2. [애니메이션 토큰 시스템](#2-애니메이션-토큰-시스템)
3. [마이크로 인터랙션](#3-마이크로-인터랙션)
4. [페이지 전환 애니메이션](#4-페이지-전환-애니메이션)
5. [시각화 인터랙션](#5-시각화-인터랙션)
6. [컴포넌트별 인터랙션 명세](#6-컴포넌트별-인터랙션-명세)
7. [제스처 & 터치](#7-제스처--터치)
8. [로딩 & 상태 애니메이션](#8-로딩--상태-애니메이션)
9. [접근성](#9-접근성)
10. [성능 최적화](#10-성능-최적화)
11. [구현 코드](#11-구현-코드)

---

## 1. 인터랙션 디자인 철학

### 1.1 "고문서를 발견하는 경험"

Sophia Atlas의 인터랙션은 도서관 깊숙한 곳에서 오래된 문서를 꺼내 펼치는
경험을 디지털로 재현한다. 모든 전환은 부드럽고, 모든 등장은 은은하며,
모든 강조는 금빛으로 빛난다.

```
인터랙션 감성 스펙트럼:

  급격함 ──────────────────────────── 부드러움
  [게임UI]    [SaaS]    [뉴스]    [Sophia Atlas]    [명상앱]

  차가움 ──────────────────────────── 따뜻함
  [기술문서]  [위키]    [블로그]  [Sophia Atlas]    [공예품]
```

### 1.2 핵심 원칙

1. **의미 있는 움직임**: 모든 애니메이션은 목적이 있다. 장식이 아닌 안내.
2. **부드러운 전환**: 상태 변화는 항상 애니메이션으로. 갑작스러운 변화 없음.
3. **골드 강조**: 사용자의 시선이 가야 할 곳은 항상 금빛으로.
4. **세피아 감성**: 차가운 파란색/하얀색 대신 따뜻한 세피아 톤.
5. **존중하는 속도**: 너무 빠르지도 (놓침), 너무 느리지도 (지루함) 않게.

### 1.3 정보 밀도와 인지 부하

```
정보 공개 전략:

  Level 1: 스캔 (scanning)
  ├── 카드 제목, 카테고리 뱃지, 시대 색상
  ├── 1초 내 파악 가능
  └── 시각적 계층으로 구분

  Level 2: 읽기 (reading)
  ├── 요약 텍스트 (1~3문장)
  ├── 5초 내 파악 가능
  └── 호버 또는 기본 표시

  Level 3: 탐구 (exploring)
  ├── 상세 설명, 관계 그래프, 저작 목록
  ├── 30초~수분
  └── 클릭하여 펼치기 또는 페이지 이동
```

---

## 2. 애니메이션 토큰 시스템

### 2.1 Duration 토큰

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--duration-instant` | 100ms | 포커스 링, 색상 변화 |
| `--duration-fast` | 150ms | 호버 피드백, 토글 |
| `--duration-normal` | 300ms | 카드 전환, 드롭다운, 표준 전환 |
| `--duration-slow` | 500ms | 페이지 전환, 모달 등장 |
| `--duration-dramatic` | 800ms | 영웅 섹션 등장, 첫 로딩 |
| `--duration-cinematic` | 1200ms | 인트로 애니메이션, 특별 효과 |

### 2.2 Easing 토큰

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | 등장 (들어옴) — 기본 |
| `--ease-in` | `cubic-bezier(0.7, 0, 0.84, 0)` | 퇴장 (나감) |
| `--ease-in-out` | `cubic-bezier(0.45, 0, 0.55, 1)` | 양방향 전환 |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 탄성 효과 (버튼 클릭) |
| `--ease-gentle` | `cubic-bezier(0.25, 0.1, 0.25, 1)` | 부드러운 자연스러움 |

### 2.3 컴포넌트별 토큰 매핑

| 컴포넌트 | Duration | Easing |
|----------|----------|--------|
| 버튼 호버 | fast (150ms) | ease-out |
| 버튼 클릭 | fast (150ms) | spring |
| 카드 호버 | normal (300ms) | ease-out |
| 드롭다운 오픈 | normal (300ms) | ease-out |
| 드롭다운 클로즈 | fast (150ms) | ease-in |
| 페이지 전환 | slow (500ms) | ease-out |
| 모달 등장 | slow (500ms) | ease-out |
| 모달 퇴장 | normal (300ms) | ease-in |
| 스크롤 등장 | normal (300ms) | ease-out |
| 그래프 노드 이동 | slow (500ms) | ease-in-out |
| 필터 전환 | normal (300ms) | ease-out |
| 툴팁 등장 | fast (150ms) | ease-out |
| 로딩 스피너 | cinematic (1200ms) | linear |

---

## 3. 마이크로 인터랙션

### 3.1 호버 인터랙션

#### 카드 호버 (fresco-card)

```css
.fresco-card {
  transition:
    transform var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out);
}

.fresco-card:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow:
    0 8px 25px rgba(184, 134, 11, 0.15),
    0 2px 8px rgba(44, 36, 22, 0.08);
}

.fresco-card:active {
  transform: translateY(0) scale(0.99);
  transition-duration: var(--duration-fast);
}
```

**상태 다이어그램:**
```
  [기본] ──hover──→ [상승+그림자] ──click──→ [눌림]
    ↑                    │                      │
    └──────leave──────────┘                      │
    ↑                                            │
    └──────────────release─────────────────────────┘
```

#### 링크 호버 (골드 밑줄 스위프)

```css
.fresco-link {
  position: relative;
  color: var(--ink-dark);
  text-decoration: none;
}

.fresco-link::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 0;
  height: 1.5px;
  background: linear-gradient(90deg, var(--gold), var(--gold-light));
  transition: width var(--duration-normal) var(--ease-out);
}

.fresco-link:hover {
  color: var(--gold);
}

.fresco-link:hover::after {
  width: 100%;
}
```

#### 버튼 호버

```css
.btn-primary {
  transition:
    background-color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-spring),
    box-shadow var(--duration-fast) var(--ease-out);
}

.btn-primary:hover {
  background-color: var(--gold-hover);
  box-shadow: 0 4px 12px rgba(184, 134, 11, 0.3);
}

.btn-primary:active {
  transform: scale(0.97);
  box-shadow: 0 2px 6px rgba(184, 134, 11, 0.2);
}
```

#### 노드 호버 (그래프)

```javascript
// D3.js node hover handler
function onNodeHover(event, d) {
  // 1. 호버된 노드 확대
  d3.select(this)
    .transition()
    .duration(200)
    .attr('r', d.radius * 1.3)
    .attr('stroke-width', 3)
    .attr('stroke', '#B8860B');

  // 2. 연결된 노드/엣지 하이라이트
  const connectedIds = getConnectedNodeIds(d.id);
  nodes.transition().duration(200)
    .attr('opacity', n => connectedIds.has(n.id) ? 1 : 0.15);
  edges.transition().duration(200)
    .attr('opacity', e => e.source.id === d.id || e.target.id === d.id ? 1 : 0.05);

  // 3. 툴팁 표시
  showTooltip(event, d);
}
```

### 3.2 스크롤 인터랙션

#### 스크롤 등장 (Intersection Observer)

```typescript
// hooks/useScrollAnimation.ts
export function useScrollAnimation(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target); // 한 번만 트리거
        }
      },
      { threshold: 0.1, rootMargin: '50px', ...options }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}
```

```css
/* 스크롤 등장 애니메이션 */
.scroll-reveal {
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity var(--duration-slow) var(--ease-out),
    transform var(--duration-slow) var(--ease-out);
}

.scroll-reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* 순차 등장 (staggered) */
.scroll-reveal-stagger > *:nth-child(1) { transition-delay: 0ms; }
.scroll-reveal-stagger > *:nth-child(2) { transition-delay: 80ms; }
.scroll-reveal-stagger > *:nth-child(3) { transition-delay: 160ms; }
.scroll-reveal-stagger > *:nth-child(4) { transition-delay: 240ms; }
```

#### 스티키 헤더 축소

```css
.glass-header {
  height: 72px;
  transition: height var(--duration-normal) var(--ease-out),
              backdrop-filter var(--duration-normal) var(--ease-out);
}

.glass-header.scrolled {
  height: 56px;
  backdrop-filter: blur(20px);
  box-shadow: 0 2px 12px rgba(44, 36, 22, 0.1);
}
```

### 3.3 입력 인터랙션

#### 검색바 포커스

```css
.search-input {
  width: 280px;
  transition:
    width var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out);
}

.search-input:focus {
  width: 400px;
  border-color: var(--gold);
  box-shadow: 0 0 0 3px rgba(184, 134, 11, 0.15);
}
```

---

## 4. 페이지 전환 애니메이션

### 4.1 기본 전환: Fade + Slide Up

```css
@keyframes page-enter {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-enter {
  animation: page-enter var(--duration-slow) var(--ease-out);
}
```

### 4.2 Next.js App Router 활용

```
Layout 구조:
┌────────────────────────────────────┐
│ RootLayout (공유, 전환 없음)         │
│ ┌─────────────────────────────────┐ │
│ │ Header (공유, 전환 없음)          │ │
│ ├─────────────────────────────────┤ │
│ │ main.page-enter (전환 대상)      │ │
│ │   └── 페이지 콘텐츠              │ │
│ ├─────────────────────────────────┤ │
│ │ Footer (공유, 전환 없음)          │ │
│ └─────────────────────────────────┘ │
└────────────────────────────────────┘
```

### 4.3 loading.tsx 스켈레톤

```tsx
// app/persons/[id]/loading.tsx
export default function PersonLoading() {
  return (
    <div className="max-w-4xl mx-auto p-8 animate-pulse">
      {/* 헤더 스켈레톤 */}
      <div className="h-8 bg-fresco-aged/50 rounded w-1/3 mb-4" />
      <div className="h-4 bg-fresco-aged/30 rounded w-1/4 mb-8" />
      {/* 요약 스켈레톤 */}
      <div className="space-y-2 mb-8">
        <div className="h-4 bg-fresco-aged/30 rounded w-full" />
        <div className="h-4 bg-fresco-aged/30 rounded w-5/6" />
        <div className="h-4 bg-fresco-aged/30 rounded w-4/6" />
      </div>
      {/* 관계 그래프 스켈레톤 */}
      <div className="h-64 bg-fresco-aged/20 rounded-lg" />
    </div>
  );
}
```

---

## 5. 시각화 인터랙션

### 5.1 인드라망 그래프

#### 초기 로딩 애니메이션

```javascript
// 노드 cascading 등장
simulation.on('tick', () => {
  const elapsed = Date.now() - startTime;

  nodes.attr('opacity', (d, i) => {
    const delay = i * 20; // 노드당 20ms 지연
    const progress = Math.max(0, Math.min(1, (elapsed - delay) / 500));
    return easeOutCubic(progress);
  });
});
```

#### 줌 & 패닝

```javascript
const zoom = d3.zoom()
  .scaleExtent([0.1, 5])
  .on('zoom', (event) => {
    container.attr('transform', event.transform);

    // 줌 레벨별 디테일 조정 (LOD)
    const scale = event.transform.k;
    labels.attr('display', scale > 0.5 ? 'block' : 'none');
    minorEdges.attr('display', scale > 0.8 ? 'block' : 'none');
    nodeIcons.attr('display', scale > 1.2 ? 'block' : 'none');
  });
```

#### 필터 전환

```javascript
function applyFilter(filter) {
  // 매칭 노드: fade in
  nodes.filter(d => matchesFilter(d, filter))
    .transition().duration(300)
    .attr('opacity', 1)
    .attr('r', d => d.radius);

  // 비매칭 노드: fade out
  nodes.filter(d => !matchesFilter(d, filter))
    .transition().duration(300)
    .attr('opacity', 0.05)
    .attr('r', d => d.radius * 0.5);

  // 관련 엣지도 동일하게
  edges.transition().duration(300)
    .attr('opacity', e =>
      matchesFilter(e.source, filter) && matchesFilter(e.target, filter)
        ? 0.6 : 0.02
    );
}
```

### 5.2 타임라인

#### 줌 레벨 전환

```
Level 1: 전체 역사 (-600 ~ 2025)
┌──────────────────────────────────────────┐
│ 고대      │  중세     │  근대    │  현대  │
│ ●●●●●    │  ●●●●   │  ●●●●●  │ ●●●● │
└──────────────────────────────────────────┘
                    ↓ 줌인 (스크롤/핀치)
Level 2: 시대 (예: 고대 -600 ~ 500)
┌──────────────────────────────────────────┐
│ -600  -500  -400  -300  -200  -100   0  │
│  ●탈레스  ●소크 ●플라톤         ●세네카 │
└──────────────────────────────────────────┘
                    ↓ 줌인
Level 3: 세기 (예: -500 ~ -400)
┌──────────────────────────────────────────┐
│ -500  -490  -480  -470  -460  -450 -440 │
│                    ●소크라테스(-470~-399) │
│          ●프로타고라스(-490~-420)         │
└──────────────────────────────────────────┘
```

### 5.3 세계지도

#### 마커 클러스터링 전환

```javascript
// React-Leaflet MarkerClusterGroup
<MarkerClusterGroup
  chunkedLoading
  maxClusterRadius={50}
  spiderfyOnMaxZoom
  showCoverageOnHover
  iconCreateFunction={(cluster) => {
    const count = cluster.getChildCount();
    return L.divIcon({
      html: `<div class="marker-cluster">${count}</div>`,
      className: 'custom-cluster',
      iconSize: L.point(40, 40)
    });
  }}
/>
```

---

## 6. 컴포넌트별 인터랙션 명세

### 6.1 PersonCard

```
┌─────────────────────────────┐
│ [카테고리뱃지]  시대뱃지      │  ← 색상으로 즉시 분류 가능
│                              │
│ 인물 이름 (한글)              │  ← Cormorant Garamond
│ Person Name (영문)           │  ← 보조
│                              │
│ 요약 텍스트 1~2줄...          │
│                              │
│ ◆ 개념1  ◆ 개념2  ◆ 개념3   │  ← 태그
└─────────────────────────────┘

상태:
  기본: shadow-sm, border-fresco-shadow
  호버: translateY(-2px), shadow-gold, border-gold/30
  클릭: scale(0.99), 페이지 이동
  로딩: 스켈레톤 펄스
```

### 6.2 ExpandableSection

```
[접힘 상태]
┌──────────────────────────────────┐
│ ▶ 상세 설명                  [+] │
└──────────────────────────────────┘
          │ 클릭 (300ms ease-out)
          ↓
[펼침 상태]
┌──────────────────────────────────┐
│ ▼ 상세 설명                  [-] │
├──────────────────────────────────┤
│                                  │
│ 상세 텍스트가 슬라이드 다운으로   │
│ 자연스럽게 나타난다...            │
│                                  │
└──────────────────────────────────┘
```

```css
.expandable-content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--duration-normal) var(--ease-out);
}

.expandable-content.open {
  grid-template-rows: 1fr;
}

.expandable-content > div {
  overflow: hidden;
}
```

### 6.3 FilterPanel

```
필터 토글 애니메이션:

  [All] [철학] [종교] [과학] [역사] [문화]
          ↑ 클릭
  [All] [■철학■] [종교] [과학] [역사] [문화]
         ↑ 활성: gold background, scale(1.05) → scale(1)
         ↑ 결과 카운트: 숫자 변경 시 counter animation
```

---

## 7. 제스처 & 터치

### 7.1 모바일 제스처 매핑

| 제스처 | 그래프 | 타임라인 | 지도 | 카드목록 |
|--------|--------|----------|------|----------|
| 탭 | 노드 선택 | 인물 선택 | 마커 선택 | 상세 이동 |
| 더블탭 | 줌인 | 줌인 | 줌인 | — |
| 핀치 | 줌 | 시간축 줌 | 줌 | — |
| 드래그 | 패닝 | 시간축 이동 | 패닝 | 스크롤 |
| 스와이프 | — | — | — | 캐러셀 이동 |
| 롱프레스 | 노드 정보 | 인물 정보 | 마커 정보 | 컨텍스트 메뉴 |

### 7.2 관성 스크롤 (Inertia)

```javascript
// 타임라인/그래프 관성 스크롤
let velocity = 0;
let lastPos = 0;

function onDragMove(pos) {
  velocity = pos - lastPos;
  lastPos = pos;
}

function onDragEnd() {
  function inertia() {
    velocity *= 0.95; // 마찰 계수
    if (Math.abs(velocity) > 0.5) {
      pan(velocity);
      requestAnimationFrame(inertia);
    }
  }
  requestAnimationFrame(inertia);
}
```

---

## 8. 로딩 & 상태 애니메이션

### 8.1 스켈레톤 로딩

```css
@keyframes skeleton-pulse {
  0%, 100% {
    background-color: var(--fresco-aged);
    opacity: 0.3;
  }
  50% {
    background-color: var(--fresco-parchment);
    opacity: 0.6;
  }
}

.skeleton {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  border-radius: 4px;
}
```

### 8.2 빈 상태 & 에러

```
404 페이지:
┌────────────────────────────┐
│                            │
│    📜 (찢어진 양피지 SVG)   │
│                            │
│  이 페이지를 찾을 수 없습니다  │
│                            │
│  [홈으로 돌아가기]           │
│                            │
└────────────────────────────┘

검색 결과 없음:
┌────────────────────────────┐
│                            │
│    🔍 (빈 돋보기 SVG)       │
│                            │
│  "검색어"에 대한 결과가       │
│  없습니다                    │
│                            │
│  다른 검색어를 시도해보세요    │
│                            │
└────────────────────────────┘
```

### 8.3 카운터 애니메이션

```typescript
// hooks/useCountAnimation.ts
export function useCountAnimation(target: number, duration = 1000) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const startValue = current;

    function animate(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCurrent(Math.round(startValue + (target - startValue) * eased));

      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [target]);

  return current;
}
```

---

## 9. 접근성

### 9.1 prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .page-enter {
    animation: none;
    opacity: 1;
  }

  .scroll-reveal {
    opacity: 1;
    transform: none;
  }
}
```

### 9.2 포커스 스타일

```css
/* 키보드 포커스: 골드 링 */
:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: 2px;
  border-radius: 4px;
}

/* 마우스 포커스: 없음 */
:focus:not(:focus-visible) {
  outline: none;
}
```

### 9.3 ARIA Live Regions

```tsx
{/* 필터 결과 카운트 변경 알림 */}
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {filteredCount}명의 인물이 표시됩니다
</div>

{/* 검색 결과 알림 */}
<div aria-live="polite" className="sr-only">
  {searchResults.length}개의 검색 결과
</div>
```

---

## 10. 성능 최적화

### 10.1 GPU 가속 규칙

```
✅ GPU 가속 사용 (transform, opacity만):
  - transform: translate, scale, rotate
  - opacity
  - filter (backdrop-filter)

❌ GPU 가속 회피 (layout 트리거):
  - width, height
  - top, left, right, bottom
  - margin, padding
  - font-size
```

### 10.2 will-change 전략

```css
/* 호버 시에만 will-change 적용 */
.fresco-card:hover {
  will-change: transform, box-shadow;
}

/* 애니메이션 종료 후 will-change 제거 */
.fresco-card {
  will-change: auto;
}
```

### 10.3 IntersectionObserver 기반 애니메이션 제어

```typescript
// 뷰포트 밖 애니메이션 중단
function pauseOffscreenAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target as HTMLElement;
      if (entry.isIntersecting) {
        el.style.animationPlayState = 'running';
      } else {
        el.style.animationPlayState = 'paused';
      }
    });
  });

  document.querySelectorAll('[data-animated]').forEach(el => {
    observer.observe(el);
  });
}
```

---

## 11. 구현 코드

### 11.1 전체 @keyframes 목록

```css
/* 기본 등장 */
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes fade-slide-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fade-slide-down { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

/* 강조 */
@keyframes glow-gold { 0%, 100% { box-shadow: 0 0 5px rgba(184,134,11,0.3); } 50% { box-shadow: 0 0 20px rgba(184,134,11,0.6); } }
@keyframes pulse-gold { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

/* 부유 */
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

/* 로딩 */
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes skeleton-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }

/* 카운터 */
@keyframes count-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* 드롭캡 */
@keyframes drop-cap-enter { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
```

### 11.2 Tailwind 커스텀 애니메이션 설정

```typescript
// tailwind.config.ts (animation 섹션)
animation: {
  'fade-in': 'fade-in 300ms ease-out',
  'fade-slide-in': 'fade-slide-in 500ms ease-out',
  'scale-in': 'scale-in 300ms ease-out',
  'glow-gold': 'glow-gold 2s ease-in-out infinite',
  'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
  'float': 'float 3s ease-in-out infinite',
  'spin-slow': 'spin 3s linear infinite',
  'skeleton': 'skeleton-pulse 1.5s ease-in-out infinite',
}
```

---

> **문서 끝**
>
> 다음 문서: [03-ia-ux-navigation.md](./03-ia-ux-navigation.md)
