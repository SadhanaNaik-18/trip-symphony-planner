import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { runAgent } from "@/lib/agents.functions";
import { demoInput, demoResult } from "@/lib/demo-trip";
import type { AgentKey, TripInput, TripResult } from "@/lib/trip-types";
import { RoadMap } from "@/components/road-map";
import { TripChat } from "@/components/trip-chat";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "TripSync AI – Autonomous Travel Planning Agent" },
    { name: "description", content: "Four AI agents research, budget, route and personalize your trip in seconds." },
    { property: "og:title", content: "TripSync AI – Autonomous Travel Planning Agent" },
    { property: "og:description", content: "Four AI agents research, budget, route and personalize your trip in seconds." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Home,
});

const AGENTS: { key: AgentKey; name: string; icon: string }[] = [
  { key: "research", name: "Destination Research", icon: "🧭" },
  { key: "budget", name: "Budget Planning", icon: "💰" },
  { key: "itinerary", name: "Route & Itinerary Optimizer", icon: "🗺️" },
  { key: "decision", name: "Decision & Personalization", icon: "🎯" },
];
const INTERESTS = ["Nature", "Culture", "Food", "Adventure", "Shopping", "Nightlife", "History", "Beaches"];
type Status = "idle" | "running" | "done" | "fallback";
type Saved = { id: string; at: string; input: TripInput; result: TripResult };
const maps = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
const dir = (a: string, b: string) => `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(a)}&destination=${encodeURIComponent(b)}`;
const inr = (n: number) => "₹" + Math.round(n || 0).toLocaleString("en-IN");

