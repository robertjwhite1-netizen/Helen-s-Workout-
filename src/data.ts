import { WorkoutPlan, Exercise, LoggedSet, AppSettings } from './types';

export const DEFAULT_SETTINGS: AppSettings = {
  userName: "Helen",
  units: "kg",
  workoutDays: ["Monday", "Wednesday", "Friday"],
  themeColor: "sage"
};

export const DEFAULT_WORKOUTS: WorkoutPlan[] = [
  {
    id: "w1",
    name: "Full Body Tone",
    day: "Monday",
    focus: "Legs, Glutes, Core & Confidence",
    exercises: [
      {
        id: "e1_1",
        name: "Goblet Squat",
        muscleGroup: "Legs / Glutes",
        equipmentType: "dumbbell",
        sets: 3,
        repMin: 10,
        repMax: 12,
        restSeconds: 60,
        startingSuggestion: 8
      },
      {
        id: "e1_2",
        name: "Dumbbell Romanian Deadlift",
        muscleGroup: "Hamstrings / Glutes",
        equipmentType: "dumbbell",
        sets: 3,
        repMin: 10,
        repMax: 12,
        restSeconds: 60,
        startingSuggestion: 8
      },
      {
        id: "e1_3",
        name: "Seated Row",
        muscleGroup: "Back",
        equipmentType: "machine",
        sets: 3,
        repMin: 10,
        repMax: 12,
        restSeconds: 60,
        startingSuggestion: 15
      },
      {
        id: "e1_4",
        name: "Dumbbell Chest Press",
        muscleGroup: "Chest / Arms",
        equipmentType: "dumbbell",
        sets: 3,
        repMin: 10,
        repMax: 12,
        restSeconds: 60,
        startingSuggestion: 4
      },
      {
        id: "e1_5",
        name: "Glute Bridge",
        muscleGroup: "Glutes",
        equipmentType: "bodyweight",
        sets: 3,
        repMin: 12,
        repMax: 15,
        restSeconds: 60,
        startingSuggestion: 0
      },
      {
        id: "e1_6",
        name: "Plank",
        muscleGroup: "Core",
        equipmentType: "bodyweight",
        sets: 3,
        repMin: 30,
        repMax: 45,
        restSeconds: 45,
        startingSuggestion: 0,
        targetOverride: "30-45 seconds"
      },
      {
        id: "e1_7",
        name: "Optional Incline Walk",
        muscleGroup: "Optional Cardio",
        equipmentType: "cardio",
        sets: 1,
        repMin: 8,
        repMax: 12,
        restSeconds: 0,
        startingSuggestion: 0,
        targetOverride: "8-12 minutes"
      }
    ]
  },
  {
    id: "w2",
    name: "Legs / Glutes / Core",
    day: "Wednesday",
    focus: "Lower Body Sculpting & Core Stability",
    exercises: [
      {
        id: "e2_1",
        name: "Leg Press",
        muscleGroup: "Legs / Glutes",
        equipmentType: "machine",
        sets: 3,
        repMin: 10,
        repMax: 12,
        restSeconds: 75,
        startingSuggestion: 20
      },
      {
        id: "e2_2",
        name: "Step-Ups",
        muscleGroup: "Legs / Glutes",
        equipmentType: "bodyweight",
        sets: 3,
        repMin: 10,
        repMax: 10,
        restSeconds: 60,
        startingSuggestion: 0,
        targetOverride: "10 reps each leg"
      },
      {
        id: "e2_3",
        name: "Hamstring Curl",
        muscleGroup: "Hamstrings",
        equipmentType: "machine",
        sets: 3,
        repMin: 12,
        repMax: 15,
        restSeconds: 60,
        startingSuggestion: 10
      },
      {
        id: "e2_4",
        name: "Cable Kickback",
        muscleGroup: "Glutes",
        equipmentType: "cable",
        sets: 3,
        repMin: 12,
        repMax: 15,
        restSeconds: 45,
        startingSuggestion: 5,
        targetOverride: "12-15 reps each leg"
      },
      {
        id: "e2_5",
        name: "Lat Pulldown",
        muscleGroup: "Back",
        equipmentType: "machine",
        sets: 3,
        repMin: 10,
        repMax: 12,
        restSeconds: 60,
        startingSuggestion: 15
      },
      {
        id: "e2_6",
        name: "Dead Bug",
        muscleGroup: "Core",
        equipmentType: "bodyweight",
        sets: 3,
        repMin: 10,
        repMax: 10,
        restSeconds: 45,
        startingSuggestion: 0,
        targetOverride: "10 reps each side"
      },
      {
        id: "e2_7",
        name: "Side Plank",
        muscleGroup: "Core / Waist",
        equipmentType: "bodyweight",
        sets: 2,
        repMin: 20,
        repMax: 30,
        restSeconds: 45,
        startingSuggestion: 0,
        targetOverride: "20-30 seconds each side"
      },
      {
        id: "e2_8",
        name: "Optional Incline Walk or Bike",
        muscleGroup: "Optional Cardio",
        equipmentType: "cardio",
        sets: 1,
        repMin: 10,
        repMax: 10,
        restSeconds: 0,
        startingSuggestion: 0,
        targetOverride: "10 minutes"
      }
    ]
  },
  {
    id: "w3",
    name: "Full Body Shape",
    day: "Friday",
    focus: "General Tone, Posture & Arms Definition",
    exercises: [
      {
        id: "e3_1",
        name: "Dumbbell Split Squat",
        muscleGroup: "Legs / Glutes",
        equipmentType: "bodyweight",
        sets: 3,
        repMin: 8,
        repMax: 10,
        restSeconds: 75,
        startingSuggestion: 0,
        targetOverride: "8-10 reps each leg"
      },
      {
        id: "e3_2",
        name: "Hip Thrust or Glute Bridge",
        muscleGroup: "Glutes",
        equipmentType: "bodyweight",
        sets: 3,
        repMin: 10,
        repMax: 12,
        restSeconds: 75,
        startingSuggestion: 0
      },
      {
        id: "e3_3",
        name: "Shoulder Press",
        muscleGroup: "Shoulders",
        equipmentType: "dumbbell",
        sets: 3,
        repMin: 10,
        repMax: 12,
        restSeconds: 60,
        startingSuggestion: 4
      },
      {
        id: "e3_4",
        name: "Cable Row or Seated Row",
        muscleGroup: "Back",
        equipmentType: "cable",
        sets: 3,
        repMin: 10,
        repMax: 12,
        restSeconds: 60,
        startingSuggestion: 15
      },
      {
        id: "e3_5",
        name: "Dumbbell Curl to Press",
        muscleGroup: "Arms / Shoulders",
        equipmentType: "dumbbell",
        sets: 2,
        repMin: 10,
        repMax: 12,
        restSeconds: 60,
        startingSuggestion: 4
      },
      {
        id: "e3_6",
        name: "Cable Woodchop",
        muscleGroup: "Core / Waist",
        equipmentType: "cable",
        sets: 3,
        repMin: 10,
        repMax: 12,
        restSeconds: 45,
        startingSuggestion: 5,
        targetOverride: "10-12 reps each side"
      },
      {
        id: "e3_7",
        name: "Reverse Crunch",
        muscleGroup: "Abs",
        equipmentType: "bodyweight",
        sets: 3,
        repMin: 12,
        repMax: 15,
        restSeconds: 45,
        startingSuggestion: 0
      },
      {
        id: "e3_8",
        name: "Optional Incline Walk",
        muscleGroup: "Optional Cardio",
        equipmentType: "cardio",
        sets: 1,
        repMin: 10,
        repMax: 15,
        restSeconds: 0,
        startingSuggestion: 0,
        targetOverride: "10-15 minutes"
      }
    ]
  }
];

