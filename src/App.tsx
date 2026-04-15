import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, onSnapshot, setDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { auth, db, signInWithGoogle, logOut } from './firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Dumbbell, Calendar as CalendarIcon, Clock, Activity, FileText, CheckCircle2, History, Target, Info, Plus, Trash2, TrendingUp, LogIn, LogOut } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// --- Types ---
interface ExerciseSet {
  reps: string;
  weight: string;
}

interface LoggedExercise {
  name: string;
  sets: ExerciseSet[];
}

interface WorkoutLog {
  id: string;
  date: string;
  type: string;
  duration: string;
  pullUpProgress: string;
  focusLevel: number;
  notes: string;
  exercises: LoggedExercise[];
}

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
}

type ExerciseDetail = {
  name: string;
  description: string;
  form: string;
  modifications: string;
  tips: string;
};

// --- Constants ---
const EXERCISE_LIBRARY: Record<string, ExerciseDetail[]> = {
  "Push": [
    { name: "Dumbbell Bench Press", description: "A compound exercise that targets the chest, shoulders, and triceps.", form: "Lie flat on a bench, feet planted. Press dumbbells straight up over your chest, then lower them slowly until your elbows are at a 90-degree angle.", modifications: "If elbows hurt, tuck them closer to your sides (neutral grip).", tips: "Squeeze your chest at the top of the movement." },
    { name: "Seated Shoulder Press (Machine)", description: "Machine-based overhead press for shoulder strength.", form: "Sit with back flat against the pad. Press handles overhead until arms are extended, then lower slowly.", modifications: "Adjust seat height so handles are at shoulder level. Machine provides stability for joints.", tips: "Don't lock out elbows completely at the top." },
    { name: "Cable Tricep Pushdowns", description: "Isolation exercise for the triceps.", form: "Stand facing the cable machine. Keep elbows tucked to your sides and push the bar/rope down until arms are fully extended.", modifications: "Use a rope attachment if a straight bar bothers your wrists.", tips: "Keep your upper arms completely still; only move your forearms." },
    { name: "Incline Dumbbell Flyes", description: "Isolation exercise for the upper chest.", form: "Lie on an incline bench. Hold dumbbells above chest with a slight bend in elbows. Lower weights out to the sides in a wide arc, then bring them back up.", modifications: "Don't go too deep if you feel shoulder strain. Keep the range of motion comfortable.", tips: "Imagine hugging a large barrel." },
    { name: "Captain's Chair Leg Raises", description: "Core exercise targeting the lower abs.", form: "Support yourself on the forearms. Keep back flat against the pad. Raise your knees toward your chest, then lower slowly.", modifications: "Bend knees if straight legs are too difficult or strain the lower back.", tips: "Avoid swinging; use your core to lift your legs." },
    { name: "Plank", description: "Isometric core strength exercise.", form: "Hold a push-up position on your forearms. Keep your body in a straight line from head to heels.", modifications: "Drop to your knees if holding the full plank compromises your lower back.", tips: "Squeeze your glutes and brace your core as if about to be punched." }
  ],
  "Pull": [
    { name: "The Pull-Up Protocol", description: "Progressive steps to achieve an unassisted pull-up.", form: "Use assisted machine or do slow negatives (jump up, lower slowly).", modifications: "Use V-Bar attachment if wrists hurt from gout flare-ups.", tips: "Squeeze abs and glutes (hollow body) to prevent swinging." },
    { name: "Lat Pulldowns", description: "Compound back exercise simulating a pull-up.", form: "Sit at the machine. Pull the bar down to your upper chest, squeezing your shoulder blades together.", modifications: "Use a neutral grip (palms facing each other) if shoulders feel tight.", tips: "Lean back slightly, but don't use momentum to pull the weight." },
    { name: "Seated Cable Rows", description: "Horizontal pulling exercise for mid-back thickness.", form: "Sit with knees slightly bent. Pull the handle to your lower stomach, keeping your back straight.", modifications: "Keep the weight light if lower back feels strained.", tips: "Squeeze shoulder blades together at the end of the movement." },
    { name: "Dumbbell Bicep Curls", description: "Isolation exercise for the biceps.", form: "Stand or sit. Curl the dumbbells up toward your shoulders, keeping elbows tucked to your sides.", modifications: "Use hammer curls (neutral grip) if standard curls bother your wrists or elbows.", tips: "Control the weight on the way down; don't just drop it." },
    { name: "Cable Crunches", description: "Weighted core exercise.", form: "Kneel facing the cable machine. Hold the rope attachment behind your neck. Crunch your torso downward.", modifications: "Ensure you are using your abs, not your arms, to pull the weight.", tips: "Keep your hips stationary; the movement should come from your spine flexing." },
    { name: "Bird-Dog", description: "Core stabilization exercise.", form: "Start on all fours. Extend opposite arm and leg straight out. Hold briefly, then return.", modifications: "Only extend the leg if extending both arm and leg is too difficult to balance.", tips: "Keep your back flat like a table; don't let your hips twist." }
  ],
  "Legs": [
    { name: "Leg Press", description: "Machine-based compound leg exercise.", form: "Sit in the machine, feet shoulder-width apart on the platform. Lower the weight until knees are at 90 degrees, then press back up.", modifications: "Place feet higher on the platform to reduce knee strain and target glutes more.", tips: "Don't lock your knees out at the top of the movement." },
    { name: "Seated Leg Curls", description: "Machine isolation exercise for hamstrings.", form: "Sit in the machine. Curl the pad down and back using your hamstrings.", modifications: "Adjust the pad so it sits comfortably above your ankles.", tips: "Squeeze your hamstrings at the bottom of the movement." },
    { name: "Leg Extensions", description: "Machine isolation exercise for quadriceps.", form: "Sit in the machine. Extend your legs straight out, lifting the padded bar.", modifications: "If you have knee issues, limit the range of motion or use lighter weight.", tips: "Pause for a second at the top of the movement to maximize quad contraction." },
    { name: "Dumbbell Goblet Squat", description: "Compound leg exercise that also engages the core.", form: "Hold a dumbbell vertically against your chest. Squat down, keeping your chest up and back straight.", modifications: "Squat to a box or bench if you have trouble with depth or balance.", tips: "Push your knees out as you squat down to engage your glutes." },
    { name: "Russian Twists", description: "Core exercise targeting the obliques.", form: "Sit on the floor, lean back slightly, and lift feet off the ground. Twist your torso from side to side, holding a weight.", modifications: "Keep feet on the floor if balancing is too difficult or strains your lower back.", tips: "Follow the weight with your eyes to ensure full torso rotation." },
    { name: "Dead Bug", description: "Core stabilization exercise.", form: "Lie on your back, arms extended up, knees bent at 90 degrees. Slowly lower opposite arm and leg toward the floor.", modifications: "Only lower the leg if doing both arm and leg is too difficult.", tips: "Crucial: Keep your lower back pressed firmly into the floor the entire time." }
  ],
  "Bike/Hike": [
    { name: "Treadmill Incline Walk", description: "Low-impact steady-state cardio.", form: "Set incline to 8%–12% and walk at 3.0–3.5 mph.", modifications: "Lower incline or speed if calves or Achilles feel tight.", tips: "Don't hold onto the handrails; pump your arms to burn more calories." },
    { name: "Stationary Bike", description: "Low-impact cardio.", form: "Adjust seat height so there's a slight bend in your knee at the bottom of the pedal stroke.", modifications: "Use a recumbent bike if you have lower back issues.", tips: "Maintain a steady cadence (RPM) rather than mashing heavy resistance." },
    { name: "Kettlebell Swings", description: "Dynamic full-body exercise for active recovery.", form: "Hinge at the hips, keeping back straight. Use your hips to explosively swing the kettlebell up to chest height.", modifications: "Keep the weight light and focus on the hip hinge if lower back feels tight.", tips: "This is a hip hinge, not a squat. The power comes from your glutes and hamstrings." }
  ]
};

