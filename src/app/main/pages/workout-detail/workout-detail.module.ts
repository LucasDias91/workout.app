import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { WorkoutDetailPage } from './workout-detail.page';
import { WorkoutDetailPageRoutingModule } from './workout-detail-routing.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    WorkoutDetailPageRoutingModule
  ],
  declarations: [WorkoutDetailPage]
})
export class WorkoutDetailPageModule {}
