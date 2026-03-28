import { Platform } from "react-native";

export interface Headline {
  title: string;
  description: string;
  source: string;
}

const RSS_FEEDS = [
  // International / hard news
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC" },
  { url: "https://feeds.npr.org/1001/rss.xml", source: "NPR" },
  { url: "https://www.aljazeera.com/xml/rss/all.xml", source: "Al Jazeera" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", source: "NYT" },
  { url: "https://www.theguardian.com/world/rss", source: "The Guardian" },
  { url: "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en", source: "Google News" },
  { url: "https://rss.dw.com/rdf/rss-en-all", source: "Deutsche Welle" },
  { url: "https://www.france24.com/en/rss", source: "France 24" },
  // US-heavy
  { url: "https://feeds.washingtonpost.com/rss/world", source: "Washington Post" },
  { url: "https://feeds.abcnews.com/abcnews/internationalheadlines", source: "ABC News" },
  { url: "https://www.cbsnews.com/latest/rss/world", source: "CBS News" },
  // Science / climate / existential risk
  { url: "https://feeds.newscientist.com/home", source: "New Scientist" },
  { url: "https://www.nature.com/nature.rss", source: "Nature" },
];

// --- XML parsing for native ---

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
  return str
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function parseItemsFromXml(xml: string, source: string): Headline[] {
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

async function fetchNative(feed: {
  url: string;
  source: string;
}): Promise<Headline[]> {
  const response = await fetch(feed.url, {
    headers: { "User-Agent": "THE_END/1.0" },
  });
  if (!response.ok) {
    throw new Error(`${feed.source}: HTTP ${response.status}`);
  }
  const xml = await response.text();
  return parseItemsFromXml(xml, feed.source);
}

// --- JSON API for web (avoids CORS) ---

interface Rss2JsonItem {
  title: string;
  description: string;
  content: string;
}

interface Rss2JsonResponse {
  status: string;
  items: Rss2JsonItem[];
}

async function fetchWeb(feed: {
  url: string;
  source: string;
}): Promise<Headline[]> {
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`;
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`${feed.source}: HTTP ${response.status}`);
  }
  const data: Rss2JsonResponse = await response.json();
  if (data.status !== "ok") {
    throw new Error(`${feed.source}: rss2json error`);
  }
  return data.items
    .filter((item) => item.title)
    .map((item) => ({
      title: stripHtml(item.title),
      description: stripHtml(item.description || item.content || ""),
      source: feed.source,
    }));
}

// --- Public API ---

export async function fetchHeadlines(): Promise<Headline[]> {
  const fetcher = Platform.OS === "web" ? fetchWeb : fetchNative;

  const results = await Promise.allSettled(
    RSS_FEEDS.map((feed) => fetcher(feed))
  );

  const allHeadlines: Headline[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      allHeadlines.push(...result.value);
    }
  }
  return allHeadlines;
}