const DEFAULT_GOALS: Goal[] = [
  { id: '1', title: 'Achieve 1 unassisted pull-up', target: 1, current: 0, unit: 'reps' },
  { id: '2', title: 'Maintain Muscle Mass', target: 78.7, current: 78.7, unit: 'lbs' },
  { id: '3', title: 'Drop fat', target: 20, current: 0, unit: 'lbs lost' }
];

export default function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [goals, setGoals] = useState<Goal[]>(DEFAULT_GOALS);

  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<string>("");
  const [duration, setDuration] = useState("");
  const [pullUpProgress, setPullUpProgress] = useState("");
  const [focusLevel, setFocusLevel] = useState<number[]>([3]);
  const [notes, setNotes] = useState("");
  
  const [currentExercises, setCurrentExercises] = useState<LoggedExercise[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;
    if (!userId) {
      setLogs([]);
      setGoals(DEFAULT_GOALS);
      return;
    }

    const logsRef = collection(db, `users/${userId}/workoutLogs`);
    const q = query(logsRef, orderBy('createdAt', 'desc'));
    
    const unsubscribeLogs = onSnapshot(q, (snapshot) => {
      const fetchedLogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WorkoutLog[];
      setLogs(fetchedLogs);
    }, (error) => {
      console.error("Error fetching logs:", error);
      toast.error("Failed to load workout logs.");
    });

    const goalsRef = collection(db, `users/${userId}/goals`);
    const unsubscribeGoals = onSnapshot(goalsRef, (snapshot) => {
      if (snapshot.empty) {
        // Initialize default goals if none exist
        DEFAULT_GOALS.forEach(async (goal) => {
          await setDoc(doc(db, `users/${userId}/goals`, goal.id), {
            ...goal,
            userId,
            createdAt: serverTimestamp()
          });
        });
      } else {
        const fetchedGoals = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Goal[];
        // Sort goals by ID to maintain order
        setGoals(fetchedGoals.sort((a, b) => a.id.localeCompare(b.id)));
      }
    }, (error) => {
      console.error("Error fetching goals:", error);
      toast.error("Failed to load goals.");
    });

    return () => {
      unsubscribeLogs();
      unsubscribeGoals();
    };
  }, [userId, isAuthReady]);

  // When workout type changes, populate the default exercises
  useEffect(() => {
    if (type && EXERCISE_LIBRARY[type]) {
      const defaultExercises = EXERCISE_LIBRARY[type].map(ex => ({
        name: ex.name,
        sets: [{ reps: "", weight: "" }]
      }));
      setCurrentExercises(defaultExercises);
    } else {
      setCurrentExercises([]);
    }
  }, [type]);

  const handleAddSet = (exerciseIndex: number) => {
    const updated = [...currentExercises];
    updated[exerciseIndex].sets.push({ reps: "", weight: "" });
    setCurrentExercises(updated);
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const updated = [...currentExercises];
    updated[exerciseIndex].sets.splice(setIndex, 1);
    setCurrentExercises(updated);
  };

  const handleSetChange = (exerciseIndex: number, setIndex: number, field: 'reps' | 'weight', value: string) => {
    const updated = [...currentExercises];
    updated[exerciseIndex].sets[setIndex][field] = value;
    setCurrentExercises(updated);
  };

  const handleSave = async () => {
    if (!userId) {
      toast.error("Please sign in to save workouts.");
      return;
    }
    if (!type || !duration) {
      toast.error("Please fill in the workout type and duration.");
      return;
    }

    const newLogId = crypto.randomUUID();
    const newLog = {
      userId,
      date,
      type,
      duration,
      pullUpProgress,
      focusLevel: focusLevel[0],
      notes,
      exercises: currentExercises,
      createdAt: serverTimestamp()
    };

    try {
      await setDoc(doc(db, `users/${userId}/workoutLogs`, newLogId), newLog);
      toast.success("Workout logged successfully!");
      
      setType("");
      setDuration("");
      setPullUpProgress("");
      setFocusLevel([3]);
      setNotes("");
      setCurrentExercises([]);
    } catch (error) {
      console.error("Error saving log:", error);
      toast.error("Failed to save workout.");
    }
  };

  const updateGoalCurrent = async (id: string, newCurrent: number) => {
    if (!userId) {
      toast.error("Please sign in to update goals.");
      return;
    }
    try {
      await setDoc(doc(db, `users/${userId}/goals`, id), { current: newCurrent }, { merge: true });
    } catch (error) {
      console.error("Error updating goal:", error);
      toast.error("Failed to update goal.");
    }
  };

  // Chart Data Preparation
  const chartData = [...logs].reverse().map(log => ({
    date: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    duration: parseInt(log.duration) || 0,
    focus: log.focusLevel
  }));

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-orange-200">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-zinc-900 p-3 rounded-xl text-white shadow-sm">
              <Dumbbell size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 font-display italic">Aegis Strength</h1>
              <p className="text-zinc-500 font-medium font-mono text-sm uppercase tracking-wider">90-Day Protocol</p>
            </div>
          </div>
          <div>
            {userId ? (
              <Button variant="outline" size="sm" onClick={logOut} className="gap-2">
                <LogOut className="w-4 h-4" /> Sign Out
              </Button>
            ) : (
              <Button variant="default" size="sm" onClick={signInWithGoogle} className="gap-2 bg-zinc-900 text-white hover:bg-zinc-800">
                <LogIn className="w-4 h-4" /> Sign In
              </Button>
            )}
          </div>
        </header>

        <Tabs defaultValue="log" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 h-12 bg-zinc-200/50 p-1 rounded-xl">
            <TabsTrigger value="log" className="rounded-lg font-medium">Log</TabsTrigger>
            <TabsTrigger value="progress" className="rounded-lg font-medium">Progress</TabsTrigger>
            <TabsTrigger value="goals" className="rounded-lg font-medium">Goals</TabsTrigger>
            <TabsTrigger value="plan" className="rounded-lg font-medium">Plan</TabsTrigger>
          </TabsList>

          {/* LOG WORKOUT TAB */}
          <TabsContent value="log" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-zinc-200 shadow-sm rounded-2xl overflow-hidden">
              <div className="h-2 bg-zinc-900 w-full"></div>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-2 font-display">
                  <Activity className="w-5 h-5 text-zinc-900" />
                  New Entry
                </CardTitle>
                <CardDescription>Record your progress for today's session.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center gap-2 text-zinc-700">
                      <CalendarIcon className="w-4 h-4" /> Date
                    </Label>
                    <Input 
                      id="date" 
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)}
                      className="bg-zinc-50 border-zinc-200 focus-visible:ring-zinc-900 font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type" className="flex items-center gap-2 text-zinc-700">
                      <Target className="w-4 h-4" /> Workout Type
                    </Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger className="bg-zinc-50 border-zinc-200 focus:ring-zinc-900 font-mono text-sm">
                        <SelectValue placeholder="Select workout type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Push">Push Day (Workout A)</SelectItem>
                        <SelectItem value="Pull">Pull Day (Workout B)</SelectItem>
                        <SelectItem value="Legs">Leg Day (Workout C)</SelectItem>
                        <SelectItem value="Bike/Hike">Bike/Hike (Active Recovery)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="flex items-center gap-2 text-zinc-700">
                      <Clock className="w-4 h-4" /> Duration (minutes)
                    </Label>
                    <Input 
                      id="duration" 
                      type="number" 
                      placeholder="e.g., 60" 
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="bg-zinc-50 border-zinc-200 focus-visible:ring-zinc-900 font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pullup" className="flex items-center gap-2 text-zinc-700">
                      <Dumbbell className="w-4 h-4" /> Pull-Up Progress
                    </Label>
                    <Input 
                      id="pullup" 
                      placeholder="e.g., Assisted 40lbs or 3 Negatives" 
                      value={pullUpProgress}
                      onChange={(e) => setPullUpProgress(e.target.value)}
                      className="bg-zinc-50 border-zinc-200 focus-visible:ring-zinc-900 font-mono text-sm"
                    />
                  </div>
                </div>

                {/* DYNAMIC EXERCISES */}
                {type && currentExercises.length > 0 && (
                  <div className="mt-8 border-t border-zinc-200 pt-6">
                    <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                      <Dumbbell className="w-5 h-5" /> Exercises
                    </h3>
                    <div className="space-y-6">
                      {currentExercises.map((exercise, exIdx) => {
                        const details = EXERCISE_LIBRARY[type].find(e => e.name === exercise.name);
                        return (
                          <div key={exIdx} className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="font-semibold text-zinc-900">{exercise.name}</h4>
                              {details && (
                                <Dialog>
                                  <DialogTrigger render={<Button variant="outline" size="sm" className="h-8 gap-1 text-xs" />}>
                                    <Info className="w-3 h-3" /> Details
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                      <DialogTitle className="font-display text-xl">{details.name}</DialogTitle>
                                      <DialogDescription>{details.description}</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 mt-4 text-sm">
                                      <div>
                                        <h5 className="font-semibold text-zinc-900 flex items-center gap-2"><Activity className="w-4 h-4"/> Form</h5>
                                        <p className="text-zinc-600 mt-1">{details.form}</p>
                                      </div>
                                      <div>
                                        <h5 className="font-semibold text-zinc-900 flex items-center gap-2"><Info className="w-4 h-4"/> Modifications</h5>
                                        <p className="text-zinc-600 mt-1">{details.modifications}</p>
                                      </div>
                                      <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                                        <h5 className="font-semibold text-zinc-900 flex items-center gap-2"><Target className="w-4 h-4"/> Pro Tip</h5>
                                        <p className="text-zinc-600 mt-1">{details.tips}</p>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                            
                            <div className="space-y-3">
                              {exercise.sets.map((set, setIdx) => (
                                <div key={setIdx} className="flex items-center gap-3">
                                  <span className="text-xs font-mono text-zinc-400 w-12">Set {setIdx + 1}</span>
                                  <Input 
                                    placeholder="Reps" 
                                    value={set.reps}
                                    onChange={(e) => handleSetChange(exIdx, setIdx, 'reps', e.target.value)}
                                    className="h-8 font-mono text-sm"
                                  />
                                  <Input 
                                    placeholder="Weight" 
                                    value={set.weight}
                                    onChange={(e) => handleSetChange(exIdx, setIdx, 'weight', e.target.value)}
                                    className="h-8 font-mono text-sm"
                                  />
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-zinc-400 hover:text-red-500"
                                    onClick={() => handleRemoveSet(exIdx, setIdx)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-xs text-zinc-500 mt-2"
                                onClick={() => handleAddSet(exIdx)}
                              >
                                <Plus className="w-3 h-3 mr-1" /> Add Set
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-4 pt-4 border-t border-zinc-200">
                  <div className="flex justify-between items-center">
                    <Label className="flex items-center gap-2 text-zinc-700">
                      <Activity className="w-4 h-4" /> Focus Level: {focusLevel[0]}
                    </Label>
                    <span className="text-xs text-zinc-500 font-medium">1 = Easy, 5 = Max Effort</span>
                  </div>
                  <Slider 
                    value={focusLevel} 
                    onValueChange={setFocusLevel} 
                    max={5} 
                    min={1} 
                    step={1}
                    className="py-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="flex items-center gap-2 text-zinc-700">
                    <FileText className="w-4 h-4" /> Notes
                  </Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Any gout flare-ups or wins today?" 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[100px] bg-zinc-50 border-zinc-200 focus-visible:ring-zinc-900 resize-none font-mono text-sm"
                  />
                </div>

              </CardContent>
              <CardFooter className="bg-zinc-50/50 border-t border-zinc-100 p-4">
                <Button onClick={handleSave} className="w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl h-12 text-md font-semibold shadow-sm transition-all active:scale-[0.98]">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Save Workout
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* PROGRESS TAB */}
          <TabsContent value="progress" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-zinc-200 shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <Clock className="w-5 h-5" /> Duration Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] w-full">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E0DDD7" vertical={false} />
                          <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E0DDD7', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }} />
                          <Line type="monotone" dataKey="duration" stroke="#1A1A1A" strokeWidth={3} dot={{ r: 4, fill: '#1A1A1A' }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-zinc-400 text-sm">No data yet</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-zinc-200 shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <Activity className="w-5 h-5" /> Focus Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] w-full">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E0DDD7" vertical={false} />
                          <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 5]} />
                          <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E0DDD7', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }} cursor={{ fill: '#f4f4f5' }} />
                          <Bar dataKey="focus" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-zinc-400 text-sm">No data yet</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-zinc-200 shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2 font-display">
                  <History className="w-5 h-5 text-zinc-900" />
                  Workout History
                </CardTitle>
                <CardDescription>Your past sessions and detailed logs.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  {logs.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500 flex flex-col items-center gap-3">
                      <Dumbbell className="w-12 h-12 opacity-20" />
                      <p>No workouts logged yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {logs.map((log) => (
                        <div key={log.id} className="p-4 rounded-xl border border-zinc-200 bg-white shadow-sm hover:border-zinc-300 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="inline-block px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-800 text-xs font-bold uppercase tracking-wider mb-2">
                                {log.type}
                              </span>
                              <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-zinc-400" />
                                {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                              </h3>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-zinc-600 text-sm font-medium">
                                <Clock className="w-3.5 h-3.5" />
                                {log.duration} min
                              </div>
                              <div className="text-xs text-zinc-400 mt-1">
                                Focus: {log.focusLevel}/5
                              </div>
                            </div>
                          </div>
                          
                          {log.pullUpProgress && (
                            <div className="mt-3 text-sm bg-zinc-50 p-2.5 rounded-lg border border-zinc-100 flex items-start gap-2">
                              <Target className="w-4 h-4 text-zinc-900 mt-0.5 shrink-0" />
                              <div>
                                <span className="font-semibold text-zinc-700">Pull-Up: </span>
                                <span className="text-zinc-600">{log.pullUpProgress}</span>
                              </div>
                            </div>
                          )}

                          {log.exercises && log.exercises.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-zinc-100">
                              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Exercises</p>
                              <div className="space-y-2">
                                {log.exercises.map((ex, i) => (
                                  <div key={i} className="text-sm">
                                    <span className="font-medium text-zinc-800">{ex.name}</span>
                                    <div className="text-zinc-500 text-xs font-mono mt-0.5">
                                      {ex.sets.map((s, si) => `${s.reps || 0}x${s.weight || 0}`).join(' | ')}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {log.notes && (
                            <div className="mt-3 text-sm text-zinc-600 flex items-start gap-2">
                              <FileText className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                              <p className="italic">{log.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* GOALS TAB */}
          <TabsContent value="goals" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-zinc-200 shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2 font-display">
                  <Target className="w-5 h-5 text-zinc-900" />
                  Primary Goals
                </CardTitle>
                <CardDescription>Track your progress against the 90-Day Plan targets.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {goals.map((goal) => {
                  const progressPct = Math.min(100, Math.max(0, (goal.current / goal.target) * 100));
                  return (
                    <div key={goal.id} className="space-y-3">
                      <div className="flex justify-between items-end">
                        <div>
                          <h4 className="font-semibold text-zinc-900">{goal.title}</h4>
                          <p className="text-sm text-zinc-500 font-mono mt-1">Target: {goal.target} {goal.unit}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold font-display text-zinc-900">{goal.current}</span>
                          <span className="text-sm text-zinc-500 ml-1">{goal.unit}</span>
                        </div>
                      </div>
                      <Progress value={progressPct} className="h-3 bg-zinc-100" />
                      <div className="flex items-center gap-2 mt-2">
                        <Input 
                          type="number" 
                          placeholder="Update current..." 
                          className="h-8 w-32 text-sm font-mono"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateGoalCurrent(goal.id, parseFloat(e.currentTarget.value) || 0);
                              e.currentTarget.value = '';
                              toast.success("Goal updated!");
                            }
                          }}
                        />
                        <span className="text-xs text-zinc-400 italic">Press Enter to update</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* PLAN TAB */}
          <TabsContent value="plan" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-zinc-200 shadow-sm rounded-2xl">
              <CardHeader className="bg-zinc-900 text-white rounded-t-2xl">
                <CardTitle className="text-xl flex items-center gap-2 font-display">
                  <Info className="w-5 h-5 text-zinc-400" />
                  90-Day Strength Plan
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Maintain 78.7 lbs of Muscle Mass, drop 20 lbs of fat, and achieve 1 unassisted pull-up by Day 90.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[65vh]">
                  <div className="p-6 space-y-6">
                    
                    <section className="space-y-2">
                      <h3 className="font-bold text-lg text-zinc-900 border-b border-zinc-200 pb-2 font-display">Overview</h3>
                      <ul className="space-y-1 text-sm text-zinc-700 list-disc pl-5">
                        <li><strong>Schedule:</strong> 2-3 Times per Week (60-75 mins total per session).</li>
                        <li><strong>Constraint Focus:</strong> Gout-safe (Low impact), Joint-friendly, Time-efficient.</li>
                      </ul>
                    </section>

                    <section className="space-y-2">
                      <h3 className="font-bold text-lg text-zinc-900 border-b border-zinc-200 pb-2 font-display">The "Warm-Up" (30 Mins)</h3>
                      <div className="text-sm text-zinc-700 space-y-2">
                        <p><strong>The Treadmill "Incline" Method:</strong> Set incline to 8%–12% and walk at 3.0–3.5 mph.</p>
                        <p><strong>The Habit Stack:</strong> Audiobooks or YouTube only while moving.</p>
                        <p><strong>Pull-Up Prep:</strong> During the last 5 mins, do arm circles and shoulder shrugs to prime the lats.</p>
                      </div>
                    </section>

                    <section className="space-y-2">
                      <h3 className="font-bold text-lg text-zinc-900 border-b border-zinc-200 pb-2 font-display">The 90-Day Pull-Up Roadmap</h3>
                      <p className="text-sm text-zinc-500 italic mb-2">Perform these at the start of every "Workout B" (Pull Day).</p>
                      <div className="space-y-3 text-sm text-zinc-700">
                        <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                          <strong className="text-zinc-900">Phase 1 (Days 1-30):</strong> Use the Assisted Machine. Reduce assistance by 5 lbs every week. Target: 45 lbs assistance by Day 30.
                        </div>
                        <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                          <strong className="text-zinc-900">Phase 2 (Days 31-60):</strong> Introduce "Slow Negatives." Jump to the top of the bar and lower yourself as slowly as possible (aim for 5-10 seconds). Do 3 sets of 3.
                        </div>
                        <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                          <strong className="text-zinc-900">Phase 3 (Days 61-90):</strong> "Scapular Pulls" and "Dead Hangs." Hang from the bar for 30 seconds to build grip strength. At Day 75, attempt your first unassisted rep.
                        </div>
                      </div>
                    </section>

                    <section className="space-y-4">
                      <h3 className="font-bold text-lg text-zinc-900 border-b border-zinc-200 pb-2 font-display">The Lifting & Core Split (45 Mins)</h3>
                      
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1" className="border-zinc-200">
                          <AccordionTrigger className="hover:no-underline hover:text-zinc-600 font-semibold">
                            Workout A: Push Day
                          </AccordionTrigger>
                          <AccordionContent className="text-zinc-600 space-y-2">
                            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Chest, Shoulders, Triceps + Core</p>
                            <ul className="list-disc pl-5 space-y-1">
                              <li><strong>Dumbbell Bench Press:</strong> 3 sets of 8–10 reps.</li>
                              <li><strong>Seated Shoulder Press (Machine):</strong> 3 sets of 10–12 reps.</li>
                              <li><strong>Cable Tricep Pushdowns:</strong> 3 sets of 15 reps.</li>
                              <li><strong>Incline Dumbbell Flyes:</strong> 2 sets of 12 reps.</li>
                              <li><strong>Core - Captain’s Chair Leg Raises:</strong> 3 sets of 12–15 reps. (Keep back flat against the pad).</li>
                              <li><strong>Core - Plank:</strong> 3 sets, hold for 45–60 seconds.</li>
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="item-2" className="border-zinc-200">
                          <AccordionTrigger className="hover:no-underline hover:text-zinc-600 font-semibold">
                            Workout B: Pull Day
                          </AccordionTrigger>
                          <AccordionContent className="text-zinc-600 space-y-2">
                            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Back, Biceps + Core</p>
                            <ul className="list-disc pl-5 space-y-1">
                              <li><strong>The Pull-Up Protocol:</strong> Assisted Machine OR Negatives as per the Roadmap.</li>
                              <li><strong>Lat Pulldowns:</strong> 3 sets of 10 reps. (Use a grip similar to your pull-up).</li>
                              <li><strong>Seated Cable Rows:</strong> 3 sets of 10–12 reps.</li>
                              <li><strong>Dumbbell Bicep Curls:</strong> 3 sets of 12 reps.</li>
                              <li><strong>Core - Cable Crunches:</strong> 3 sets of 15–20 reps. (Kneeling, using the rope attachment).</li>
                              <li><strong>Core - Bird-Dog:</strong> 3 sets of 10 reps per side (Great for stabilizing the spine).</li>
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="item-3" className="border-zinc-200">
                          <AccordionTrigger className="hover:no-underline hover:text-zinc-600 font-semibold">
                            Workout C: Leg Day
                          </AccordionTrigger>
                          <AccordionContent className="text-zinc-600 space-y-2">
                            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Quads, Hamstrings + Core</p>
                            <ul className="list-disc pl-5 space-y-1">
                              <li><strong>Leg Press:</strong> 3 sets of 10–12 reps.</li>
                              <li><strong>Seated Leg Curls:</strong> 3 sets of 12–15 reps.</li>
                              <li><strong>Leg Extensions:</strong> 3 sets of 12–15 reps.</li>
                              <li><strong>Dumbbell Goblet Squat:</strong> 2 sets of 10 reps.</li>
                              <li><strong>Core - Russian Twists:</strong> 3 sets of 20 reps (Use a light dumbbell or kettlebell).</li>
                              <li><strong>Core - Dead Bug:</strong> 3 sets of 12 reps (Focus on keeping your lower back pressed into the floor).</li>
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </section>

                    <section className="space-y-2">
                      <h3 className="font-bold text-lg text-zinc-900 border-b border-zinc-200 pb-2 font-display">Pro-Tips for the Pull-Up Goal</h3>
                      <ul className="space-y-2 text-sm text-zinc-700">
                        <li><strong>Grip Strength:</strong> Gout can sometimes affect the hands/wrists. If you feel a flare-up, use the "V-Bar" attachment for pull-ups instead of a wide straight bar to take pressure off the wrists.</li>
                        <li><strong>The "Hollow Body" Position:</strong> When doing pull-ups or negatives, squeeze your abs and glutes. This keeps your body from swinging and makes the lift 20% easier.</li>
                        <li><strong>Consistency:</strong> Don't skip the "Negatives" in Phase 2. That eccentric (lowering) strength is what actually builds the muscle for the pull-up.</li>
                      </ul>
                    </section>

                    <section className="space-y-2">
                      <h3 className="font-bold text-lg text-zinc-900 border-b border-zinc-200 pb-2 font-display">Home-Based "Active Recovery"</h3>
                      <ul className="space-y-1 text-sm text-zinc-700 list-disc pl-5">
                        <li><strong>Kettlebell Swings:</strong> 3 sets of 15.</li>
                        <li><strong>Gravel Bike / Hiking:</strong> Low-impact steady-state cardio.</li>
                      </ul>
                    </section>

                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}
