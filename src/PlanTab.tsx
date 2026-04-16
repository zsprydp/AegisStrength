import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Info, TrendingUp, Utensils, Zap, Brain, AlertTriangle } from "lucide-react";
import {
  SCANS, MACROS, FASTING, PHASES, DESSERTS, HABIT_STACKS, KRYPTONITE, PLAN_META
} from './data/plan';

const delta = (cur: number, prev: number) => {
  const d = +(cur - prev).toFixed(1);
  return d > 0 ? `+${d}` : `${d}`;
};

// --- Comparison row ---
const CompareRow = ({
  label, a, b, unit, lowerGood = true, highlight = false,
}: {
  label: string;
  a: number;
  b: number;
  unit: string;
  lowerGood?: boolean;
  highlight?: boolean;
}) => {
  const d = +(b - a).toFixed(1);
  const good = lowerGood ? d < 0 : d > 0;
  const deltaColor = d === 0 ? 'text-zinc-400' : good ? 'text-emerald-600' : 'text-red-500';
  return (
    <div className={`grid grid-cols-[1.3fr_1fr_1fr_1fr] items-center py-2.5 border-b border-zinc-100 ${highlight ? 'bg-amber-50/40 -mx-2 px-2 rounded' : ''}`}>
      <span className="text-sm text-zinc-700">{label}</span>
      <span className="text-sm text-zinc-500 font-mono text-right">{a} {unit}</span>
      <span className="text-sm text-zinc-900 font-mono text-right font-semibold">{b} {unit}</span>
      <span className={`text-sm font-mono text-right ${deltaColor}`}>
        {d > 0 ? '+' : ''}{d} {unit}
      </span>
    </div>
  );
};

