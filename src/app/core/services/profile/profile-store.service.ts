import { Injectable } from '@angular/core';
import { ProfileDraft } from '../../models/users/profile-draft';

const STORE = 'meu_treino.profile_proto';

const DEFAULT_PROFILE: ProfileDraft = {
  name: 'Lucas',
  goal: 'Hipertrofia',
  weightKg: 82,
  heightCm: 178,
  restDefaultSec: 60
};

@Injectable({
  providedIn: 'root'
})
export class ProfileStoreService {
  load(): ProfileDraft {
    try {
      const raw = window.localStorage.getItem(STORE);
      if (!raw) {
        return Object.assign({}, DEFAULT_PROFILE);
      }
      return Object.assign({}, DEFAULT_PROFILE, JSON.parse(raw));
    } catch {
      return Object.assign({}, DEFAULT_PROFILE);
    }
  }

  save(profile: ProfileDraft): void {
    try {
      window.localStorage.setItem(STORE, JSON.stringify(profile));
    } catch {
      return;
    }
  }

  clear(): void {
    try {
      window.localStorage.removeItem(STORE);
    } catch {
      return;
    }
  }

  initial(name: string): string {
    const trimmed = (name || '').trim();
    return trimmed ? trimmed.charAt(0).toUpperCase() : 'U';
  }
}
