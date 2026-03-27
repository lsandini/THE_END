# THE_END — Doom Headlines App

## Overview

A mobile app built with Expo SDK 55 that fetches news headlines from free RSS feeds, ranks them by negativity using sentiment analysis, displays the 6 most negative headlines, and lets the user tap one to generate a humorous, fictional cataclysmic future via the Anthropic API.

## Screens

### Screen 1: Headlines

- On load, fetch headlines from 3-4 free RSS news sources (BBC, Reuters, NPR, Al Jazeera)
- Parse RSS XML to extract headline titles
- Score each headline using the `sentiment` npm package (lower score = more negative)
- Sort ascending by score, display the top 6 most negative
- Each headline is tappable and navigates to the Story screen
- Pull-to-refresh to re-fetch and re-rank
- Show a loading indicator while fetching

### Screen 2: Story (The End)

- Receives the selected headline as a route parameter
- Displays the headline at the top
- Sends the headline to the Anthropic API with a system prompt instructing it to generate a fictional, humorous escalation of events ending in the complete extinction of humankind
- Displays the generated text as it arrives
- Back button to return to headlines

## Data Flow

```
RSS Feeds → fetch & parse XML → extract titles → sentiment score → sort → top 6 → display
                                                                          ↓ (user taps)
                                                            Anthropic API → generated story → display
```

## Technology

- **Expo SDK 55** with Expo Router (file-based routing)
- **sentiment** npm package for negativity scoring
- **@anthropic-ai/sdk** for Anthropic API calls
- **RSS parsing** via a lightweight XML parser or regex extraction
- **react-native-dotenv** or `expo-constants` for environment variables

## File Structure

```
app/
  _layout.tsx          — Root layout with Stack navigator
  index.tsx            — Headlines screen
  story.tsx            — Generated story screen
services/
  news.ts              — RSS fetching & parsing
  sentiment.ts         — Scoring wrapper using sentiment package
  anthropic.ts         — API call to generate cataclysmic story
.env                   — ANTHROPIC_API_KEY
```

## RSS Sources

- BBC World News: `http://feeds.bbci.co.uk/news/world/rss.xml`
- Reuters World: `https://www.rss-bridge.org/bridge01/?action=display&bridge=Reuters&feed=world&format=Atom` (or similar free proxy)
- NPR News: `https://feeds.npr.org/1001/rss.xml`
- Al Jazeera: `https://www.aljazeera.com/xml/rss/all.xml`

Note: Some feeds may require a CORS proxy or alternative endpoints. We will test and adjust during implementation.

## Anthropic API Prompt

System prompt:
> You are a darkly comedic fiction writer. Given a real news headline, write a fictional, humorous chain of increasingly absurd events that escalates from that headline into the complete end of human civilization. Be creative, surprising, and funny. Despite the humor, always end with the total and irreversible extinction of humankind and the collapse of civilization. Keep it to about 3-4 paragraphs.

## Styling

Plain/default React Native styling. No custom themes or design system. Functional only.

## Out of Scope

- User accounts or authentication
- Persistent storage or caching
- Custom styling or theming
- Push notifications
- Offline support
