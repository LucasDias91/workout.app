import { Injectable } from '@angular/core';
import { DatabaseService } from '../database/database.service';
import { Program } from '../../models/workouts/program';
import { Workout } from '../../models/workouts/workout';
import { WorkoutDetail } from '../../models/workouts/workout-detail';

@Injectable({
  providedIn: 'root'
})
export class WorkoutsService {
  constructor(private database: DatabaseService) {}

  async getPrograms(): Promise<Program[]> {
    const programs = await this.database.getPrograms();
    return programs.filter(item => item.id >= 2);
  }

  getProgram(programId: number): Promise<Program> {
    return this.database.getProgramById(programId);
  }

  async getWorkouts(programId: number): Promise<Workout[]> {
    const [workouts, active, letter] = await Promise.all([
      this.database.getWorkoutsByProgram(programId),
      this.database.getActiveProgram(),
      this.database.getActiveLetter()
    ]);
    const highlight = active && active.id === programId;
    return workouts.map(item => ({
      ...item,
      isToday: highlight && item.letter === letter
    }));
  }

  async setActive(programId: number, letter: string): Promise<void> {
    await this.database.setActive(programId, letter);
  }

  async getAdjacentWorkoutIds(workoutId: number): Promise<{ previousId: number; nextId: number }> {
    const workout = await this.database.getWorkoutById(workoutId);
    if (!workout) {
      return { previousId: null, nextId: null };
    }
    const list = await this.database.getWorkoutsByProgram(workout.programId);
    const index = list.findIndex(item => item.id === workoutId);
    return {
      previousId: index > 0 ? list[index - 1].id : null,
      nextId: index >= 0 && index < list.length - 1 ? list[index + 1].id : null
    };
  }

  async getWorkoutDetail(workoutId: number): Promise<WorkoutDetail> {
    const workout = await this.database.getWorkoutById(workoutId);
    if (!workout) {
      return null;
    }
    const program = await this.database.getProgramById(workout.programId);
    const exercises = await this.database.getExercisesByWorkout(workoutId);
    return { program, workout, exercises };
  }
}
