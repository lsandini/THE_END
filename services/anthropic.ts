import Anthropic from "@anthropic-ai/sdk";
import Constants from "expo-constants";

const SYSTEM_PROMPT = `Darkly comedic fiction writer. From a news headline, write 3 short paragraphs of absurd escalation ending in human extinction. Be funny and surprising. No title or heading — start directly with narrative.`;

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (_client) return _client;
  const apiKey = Constants.expoConfig?.extra?.anthropicApiKey;
  if (!apiKey || apiKey === "your_key_here") {
    throw new Error("ANTHROPIC_API_KEY not configured in .env");
  }
  _client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  return _client;
}

export async function generateCataclysmicFuture(
  headline: string
): Promise<string> {
  const client = getClient();
  const message = await client.messages.create({
    // model: "claude-opus-4-5-20250514",
    // model: "claude-sonnet-4-5-20250929",
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Here is today's headline:\n\n"${headline}"\n\nNow tell me how this leads to the end of everything.`,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  return textBlock ? textBlock.text : "Even the AI couldn't predict this one.";
}
