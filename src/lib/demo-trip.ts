import type { TripResult } from "./trip-types";
export const demoInput = { origin: "Bengaluru", destination: "Mysuru", days: 2, budget: 5000, travelers: 2, interests: ["Nature", "Culture", "Food"], style: "Budget" };
export const demoResult: TripResult = {
  research: {
    summary: "Mysuru, the City of Palaces, blends royal heritage, lush gardens and legendary South Indian food — an easy 3-hour trip from Bengaluru.",
    destinations: [
      { name: "Mysore Palace", description: "Indo-Saracenic royal palace, lit with 97,000 bulbs on Sundays.", category: "Culture", bestTime: "Evening", rating: 4.8 },
      { name: "Chamundi Hills", description: "Hilltop temple with panoramic city views and the giant Nandi statue.", category: "Nature", bestTime: "Morning", rating: 4.6 },
      { name: "Brindavan Gardens", description: "Terraced gardens below KRS dam with a musical fountain show.", category: "Nature", bestTime: "Evening", rating: 4.4 },
      { name: "Devaraja Market", description: "Century-old market of flowers, spices, sandalwood and Mysore pak.", category: "Food", bestTime: "Morning", rating: 4.5 },
      { name: "St. Philomena's Church", description: "Neo-Gothic church with twin spires and stained glass.", category: "Culture", bestTime: "Afternoon", rating: 4.5 },
      { name: "Mylari Hotel", description: "Iconic spot for butter-soft Mysore masala dosa.", category: "Food", bestTime: "Breakfast", rating: 4.7 },
    ],
  },
  budget: {
    items: [ { category: "Transport", amount: 1200 }, { category: "Stay", amount: 1600 }, { category: "Food", amount: 1200 }, { category: "Entry tickets", amount: 500 }, { category: "Local travel", amount: 400 } ],
    total: 4900, perPerson: 2450, withinBudget: true, note: "Train + budget homestay keeps you ₹100 under budget.",
  },
  itinerary: {
    days: [
      { day: 1, title: "Royal Mysuru", activities: [
        { time: "06:15", place: "KSR Bengaluru → Mysuru", detail: "Shatabdi / MEMU train, arrive ~09:00" },
        { time: "09:30", place: "Mylari Hotel", detail: "Breakfast: Mysore masala dosa" },
        { time: "11:00", place: "Mysore Palace", detail: "Explore the royal halls" },
        { time: "14:00", place: "St. Philomena's Church", detail: "Gothic architecture" },
        { time: "17:30", place: "Brindavan Gardens", detail: "Musical fountain show" } ] },
      { day: 2, title: "Hills & Markets", activities: [
        { time: "07:00", place: "Chamundi Hills", detail: "Sunrise climb via 1,000 steps" },
        { time: "10:30", place: "Devaraja Market", detail: "Spices, flowers & Mysore pak" },
        { time: "13:00", place: "Hanumanthu Mess", detail: "Famous mutton pulao (or veg thali)" },
        { time: "17:00", place: "Mysuru → Bengaluru", detail: "Evening train back" } ] },
    ],
    route: [
      { from: "Bengaluru", to: "Mysuru", mode: "Train", duration: "2h 45m", cost: 600 },
      { from: "Mysore Palace", to: "Brindavan Gardens", mode: "Bus", duration: "45m", cost: 100 },
      { from: "Mysuru", to: "Chamundi Hills", mode: "Auto", duration: "25m", cost: 150 },
      { from: "Mysuru", to: "Bengaluru", mode: "Train", duration: "2h 45m", cost: 600 },
    ],
  },
  decision: {
    verdict: "Go for it — a well-balanced, budget-friendly culture & food trip.", score: 92,
    tips: ["Book train tickets 2 weeks ahead", "Visit the palace on Sunday evening for illumination", "Carry cash for Devaraja Market"],
    optimizations: ["Grouped palace & church on day 1 to cut travel", "Chamundi at sunrise avoids crowds and heat", "Trains save ₹800 vs. cab"],
  },
};
