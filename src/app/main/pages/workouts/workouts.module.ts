import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { WorkoutsPage } from './workouts.page';
import { WorkoutsPageRoutingModule } from './workouts-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkoutsPageRoutingModule
  ],
  declarations: [WorkoutsPage]
})
export class WorkoutsPageModule {}
