export interface Headline {
  title: string;
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

function parseTitles(xml: string, source: string): Headline[] {
  const headlines: Headline[] = [];
  const itemRegex = /<item[\s>][\s\S]*?<\/item>/gi;
  const titleRegex = /<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title>([\s\S]*?)<\/title>/i;

  const items = xml.match(itemRegex) || [];
  for (const item of items) {
    const titleMatch = item.match(titleRegex);
    if (titleMatch) {
      const title = (titleMatch[1] || titleMatch[2] || "").trim();
      if (title) {
        headlines.push({ title, source });
      }
    }
  }
  return headlines;
}

export async function fetchHeadlines(): Promise<Headline[]> {
  const results = await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      const response = await fetch(feed.url, {
        headers: { "User-Agent": "THE_END/1.0" },
      });
      if (!response.ok) {
        throw new Error(`${feed.source}: HTTP ${response.status}`);
      }
      const xml = await response.text();
      return parseTitles(xml, feed.source);
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
