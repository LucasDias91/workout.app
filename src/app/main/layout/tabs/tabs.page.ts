import { Component } from '@angular/core';
import { MenuService } from '../../../core/services/menu/menu.service';
import { TabItem } from '../../../core/models/menu/tab-item';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  tabs: TabItem[] = [];

  constructor(private menuService: MenuService) {
    this.tabs = this.menuService.tabs;
  }
}
