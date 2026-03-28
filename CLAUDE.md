# THE_END

Expo SDK 55 app that shows the most negative news headlines and generates humorous apocalyptic fiction via the Anthropic API.

## Stack

- Expo SDK 55 + Expo Router (file-based routing)
- TypeScript
- `sentiment` package for negativity scoring
- `react-native-svg` for flame animations
- `@anthropic-ai/sdk` for story generation (model configurable in `services/anthropic.ts`, currently `claude-haiku-4-5-20251001`)

## Structure

```
app/_layout.tsx          — Stack navigator with fade transitions, shared back button
app/index.tsx            — Welcome intro + Headlines screen
app/story.tsx            — Story screen (paragraph-by-paragraph reveal)
components/BurningSkyline.tsx — Animated SVG burning city skyline
theme.ts                 — Shared palette, typography, glow utilities
services/news.ts         — RSS fetching (rss2json on web, direct on native)
services/sentiment.ts    — Sentiment scoring with randomized top selection
services/anthropic.ts    — Anthropic API call
types/sentiment.d.ts     — Type declarations for sentiment package
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
- **Security**: The API key is exposed client-side. For production, use a backend proxy.
- Install deps with `--legacy-peer-deps` if peer conflicts arise
- Dark theme throughout — splash, status bar, and `userInterfaceStyle` all set to dark
