import Anthropic from "@anthropic-ai/sdk";
import Constants from "expo-constants";

const SYSTEM_PROMPT = `You are a darkly comedic fiction writer. Given a real news headline, write a fictional, humorous chain of increasingly absurd events that escalates from that headline into the complete end of human civilization. Be creative, surprising, and funny. Despite the humor, always end with the total and irreversible extinction of humankind and the collapse of civilization. Keep it to about 3-4 paragraphs.`;

function getClient(): Anthropic {
  const apiKey = Constants.expoConfig?.extra?.anthropicApiKey;
  if (!apiKey || apiKey === "your_key_here") {
    throw new Error("ANTHROPIC_API_KEY not configured in .env");
  }
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
}

export async function generateCataclysmicFuture(
  headline: string
): Promise<string> {
  const client = getClient();
  const message = await client.messages.create({
    model: "claude-sonnet-4-5-20250514",
    max_tokens: 1024,
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
