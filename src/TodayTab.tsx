import { useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Sunrise, Coffee, Dumbbell, Footprints, Moon,
  CheckCircle2, Circle, Flame, Target, BedDouble,
} from "lucide-react";
import {
  MACROS, FASTING, getCurrentPhase, getTodayWorkout
} from './data/plan';

interface DayCheckins {
  date: string;
  fastBroken: boolean;
  water1: boolean;
  protein: number;
  steps: number;
  workoutDone: boolean;
  kitchenClosed: boolean;
  notes?: string;
}

interface Props {
  userId: string | null;
}

const CheckRow = ({
  icon,
  label,
  sub,
  done,
  onToggle,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  done: boolean;
  onToggle: () => void;
  accent?: boolean;
}) => (
  <button
    onClick={onToggle}
    className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border transition-all ${
      done
        ? 'bg-zinc-900 text-white border-zinc-900'
        : accent
          ? 'bg-white border-amber-200 hover:border-amber-400'
          : 'bg-white border-zinc-200 hover:border-zinc-400'
    }`}
  >
    <div className={`shrink-0 ${done ? 'text-amber-300' : 'text-zinc-500'}`}>
      {done ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
    </div>
    <div className="shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <div className={`font-semibold ${done ? 'line-through opacity-70' : ''}`}>{label}</div>
      {sub && <div className={`text-xs mt-0.5 ${done ? 'text-zinc-400' : 'text-zinc-500'}`}>{sub}</div>}
    </div>
  </button>
);

const MetricPill = ({
  label,
  value,
  target,
  unit,
  color,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
}) => {
  const pct = Math.min((value / target) * 100, 100);
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-3">
      <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="flex items-baseline gap-1 mt-0.5">
        <span className="text-2xl font-display font-bold">{value}</span>
        <span className="text-xs text-zinc-400">/ {target} {unit}</span>
      </div>
      <div className="mt-2 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

export default function TodayTab({ userId }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const phase = getCurrentPhase();
  const todayWorkout = getTodayWorkout();

  const [checkins, setCheckins] = useState<DayCheckins>({
    date: today,
    fastBroken: false,
    water1: false,
    protein: 0,
    steps: 0,
    workoutDone: false,
    kitchenClosed: false,
  });

  const [proteinInput, setProteinInput] = useState("");
  const [stepsInput, setStepsInput] = useState("");

  useEffect(() => {
    if (!userId) return;
    const ref = doc(db, `users/${userId}/dailyCheckins`, today);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setCheckins(snap.data() as DayCheckins);
    });
    return () => unsub();
  }, [userId, today]);

  const save = async (update: Partial<DayCheckins>) => {
    if (!userId) {
      toast.error("Sign in to save check-ins.");
      return;
    }
    const next = { ...checkins, ...update, date: today };
    setCheckins(next);
    try {
      await setDoc(
        doc(db, `users/${userId}/dailyCheckins`, today),
        { ...next, userId, updatedAt: serverTimestamp() },
        { merge: true }
      );
    } catch (e) {
      console.error(e);
      toast.error("Failed to save.");
    }
  };

  const addProtein = () => {
    const n = parseInt(proteinInput);
    if (!isNaN(n) && n > 0) {
      save({ protein: checkins.protein + n });
      setProteinInput("");
    }
  };

  const setSteps = () => {
    const n = parseInt(stepsInput);
    if (!isNaN(n) && n >= 0) {
      save({ steps: n });
      setStepsInput("");
    }
  };

  const checks = [
    checkins.fastBroken,
    checkins.water1,
    checkins.protein >= MACROS.protein * 0.9,
    checkins.steps >= 8000,
    checkins.workoutDone,
    checkins.kitchenClosed,
  ];
  const completed = checks.filter(Boolean).length;
  const dayScore = Math.round((completed / checks.length) * 100);

  return (
    <div className="space-y-6">
      <Card className="border-zinc-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="h-2 bg-zinc-900 w-full" />
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
              <CardTitle className="text-2xl font-display italic">Today's Check-In</CardTitle>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-500">Day Score</div>
              <div className="text-3xl font-display font-bold">{dayScore}<span className="text-base text-zinc-400">%</span></div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-zinc-900 text-white rounded-xl p-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-amber-300">
                  Phase {phase.num} · {phase.days}
                </div>
                <div className="text-lg font-display italic">{phase.name}</div>
              </div>
              <div className="text-xs font-mono text-amber-300">{todayWorkout.workout} · {todayWorkout.where}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-zinc-200 shadow-sm rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Moon className="w-5 h-5" /> Fasting Window (16:8)
          </CardTitle>
          <CardDescription className="text-xs font-mono">
            Eat {FASTING.eatStart} → {FASTING.eatEnd}. Coffee and water only outside.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FastingBar />
        </CardContent>
      </Card>

      <div>
        <h3 className="font-display italic text-lg font-bold mb-3 flex items-center gap-2">
          <Target className="w-5 h-5" /> Daily Targets
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <MetricPill label="Calories cap" value={0} target={MACROS.kcal} unit="kcal" color="#1A1A1A" />
          <MetricPill label="Protein" value={checkins.protein} target={MACROS.protein} unit="g" color="#D4AF37" />
          <MetricPill label="Steps" value={checkins.steps} target={8000} unit="" color="#1A1A1A" />
          <MetricPill label="Water" value={checkins.water1 ? 16 : 0} target={80} unit="oz" color="#60A5FA" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="flex gap-2">
            <input type="number" placeholder="+ protein g" value={proteinInput} onChange={(e) => setProteinInput(e.target.value)} className="flex-1 h-10 px-3 rounded-lg border border-zinc-200 bg-white font-mono text-sm focus:outline-none focus:border-zinc-900" />
            <Button size="sm" className="h-10 bg-amber-500 hover:bg-amber-600 text-black" onClick={addProtein}>Add</Button>
          </div>
          <div className="flex gap-2">
            <input type="number" placeholder="steps total" value={stepsInput} onChange={(e) => setStepsInput(e.target.value)} className="flex-1 h-10 px-3 rounded-lg border border-zinc-200 bg-white font-mono text-sm focus:outline-none focus:border-zinc-900" />
            <Button size="sm" className="h-10 bg-zinc-900 hover:bg-zinc-800 text-white" onClick={setSteps}>Set</Button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-display italic text-lg font-bold mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" /> Non-Negotiables
        </h3>
        <div className="space-y-2">
          <CheckRow icon={<Sunrise className="w-5 h-5" />} label="Morning water (16 oz before coffee)" sub="5:30 AM journal ritual anchor" done={checkins.water1} onToggle={() => save({ water1: !checkins.water1 })} />
          <CheckRow icon={<Coffee className="w-5 h-5" />} label="Broke fast at noon, not before" sub={`Eat window ${FASTING.eatStart} – ${FASTING.eatEnd}`} done={checkins.fastBroken} onToggle={() => save({ fastBroken: !checkins.fastBroken })} />
          <CheckRow icon={<Dumbbell className="w-5 h-5" />} label={`Completed: ${todayWorkout.workout}`} sub={todayWorkout.where} done={checkins.workoutDone} onToggle={() => save({ workoutDone: !checkins.workoutDone })} accent />
          <CheckRow icon={<Footprints className="w-5 h-5" />} label="Steps goal hit (8,000+)" sub={`Current: ${checkins.steps.toLocaleString()}`} done={checkins.steps >= 8000} onToggle={() => save({ steps: checkins.steps >= 8000 ? 0 : 8000 })} />
          <CheckRow icon={<BedDouble className="w-5 h-5" />} label="Kitchen closed at 8 PM" sub="Brushed teeth. No grazing." done={checkins.kitchenClosed} onToggle={() => save({ kitchenClosed: !checkins.kitchenClosed })} accent />
        </div>
      </div>

      {dayScore >= 100 && (
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <Flame className="w-6 h-6 text-amber-600 shrink-0" />
          <div>
            <div className="font-display italic font-bold text-amber-900">All six, locked in.</div>
            <div className="text-sm text-amber-800">That's a perfect day. Compound these.</div>
          </div>
        </div>
      )}
    </div>
  );
}

const FastingBar = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const hour = now.getHours() + now.getMinutes() / 60;
  const eatStart = 12;
  const eatEnd = 20;
  const inWindow = hour >= eatStart && hour < eatEnd;
  const pct = (hour / 24) * 100;

  return (
    <div>
      <div className="relative h-10 bg-zinc-100 rounded-lg overflow-hidden">
        <div className="absolute top-0 bottom-0 bg-amber-200/70" style={{ left: `${(eatStart / 24) * 100}%`, width: `${((eatEnd - eatStart) / 24) * 100}%` }} />
        <div className="absolute top-0 bottom-0 w-0.5 bg-zinc-900" style={{ left: `${pct}%` }} />
      </div>
      <div className="mt-3 text-xs font-mono text-zinc-500">
        {inWindow ? '🟡 EAT WINDOW' : '⚫ FASTING'}
      </div>
    </div>
  );
};

