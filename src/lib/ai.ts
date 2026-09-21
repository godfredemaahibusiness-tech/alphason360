import Anthropic from "@anthropic-ai/sdk";

export function isAiConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function draftAnnouncement(
  topic: string
): Promise<{ title: string; description: string } | { error: string }> {
  if (!isAiConfigured()) {
    return {
      error:
        "AI drafting isn't configured yet — set ANTHROPIC_API_KEY in the server environment to enable it.",
    };
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 400,
      system:
        "You draft short school announcements for Alphason International School, Oduman, Accra, Ghana. " +
        'Reply with strict JSON only: {"title": "...", "description": "..."}. ' +
        "Title under 10 words. Description 2-4 sentences, warm but professional, suitable for parents and staff. " +
        "Never invent specific dates, prices, or names that were not given in the topic.",
      messages: [{ role: "user", content: `Draft an announcement about: ${topic}` }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { error: "The AI response didn't include any text." };
    }

    const parsed = JSON.parse(textBlock.text);
    if (!parsed.title || !parsed.description) {
      return { error: "The AI response was missing a title or description." };
    }
    return { title: parsed.title, description: parsed.description };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "AI drafting failed." };
  }
}
