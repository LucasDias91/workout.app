export interface Workout {
  id: number;
  programId: number;
  letter: string;
  targetMuscle: string;
  sortOrder: number;
  isToday?: boolean;
  isActive?: boolean;
}
