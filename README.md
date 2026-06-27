# OurCFO

OurCFO는 우리집 자산현황, 주식계좌, 가계부를 관리하는 개인용 자산관리 대시보드입니다. 현재 화면 기능은 브라우저 기반으로 유지하면서, Vercel Production 배포와 향후 AI CIO 브리핑, 텔레그램 알림, OpenAI API 연동을 위한 REST API 계층을 함께 제공합니다.

## 현재 기술스택

| 항목 | 현재 상태 |
| --- | --- |
| Frontend | Vanilla HTML/CSS/JavaScript (`index.html`, `styles.css`, `app.js`) |
| Backend | Vercel Serverless Functions (`api/*.js`) |
| Database | 현재 화면 데이터는 브라우저 `localStorage` 저장. Production API는 Supabase PostgreSQL 또는 환경변수 seed JSON을 읽을 수 있음 |
| 인증 | 화면 진입 PIN은 프론트엔드 세션 잠금 방식. API는 `OURCFO_API_READ_TOKEN` 설정 시 Bearer token 필요 |
| 현재 실행 방식 | `pnpm dev` 또는 `npm run dev`로 로컬 서버 실행 |
| 배포 가능 여부 | Vercel 정적 사이트 + Serverless API 형태로 배포 가능 |
| Vercel 주의점 | `localStorage` 데이터는 서버에서 직접 읽을 수 없으므로, AI/API가 읽으려면 Supabase 이전 또는 seed 환경변수 등록 필요 |

## 로컬 실행

```bash
pnpm install
pnpm dev
```

기본 주소는 `http://127.0.0.1:4173` 입니다.

API 확인:

```bash
curl http://127.0.0.1:4173/api/dashboard
curl http://127.0.0.1:4173/api/assets
curl http://127.0.0.1:4173/api/stocks
curl http://127.0.0.1:4173/api/budget
curl http://127.0.0.1:4173/api/portfolio
curl http://127.0.0.1:4173/api/summary
```

`OURCFO_API_READ_TOKEN`을 설정한 경우:

```bash
curl -H "Authorization: Bearer <token>" http://127.0.0.1:4173/api/summary
```

## 환경변수

`.env` 파일은 GitHub에 올리지 않습니다. 필요한 값은 `.env.example`을 기준으로 Vercel Project Settings의 Environment Variables에 등록합니다.

| 변수 | 설명 |
| --- | --- |
| `OURCFO_DATA_SOURCE` | `seed` 또는 `supabase` |
| `OURCFO_API_READ_TOKEN` | API 읽기 보호 토큰. Production에서는 설정 권장 |
| `OURCFO_INITIAL_DATA` | 대시보드에서 내보낸 JSON을 seed로 등록할 때 사용 |
| `OURCFO_INITIAL_DATA_BASE64` | JSON이 너무 길거나 특수문자가 많을 때 base64로 등록 |
| `SUPABASE_URL` | Supabase 프로젝트 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 API에서만 사용하는 Supabase service role key |
| `OPENAI_API_KEY` | 향후 OpenAI Responses API 연동용 |
| `TELEGRAM_BOT_TOKEN` | 향후 텔레그램 알림용 |
| `TELEGRAM_CHAT_ID` | 향후 텔레그램 알림 대상 |

## GitHub Push 준비

이 폴더는 GitHub에 올릴 수 있도록 `.gitignore`가 구성되어 있습니다. 다음 항목은 커밋하지 않습니다.

- `.env`, `.env.*`
- `.vercel`, `.vercel-home`
- `node_modules`, `.pnpm-store`
- 로컬 서버 로그

일반적인 Push 순서:

```bash
git init
git add .
git commit -m "Prepare OurCFO production deployment"
git branch -M main
git remote add origin https://github.com/<owner>/<repo>.git
git push -u origin main
```

## Vercel 배포

권장 방식은 Vercel의 GitHub Integration입니다.

