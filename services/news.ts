export interface Headline {
  title: string;
  description: string;
  source: string;
}

const RSS_FEEDS = [
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC" },
  { url: "https://feeds.npr.org/1001/rss.xml", source: "NPR" },
  { url: "https://www.aljazeera.com/xml/rss/all.xml", source: "Al Jazeera" },
  {
    url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    source: "NYT",
  },
];

function extractTag(xml: string, tag: string): string {
  const cdataRegex = new RegExp(
    `<${tag}>[\\s]*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>[\\s]*</${tag}>`,
    "i"
  );
  const plainRegex = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i");
  const match = xml.match(cdataRegex) || xml.match(plainRegex);
  return match ? match[1].trim() : "";
}

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

function parseItems(xml: string, source: string): Headline[] {
  const headlines: Headline[] = [];
  const itemRegex = /<item[\s>][\s\S]*?<\/item>/gi;
  const items = xml.match(itemRegex) || [];

  for (const item of items) {
    const title = extractTag(item, "title");
    const rawDesc = extractTag(item, "description");
    const description = stripHtml(rawDesc);

    if (title) {
      headlines.push({ title, description, source });
    }
  }
  return headlines;
}

import { Platform } from "react-native";

const CORS_PROXY = "https://api.allorigins.win/raw?url=";

function feedUrl(url: string): string {
  if (Platform.OS === "web") {
    return CORS_PROXY + encodeURIComponent(url);
  }
  return url;
}

export async function fetchHeadlines(): Promise<Headline[]> {
  const results = await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      const response = await fetch(feedUrl(feed.url));
      if (!response.ok) {
        throw new Error(`${feed.source}: HTTP ${response.status}`);
      }
      const xml = await response.text();
      return parseItems(xml, feed.source);
    })
  );

  const allHeadlines: Headline[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      allHeadlines.push(...result.value);
    }
  }
  return allHeadlines;
}
