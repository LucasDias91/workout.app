export interface SeedProgram {
  id: number;
  startedOn: string;
  type: string;
  isActive: number;
}

export interface SeedWorkout {
  id: number;
  programId: number;
  letter: string;
  targetMuscle: string;
  sortOrder: number;
}

export interface SeedExercise {
  id: number;
  name: string;
}

export interface SeedWorkoutExercise {
  id: number;
  workoutId: number;
  exerciseId: number;
  sortOrder: number;
  sxr: string;
  sets: number;
  reps: string;
  technique: string | null;
  restPeriod: string;
  restMinSec: number;
  restMaxSec: number;
}

export interface SeedData {
  programs: SeedProgram[];
  workouts: SeedWorkout[];
  exercises: SeedExercise[];
  workoutExercises: SeedWorkoutExercise[];
}
