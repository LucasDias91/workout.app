export interface WorkoutLog {
  id: number;
  workoutId: number;
  startedAt: string;
  endedAt: string;
  durationSec: number;
  letter: string;
  targetMuscle: string;
}