function Home() {
  const [input, setInput] = useState<TripInput>(demoInput);
  const [status, setStatus] = useState<Record<AgentKey, Status>>({ research: "idle", budget: "idle", itinerary: "idle", decision: "idle" });
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<TripResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<Saved[]>([]);
  useEffect(() => { try { setHistory(JSON.parse(localStorage.getItem("tripsync") || "[]")); } catch { /* empty */ } }, []);
  const log = (m: string) => setLogs((l) => [...l, `${new Date().toLocaleTimeString()}  ${m}`]);

  async function plan(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.origin || !input.destination || input.days < 1 || input.budget < 1) return log("⚠️ Please fill origin, destination, days and budget.");
    setBusy(true); setResult(null); setLogs([]);
    setStatus({ research: "idle", budget: "idle", itinerary: "idle", decision: "idle" });
    log("🧠 Orchestrator: starting autonomous workflow");
    const out: Partial<TripResult> = {};
    for (const a of AGENTS) {
      setStatus((s) => ({ ...s, [a.key]: "running" })); log(`${a.icon} ${a.name} Agent working…`);
      let ok = false;
      try {
        const r = await runAgent({ data: { agent: a.key, input, context: JSON.stringify(out) } });
        if (r.ok) { (out as Record<string, unknown>)[a.key] = JSON.parse(r.json); ok = true; }
        else log(`⚠️ ${a.name}: ${r.error}`);
      } catch (err) { log(`⚠️ ${a.name}: ${err instanceof Error ? err.message : "error"}`); }
      if (!ok) { (out as Record<string, unknown>)[a.key] = demoResult[a.key]; log(`↩️ ${a.name}: using demo fallback`); }
      setStatus((s) => ({ ...s, [a.key]: ok ? "done" : "fallback" }));
      if (ok) log(`✅ ${a.name} Agent completed`);
    }
    const final = out as TripResult; setResult(final);
    const saved = [{ id: crypto.randomUUID(), at: new Date().toLocaleString(), input, result: final }, ...history].slice(0, 10);
    setHistory(saved); localStorage.setItem("tripsync", JSON.stringify(saved));
    log("🏁 Orchestrator: plan ready & saved to history"); setBusy(false);
    setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  const field = "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
  const maxBudget = Math.max(...(result?.budget.items ?? []).map((i) => i.amount), 1);

  return (
    <div className="min-h-screen">
      <header className="relative text-primary-foreground">
        <img src="/travel-hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-hero opacity-80" />
        <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <span className="font-display text-2xl font-bold">TripSync<span className="text-accent"> AI</span></span>
           <div className="hidden gap-6 text-sm sm:flex"><a href="#plan">Plan</a><a href="#road-maps">Road maps</a><a href="#trip-chat">Ask AI</a><a href="#history">History</a></div>
        </nav>
        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-12">
          <p className="mb-3 text-sm uppercase tracking-widest text-accent">Autonomous travel planning agent</p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">Four AI agents. One perfect trip.</h1>
          <p className="mt-5 max-w-xl opacity-85">Research, budget, routing and personal decisions — orchestrated in seconds.</p>
        </div>
      </header>

      <main className="mx-auto -mt-14 max-w-6xl space-y-10 px-6 pb-20">
        <form id="plan" onSubmit={plan} className="grid gap-4 rounded-xl bg-card p-6 shadow-xl sm:grid-cols-2 lg:grid-cols-4">
          {(["origin", "destination"] as const).map((k) => (
            <label key={k} className="text-sm font-semibold capitalize">{k}<input className={field} value={input[k]} onChange={(e) => setInput({ ...input, [k]: e.target.value })} /></label>))}
          {(["days", "budget", "travelers"] as const).map((k) => (
            <label key={k} className="text-sm font-semibold capitalize">{k === "budget" ? "Budget (₹)" : k}<input type="number" min={1} className={field} value={input[k]} onChange={(e) => setInput({ ...input, [k]: Number(e.target.value) })} /></label>))}
          <label className="text-sm font-semibold">Travel style<select className={field} value={input.style} onChange={(e) => setInput({ ...input, style: e.target.value })}>{["Budget", "Comfort", "Luxury", "Backpacker"].map((s) => <option key={s}>{s}</option>)}</select></label>
          <div className="sm:col-span-2 lg:col-span-4"><p className="mb-2 text-sm font-semibold">Interests</p><div className="flex flex-wrap gap-2">
            {INTERESTS.map((i) => { const on = input.interests.includes(i); return (
              <button type="button" key={i} onClick={() => setInput({ ...input, interests: on ? input.interests.filter((x) => x !== i) : [...input.interests, i] })}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${on ? "border-primary bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i}</button>); })}
          </div></div>
          <div className="flex gap-3 sm:col-span-2 lg:col-span-4">
            <button disabled={busy} className="rounded-lg bg-accent px-6 py-3 font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-60">{busy ? "Agents working…" : "Plan my trip ✨"}</button>
            <button type="button" onClick={() => setInput(demoInput)} className="rounded-lg border px-4 py-3 text-sm">Load demo</button>
          </div>
        </form>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2"><h2 className="mb-4 text-2xl font-bold">Agent workflow</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {AGENTS.map((a, i) => { const s = status[a.key]; return (
                <div key={a.key} className={`rounded-xl border bg-card p-4 ${s === "running" ? "border-accent pulse-ring" : ""}`}>
                  <div className="flex items-center justify-between"><span className="text-2xl">{a.icon}</span><span className={`text-xs font-semibold ${s === "done" ? "text-success" : s === "fallback" ? "text-accent" : "text-muted-foreground"}`}>{s === "idle" ? "Waiting" : s === "running" ? "Running…" : s === "done" ? "Done" : "Demo fallback"}</span></div>
                  <p className="mt-2 font-semibold">{i + 1}. {a.name}</p></div>); })}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">🧠 Orchestrator passes each agent's output to the next.</p></div>
          <div><h2 className="mb-4 text-2xl font-bold">Activity log</h2>
            <div className="h-64 overflow-auto rounded-xl bg-primary p-4 font-mono text-xs leading-relaxed text-primary-foreground">{logs.length ? logs.map((l, i) => <div key={i}>{l}</div>) : <span className="opacity-60">Awaiting a trip request…</span>}</div></div>
        </section>

        {result && (<div id="results" className="space-y-10">
          <section><h2 className="text-2xl font-bold">Discover {input.destination}</h2><p className="mb-4 mt-1 text-muted-foreground">{result.research.summary}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{result.research.destinations?.map((d) => (
              <a key={d.name} href={maps(`${d.name}, ${input.destination}`)} target="_blank" rel="noreferrer" className="rounded-xl border bg-card p-5 transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex justify-between text-xs"><span className="rounded-full bg-secondary px-2 py-0.5">{d.category}</span><span>⭐ {d.rating}</span></div>
                <h3 className="mt-3 text-lg font-bold">{d.name}</h3><p className="mt-1 text-sm text-muted-foreground">{d.description}</p><p className="mt-3 text-xs text-primary">Best: {d.bestTime} · Open in Maps →</p></a>))}</div></section>

          <section className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-xl border bg-card p-6 lg:col-span-2"><h2 className="mb-4 text-2xl font-bold">Budget dashboard</h2>
              {result.budget.items?.map((b) => (<div key={b.category} className="mb-3"><div className="flex justify-between text-sm"><span>{b.category}</span><span className="font-semibold">{inr(b.amount)}</span></div>
                <div className="mt-1 h-3 rounded-full bg-muted"><div className="h-3 rounded-full bg-hero" style={{ width: `${(b.amount / maxBudget) * 100}%` }} /></div></div>))}</div>
            <div className="space-y-3 rounded-xl bg-hero p-6 text-primary-foreground">
              <p className="text-sm opacity-80">Total estimate</p><p className="font-display text-4xl font-bold">{inr(result.budget.total)}</p>
              <p className="text-sm">{inr(result.budget.perPerson)} per person · budget {inr(input.budget)}</p>
              <p className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${result.budget.withinBudget ? "bg-success" : "bg-destructive"}`}>{result.budget.withinBudget ? "Within budget" : "Over budget"}</p>
              <p className="text-sm opacity-85">{result.budget.note}</p></div>
          </section>

          <section><h2 className="mb-4 text-2xl font-bold">Day-wise itinerary</h2><div className="grid gap-6 md:grid-cols-2">
            {result.itinerary.days?.map((d) => (<div key={d.day} className="rounded-xl border bg-card p-6"><p className="text-sm font-semibold text-accent">Day {d.day}</p><h3 className="mb-4 text-xl font-bold">{d.title}</h3>
              <ol className="space-y-3 border-l-2 border-primary pl-4">{d.activities?.map((a, i) => (<li key={i}><span className="font-mono text-xs text-muted-foreground">{a.time}</span>
                <a href={maps(`${a.place}, ${input.destination}`)} target="_blank" rel="noreferrer" className="block font-semibold hover:text-primary">{a.place}</a><p className="text-sm text-muted-foreground">{a.detail}</p></li>))}</ol></div>))}</div></section>

          <section><h2 className="mb-4 text-2xl font-bold">Optimized route</h2><div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-sm"><thead className="bg-muted text-left"><tr>{["From", "To", "Mode", "Time", "Cost", ""].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
              <tbody>{result.itinerary.route?.map((r, i) => (<tr key={i} className="border-t"><td className="p-3">{r.from}</td><td className="p-3">{r.to}</td><td className="p-3">{r.mode}</td><td className="p-3">{r.duration}</td><td className="p-3">{inr(r.cost)}</td>
                <td className="p-3"><a className="font-semibold text-primary" href={dir(r.from, r.to)} target="_blank" rel="noreferrer">Directions →</a></td></tr>))}</tbody></table></div></section>

          <section className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl bg-primary p-6 text-primary-foreground"><p className="text-sm opacity-80">Trip score</p><p className="font-display text-6xl font-bold">{result.decision.score}</p><p className="mt-2">{result.decision.verdict}</p></div>
            <div className="rounded-xl border bg-card p-6"><h3 className="mb-3 font-bold">Optimizations applied</h3><ul className="space-y-2 text-sm">{result.decision.optimizations?.map((o) => <li key={o}>⚡ {o}</li>)}</ul></div>
            <div className="rounded-xl border bg-card p-6"><h3 className="mb-3 font-bold">Personal tips</h3><ul className="space-y-2 text-sm">{result.decision.tips?.map((o) => <li key={o}>💡 {o}</li>)}</ul></div>
          </section></div>)}

         <RoadMap input={input} result={result} />
         <TripChat input={input} result={result} />

         <section id="history"><h2 className="mb-4 text-2xl font-bold">Saved trips</h2>
          {history.length === 0 ? <p className="text-muted-foreground">No trips yet — plan one above.</p> :
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{history.map((h) => (
              <div key={h.id} className="rounded-xl border bg-card p-4"><p className="font-semibold">{h.input.origin} → {h.input.destination}</p><p className="text-xs text-muted-foreground">{h.input.days} days · {inr(h.input.budget)} · {h.at}</p>
                <div className="mt-3 flex gap-3 text-sm"><button onClick={() => { setInput(h.input); setResult(h.result); }} className="font-semibold text-primary">Open</button>
                  <button onClick={() => { const n = history.filter((x) => x.id !== h.id); setHistory(n); localStorage.setItem("tripsync", JSON.stringify(n)); }} className="text-destructive">Delete</button></div></div>))}</div>}
        </section>
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">TripSync AI · Powered by Gemini multi-agent orchestration</footer>
    </div>
  );
}
