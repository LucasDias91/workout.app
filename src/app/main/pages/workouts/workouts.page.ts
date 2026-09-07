import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { Program } from '../../../core/models/workouts/program';
import { Workout } from '../../../core/models/workouts/workout';
import { WorkoutsService } from '../../../core/services/workouts/workouts.service';

@Component({
  selector: 'app-workouts',
  templateUrl: './workouts.page.html',
  styleUrls: ['./workouts.page.scss']
})
export class WorkoutsPage implements OnInit {
  programs: Program[] = [];
  program: Program;
  workouts: Workout[] = [];
  loading = true;
  programIndex = 0;

  get programDate(): string {
    if (!this.program || !this.program.startedOn) {
      return '';
    }
    const parts = this.program.startedOn.split('-');
    return parts.length === 3 ? parts[2] + '/' + parts[1] + '/' + parts[0] : this.program.startedOn;
  }

  get hasPrevious(): boolean {
    return this.programIndex > 0;
  }

  get hasNext(): boolean {
    return this.programIndex < this.programs.length - 1;
  }

  constructor(
    private workoutsService: WorkoutsService,
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    await this.reloadPrograms(true);
    this.loading = false;
  }

  async previous() {
    if (!this.hasPrevious) {
      return;
    }
    this.programIndex -= 1;
    await this.loadProgram();
  }

  async next() {
    if (!this.hasNext) {
      return;
    }
    this.programIndex += 1;
    await this.loadProgram();
  }

  openWorkout(workout: Workout) {
    this.navCtrl.navigateForward(['/tabs/workouts', workout.id]);
  }

  async activateProgram() {
    if (!this.program || !this.workouts.length) {
      return;
    }
    const current = this.workouts.find(item => item.isToday);
    const letter = current ? current.letter : this.workouts[0].letter;
    await this.saveActive(this.program.id, letter);
  }

  async activateWorkout(workout: Workout, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    if (!this.program) {
      return;
    }
    await this.saveActive(this.program.id, workout.letter);
  }

  private async saveActive(programId: number, letter: string) {
    await this.workoutsService.setActive(programId, letter);
    await this.reloadPrograms(false);
    const toast = await this.toastCtrl.create({
      message: 'Ativo: programa #' + programId + ' · Treino ' + letter,
      duration: 2000,
      color: 'dark'
    });
    toast.present();
  }

  private async reloadPrograms(jumpToActive: boolean) {
    const currentId = this.program ? this.program.id : null;
    this.programs = await this.workoutsService.getPrograms();
    if (jumpToActive) {
      const activeIndex = this.programs.findIndex(item => item.isActive);
      this.programIndex = activeIndex >= 0 ? activeIndex : 0;
    } else if (currentId != null) {
      const index = this.programs.findIndex(item => item.id === currentId);
      this.programIndex = index >= 0 ? index : this.programIndex;
    }
    await this.loadProgram();
  }

  private async loadProgram() {
    this.program = this.programs[this.programIndex];
    if (!this.program) {
      this.workouts = [];
      return;
    }
    this.workouts = await this.workoutsService.getWorkouts(this.program.id);
  }
}
