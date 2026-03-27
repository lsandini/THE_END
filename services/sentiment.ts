import Sentiment from "sentiment";
import { Headline } from "./news";

const analyzer = new Sentiment();

export interface ScoredHeadline extends Headline {
  score: number;
}

export function scoreHeadlines(headlines: Headline[]): ScoredHeadline[] {
  return headlines.map((h) => ({
    ...h,
    score: analyzer.analyze(h.title).score,
  }));
}

export function getMostNegative(
  headlines: Headline[],
  count: number = 6
): ScoredHeadline[] {
  const scored = scoreHeadlines(headlines);
  return scored
    .filter((h) => h.score < 0)
    .sort((a, b) => a.score - b.score)
    .slice(0, count);
}
