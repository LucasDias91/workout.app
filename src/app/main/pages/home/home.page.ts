import { Component } from '@angular/core';
import { NavController, ViewWillEnter } from '@ionic/angular';
import { Workout } from '../../../core/models/workouts/workout';
import { WorkoutLog } from '../../../core/models/workouts/workout-log';
import { DatabaseService } from '../../../core/services/database/database.service';
import { ProfileStoreService } from '../../../core/services/profile/profile-store.service';
import { WorkoutsService } from '../../../core/services/workouts/workouts.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements ViewWillEnter {
  name = '';
  today: Workout;
  lastLog: WorkoutLog;

  constructor(
    private navCtrl: NavController,
    private database: DatabaseService,
    private profileStore: ProfileStoreService,
    private workoutsService: WorkoutsService
  ) {}

  async ionViewWillEnter() {
    this.name = this.firstName(this.profileStore.load().name);
    const [today, logs] = await Promise.all([
      this.workoutsService.getTodayWorkout(),
      this.database.getWorkoutLogs()
    ]);
    this.today = today;
    this.lastLog = logs.length ? logs[0] : null;
  }

  startWorkout() {
    if (!this.today) {
      return;
    }
    this.navCtrl.navigateForward(['/tabs/workouts', this.today.id, 'session']);
  }

  openHistory() {
    this.navCtrl.navigateRoot('/tabs/history');
  }

  private firstName(name: string): string {
    const trimmed = (name || '').trim();
    return trimmed ? trimmed.split(' ')[0] : 'aí';
  }
}
