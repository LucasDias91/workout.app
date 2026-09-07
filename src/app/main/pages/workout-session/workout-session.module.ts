import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { WorkoutSessionPage } from './workout-session.page';
import { WorkoutSessionPageRoutingModule } from './workout-session-routing.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    WorkoutSessionPageRoutingModule
  ],
  declarations: [WorkoutSessionPage]
})
export class WorkoutSessionPageModule {}
