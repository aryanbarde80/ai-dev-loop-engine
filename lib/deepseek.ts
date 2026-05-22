import { z } from "zod";
import { getEnv } from "@/lib/env";
import type { ImprovementPlan } from "@/lib/types";

const improvementPlanSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  rationale: z.string().min(1),
  buildCommand: z.string().min(1),
  files: z
    .array(
      z.object({
        path: z.string().min(1),
        summary: z.string().min(1),
        content: z.string(),
      }),
    )
    .min(1)
    .max(3),
});

export async function requestImprovementPlan(prompt: string): Promise<ImprovementPlan> {
  const env = getEnv();
  const response = await fetch(`${env.deepseekBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.deepseekApiKey}`,
    },
    body: JSON.stringify({
      model: env.deepseekModel,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You produce small safe software improvements for a separate Next.js repository. Output JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`DeepSeek request failed: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("DeepSeek returned no content.");
  }

  const parsed = JSON.parse(content);
  return improvementPlanSchema.parse(parsed);
}