export function calculateProgression(
  exercise: Exercise,
  loggedSets: LoggedSet[],
  units: 'kg' | 'lbs' = 'kg'
): { nextWeight: number; nextRepsText: string; reason: string } {
  const completedSets = loggedSets.filter(s => s.completed);
  
  // If no sets are logged or completed, stay at suggested or current.
  if (completedSets.length === 0) {
    const defaultWt = Number(exercise.startingSuggestion);
    const repText = exercise.targetOverride || `${exercise.repMin}-${exercise.repMax} reps`;
    return {
      nextWeight: defaultWt,
      nextRepsText: repText,
      reason: "Start this exercise at the suggested weight and focus on nice, slow control."
    };
  }

  // Get weights used and reps hit for completed sets
  const weights = completedSets.map(s => Number(s.weight) || 0);
  const reps = completedSets.map(s => Number(s.reps) || 0);
  const currentWeight = weights[0] !== undefined ? weights[0] : Number(exercise.startingSuggestion);

  // If exercise has custom target text override (plank, cardio walk, etc)
  if (exercise.targetOverride) {
    return {
      nextWeight: currentWeight,
      nextRepsText: exercise.targetOverride,
      reason: "Maintain consistent time and focus on deep, steady breaths."
    };
  }

  const targetSets = exercise.sets;
  const isAllSetsDone = completedSets.length >= targetSets;

  // Check if every set hit the target rep requirements
  const hitAllTop = isAllSetsDone && reps.every(r => r >= exercise.repMax);
  const hitAllMin = isAllSetsDone && reps.every(r => r >= exercise.repMin);

  // Bodyweight progression
  if (exercise.equipmentType === 'bodyweight') {
    if (hitAllTop) {
      // Bodyweight exercises progression: suggest adding reps
      const newMax = exercise.repMax + 2;
      const newMin = exercise.repMin + 1;
      return {
        nextWeight: 0, // Bodyweight remains 0
        nextRepsText: `${newMin}-${newMax} reps`,
        reason: `Splendid job! You completed all sets at the maximum rep range. Let's aim slightly higher (${newMin}-${newMax} reps) to keep toning up.`
      };
    } else if (hitAllMin) {
      return {
        nextWeight: 0,
        nextRepsText: `${exercise.repMin}-${exercise.repMax} reps`,
        reason: `Great consistency. Keep staying at this range and aim to get all sets to ${exercise.repMax} reps next time.`
      };
    } else {
      return {
        nextWeight: 0,
        nextRepsText: `${exercise.repMin}-${exercise.repMax} reps`,
        reason: "Keep practicing at this range. Focus on deep core activation and slower movement."
      };
    }
  }

  // Increments for weighted exercises
  let increment = 1.0;
  if (exercise.equipmentType === 'machine') {
    increment = 2.5; // typical plate stack smallest increment
  } else if (exercise.equipmentType === 'cable') {
    increment = 1.0; // small pin weights
  } else if (exercise.equipmentType === 'dumbbell') {
    increment = 1.0; // dumbbell pair increments (usually smaller steps like 1kg to 2kg)
  } else {
    increment = 2.5; // barbell
  }

  if (hitAllTop) {
    const nextWeight = currentWeight + increment;
    return {
      nextWeight,
      nextRepsText: `${exercise.repMin}-${exercise.repMax} reps`,
      reason: `Wonderful! You hit all ${targetSets} sets at the top rep range of ${exercise.repMax} with ${currentWeight}${units}. Let's gently increase weight to ${nextWeight}${units} next time.`
    };
  } else if (hitAllMin) {
    return {
      nextWeight: currentWeight,
      nextRepsText: `${exercise.repMin}-${exercise.repMax} reps`,
      reason: `Consistent performance at ${currentWeight}${units}! Keep the same weight and work on pushing all sets toward ${exercise.repMax} reps next time.`
    };
  } else {
    return {
      nextWeight: currentWeight,
      nextRepsText: `${exercise.repMin}-${exercise.repMax} reps`,
      reason: `Stay at ${currentWeight}${units}. Focus on form, controlled momentum, and recovery to hit the absolute target reps next week.`
    };
  }
}
