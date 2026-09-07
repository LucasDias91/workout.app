import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { WorkoutDetail } from '../../../core/models/workouts/workout-detail';
import { DatabaseService } from '../../../core/services/database/database.service';
import { WorkoutsService } from '../../../core/services/workouts/workouts.service';

@Component({
  selector: 'app-workout-session',
  templateUrl: './workout-session.page.html',
  styleUrls: ['./workout-session.page.scss']
})
export class WorkoutSessionPage implements OnInit {
  detail: WorkoutDetail;
  loading = true;
  saving = false;
  private startedAt: string;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private database: DatabaseService,
    private workoutsService: WorkoutsService
  ) {}

  async ngOnInit() {
    this.startedAt = new Date().toISOString();
    const id = this.readId();
    this.detail = Number.isFinite(id) ? await this.workoutsService.getWorkoutDetail(id) : null;
    this.loading = false;
  }

  async complete() {
    if (!this.detail || this.saving) {
      return;
    }
    this.saving = true;
    await this.database.logWorkout(this.detail.workout.id, this.startedAt);
    this.saving = false;
    const toast = await this.toastCtrl.create({
      message: 'Treino registrado',
      duration: 1800,
      color: 'dark'
    });
    toast.present();
    this.navCtrl.navigateRoot('/tabs/history');
  }

  private readId(): number {
    const value = this.route.snapshot.pathFromRoot
      .map(item => item.paramMap.get('id'))
      .filter(item => !!item)
      .pop();
    return Number(value);
  }
}
