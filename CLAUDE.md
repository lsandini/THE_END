# THE_END

Expo SDK 55 app that shows the 6 most negative news headlines and generates humorous apocalyptic fiction via the Anthropic API.

## Stack

- Expo SDK 55 + Expo Router (file-based routing)
- TypeScript
- `sentiment` package for negativity scoring
- `@anthropic-ai/sdk` for story generation (model: `claude-sonnet-4-5-20250929`)

## Structure

```
app/_layout.tsx     — Stack navigator with fade transitions
app/index.tsx       — Headlines screen (fetch, score, display top 6)
app/story.tsx       — Story screen (article detail + API generation)
services/news.ts    — RSS fetching (rss2json on web, direct on native)
services/sentiment.ts — Sentiment scoring wrapper
services/anthropic.ts — Anthropic API call
types/sentiment.d.ts  — Type declarations for sentiment package
```

## Setup

```
cp .env.example .env   # Add your ANTHROPIC_API_KEY
npm install
npx expo start
```

## Notes

- Web uses `rss2json.com` API to avoid CORS; native fetches RSS directly
- API key flows through `app.config.ts` → `expo-constants` → runtime (`dangerouslyAllowBrowser: true`)
- Install deps with `--legacy-peer-deps` if peer conflicts arise
