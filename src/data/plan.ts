// Aegis Strength — 90-Day Plan Data
// Phase/nutrition/habit payload extracted from the InBody comparison.
// Baseline Jun 2025 -> Current Apr 2026 -> Goal Jul 2026.

export interface InBodyScan {
  date: string;
  weight: number;
  bodyFatMass: number;
  leanBodyMass: number;
  smm: number;
  pbf: number;
  bmi: number;
  visceralFat: number;
  bmr: number;
}

export interface Phase {
  num: 1 | 2 | 3;
  name: string;
  days: string;
  dateRange: string;
  weightTarget: number;
  vfTarget: number;
  focus: string;
  exercise: string;
  win: string;
}

export interface Dessert {
  name: string;
  tagline: string;
  cal: number;
  protein: number;
  ingredients: string[];
  method: string;
}

export interface HabitStack {
  trigger: string;
  then: string;
  why: string;
}

export interface KryptoniteRule {
  rule: string;
  how: string;
}

export const PLAN_META = {
  startDate: "Apr 16, 2026",
  endDate: "Jul 15, 2026",
  age: 47,
  height: "5'9\"",
  bmr: 1767,
};

export const SCANS: {
  baseline: InBodyScan;
  current: InBodyScan;
  goal: Pick<InBodyScan, "date" | "weight" | "bodyFatMass" | "leanBodyMass" | "smm" | "pbf" | "bmi" | "visceralFat">;
} = {
  baseline: {
    date: "Jun 02, 2025",
    weight: 207.1,
    bodyFatMass: 66.7,
    leanBodyMass: 140.4,
    smm: 78.7,
    pbf: 32.2,
    bmi: 30.6,
    visceralFat: 13,
    bmr: 1746,
  },
  current: {
    date: "Apr 16, 2026",
    weight: 204.5,
    bodyFatMass: 62.0,
    leanBodyMass: 142.5,
    smm: 79.8,
    pbf: 30.3,
    bmi: 30.2,
    visceralFat: 10,
    bmr: 1767,
  },
  goal: {
    date: "Jul 15, 2026",
    weight: 184.5,
    bodyFatMass: 23.0,
    leanBodyMass: 161.5,
    smm: 80.8,
    pbf: 12.5,
    bmi: 27.2,
    visceralFat: 7,
  },
};

export const MACROS = {
  kcal: 1650,
  kcalLow: 1600,
  kcalHigh: 1700,
  protein: 165,
  proteinMin: 155,
  proteinMax: 175,
  carbsRange: "150-180g",
  fatRange: "55-65g",
  deficit: 650,
};

export const FASTING = {
  eatStart: "12:00 PM",
  eatEnd: "8:00 PM",
  fastHours: 16,
  eatHours: 8,
};

export const PHASES: Phase[] = [
  {
    num: 1,
    name: "Rebuild the Ritual",
    days: "Days 1–30",
    dateRange: "Apr 16 – May 15",
    weightTarget: 197,
    vfTarget: 9,
    focus: "Lock in the 16:8 fasting window. Track every bite in MacroFactor. Hit 8,000 steps.",
    exercise: "3 Planet Fitness sessions (A/B/C split) + 30 min daily walk.",
    win: "30 straight days logging food. Zero late-night snacks.",
  },
  {
    num: 2,
    name: "Metabolic Shift",
    days: "Days 31–60",
    dateRange: "May 16 – Jun 14",
    weightTarget: 190,
    vfTarget: 8,
    focus: "Steps to 10k/day. Add 1 gravel bike ride or hike per week. 50/25/25 plating at dinner.",
    exercise: "3 PF sessions + 1 conditioning ride (60-90 min) + daily walk.",
    win: "Down 7 more lbs. Pull-up negatives in full control.",
  },
  {
    num: 3,
    name: "Polish and Finish",
    days: "Days 61–90",
    dateRange: "Jun 15 – Jul 15",
    weightTarget: 184.5,
    vfTarget: 7,
    focus: "Heavier compound lifts. Protein stays high. Preserve the 80 lbs of muscle.",
    exercise: "3 PF sessions (heavier) + 2 bike/hike + daily walk.",
    win: "First unassisted pull-up. Visceral fat ≤7. Weight ≤185.",
  },
];

