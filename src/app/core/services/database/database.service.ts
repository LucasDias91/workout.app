import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Platform } from '@ionic/angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { SeedData } from '../../models/workouts/seed-data';
import { Program } from '../../models/workouts/program';
import { Workout } from '../../models/workouts/workout';
import { WorkoutExercise } from '../../models/workouts/workout-exercise';
import { WorkoutLog } from '../../models/workouts/workout-log';
import { WeeklyWeight } from '../../models/users/weekly-weight';

const DB_NAME = 'meu_treino.db';
const SEED_VERSION = '3';
const STORE_PROGRAM = 'meu_treino.user_active_program';
const STORE_LETTER = 'meu_treino.user_active_letter';
const STORE_LOGS = 'meu_treino.workout_logs';
const STORE_WEIGHTS = 'meu_treino.weekly_weights';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private readyPromise: Promise<void>;
  private sqliteDb: SQLiteObject;
  private memory: SeedData;
  private useSqlite = false;
  private activeLetter = 'A';
  private memoryLogs: WorkoutLog[] = [];
  private memoryWeights: WeeklyWeight[] = [];
  private nextLogId = 1;
  private nextWeightId = 1;

  constructor(
    private http: HttpClient,
    private platform: Platform,
    private sqlite: SQLite
  ) {}

  ready(): Promise<void> {
    if (!this.readyPromise) {
      this.readyPromise = this.open();
    }
    return this.readyPromise;
  }

  async getActiveProgram(): Promise<Program> {
    await this.ready();
    if (!this.useSqlite) {
      const row = this.memory.programs.find(item => item.isActive === 1);
      return row ? this.mapProgram(row) : null;
    }
    const result = await this.sqliteDb.executeSql(
      'SELECT id, started_on, type, is_active FROM program WHERE is_active = 1 LIMIT 1',
      []
    );
    return result.rows.length ? this.mapProgramRow(result.rows.item(0)) : null;
  }

  async getWorkoutsByProgram(programId: number): Promise<Workout[]> {
    await this.ready();
    if (!this.useSqlite) {
      return this.memory.workouts
        .filter(item => item.programId === programId)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(item => this.mapWorkout(item));
    }
    const result = await this.sqliteDb.executeSql(
      'SELECT id, program_id, letter, target_muscle, sort_order FROM workout WHERE program_id = ? ORDER BY sort_order',
      [programId]
    );
    return this.readRows(result).map(row => this.mapWorkoutRow(row));
  }

  async getWorkoutById(workoutId: number): Promise<Workout> {
    await this.ready();
    if (!this.useSqlite) {
      const row = this.memory.workouts.find(item => item.id === workoutId);
      return row ? this.mapWorkout(row) : null;
    }
    const result = await this.sqliteDb.executeSql(
      'SELECT id, program_id, letter, target_muscle, sort_order FROM workout WHERE id = ? LIMIT 1',
      [workoutId]
    );
    return result.rows.length ? this.mapWorkoutRow(result.rows.item(0)) : null;
  }

  async getPrograms(): Promise<Program[]> {
    await this.ready();
    if (!this.useSqlite) {
      return this.memory.programs
        .slice()
        .sort((a, b) => a.id - b.id)
        .map(item => this.mapProgram(item));
    }
    const result = await this.sqliteDb.executeSql(
      'SELECT id, started_on, type, is_active FROM program ORDER BY id',
      []
    );
    return this.readRows(result).map(row => this.mapProgramRow(row));
  }

  async getProgramById(programId: number): Promise<Program> {
    await this.ready();
    if (!this.useSqlite) {
      const row = this.memory.programs.find(item => item.id === programId);
      return row ? this.mapProgram(row) : null;
    }
    const result = await this.sqliteDb.executeSql(
      'SELECT id, started_on, type, is_active FROM program WHERE id = ? LIMIT 1',
      [programId]
    );
    return result.rows.length ? this.mapProgramRow(result.rows.item(0)) : null;
  }

  async getExercisesByWorkout(workoutId: number): Promise<WorkoutExercise[]> {
    await this.ready();
    if (!this.useSqlite) {
      const names = new Map(this.memory.exercises.map(item => [item.id, item.name]));
      return this.memory.workoutExercises
        .filter(item => item.workoutId === workoutId)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(item => this.mapWorkoutExercise(item, names.get(item.exerciseId)));
    }
    const result = await this.sqliteDb.executeSql(
      `SELECT we.id, we.workout_id, we.exercise_id, we.sort_order, we.sxr, we.sets, we.reps,
              we.technique, we.rest_period, we.rest_min_sec, we.rest_max_sec, e.name
       FROM workout_exercise we
       INNER JOIN exercise e ON e.id = we.exercise_id
       WHERE we.workout_id = ?
       ORDER BY we.sort_order`,
      [workoutId]
    );
    return this.readRows(result).map(row => this.mapWorkoutExerciseRow(row));
  }

  async getActiveLetter(): Promise<string> {
    await this.ready();
    return this.activeLetter || 'A';
  }

  async setActive(programId: number, letter: string): Promise<void> {
    await this.ready();
    await this.writeActiveState(programId, letter || 'A', true);
  }

  async logWorkout(workoutId: number, startedAt: string): Promise<void> {
    await this.ready();
    const endedAt = new Date().toISOString();
    const durationSec = Math.max(0, Math.round((Date.parse(endedAt) - Date.parse(startedAt)) / 1000));
    if (!this.useSqlite) {
      const workout = this.memory.workouts.find(item => item.id === workoutId);
      this.memoryLogs.unshift({
        id: this.nextLogId++,
        workoutId,
        startedAt,
        endedAt,
        durationSec,
        letter: workout ? workout.letter : '',
        targetMuscle: workout ? workout.targetMuscle : ''
      });
      this.persistMemoryUserData();
      return;
    }
    await this.sqliteDb.executeSql(
      'INSERT INTO workout_log (workout_id, started_at, ended_at, duration_sec) VALUES (?, ?, ?, ?)',
      [workoutId, startedAt, endedAt, durationSec]
    );
  }

  async getWorkoutLogs(): Promise<WorkoutLog[]> {
    await this.ready();
    if (!this.useSqlite) {
      return this.memoryLogs.slice();
    }
    const result = await this.sqliteDb.executeSql(
      `SELECT l.id, l.workout_id, l.started_at, l.ended_at, l.duration_sec, w.letter, w.target_muscle
       FROM workout_log l
       INNER JOIN workout w ON w.id = l.workout_id
       ORDER BY l.ended_at DESC`,
      []
    );
    return this.readRows(result).map(row => ({
      id: row.id,
      workoutId: row.workout_id,
      startedAt: row.started_at,
      endedAt: row.ended_at,
      durationSec: row.duration_sec,
      letter: row.letter,
      targetMuscle: row.target_muscle
    }));
  }

  async saveWeeklyWeight(weekStart: string, weightKg: number): Promise<void> {
    await this.ready();
    if (!this.useSqlite) {
      const current = this.memoryWeights.find(item => item.weekStart === weekStart);
      if (current) {
        current.weightKg = weightKg;
      } else {
        this.memoryWeights.unshift({
          id: this.nextWeightId++,
          weekStart,
          weightKg
        });
      }
      this.memoryWeights.sort((a, b) => b.weekStart.localeCompare(a.weekStart));
      this.persistMemoryUserData();
      return;
    }
    await this.sqliteDb.executeSql(
      'INSERT OR REPLACE INTO weekly_weight (week_start, weight_kg) VALUES (?, ?)',
      [weekStart, weightKg]
    );
  }

  async getWeeklyWeights(): Promise<WeeklyWeight[]> {
    await this.ready();
    if (!this.useSqlite) {
      return this.memoryWeights.slice();
    }
    const result = await this.sqliteDb.executeSql(
      'SELECT id, week_start, weight_kg FROM weekly_weight ORDER BY week_start DESC',
      []
    );
    return this.readRows(result).map(row => ({
      id: row.id,
      weekStart: row.week_start,
      weightKg: row.weight_kg
    }));
  }

  async resetUserData(): Promise<void> {
    await this.ready();
    this.memoryLogs = [];
    this.memoryWeights = [];
    this.nextLogId = 1;
    this.nextWeightId = 1;
    this.removeLocal(STORE_LOGS);
    this.removeLocal(STORE_WEIGHTS);
    this.removeLocal(STORE_PROGRAM);
    this.removeLocal(STORE_LETTER);
    this.removeLocal('meu_treino.profile_proto');
    if (this.useSqlite && this.sqliteDb) {
      await this.sqliteDb.executeSql('DELETE FROM workout_log', []);
      await this.sqliteDb.executeSql('DELETE FROM weekly_weight', []);
      await this.sqliteDb.executeSql('DELETE FROM meta WHERE key IN (?, ?)', [
        'user_active_program',
        'user_active_letter'
      ]);
    }
    await this.writeActiveState(2, 'A', false);
  }

  private async open(): Promise<void> {
    await this.platform.ready();
    const seed = await this.http.get<SeedData>('assets/data/seed.json').toPromise();
    this.useSqlite = !!(window as any).sqlitePlugin;
    if (!this.useSqlite) {
      this.memory = seed;
      this.loadMemoryUserData();
      await this.applyStoredActive();
      return;
    }
    this.sqliteDb = await this.sqlite.create({
      name: DB_NAME,
      location: 'default'
    });
    await this.createTables();
    await this.seedIfNeeded(seed);
    await this.applyStoredActive();
  }

  private async createTables(): Promise<void> {
    const statements = [
      `CREATE TABLE IF NOT EXISTS meta (
        key TEXT PRIMARY KEY,
        value TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS program (
        id INTEGER PRIMARY KEY,
        started_on TEXT NOT NULL,
        type TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 0
      )`,
      `CREATE TABLE IF NOT EXISTS exercise (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      )`,
      `CREATE TABLE IF NOT EXISTS workout (
        id INTEGER PRIMARY KEY,
        program_id INTEGER NOT NULL,
        letter TEXT NOT NULL,
        target_muscle TEXT NOT NULL,
        sort_order INTEGER NOT NULL,
        FOREIGN KEY (program_id) REFERENCES program(id)
      )`,
      `CREATE TABLE IF NOT EXISTS workout_exercise (
        id INTEGER PRIMARY KEY,
        workout_id INTEGER NOT NULL,
        exercise_id INTEGER NOT NULL,
        sort_order INTEGER NOT NULL,
        sxr TEXT NOT NULL,
        sets INTEGER,
        reps TEXT,
        technique TEXT,
        rest_period TEXT NOT NULL,
        rest_min_sec INTEGER,
        rest_max_sec INTEGER,
        FOREIGN KEY (workout_id) REFERENCES workout(id),
        FOREIGN KEY (exercise_id) REFERENCES exercise(id)
      )`,
      `CREATE TABLE IF NOT EXISTS workout_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workout_id INTEGER NOT NULL,
        started_at TEXT NOT NULL,
        ended_at TEXT NOT NULL,
        duration_sec INTEGER NOT NULL,
        FOREIGN KEY (workout_id) REFERENCES workout(id)
      )`,
      `CREATE TABLE IF NOT EXISTS weekly_weight (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        week_start TEXT NOT NULL UNIQUE,
        weight_kg REAL NOT NULL
      )`
    ];
    for (const sql of statements) {
      await this.sqliteDb.executeSql(sql, []);
    }
  }

  private async seedIfNeeded(seed: SeedData): Promise<void> {
    const version = await this.sqliteDb.executeSql(
      'SELECT value FROM meta WHERE key = ? LIMIT 1',
      ['seed_version']
    );
    if (version.rows.length && version.rows.item(0).value === SEED_VERSION) {
      return;
    }
    await this.sqliteDb.executeSql('DELETE FROM workout_exercise', []);
    await this.sqliteDb.executeSql('DELETE FROM workout', []);
    await this.sqliteDb.executeSql('DELETE FROM exercise', []);
    await this.sqliteDb.executeSql('DELETE FROM program', []);
    await this.sqliteDb.executeSql('DELETE FROM meta', []);

    const batch: Array<[string, any[]]> = [];
    seed.programs.forEach(item => {
      batch.push([
        'INSERT INTO program (id, started_on, type, is_active) VALUES (?, ?, ?, ?)',
        [item.id, item.startedOn, item.type, item.isActive]
      ]);
    });
    seed.exercises.forEach(item => {
      batch.push([
        'INSERT INTO exercise (id, name) VALUES (?, ?)',
        [item.id, item.name]
      ]);
    });
    seed.workouts.forEach(item => {
      batch.push([
        'INSERT INTO workout (id, program_id, letter, target_muscle, sort_order) VALUES (?, ?, ?, ?, ?)',
        [item.id, item.programId, item.letter, item.targetMuscle, item.sortOrder]
      ]);
    });
    seed.workoutExercises.forEach(item => {
      batch.push([
        `INSERT INTO workout_exercise
          (id, workout_id, exercise_id, sort_order, sxr, sets, reps, technique, rest_period, rest_min_sec, rest_max_sec)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id, item.workoutId, item.exerciseId, item.sortOrder, item.sxr,
          item.sets, item.reps, item.technique, item.restPeriod, item.restMinSec, item.restMaxSec
        ]
      ]);
    });
    batch.push(['INSERT INTO meta (key, value) VALUES (?, ?)', ['seed_version', SEED_VERSION]]);

    const chunkSize = 200;
    for (let i = 0; i < batch.length; i += chunkSize) {
      await this.sqliteDb.sqlBatch(batch.slice(i, i + chunkSize));
    }
  }

  private readRows(result: any): any[] {
    const rows = [];
    for (let i = 0; i < result.rows.length; i++) {
      rows.push(result.rows.item(i));
    }
    return rows;
  }

  private mapProgram(row: { id: number; startedOn: string; type: string; isActive: number }): Program {
    return {
      id: row.id,
      startedOn: row.startedOn,
      type: row.type,
      isActive: row.isActive === 1
    };
  }

  private mapProgramRow(row: any): Program {
    return {
      id: row.id,
      startedOn: row.started_on,
      type: row.type,
      isActive: row.is_active === 1
    };
  }

  private mapWorkout(row: { id: number; programId: number; letter: string; targetMuscle: string; sortOrder: number }): Workout {
    return {
      id: row.id,
      programId: row.programId,
      letter: row.letter,
      targetMuscle: row.targetMuscle,
      sortOrder: row.sortOrder
    };
  }

  private mapWorkoutRow(row: any): Workout {
    return {
      id: row.id,
      programId: row.program_id,
      letter: row.letter,
      targetMuscle: row.target_muscle,
      sortOrder: row.sort_order
    };
  }

  private mapWorkoutExercise(row: any, name: string): WorkoutExercise {
    return {
      id: row.id,
      workoutId: row.workoutId,
      exerciseId: row.exerciseId,
      sortOrder: row.sortOrder,
      sxr: row.sxr,
      sets: row.sets,
      reps: row.reps,
      technique: row.technique,
      restPeriod: row.restPeriod,
      restMinSec: row.restMinSec,
      restMaxSec: row.restMaxSec,
      name
    };
  }

  private mapWorkoutExerciseRow(row: any): WorkoutExercise {
    return {
      id: row.id,
      workoutId: row.workout_id,
      exerciseId: row.exercise_id,
      sortOrder: row.sort_order,
      sxr: row.sxr,
      sets: row.sets,
      reps: row.reps,
      technique: row.technique,
      restPeriod: row.rest_period,
      restMinSec: row.rest_min_sec,
      restMaxSec: row.rest_max_sec,
      name: row.name
    };
  }

  private async applyStoredActive(): Promise<void> {
    const storedProgram = this.readLocal(STORE_PROGRAM) || await this.getMeta('user_active_program');
    const storedLetter = this.readLocal(STORE_LETTER) || await this.getMeta('user_active_letter');
    let programId = storedProgram ? Number(storedProgram) : 0;
    if (!programId) {
      if (!this.useSqlite) {
        const row = this.memory.programs.find(item => item.isActive === 1);
        programId = row ? row.id : 2;
      } else {
        const result = await this.sqliteDb.executeSql(
          'SELECT id FROM program WHERE is_active = 1 LIMIT 1',
          []
        );
        programId = result.rows.length ? result.rows.item(0).id : 2;
      }
    }
    await this.writeActiveState(programId, storedLetter || 'A', false);
  }

  private async writeActiveState(programId: number, letter: string, persistUser: boolean): Promise<void> {
    this.activeLetter = letter || 'A';
    if (!this.useSqlite) {
      this.memory.programs.forEach(item => {
        item.isActive = item.id === programId ? 1 : 0;
      });
    } else {
      await this.sqliteDb.executeSql('UPDATE program SET is_active = 0', []);
      await this.sqliteDb.executeSql('UPDATE program SET is_active = 1 WHERE id = ?', [programId]);
    }
    if (persistUser) {
      this.writeLocal(STORE_PROGRAM, String(programId));
      this.writeLocal(STORE_LETTER, this.activeLetter);
      await this.setMeta('user_active_program', String(programId));
      await this.setMeta('user_active_letter', this.activeLetter);
    }
  }

  private async getMeta(key: string): Promise<string> {
    if (!this.useSqlite || !this.sqliteDb) {
      return null;
    }
    const result = await this.sqliteDb.executeSql(
      'SELECT value FROM meta WHERE key = ? LIMIT 1',
      [key]
    );
    return result.rows.length ? result.rows.item(0).value : null;
  }

  private async setMeta(key: string, value: string): Promise<void> {
    if (!this.useSqlite || !this.sqliteDb) {
      return;
    }
    await this.sqliteDb.executeSql(
      'INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)',
      [key, value]
    );
  }

  private readLocal(key: string): string {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private writeLocal(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      return;
    }
  }

  private removeLocal(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch {
      return;
    }
  }

  private loadMemoryUserData(): void {
    this.memoryLogs = this.readJson<WorkoutLog[]>(STORE_LOGS, []);
    this.memoryWeights = this.readJson<WeeklyWeight[]>(STORE_WEIGHTS, []);
    this.nextLogId = this.memoryLogs.reduce((max, item) => Math.max(max, item.id), 0) + 1;
    this.nextWeightId = this.memoryWeights.reduce((max, item) => Math.max(max, item.id), 0) + 1;
  }

  private persistMemoryUserData(): void {
    this.writeLocal(STORE_LOGS, JSON.stringify(this.memoryLogs));
    this.writeLocal(STORE_WEIGHTS, JSON.stringify(this.memoryWeights));
  }

  private readJson<T>(key: string, fallback: T): T {
    try {
      const raw = this.readLocal(key);
      return raw ? JSON.parse(raw) as T : fallback;
    } catch {
      return fallback;
    }
  }
}
