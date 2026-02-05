# Sophia Atlas — 다중 시각화 뷰 설계서 v1.0

> **"인드라망 — 모든 것이 연결된 보석의 그물을 시각화한다"**
> 작성일: 2026-02-05 | 버전: 1.0 | 상태: Draft

---

## 1. 시각화 철학

Sophia Atlas의 시각화는 단순한 차트가 아니다. **사상의 지형**을 보여주는 것이다.
사용자가 "아, 이것들이 이렇게 연결되어 있구나"라는 깨달음을 얻는 순간을 만드는 것이 목표이다.

### 1.1 5대 시각화 뷰

| 뷰 | 목적 | 기술 | 페이지 |
|----|------|------|--------|
| **인드라망 그래프** | 관계 네트워크 탐색 | D3.js Force | /connections |
| **타임라인** | 시간축 탐색 | D3.js / Custom | /*/timeline |
| **세계지도** | 공간축 탐색 | React-Leaflet | /religion/map |
| **분파 트리** | 계층 구조 탐색 | D3.js Tree | /religion/tree |
| **비교 매트릭스** | 병렬 비교 | CSS Grid | /religion/compare |

---

## 2. 인드라망 그래프 (Force-Directed Graph)

### 2.1 노드 설계

#### Person 노드

```javascript
// 노드 속성
{
  id: 'socrates',
  type: 'person',
  category: 'philosopher',        // 색상 결정
  era: 'ancient',                  // 테두리 색상
  radius: 8 + connections * 0.5,   // 크기 = 기본 + 연결 수 비례
  label: '소크라테스',
  color: '#4A5D8A',               // philosopher
  borderColor: '#B8860B',          // ancient
}
```

| 카테고리 | 색상 | 형태 |
|----------|------|------|
| philosopher | #4A5D8A | 원형 |
| religious_figure | #B8860B | 원형 |
| scientist | #5B7355 | 원형 |
| historical_figure | #8B4040 | 원형 |
| cultural_figure | #7A5478 | 원형 |

#### Entity 노드

| 엔터티 유형 | 형태 | 크기 |
|------------|------|------|
| event | ◇ 다이아몬드 | 10px |
| ideology | △ 삼각형 | 10px |
| movement | ⬠ 오각형 | 10px |
| institution | □ 사각형 | 10px |
| text | ⬡ 육각형 | 10px |
| concept | ○ 작은 원 | 8px |

### 2.2 엣지 설계

```javascript
const EDGE_STYLES = {
  // Person ↔ Person
  influenced:      { stroke: '#4A5D8A', width: 1.5, dash: 'none', arrow: true },
  opposed:         { stroke: '#8B4040', width: 1.5, dash: '4,4', arrow: true },
  developed:       { stroke: '#5B7355', width: 1.5, dash: 'none', arrow: true },
  parallel:        { stroke: '#6B4E8A', width: 1,   dash: '2,4', arrow: false },
  contextual:      { stroke: '#9C8B73', width: 0.8, dash: '2,4', arrow: false },
  teacher_student: { stroke: '#4A5D8A', width: 2,   dash: 'none', arrow: true },
  collaborated:    { stroke: '#B8860B', width: 1.5, dash: 'none', arrow: false },
  contemporary:    { stroke: '#9C8B73', width: 0.8, dash: '4,2', arrow: false },

  // Person ↔ Entity
  founded:      { stroke: '#B8860B', width: 1.5, dash: 'none', arrow: true },
  member_of:    { stroke: '#7A6B55', width: 1,   dash: 'none', arrow: true },
  authored:     { stroke: '#5B7355', width: 1,   dash: 'none', arrow: true },
  belongs_to:   { stroke: '#7A6B55', width: 0.8, dash: '2,2', arrow: true },
  // ... 나머지 유형
};
```

### 2.3 Force Simulation 상세

```javascript
const simulation = d3.forceSimulation(nodes)
  // 링크 힘: 연결된 노드를 적정 거리로
  .force('link', d3.forceLink(links)
    .id(d => d.id)
    .distance(d => {
      // strength별 거리 조절
      if (d.strength === 3) return 60;
      if (d.strength === 2) return 100;
      return 150;
    })
    .strength(d => d.strength === 3 ? 0.8 : 0.3)
  )
  // 척력: 노드 간 반발력
  .force('charge', d3.forceManyBody()
    .strength(d => d.type === 'person' ? -300 : -100)
    .distanceMax(500)
  )
  // 중심력
  .force('center', d3.forceCenter(width / 2, height / 2).strength(0.05))
  // 충돌 방지
  .force('collision', d3.forceCollide()
    .radius(d => d.radius + 5)
    .strength(0.7)
  )
  // 카테고리 클러스터링 (선택)
  .force('x', d3.forceX()
    .x(d => getCategoryX(d.category))
    .strength(0.03)
  );
```

### 2.4 레이아웃 모드 (5종)

```
1. Force-directed (기본):
   자연스러운 클러스터링, 관계 기반 배치

2. Radial (방사형):
   선택 노드를 중심에, 연결 노드를 동심원으로
   ┌─────────────────┐
   │    ○   ○        │
   │  ○   ★   ○     │
   │    ○   ○        │
   └─────────────────┘

3. Timeline (시간축):
   x축 = 시간, y축 = 카테고리
   ┌─────────────────┐
   │ 철학 ●  ●   ●   │
   │ 종교   ●  ●     │
   │ 과학     ●  ● ● │
   │ -500  0  1000 2000│
   └─────────────────┘

4. Hierarchical (계층):
   영향 관계 기반 상하 배치

5. Geographic (지리):
   대략적 위도/경도 기반 배치
```

### 2.5 성능 최적화

| 노드 수 | 렌더링 방식 | 목표 FPS |
|---------|------------|---------|
| ~200 | SVG | 60fps |
| 200~1000 | Canvas | 60fps |
| 1000~3000 | Canvas + LOD | 30fps |
| 3000+ | WebGL (future) | 30fps |

```javascript
// Canvas 렌더링 최적화
function renderCanvas(ctx, nodes, edges) {
  ctx.clearRect(0, 0, width, height);

  // 1. 엣지 먼저 (뒤에)
  ctx.globalAlpha = 0.4;
  edges.forEach(edge => {
    ctx.beginPath();
    ctx.moveTo(edge.source.x, edge.source.y);
    ctx.lineTo(edge.target.x, edge.target.y);
    ctx.strokeStyle = EDGE_STYLES[edge.type].stroke;
    ctx.lineWidth = EDGE_STYLES[edge.type].width;
    ctx.stroke();
  });

  // 2. 노드 (앞에)
  ctx.globalAlpha = 1;
  nodes.forEach(node => {
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    ctx.fillStyle = node.color;
    ctx.fill();
    ctx.strokeStyle = node.borderColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  // 3. 라벨 (줌 레벨에 따라)
  if (currentZoom > 0.8) {
    ctx.font = '11px "Pretendard", sans-serif';
    ctx.fillStyle = '#2C2416';
    ctx.textAlign = 'center';
    nodes.forEach(node => {
      ctx.fillText(node.label, node.x, node.y + node.radius + 14);
    });
  }
}
```

---

## 3. 타임라인 시각화

### 3.1 기본 구조

```
x축: 시간 (-3000 BCE ~ 2025 CE)
y축: 카테고리별 행 또는 자유 배치

┌────────────────────────────────────────────────┐
│  고대(-3000~500)  │ 중세(500~1500) │ 근대(1500~) │
│  █████████████████│████████████████│████████████│
│                   │                │            │
│  ● 탈레스    ● 플라톤          ● 아퀴나스    ● 칸트 │
│  ● 붓다      ● 아리스          ● 이븐시나    ● 헤겔 │
│                   │                │            │
│  ▼ 과학혁명 시작  ▼ 종교개혁      ▼ 프랑스혁명 │
│  (사건 오버레이)                                │
└────────────────────────────────────────────────┘
```

### 3.2 줌 레벨 (4단계)

| Level | 시간 범위 | 표시 내용 | d3 scale |
|-------|-----------|-----------|----------|
| 1 (전체) | -3000~2025 | 시대 블록, MVP 인물만 | scaleTime, domain 5000yr |
| 2 (시대) | ~500년 | 주요 인물 + 주요 사건 | domain 500yr |
| 3 (세기) | ~100년 | 모든 인물 + 모든 사건 | domain 100yr |
| 4 (상세) | ~30년 | 생몰년 바 + 저작 시점 | domain 30yr |

### 3.3 인터랙션

```javascript
// 줌 + 패닝
const zoom = d3.zoom()
  .scaleExtent([0.5, 50])
  .on('zoom', ({ transform }) => {
    // x축 스케일 업데이트
    const newXScale = transform.rescaleX(xScale);
    xAxis.call(d3.axisBottom(newXScale));

    // 노드 위치 업데이트
    personNodes
      .attr('cx', d => newXScale(d.period.start))
      .attr('display', d => {
        // 줌 레벨에 따라 표시/숨김
        const zoomLevel = transform.k;
        if (zoomLevel < 2 && !d.mvp) return 'none';
        return 'block';
      });
  });
```

---

## 4. 세계지도 시각화

### 4.1 React-Leaflet 기본 설정

```tsx
<MapContainer
  center={[30, 20]}        // 세계 중심 부근
  zoom={2}
  minZoom={2}
  maxZoom={12}
  style={{ height: '100vh', width: '100%' }}
  className="fresco-map"
>
  <TileLayer
    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
    attribution='&copy; OpenStreetMap'
  />
  <MarkerClusterGroup
    chunkedLoading
    maxClusterRadius={50}
    iconCreateFunction={createClusterIcon}
  >
    {persons.map(person => (
      <Marker
        key={person.id}
        position={[person.location.lat, person.location.lng]}
        icon={createPersonIcon(person)}
      >
        <Popup>
          <PersonPopupCard person={person} />
        </Popup>
      </Marker>
    ))}
  </MarkerClusterGroup>
</MapContainer>
```

### 4.2 프레스코 스타일 지도

현재는 CartoDB 라이트 타일 사용. 미래 개선:
- 세피아 톤 필터 (CSS filter: sepia(0.3))
- 커스텀 Mapbox 스타일 (양피지 색상 팔레트)
- 고대 지도 스타일 타일 (Stamen Watercolor 참고)

### 4.3 오버레이 레이어

```
Layer 1: 인물 마커 (기본)
Layer 2: 종교 분포 히트맵 (토글)
Layer 3: 사상 전파 경로 (토글, 애니메이션)
Layer 4: 문명 영역 폴리곤 (토글)
```

---

## 5. 분파 트리 시각화

### 5.1 D3.js Tree Layout

```javascript
const treeLayout = d3.tree()
  .size([height, width - 200])
  .separation((a, b) => a.parent === b.parent ? 1 : 1.5);

const root = d3.hierarchy(religionData);
treeLayout(root);

// 노드 렌더링
svg.selectAll('.node')
  .data(root.descendants())
  .join('g')
  .attr('class', 'node')
  .attr('transform', d => `translate(${d.y},${d.x})`);

// 링크 렌더링 (곡선)
svg.selectAll('.link')
  .data(root.links())
  .join('path')
  .attr('class', 'link')
  .attr('d', d3.linkHorizontal()
    .x(d => d.y)
    .y(d => d.x)
  );
```

### 5.2 종교별 트리 데이터

```
기독교
├── 동방교회 (1054)
│   ├── 동방 정교회
│   ├── 동방 가톨릭
│   └── 오리엔탈 정교회
└── 서방교회
    ├── 로마 가톨릭
    └── 개신교 (1517)
        ├── 루터교
        ├── 칼뱅주의/개혁교회
        ├── 성공회
        ├── 침례교
        ├── 감리교
        └── 오순절/카리스마

불교
├── 상좌부불교 (테라바다)
│   └── 스리랑카, 미얀마, 태국
├── 대승불교 (마하야나)
│   ├── 중관학파 (나가르주나)
│   ├── 유식학파 (바수반두)
│   ├── 선불교 (禪)
│   │   ├── 임제종
│   │   └── 조동종
│   ├── 정토종
│   └── 천태/화엄
└── 금강승 (바즈라야나)
    └── 티베트 불교
```

---

## 6. 비교 매트릭스

### 6.1 종교 비교

```
            │ 창조  │ 사후세계 │ 윤리관 │ 신관  │ 구원관
────────────┼───────┼─────────┼────────┼───────┼────────
기독교      │ 유신론 │ 천국/지옥 │ 사랑   │ 유일신│ 은총
이슬람      │ 유신론 │ 천국/지옥 │ 순종   │ 유일신│ 순종
불교        │ 연기  │ 윤회/열반 │ 자비   │ 무신론│ 깨달음
힌두교      │ 범아일│ 윤회/해탈 │ 다르마 │ 다신론│ 해탈
유대교      │ 유신론 │ 다양    │ 율법   │ 유일신│ 율법
도교        │ 도    │ 불사    │ 무위   │ 범신론│ 합도
```

### 6.2 CSS Grid 구현

```css
.compare-matrix {
  display: grid;
  grid-template-columns: 120px repeat(var(--cols), 1fr);
  gap: 1px;
  background: var(--fresco-shadow);
}

.compare-cell {
  background: var(--fresco-ivory);
  padding: 12px;
  font-size: 0.875rem;
  line-height: 1.6;
  transition: background-color 200ms ease-out;
}

.compare-cell:hover {
  background: var(--fresco-parchment);
}

.compare-header {
  background: var(--fresco-aged);
  font-family: 'Cormorant Garamond', serif;
  font-weight: 600;
  color: var(--ink-dark);
}
```

---

## 7. 프레스코 디자인 적용

모든 시각화에 공통 적용:

| 요소 | 스타일 |
|------|--------|
| 배경 | fresco-ivory (#FAF6E9) + 미묘한 parchment-texture |
| 노드 채우기 | 카테고리별 색상 (따뜻한 톤) |
| 엣지/선 | 세피아 톤 (ink-light #7A6B55 기본) |
| 툴팁 | fresco-card 스타일 (양피지 배경, 세피아 그림자) |
| 범례 | 골드 테두리, 양피지 배경 |
| 그리드라인 | fresco-shadow/30 (#D4C4AB at 30% opacity) |
| 텍스트 | ink-dark (#2C2416), Pretendard 폰트 |
| 강조 | gold (#B8860B) glow effect |

---

## 8. 구현 로드맵

| Phase | 시각화 | 기능 |
|-------|--------|------|
| Phase 1 | Force Graph + Timeline | 기본 렌더링 + 필터 |
| Phase 2 | Map + Tree + Compare | 기본 구현 |
| Phase 3 | 고급 인터랙션 | 줌 LOD, 레이아웃 모드, 애니메이션 |
| Phase 4 | 성능 최적화 | Canvas 전환, Web Worker |
| Phase 5 | 통합 대시보드 | 미니 위젯, 크로스 시각화 링크 |

---

> **문서 끝**
>
> 다음 문서: [07-domain-expansion-architecture.md](./07-domain-expansion-architecture.md)