export const DESSERTS: Dessert[] = [
  {
    name: "Chocolate Protein Fluff",
    tagline: "Massive bowl, under 300 cal. Xanthan gum makes it feel buttery.",
    cal: 280,
    protein: 38,
    ingredients: [
      "1.5 scoops dairy-free chocolate protein (pea or soy)",
      "10g unsweetened cocoa powder",
      "½ tsp xanthan gum (the secret)",
      "1 cup frozen cherries",
      "½ cup unsweetened almond milk",
    ],
    method: "Everything in a high-speed blender. Blend 2-3 min until it quintuples in size. Top with flaky sea salt.",
  },
  {
    name: "1 lb Strawberry Cookie Crumble",
    tagline: "20 minutes of eating. Cookie crunch without the cookie calories.",
    cal: 310,
    protein: 8,
    ingredients: [
      "1 lb fresh strawberries, sliced",
      "2 Biscoff cookies (dairy-free), crushed",
      "2 tbsp Chocolate PB2 + splash of water for drizzle",
      "Pinch of stevia",
    ],
    method: "Macerate strawberries with stevia. Top with crushed Biscoff and chocolate-peanut drizzle.",
  },
  {
    name: "Air-Fryer Chickpea Cookie Bites",
    tagline: "Butter/sugar/chocolate trio. Built on fiber and protein.",
    cal: 290,
    protein: 12,
    ingredients: [
      "1 can chickpeas (rinsed, patted bone-dry)",
      "1 tbsp maple syrup",
      "1 tbsp melted coconut oil",
      "1 tsp cinnamon",
      "15g dairy-free dark chocolate chips",
    ],
    method: "Toss chickpeas in oil, syrup, cinnamon. Air fry 400°F for 12-15 min until crunchy. Toss with chips while hot so they melt slightly.",
  },
  {
    name: "Frozen Banana Cocoa Sundae",
    tagline: "Soft-serve texture, zero dairy. Cherry topping hits gout + sweet tooth.",
    cal: 250,
    protein: 22,
    ingredients: [
      "1 frozen banana (sliced before freezing)",
      "1 scoop dairy-free vanilla protein",
      "1 tbsp cocoa powder",
      "¼ cup frozen cherries for topping",
      "Splash unsweetened almond milk",
    ],
    method: "Blend banana, protein, cocoa, and almond milk until soft-serve thick. Top with frozen cherries and a sprinkle of sea salt.",
  },
];

export const HABIT_STACKS: HabitStack[] = [
  {
    trigger: "YouTube or audiobook queued up",
    then: "Hop on the stationary or gravel bike first. No screen without pedals.",
    why: "Anchors cardio to something you already want to do. Audiobook time becomes zone-2 time.",
  },
  {
    trigger: "Pour morning coffee (5:30 AM journal)",
    then: "Drink 16 oz water before the first sip.",
    why: "Breaks the overnight dehydration that fakes hunger pangs later.",
  },
  {
    trigger: "Sweet tooth hits after 8 PM",
    then: "Pay the Toll: 15 min on the stationary bike with a YouTube episode before touching food.",
    why: "Most late-night cravings die inside 10 minutes of distraction.",
  },
  {
    trigger: "Finish a lifting set at PF",
    then: "30 sec standing breath work while logging the set in the app.",
    why: "Stops rest periods from ballooning. Keeps session to 60-75 min.",
  },
  {
    trigger: "Cook family dinner",
    then: "Plate your portion first using 50/25/25, then serve the family.",
    why: "Prevents the grazing-while-plating calorie leak.",
  },
];

export const KRYPTONITE: KryptoniteRule[] = [
  { rule: "Kitchen closes at 8:00 PM", how: "Brush teeth right at 8. Food feels wrong for 2 hours after." },
  { rule: "The Toll (if craving persists)", how: "15 min stationary bike + YouTube before any dessert. Craving usually dies in 10." },
  { rule: "Pre-loaded dessert defaults", how: "One of the 4 volume desserts is prepped or 5 min from ready, always." },
  { rule: "Dad Stash in the freezer", how: "Frozen cherries + strawberries. If kids ate the fresh fruit, you still have ammo." },
  { rule: "Bread moves out of sight", how: "Homemade bread goes in a cabinet, not on the counter." },
];

export const WEEK_TEMPLATE = [
  { day: "Mon", workout: "A — Push", where: "Planet Fitness" },
  { day: "Tue", workout: "30 min walk + 10 min kettlebell", where: "Home" },
  { day: "Wed", workout: "B — Pull", where: "Planet Fitness" },
  { day: "Thu", workout: "Gravel bike or hike (zone 2)", where: "Outdoors" },
  { day: "Fri", workout: "C — Legs", where: "Planet Fitness" },
  { day: "Sat", workout: "Long walk or hike, 60-90 min", where: "Outdoors" },
  { day: "Sun", workout: "Rest or 30 min stationary bike", where: "Home" },
];

// Helper: figure out which phase today belongs to based on startDate
export const getCurrentPhase = (startIso = "2026-04-16"): Phase => {
  const start = new Date(startIso);
  const today = new Date();
  const days = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 30) return PHASES[0];
  if (days < 60) return PHASES[1];
  return PHASES[2];
};

// Helper: get today's scheduled workout based on day of week
export const getTodayWorkout = (): typeof WEEK_TEMPLATE[number] => {
  const jsDay = new Date().getDay(); // Sun=0
  const map = [6, 0, 1, 2, 3, 4, 5]; // map Sun=0 to index 6, Mon=1 to index 0
  return WEEK_TEMPLATE[map[jsDay]];
};

