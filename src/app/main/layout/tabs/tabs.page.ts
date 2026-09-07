import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MenuService } from '../../../core/services/menu/menu.service';
import { TabItem } from '../../../core/models/menu/tab-item';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  tabs: TabItem[] = [];
  hideTabBar = false;
  selectedTab = 'home';

  constructor(
    private menuService: MenuService,
    private router: Router
  ) {
    this.tabs = this.menuService.tabs;
    this.syncFromUrl(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.syncFromUrl(event.urlAfterRedirects);
    });
  }

  private syncFromUrl(url: string) {
    this.hideTabBar = /\/tabs\/workouts\/\d+/.test(url) || /\/tabs\/profile\/settings/.test(url);
    const match = url.match(/\/tabs\/([^\/?#]+)/);
    this.selectedTab = match ? match[1] : 'home';
  }
}
