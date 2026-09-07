import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { WorkoutDetail } from '../../../core/models/workouts/workout-detail';
import { WorkoutsService } from '../../../core/services/workouts/workouts.service';

@Component({
  selector: 'app-workout-detail',
  templateUrl: './workout-detail.page.html',
  styleUrls: ['./workout-detail.page.scss']
})
export class WorkoutDetailPage implements OnInit {
  detail: WorkoutDetail;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private workoutsService: WorkoutsService,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.detail = await this.workoutsService.getWorkoutDetail(id);
    this.loading = false;
  }

  async startWorkout() {
    const toast = await this.toastCtrl.create({
      message: 'Execução do treino entra na próxima etapa.',
      duration: 2200,
      color: 'dark'
    });
    toast.present();
  }
}
