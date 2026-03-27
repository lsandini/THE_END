declare module "sentiment" {
  interface SentimentResult {
    score: number;
    comparative: number;
    tokens: string[];
    words: string[];
    positive: string[];
    negative: string[];
  }
  export default class Sentiment {
    analyze(phrase: string): SentimentResult;
  }
}
