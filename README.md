# NEXPLAY Frontend

올해 신작, 인기 게임, 출시 일정과 공식 업데이트를 탐색하는 NEXPLAY의 Next.js 프론트엔드입니다. 백엔드는 [`nexplay-be`](https://github.com/ronypoong/nexplay-be) 저장소에 있습니다.

## 실행

```bash
npm install
npm run dev
```

프론트엔드는 `http://localhost:3003`에서 실행됩니다. `.env.local`에는 다음 값이 필요합니다.

```dotenv
NEXT_PUBLIC_NEXPLAY_API_BASE_URL=http://localhost:4004
```

화면은 백엔드의 실제 데이터만 사용하며 API 실패 시 목업으로 fallback하지 않습니다. 따라서 프론트 실행 전 백엔드 `http://localhost:4004/actuator/health`를 확인하세요.

## 주요 화면

- 홈: 10개 인기 급상승 캐러셀, NEXPLAY 매거진, 출시 예정, 숨은 기대작
- 게임 탐색과 통합 검색
- 복수 장르·플랫폼이 표시되는 게임 카드와 상세 화면
- 게임 상세, NEXPLAY 지수/기대 지수, 공식 이벤트 타임라인
- 현재 월부터 6개월 범위의 출시 캘린더와 플랫폼 필터
- 검증된 공식 URL이 있을 때만 노출되는 YouTube 트레일러

## 검증

```bash
npm run build
npm run lint
```

Next.js 버전별 작업 규칙은 [`AGENTS.md`](./AGENTS.md)를 따릅니다.

## 라이선스

**Copyright (c) 2026 RUBI-ON. All rights reserved.**

소스를 공개해 두었지만 오픈소스는 아닙니다. 열람과 학습은 자유롭게 하셔도 되고,
복제·개작·배포·서비스 운영은 사전 서면 허락이 필요합니다. 전문은 [`LICENSE`](./LICENSE)에 있습니다.

수집·표시하는 데이터의 권리는 각 출처(Wikidata CC0, Wikipedia CC BY-SA, Steam,
각 게임사)에 있으며 위 조건이 아니라 각 출처의 라이선스를 따릅니다.
