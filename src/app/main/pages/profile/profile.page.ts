import { Component } from '@angular/core';
import { NavController, ToastController, ViewWillEnter } from '@ionic/angular';
import { ProfileDraft } from '../../../core/models/users/profile-draft';
import { ProfileStoreService } from '../../../core/services/profile/profile-store.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss']
})
export class ProfilePage implements ViewWillEnter {
  profile: ProfileDraft;
  editing = false;
  saving = false;

  get initial(): string {
    return this.store.initial(this.profile ? this.profile.name : '');
  }

  constructor(
    private store: ProfileStoreService,
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) {
    this.profile = this.store.load();
  }

  ionViewWillEnter() {
    this.profile = this.store.load();
    this.editing = false;
  }

  startEdit() {
    this.editing = true;
  }

  cancelEdit() {
    this.profile = this.store.load();
    this.editing = false;
  }

  async save() {
    this.saving = true;
    this.store.save(this.profile);
    this.saving = false;
    this.editing = false;
    const toast = await this.toastCtrl.create({
      message: 'Perfil salvo',
      duration: 1800,
      color: 'dark'
    });
    toast.present();
  }

  openHistory() {
    this.navCtrl.navigateRoot('/tabs/history');
  }

  openSettings() {
    this.navCtrl.navigateForward('/tabs/profile/settings');
  }
}
