export type TripInput = { origin: string; destination: string; days: number; budget: number; travelers: number; interests: string[]; style: string };
export type Destination = { name: string; description: string; category: string; bestTime: string; rating: number };
export type BudgetItem = { category: string; amount: number };
export type DayPlan = { day: number; title: string; activities: { time: string; place: string; detail: string }[] };
export type RouteStop = { from: string; to: string; mode: string; duration: string; cost: number };
export type Decision = { verdict: string; score: number; tips: string[]; optimizations: string[] };
export type TripResult = {
  research: { summary: string; destinations: Destination[] };
  budget: { items: BudgetItem[]; total: number; perPerson: number; withinBudget: boolean; note: string };
  itinerary: { days: DayPlan[]; route: RouteStop[] };
  decision: Decision;
};
export type AgentKey = keyof TripResult;
