import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ProfileSettingsPage } from './profile-settings.page';
import { ProfileSettingsPageRoutingModule } from './profile-settings-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfileSettingsPageRoutingModule
  ],
  declarations: [ProfileSettingsPage]
})
export class ProfileSettingsPageModule {}
