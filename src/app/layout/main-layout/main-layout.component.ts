import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
    selector: 'app-main-layout',
    imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
    template: `
    <div class="layout-wrapper">
      <app-sidebar [collapsed]="sidebarCollapsed"></app-sidebar>
      <div class="content-area">
        <app-header [sidebarCollapsed]="sidebarCollapsed" (toggleSidebar)="sidebarCollapsed = !sidebarCollapsed"></app-header>
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
    styles: [`
    .layout-wrapper { display: flex; height: 100vh; overflow: hidden; }
    .content-area  { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
    .main-content  { flex: 1; overflow-y: auto; background: var(--bg-base); }
  `]
})
export class MainLayoutComponent {
  sidebarCollapsed = false;
}