1. GitHub에 OurCFO 저장소를 Push합니다.
2. Vercel Dashboard에서 `Add New Project`를 선택합니다.
3. GitHub 저장소를 Import합니다.
4. Framework Preset은 `Other` 또는 자동 감지 그대로 둡니다.
5. Build Command는 비워두거나 `pnpm build`를 사용합니다.
6. Output Directory는 비워둡니다.
7. Environment Variables를 등록합니다.
8. Deploy를 실행합니다.

이후 `main` 브랜치에 Push하면 Vercel이 자동으로 Production 배포를 갱신합니다. 배포가 완료되면 `https://<project-name>.vercel.app` 주소로 PC가 꺼져 있어도 접속할 수 있습니다.

CLI 배포:

```bash
pnpm vercel link
pnpm deploy:production
```

## Supabase 연결

현재 화면의 기존 데이터는 브라우저 `localStorage`에 있으므로, 서버 API와 AI가 읽으려면 Supabase로 이전하는 것을 권장합니다.

1. Supabase 프로젝트를 생성합니다.
2. SQL Editor에서 `database/supabase-schema.sql`을 실행합니다.
3. OurCFO 화면에서 `내보내기`로 JSON 파일을 저장합니다.
4. 환경변수를 설정한 뒤 마이그레이션을 실행합니다.

```bash
$env:SUPABASE_URL="https://xxxxx.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="xxxxx"
node scripts/localstorage-to-supabase.mjs .\ourcfo-export.json
```

5. Vercel Environment Variables에 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OURCFO_API_READ_TOKEN`을 등록합니다.
6. 재배포 후 `/api/summary`가 Supabase 데이터를 반환하는지 확인합니다.

## API 구조

모든 API는 JSON을 반환합니다.

| API | 용도 |
| --- | --- |
| `GET /api/assets` | 자산현황 및 순자산 합계 |
| `GET /api/stocks` | 보유 주식, 거래내역, 계좌/종목별 합계 |
| `GET /api/budget` | 월별 가계부. `?month=YYYY-MM` 지원 |
| `GET /api/dashboard` | 대시보드 핵심 지표 |
| `GET /api/portfolio` | 투자 포트폴리오 요약 |
| `GET /api/summary` | AI 브리핑용 압축 요약 |

향후 OpenAI Responses API를 붙일 때는 `/api/summary`, `/api/dashboard`, `/api/portfolio`를 도구 입력으로 사용하면 됩니다.

## 업데이트 방법

1. 로컬에서 화면과 API를 확인합니다.
2. 민감정보가 `.env` 또는 Vercel Environment Variables에만 있는지 확인합니다.
3. GitHub에 commit/push합니다.
4. Vercel 배포 로그를 확인합니다.
5. Production URL에서 화면과 `/api/summary`를 확인합니다.

## 장애 발생 시 확인

- 화면이 안 열림: Vercel Deployment 로그와 `index.html`, `app.js`, `styles.css` 포함 여부 확인
- API가 401 반환: `OURCFO_API_READ_TOKEN`과 Authorization header 확인
- API 데이터가 비어 있음: Supabase 환경변수 또는 `OURCFO_INITIAL_DATA` 등록 여부 확인
- Supabase 오류: `database/supabase-schema.sql` 실행 여부와 service role key 확인
- 주가 데이터 오류: `/api/yahoo` 응답과 외부 Yahoo Finance 요청 제한 여부 확인

## 장기 목표

OurCFO는 단순한 자산관리 웹사이트가 아니라, 가족 자산을 자연어로 묻고 답하는 AI 패밀리오피스 시스템을 목표로 합니다. 현재 REST API는 향후 AI CIO 브리핑, 자녀계좌/ISA/연금저축 분석, 경제이슈 요약, 텔레그램 알림, OpenAI Responses API 도구 호출 구조로 확장할 수 있게 분리되어 있습니다.
