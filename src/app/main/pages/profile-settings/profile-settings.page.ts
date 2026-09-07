import { Component } from '@angular/core';
import { AlertController, ToastController, ViewWillEnter } from '@ionic/angular';
import { ProfileDraft } from '../../../core/models/users/profile-draft';
import { DatabaseService } from '../../../core/services/database/database.service';
import { ProfileStoreService } from '../../../core/services/profile/profile-store.service';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.page.html',
  styleUrls: ['./profile-settings.page.scss']
})
export class ProfileSettingsPage implements ViewWillEnter {
  profile: ProfileDraft;
  saving = false;

  constructor(
    private store: ProfileStoreService,
    private database: DatabaseService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    this.profile = this.store.load();
  }

  ionViewWillEnter() {
    this.profile = this.store.load();
  }

  async save() {
    this.saving = true;
    this.store.save(this.profile);
    this.saving = false;
    const toast = await this.toastCtrl.create({
      message: 'Configurações salvas',
      duration: 1800,
      color: 'dark'
    });
    toast.present();
  }

  async confirmReset() {
    const alert = await this.alertCtrl.create({
      header: 'Resetar tudo',
      message: 'Apaga o histórico de treinos, os pesos da semana e o perfil. A planilha de treinos permanece.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Resetar',
          role: 'destructive',
          handler: () => {
            this.resetAll();
          }
        }
      ]
    });
    await alert.present();
  }

  private async resetAll() {
    await this.database.resetUserData();
    this.store.clear();
    this.profile = this.store.load();
    const toast = await this.toastCtrl.create({
      message: 'Dados apagados',
      duration: 1800,
      color: 'dark'
    });
    toast.present();
  }
}