export default function PlanTab() {
  const { baseline: b, current: c } = SCANS;

  return (
    <Card className="border-zinc-200 shadow-sm rounded-2xl">
      <CardHeader className="bg-zinc-900 text-white rounded-t-2xl">
        <CardTitle className="text-xl flex items-center gap-2 font-display italic">
          <Info className="w-5 h-5 text-amber-300" />
          90-Day Plan
        </CardTitle>
        <CardDescription className="text-zinc-300">
          {PLAN_META.startDate} → {PLAN_META.endDate}. 205 → 185 lbs. Hold 80 lbs of muscle. Visceral fat ≤ 7.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[75vh]">
          <div className="p-6 space-y-8">

            {/* THE STRATEGIC SHIFT */}
            <section>
              <h3 className="font-display italic font-bold text-lg text-zinc-900 border-b border-zinc-200 pb-2 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> What Changed Since Last Scan
              </h3>
              <div className="bg-zinc-900 text-white rounded-xl p-4 mb-4">
                <p className="text-sm leading-relaxed">
                  10 months of work paid off. You dropped <span className="text-amber-300 font-semibold">4.7 lbs of fat</span>,
                  added <span className="text-amber-300 font-semibold">2.1 lbs of lean mass</span>, and cut visceral fat from
                  <span className="text-red-300 font-semibold"> 13</span> to
                  <span className="text-amber-300 font-semibold"> 10</span>. The old goal is hit.
                </p>
                <p className="text-sm text-zinc-300 mt-2">
                  New target: drive to 185 lbs at 10-15% body fat while holding the 80 lbs of skeletal muscle you built.
                </p>
              </div>

              <div className="bg-white border border-zinc-200 rounded-xl p-4">
                <div className="grid grid-cols-[1.3fr_1fr_1fr_1fr] pb-2 border-b border-zinc-200 mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Metric</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 text-right">Jun '25</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 text-right">Apr '26</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 text-right">Δ</span>
                </div>
                <CompareRow label="Weight" a={b.weight} b={c.weight} unit="lbs" />
                <CompareRow label="Body fat mass" a={b.bodyFatMass} b={c.bodyFatMass} unit="lbs" highlight />
                <CompareRow label="Lean mass" a={b.leanBodyMass} b={c.leanBodyMass} unit="lbs" lowerGood={false} highlight />
                <CompareRow label="Skeletal muscle" a={b.smm} b={c.smm} unit="lbs" lowerGood={false} highlight />
                <CompareRow label="Body fat %" a={b.pbf} b={c.pbf} unit="%" />
                <CompareRow label="Visceral fat" a={b.visceralFat} b={c.visceralFat} unit="" highlight />
                <CompareRow label="BMR" a={b.bmr} b={c.bmr} unit="kcal" lowerGood={false} />
              </div>
            </section>

            {/* NUTRITION */}
            <section>
              <h3 className="font-display italic font-bold text-lg text-zinc-900 border-b border-zinc-200 pb-2 mb-3 flex items-center gap-2">
                <Utensils className="w-5 h-5" /> Daily Nutrition Targets
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="bg-white border border-zinc-200 rounded-xl p-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Calories</div>
                  <div className="text-2xl font-display font-bold">{MACROS.kcal.toLocaleString()}</div>
                  <div className="text-[10px] font-mono text-zinc-400">{MACROS.kcalLow}-{MACROS.kcalHigh}</div>
                </div>
                <div className="bg-white border border-zinc-200 rounded-xl p-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Protein</div>
                  <div className="text-2xl font-display font-bold text-amber-600">{MACROS.protein}g</div>
                  <div className="text-[10px] font-mono text-zinc-400">{MACROS.proteinMin}-{MACROS.proteinMax}g</div>
                </div>
                <div className="bg-white border border-zinc-200 rounded-xl p-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Carbs</div>
                  <div className="text-2xl font-display font-bold">{MACROS.carbsRange}</div>
                  <div className="text-[10px] font-mono text-zinc-400">timed w/ lifts</div>
                </div>
                <div className="bg-white border border-zinc-200 rounded-xl p-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Fat</div>
                  <div className="text-2xl font-display font-bold">{MACROS.fatRange}</div>
                  <div className="text-[10px] font-mono text-zinc-400">olive, avo, eggs</div>
                </div>
              </div>

              {/* Fasting */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <div className="text-[10px] font-mono uppercase tracking-wider text-amber-700">16:8 Fasting Window</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-display italic text-xl font-bold">{FASTING.eatStart} – {FASTING.eatEnd}</span>
                  <span className="text-xs font-mono text-amber-700">eat window</span>
                </div>
                <p className="text-sm text-zinc-700 mt-2">
                  5:30 AM journaling stays clean: black coffee, tea, water only. First meal at noon.
                  Kitchen closes hard at 8 PM. That's the move that kills late-night snacking.
                </p>
              </div>

              {/* 50/25/25 plating */}
              <div className="bg-white border border-zinc-200 rounded-xl p-4">
                <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">The 50/25/25 Plating Rule</div>
                <div className="space-y-1.5 text-sm">
                  <div><span className="font-mono font-bold text-emerald-600">50%</span> neutral bulkers — cauliflower rice, peppers, shredded cabbage, egg whites</div>
                  <div><span className="font-mono font-bold text-amber-600">25%</span> lean protein — chicken, turkey, limited beef</div>
                  <div><span className="font-mono font-bold text-zinc-700">25%</span> family starch — the homemade bread, potatoes, pasta everyone else eats</div>
                </div>
                <p className="text-xs italic text-zinc-500 mt-3">You eat what the family eats. You just plate it differently.</p>
              </div>
            </section>

            {/* PHASES */}
            <section>
              <h3 className="font-display italic font-bold text-lg text-zinc-900 border-b border-zinc-200 pb-2 mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5" /> The Three Phases
              </h3>
              <div className="space-y-3">
                {PHASES.map(p => (
                  <div key={p.num} className="bg-white border border-zinc-200 rounded-xl p-4">
                    <div className="flex items-baseline justify-between flex-wrap gap-2 mb-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-mono uppercase tracking-wider text-amber-600">Phase {p.num}</span>
                        <span className="font-display italic text-lg font-bold">{p.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">{p.dateRange}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-zinc-50 rounded-lg p-2">
                        <div className="text-[10px] font-mono uppercase text-zinc-500">Weight</div>
                        <div className="font-display font-bold">{p.weightTarget} lbs</div>
                      </div>
                      <div className="bg-zinc-50 rounded-lg p-2">
                        <div className="text-[10px] font-mono uppercase text-zinc-500">Visceral fat</div>
                        <div className="font-display font-bold">≤ {p.vfTarget}</div>
                      </div>
                    </div>
                    <p className="text-sm text-zinc-700 mb-2"><span className="font-semibold">Focus: </span>{p.focus}</p>
                    <p className="text-sm text-zinc-700 mb-2"><span className="font-semibold">Exercise: </span>{p.exercise}</p>
                    <div className="bg-emerald-50 border-l-2 border-emerald-500 p-2 rounded-r">
                      <div className="text-[10px] font-mono uppercase text-emerald-700">Win condition</div>
                      <div className="text-sm text-zinc-900">{p.win}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* DESSERTS */}
            <section>
              <h3 className="font-display italic font-bold text-lg text-zinc-900 border-b border-zinc-200 pb-2 mb-3">
                Volume-Eating Desserts (All Dairy-Free)
              </h3>
              <Accordion type="single" collapsible className="w-full">
                {DESSERTS.map((d, i) => (
                  <AccordionItem key={d.name} value={`dessert-${i}`} className="border-zinc-200">
                    <AccordionTrigger className="hover:no-underline font-semibold text-left">
                      <div className="flex items-center gap-3 flex-1">
                        <span>{d.name}</span>
                        <span className="text-xs font-mono text-zinc-500">· {d.cal} cal · {d.protein}g P</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm">
                      <p className="italic text-zinc-500">{d.tagline}</p>
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">Ingredients</div>
                        <ul className="list-disc pl-5 space-y-1 text-zinc-700">
                          {d.ingredients.map((i, idx) => <li key={idx}>{i}</li>)}
                        </ul>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">Method</div>
                        <p className="text-zinc-700">{d.method}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>

            {/* HABIT STACKS */}
            <section>
              <h3 className="font-display italic font-bold text-lg text-zinc-900 border-b border-zinc-200 pb-2 mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5" /> Habit Stacks
              </h3>
              <p className="text-xs text-zinc-500 mb-3">Anchor a new behavior to one you already do. Zero willpower after week 2.</p>
              <div className="space-y-3">
                {HABIT_STACKS.map((h, i) => (
                  <div key={i} className="bg-white border border-zinc-200 rounded-xl p-4">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Trigger</div>
                    <div className="text-sm font-semibold mb-2">{h.trigger}</div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-amber-600">Then</div>
                    <div className="text-sm mb-2">{h.then}</div>
                    <p className="text-xs italic text-zinc-500">{h.why}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* KRYPTONITE */}
            <section>
              <h3 className="font-display italic font-bold text-lg text-zinc-900 border-b border-zinc-200 pb-2 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Kryptonite Protocols (Late-Night Sweet Tooth)
              </h3>
              <div className="space-y-2">
                {KRYPTONITE.map((k, i) => (
                  <div key={i} className="bg-white border border-zinc-200 rounded-xl p-3 grid grid-cols-[1fr_1.5fr] gap-3">
                    <div className="text-sm font-semibold">{k.rule}</div>
                    <div className="text-sm text-zinc-600">{k.how}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* ORIGINAL PULL-UP ROADMAP (preserved from original Plan tab) */}
            <section>
              <h3 className="font-display italic font-bold text-lg text-zinc-900 border-b border-zinc-200 pb-2 mb-3">
                The 90-Day Pull-Up Roadmap
              </h3>
              <p className="text-xs italic text-zinc-500 mb-3">Perform at the start of every Workout B (Pull Day).</p>
              <div className="space-y-3 text-sm text-zinc-700">
                <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                  <strong className="text-zinc-900">Phase 1 (Days 1-30):</strong> Assisted machine. Reduce assistance by 5 lbs/week. Target: 45 lbs by Day 30.
                </div>
                <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                  <strong className="text-zinc-900">Phase 2 (Days 31-60):</strong> Slow negatives. Jump up, lower 5-10 sec. 3 sets of 3.
                </div>
                <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                  <strong className="text-zinc-900">Phase 3 (Days 61-90):</strong> Scapular pulls + dead hangs 30 sec. First unassisted attempt Day 75.
                </div>
              </div>
            </section>

          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

