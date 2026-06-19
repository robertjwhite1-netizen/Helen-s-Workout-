export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipmentType: 'dumbbell' | 'machine' | 'bodyweight' | 'cable' | 'barbell' | 'cardio';
  sets: number;
  repMin: number;
  repMax: number;
  restSeconds: number;
  startingSuggestion: number; // in kg or 0 if bodyweight
  targetOverride?: string;    // for plank, incline walk, etc. (e.g. "30-45s", "10-15m")
  units?: string;             // "kg" (default)
}

export interface WorkoutPlan {
  id: string; // "w1" | "w2" | "w3"
  name: string; // e.g. "Full Body Tone"
  day: string; // e.g. "Monday"
  focus: string; // e.g. "legs / glutes / core"
  exercises: Exercise[];
}

export interface LoggedSet {
  setNumber: number;
  weight: number | string; // user input weight
  reps: number | string;   // user input reps
  completed: boolean;
  timestamp?: number;
}

export interface LoggedExercise {
  exerciseId: string;
  exerciseName: string;
  sets: LoggedSet[];
}

export interface WorkoutSession {
  id: string; // Unique timestamp or ID
  date: string; // e.g. "2026-06-19"
  workoutPlanId: string; // "w1" | "w2" | "w3"
  workoutName: string; // Workouts name
  day: string; // "Monday" | "Wednesday" | "Friday"
  completedExercises: LoggedExercise[];
  notes?: string;
}

export interface AppSettings {
  userName: string;
  units: 'kg' | 'lbs';
  workoutDays: string[]; // e.g., ["Monday", "Wednesday", "Friday"]
  themeColor: 'sage' | 'mint' | 'olive' | 'eucalyptus';
}
