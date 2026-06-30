# OurCFO Supabase 실시간 데이터 연결

이 방식으로 연결하면 브라우저에 저장한 자산/가계부/주식 데이터가 Supabase에 저장되고, GitHub Actions 알림도 같은 최신 데이터를 읽습니다.

## 1. Supabase에서 프로젝트 만들기

1. Supabase에 로그인합니다.
2. New project를 만듭니다.
3. Project Settings > API에서 아래 값을 확인합니다.
   - Project URL -> `SUPABASE_URL`
   - service_role key -> `SUPABASE_SERVICE_ROLE_KEY`

`SUPABASE_SERVICE_ROLE_KEY`는 절대 화면 코드에 넣지 말고 `.env`, Vercel, GitHub Actions Secret에만 넣습니다.

## 2. 테이블 만들기

Supabase SQL Editor에서 `database/supabase-schema.sql` 전체 내용을 실행합니다.

## 3. 기존 JSON 데이터 1회 업로드

프로젝트 루트의 `.env`에 아래 값을 넣습니다.

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

그 다음 로컬에서 1회 실행합니다.

```powershell
node scripts/localstorage-to-supabase.mjs "C:\Users\wooer\Downloads\ourcfo-export.json"
```

## 4. GitHub Actions Secret에 추가

GitHub 저장소 > Settings > Secrets and variables > Actions에 아래 값을 추가합니다.

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

이후 `OURCFO_INITIAL_DATA_BASE64`는 임시 스냅샷 용도라 없어도 됩니다. Supabase 값이 있으면 GitHub Actions는 Supabase를 우선 읽습니다.

## 5. 운영 방식

- 앱에서 자산/가계부/주식 정보를 저장하면 로컬 저장 후 Supabase 저장이 예약됩니다.
- 앱을 다시 열면 Supabase에 저장된 최신 데이터를 먼저 불러옵니다.
- GitHub Actions 알림은 PC가 꺼져 있어도 Supabase 최신 데이터를 읽어 텔레그램으로 보냅니다.

## 6. 주의

브라우저 앱은 Supabase service role key를 직접 알지 않습니다. 앱은 `/api/state`로 저장 요청을 보내고, 서버 API가 Supabase에 저장합니다.
