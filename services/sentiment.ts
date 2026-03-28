import Sentiment from "sentiment";
import { Headline } from "./news";

const analyzer = new Sentiment();

export interface ScoredHeadline extends Headline {
  score: number;
}

export function scoreHeadlines(headlines: Headline[]): ScoredHeadline[] {
  return headlines.map((h) => {
    const text = h.description ? `${h.title} ${h.description}` : h.title;
    return { ...h, score: analyzer.analyze(text).score };
  });
}

export function getMostNegative(
  headlines: Headline[],
  count: number = 6
): ScoredHeadline[] {
  const scored = scoreHeadlines(headlines);
  const negative = scored
    .filter((h) => h.score < 0)
    .sort((a, b) => a.score - b.score);

  // take a pool of the top candidates (2x count), then randomly pick `count`
  const poolSize = Math.min(negative.length, count * 2);
  const pool = negative.slice(0, poolSize);

  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, count).sort((a, b) => a.score - b.score);
}
