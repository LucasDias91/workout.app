import { Injectable } from '@angular/core';
import { TabItem } from '../../models/menu/tab-item';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  readonly tabs: TabItem[] = [
    {
      title: 'Início',
      tab: 'home',
      url: '/tabs/home',
      icon: 'home',
      iconOutline: 'home-outline'
    },
    {
      title: 'Treinos',
      tab: 'workouts',
      url: '/tabs/workouts',
      icon: 'barbell',
      iconOutline: 'barbell-outline'
    },
    {
      title: 'Histórico',
      tab: 'history',
      url: '/tabs/history',
      icon: 'calendar',
      iconOutline: 'calendar-outline'
    },
    {
      title: 'Perfil',
      tab: 'profile',
      url: '/tabs/profile',
      icon: 'person',
      iconOutline: 'person-outline'
    }
  ];
}
