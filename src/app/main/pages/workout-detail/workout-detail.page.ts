import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { EMPTY, merge, Subscription } from 'rxjs';
import { WorkoutDetail } from '../../../core/models/workouts/workout-detail';
import { WorkoutsService } from '../../../core/services/workouts/workouts.service';

@Component({
  selector: 'app-workout-detail',
  templateUrl: './workout-detail.page.html',
  styleUrls: ['./workout-detail.page.scss']
})
export class WorkoutDetailPage implements OnDestroy {
  detail: WorkoutDetail;
  loading = true;
  previousId: number;
  nextId: number;
  private paramsSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private workoutsService: WorkoutsService
  ) {
    this.paramsSub = merge(
      this.route.paramMap,
      this.route.parent ? this.route.parent.paramMap : EMPTY
    ).subscribe(() => {
      this.load(this.readId());
    });
  }

  private readId(): number {
    const value = this.route.snapshot.pathFromRoot
      .map(item => item.paramMap.get('id'))
      .filter(item => !!item)
      .pop();
    return Number(value);
  }

  ngOnDestroy() {
    if (this.paramsSub) {
      this.paramsSub.unsubscribe();
    }
  }

  goTo(workoutId: number) {
    if (!workoutId) {
      return;
    }
    this.router.navigate(['/tabs/workouts', workoutId], { replaceUrl: true });
  }

  startWorkout() {
    if (!this.detail) {
      return;
    }
    this.navCtrl.navigateForward(['/tabs/workouts', this.detail.workout.id, 'session']);
  }

  private async load(id: number) {
    this.loading = true;
    this.detail = Number.isFinite(id) ? await this.workoutsService.getWorkoutDetail(id) : null;
    if (this.detail) {
      const adjacent = await this.workoutsService.getAdjacentWorkoutIds(id);
      this.previousId = adjacent.previousId;
      this.nextId = adjacent.nextId;
    } else {
      this.previousId = null;
      this.nextId = null;
    }
    this.loading = false;
  }
}
