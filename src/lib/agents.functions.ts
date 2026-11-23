import { createServerFn } from "@tanstack/react-start";
import type { AgentKey, TripInput } from "./trip-types";

const SHAPES: Record<AgentKey, string> = {
  research: '{"summary":string,"destinations":[{"name":string,"description":string,"category":string,"bestTime":string,"rating":number}]} (5-6 places)',
  budget: '{"items":[{"category":string,"amount":number}],"total":number,"perPerson":number,"withinBudget":boolean,"note":string} amounts in INR',
  itinerary: '{"days":[{"day":number,"title":string,"activities":[{"time":"HH:MM","place":string,"detail":string}]}],"route":[{"from":string,"to":string,"mode":string,"duration":string,"cost":number}]}',
  decision: '{"verdict":string,"score":number 0-100,"tips":[string],"optimizations":[string]}',
};
const ROLES: Record<AgentKey, string> = {
  research: "Destination Research Agent: discover top attractions matching interests.",
  budget: "Budget Planning Agent: produce a realistic cost breakdown within the budget.",
  itinerary: "Route and Itinerary Optimizer Agent: build a day-wise plan with an optimized route.",
  decision: "Trip Decision and Personalization Agent: evaluate the plan, score it and suggest optimizations.",
};

export const runAgent = createServerFn({ method: "POST" })
  .inputValidator((d: { agent: AgentKey; input: TripInput; context: string }) => d)
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { ok: false as const, error: "AI key missing" };
    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Lovable-API-Key": key, Authorization: `Bearer ${key}`, "X-Lovable-AIG-SDK": "fetch" },
        body: JSON.stringify({
          model: "google/gemini-3.8-flash",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: `You are the ${ROLES[data.agent]} Reply ONLY with json of shape ${SHAPES[data.agent]}.` },
            { role: "user", content: `Trip: ${JSON.stringify(data.input)}\nPrevious agent outputs: ${data.context.slice(0, 6000)}` },
          ],
        }),
      });
      if (!res.ok) return { ok: false as const, error: `AI error ${res.status}` };
      const j = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const txt = (j.choices?.[0]?.message?.content ?? "").replace(/```json|```/g, "").trim();
      return { ok: true as const, json: txt };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : "failed" };
    }
  });
