# Sophia Atlas

> **인류 사상의 시공간 지도** — 철학 계보와 세계 신화/종교를 타임라인과 세계지도로 탐색하는 인터랙티브 웹 플랫폼

## Overview

**Sophia Atlas**는 철학사와 세계 종교/신화를 시각적으로 탐색할 수 있는 오픈소스 웹 플랫폼입니다.

- **Sophia** (Σοφία): 그리스어 '지혜' — Philosophy의 어원
- **Atlas**: 지도책

## Features

- **타임라인 뷰**: BC 600년부터 현대까지 철학사 흐름을 시각적으로 탐색
- **영향 관계 그래프**: 철학자 간 영향 관계를 인터랙티브 노드맵으로 시각화
- **세계지도 뷰**: 지역별 신화와 종교를 지도에서 탐색
- **종교 분파 트리**: 주요 종교의 분파 역사를 트리 구조로 시각화
- **비교 매트릭스**: 창조신화, 사후세계, 윤리관 등 테마별 비교
- **학습 경로**: 입문자부터 심화까지 단계별 학습 코스
- **통합 검색**: 철학자, 종교, 용어를 한 번에 검색
- **오늘의 명언**: 매일 새로운 철학/종교 명언 제공

## Tech Stack

| Area | Technology |
|------|-----------|
| Framework | Next.js 14 (App Router, Static Export) |
| Styling | Tailwind CSS |
| Language | TypeScript |
| Search | Fuse.js |
| Icons | Lucide React |
| Deployment | GitHub Pages |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000/Sophia-Atlas](http://localhost:3000/Sophia-Atlas)

## Build & Deploy

```bash
npm run build
```

Static files are exported to the `out/` directory. Deployment is automated via GitHub Actions.

## Project Structure

```
src/
├── app/          # Next.js App Router pages
├── components/   # React components
├── data/         # JSON data files
├── lib/          # Utility functions
└── types/        # TypeScript type definitions
```

## Contributing

Contributions are welcome! Please see the About page for contribution guidelines.

## License

ISC

## Credits

- 기반 자료: "5분 뚝딱 철학 - 생각의 역사"
- 참고: Stanford Encyclopedia of Philosophy, Internet Encyclopedia of Philosophy
