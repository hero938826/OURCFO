# OurCFO Telegram Automation

OurCFO morning notifications run on GitHub Actions, so the PC can be turned off.

## Schedule

GitHub Actions cron uses UTC.

- 08:00 KST CIO briefing: `.github/workflows/ourcfo-cio-briefing.yml` / `0 23 * * *`
- 08:30 KST Nasdaq-100 drawdown TOP10: `.github/workflows/ourcfo-nasdaq-drawdowns.yml` / `30 23 * * *`
- 09:00 KST economy lesson: `.github/workflows/ourcfo-economy-lesson.yml` / `0 0 * * *`
- Condition alerts: `.github/workflows/ourcfo-cio-alerts.yml` / `*/30 * * * *`

Vercel Cron is not required for these notifications. The workflows check out this repository and run the Node modules directly.

## Required GitHub Secrets

Add these at GitHub repository `Settings -> Secrets and variables -> Actions`.

```bash
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are required for accurate OurCFO asset data. If Supabase is not used, set `OURCFO_INITIAL_DATA_BASE64` instead.

Optional:

```bash
OURCFO_INITIAL_DATA_BASE64=
OPENAI_API_KEY=
```

## Manual Test

In GitHub, open the `Actions` tab, choose a workflow, and run `Run workflow`.

Local tests still work:

```bash
node scripts/github-action-runner.cjs cio-briefing
node scripts/github-action-runner.cjs nasdaq-drawdowns
node scripts/github-action-runner.cjs economy-lesson
node scripts/github-action-runner.cjs condition-alerts
```

Telegram delivery requires that the bot chat has already been started with `/start`.
