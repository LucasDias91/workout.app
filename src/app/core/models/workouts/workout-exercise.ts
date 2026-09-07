export interface WorkoutExercise {
  id: number;
  workoutId: number;
  exerciseId: number;
  sortOrder: number;
  sxr: string;
  sets: number;
  reps: string;
  technique?: string;
  restPeriod: string;
  restMinSec: number;
  restMaxSec: number;
  name?: string;
}
