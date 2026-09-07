import { Program } from './program';
import { Workout } from './workout';
import { WorkoutExercise } from './workout-exercise';

export interface WorkoutDetail {
  program: Program;
  workout: Workout;
  exercises: WorkoutExercise[];
}
