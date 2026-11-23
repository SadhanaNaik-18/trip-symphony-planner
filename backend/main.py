"""TripSync AI - optional FastAPI backend (Gemini). Run: uvicorn main:app --reload"""
import json, os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai

genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))
model = genai.GenerativeModel("gemini-2.5-flash", generation_config={"response_mime_type": "application/json"})
app = FastAPI(title="TripSync AI")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class Trip(BaseModel):
    origin: str; destination: str; days: int; budget: int; travelers: int; interests: list[str]; style: str

AGENTS = {
    "research": "Destination Research Agent. JSON: {summary, destinations:[{name,description,category,bestTime,rating}]}",
    "budget": "Budget Planning Agent. JSON: {items:[{category,amount}],total,perPerson,withinBudget,note}",
    "itinerary": "Route & Itinerary Optimizer. JSON: {days:[{day,title,activities:[{time,place,detail}]}],route:[{from,to,mode,duration,cost}]}",
    "decision": "Trip Decision & Personalization Agent. JSON: {verdict,score,tips:[],optimizations:[]}",
}

def run_agent(name: str, trip: Trip, ctx: dict) -> dict:
    prompt = f"You are the {AGENTS[name]}\nTrip: {trip.model_dump_json()}\nContext: {json.dumps(ctx)[:6000]}"
    return json.loads(model.generate_content(prompt).text)

@app.post("/api/plan")
def plan(trip: Trip):
    """Orchestrator: runs the four agents in sequence, passing context forward."""
    result, logs = {}, []
    try:
        for name in AGENTS:
            logs.append(f"{name} agent started")
            result[name] = run_agent(name, trip, result)
            logs.append(f"{name} agent completed")
    except Exception as e:
        raise HTTPException(502, f"Agent failure: {e}")
    return {"result": result, "logs": logs}

@app.get("/health")
def health():
    return {"ok": True}
