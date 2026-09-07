import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkoutDetail } from '../../../core/models/workouts/workout-detail';
import { WorkoutsService } from '../../../core/services/workouts/workouts.service';

@Component({
  selector: 'app-workout-session',
  templateUrl: './workout-session.page.html',
  styleUrls: ['./workout-session.page.scss']
})
export class WorkoutSessionPage implements OnInit {
  detail: WorkoutDetail;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private workoutsService: WorkoutsService
  ) {}

  async ngOnInit() {
    const id = this.readId();
    this.detail = Number.isFinite(id) ? await this.workoutsService.getWorkoutDetail(id) : null;
    this.loading = false;
  }

  private readId(): number {
    const value = this.route.snapshot.pathFromRoot
      .map(item => item.paramMap.get('id'))
      .filter(item => !!item)
      .pop();
    return Number(value);
  }
}
