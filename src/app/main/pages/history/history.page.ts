import { Component } from '@angular/core';
import { ToastController, ViewWillEnter } from '@ionic/angular';
import { WeeklyWeight } from '../../../core/models/users/weekly-weight';
import { WorkoutLog } from '../../../core/models/workouts/workout-log';
import { DatabaseService } from '../../../core/services/database/database.service';
import { ProfileStoreService } from '../../../core/services/profile/profile-store.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss']
})
export class HistoryPage implements ViewWillEnter {
  logs: WorkoutLog[] = [];
  weights: WeeklyWeight[] = [];
  weekStart = '';
  weekWeight: number = null;
  savingWeight = false;

  get pastWeights(): WeeklyWeight[] {
    return this.weights.filter(item => item.weekStart !== this.weekStart);
  }

  constructor(
    private database: DatabaseService,
    private profileStore: ProfileStoreService,
    private toastCtrl: ToastController
  ) {}

  async ionViewWillEnter() {
    this.weekStart = this.currentWeekStart();
    const profile = this.profileStore.load();
    const [logs, weights] = await Promise.all([
      this.database.getWorkoutLogs(),
      this.database.getWeeklyWeights()
    ]);
    this.logs = logs;
    this.weights = weights;
    const current = weights.find(item => item.weekStart === this.weekStart);
    this.weekWeight = current ? current.weightKg : profile.weightKg;
  }

  async saveWeight() {
    const value = Number(this.weekWeight);
    if (!Number.isFinite(value) || value <= 0 || value > 400) {
      const toast = await this.toastCtrl.create({
        message: 'Informe um peso válido',
        duration: 1800,
        color: 'dark'
      });
      toast.present();
      return;
    }
    this.savingWeight = true;
    await this.database.saveWeeklyWeight(this.weekStart, value);
    const profile = this.profileStore.load();
    profile.weightKg = value;
    this.profileStore.save(profile);
    this.weights = await this.database.getWeeklyWeights();
    this.savingWeight = false;
    const toast = await this.toastCtrl.create({
      message: 'Peso da semana salvo',
      duration: 1800,
      color: 'dark'
    });
    toast.present();
  }

  formatLogDate(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short'
    });
  }

  formatDuration(sec: number): string {
    const minutes = Math.round(sec / 60);
    if (minutes < 1) {
      return '< 1 min';
    }
    if (minutes < 60) {
      return minutes + ' min';
    }
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest ? hours + ' h ' + rest + ' min' : hours + ' h';
  }

  formatWeek(weekStart: string): string {
    return new Date(weekStart + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short'
    });
  }

  private currentWeekStart(): string {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayNum = String(date.getDate()).padStart(2, '0');
    return date.getFullYear() + '-' + month + '-' + dayNum;
  }
}
