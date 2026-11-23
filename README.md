# TripSync AI – Autonomous Travel Planning Agent

Four specialized AI agents (Destination Research, Budget Planning, Route & Itinerary Optimizer, Trip Decision & Personalization) coordinated by an orchestrator.

## Web app (React + Vite + Tailwind)
```
bun install
bun run dev
```
AI runs through server functions (`src/lib/agents.functions.ts`) using Gemini Flash. If AI is unavailable, a demo plan (Bengaluru → Mysuru) is used automatically. Trips are saved in browser history.

## Optional Python FastAPI backend
```
cd backend
pip install -r requirements.txt
cp .env.example .env   # add GEMINI_API_KEY
uvicorn main:app --reload
```
`POST /api/plan` runs the full orchestrated workflow.
