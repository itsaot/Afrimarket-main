import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const DescribeInput = z.object({
  name: z.string().min(2).max(200),
  category: z.string().min(2).max(50),
  notes: z.string().max(500).optional(),
});

async function callLovableAI(messages: { role: string; content: string }[]) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("The assistant is unavailable right now.");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages,
    }),
  });
  if (res.status === 429) throw new Error("The assistant is busy. Try again shortly.");
  if (res.status === 402) throw new Error("The assistant is unavailable right now.");
  if (!res.ok) throw new Error("The assistant is unavailable right now.");
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

export const generateProductDescription = createServerFn({ method: "POST" })
  .validator((input: unknown) => DescribeInput.parse(input))
  .handler(async ({ data }) => {
    const content = await callLovableAI([
      {
        role: "system",
        content:
          "You write concise, premium e-commerce product descriptions for an African marketplace. 2-3 sentences. No emojis. No hyperbole. Highlight craftsmanship, origin, and care. Output plain text only.",
      },
      {
        role: "user",
        content: `Product: ${data.name}\nCategory: ${data.category}\nNotes: ${data.notes ?? "(none)"}`,
      },
    ]);
    return { description: content };
  });

const SuggestInput = z.object({
  query: z.string().min(1).max(200),
  available: z.array(z.string()).max(40),
});

export const suggestSimilarProducts = createServerFn({ method: "POST" })
  .validator((input: unknown) => SuggestInput.parse(input))
  .handler(async ({ data }) => {
    if (data.available.length === 0) return { suggestions: [] as string[] };
    const content = await callLovableAI([
      {
        role: "system",
        content:
          "You are a marketplace search assistant. Given a user's search query and a list of available product names, return up to 5 product names from the list that are most semantically related. Output ONLY a JSON array of strings, no prose, no markdown.",
      },
      {
        role: "user",
        content: `Query: ${data.query}\nAvailable: ${JSON.stringify(data.available)}`,
      },
    ]);
    try {
      const cleaned = content.replace(/^```(?:json)?\s*|\s*```$/g, "");
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        return {
          suggestions: parsed.filter((x): x is string => typeof x === "string").slice(0, 5),
        };
      }
    } catch {
      /* ignore */
    }
    return { suggestions: [] as string[] };
  });
