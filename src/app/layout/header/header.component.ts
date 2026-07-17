import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../core/services/mock-data.service';
import { Notification } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatMenuModule, MatBadgeModule, MatTooltipModule, MatDividerModule, FormsModule],
  template: `
    <header class="header">
      <!-- Left -->
      <div class="header-left">
        <button class="icon-btn" (click)="toggleSidebar.emit()">
          <mat-icon>{{ sidebarCollapsed ? 'menu_open' : 'menu' }}</mat-icon>
        </button>
        <div class="search-box">
          <mat-icon class="search-icon">search</mat-icon>
          <input type="text" placeholder="Search models, clients, quotations..." [(ngModel)]="searchQuery" (keyup.enter)="onSearch()">
          <span class="search-shortcut">⌘K</span>
        </div>
      </div>

      <!-- Right -->
      <div class="header-right">
        <!-- Notifications -->
        <button class="icon-btn" [matMenuTriggerFor]="notifMenu" matTooltip="Notifications">
          <mat-icon [matBadge]="unreadCount" [matBadgeHidden]="unreadCount===0" matBadgeColor="warn" matBadgeSize="small">notifications</mat-icon>
        </button>
        <mat-menu #notifMenu="matMenu" class="notif-menu">
          <div class="notif-header" (click)="$event.stopPropagation()">
            <span>Notifications</span>
            <button mat-button color="primary" (click)="markAllRead()">Mark all read</button>
          </div>
          <div class="notif-list">
            <div *ngFor="let n of notifications" class="notif-item" [class.unread]="!n.isRead" (click)="readNotif(n)">
              <div class="notif-dot" [class]="n.type"></div>
              <div class="notif-content">
                <div class="notif-title">{{ n.title }}</div>
                <div class="notif-msg">{{ n.message }}</div>
                <div class="notif-time">{{ n.timestamp }}</div>
              </div>
            </div>
          </div>
        </mat-menu>

        <!-- Theme Picker -->
        <button class="icon-btn" [matMenuTriggerFor]="themeMenu" matTooltip="Change Theme">
          <mat-icon>palette</mat-icon>
        </button>
        <mat-menu #themeMenu="matMenu">
          <div style="padding:12px 16px;border-bottom:1px solid var(--border);font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.8px"
               (click)="$event.stopPropagation()">
            Choose Theme
          </div>
          <div (click)="$event.stopPropagation()"
               style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:16px;width:288px">
            <div *ngFor="let t of themes"
                 (click)="applyTheme(t.key)"
                 [style.background]="activeTheme===t.key ? 'rgba(0,0,0,0.06)' : 'transparent'"
                 style="display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;
                        padding:10px 6px;border-radius:12px;transition:background 0.18s">
              <div [style.background]="t.gradient"
                   [style.box-shadow]="activeTheme===t.key ? '0 0 0 3px white, 0 0 0 5px '+t.borderColor : '0 2px 8px rgba(0,0,0,0.18)'"
                   style="width:36px;height:36px;border-radius:50%;
                          display:flex;align-items:center;justify-content:center;transition:box-shadow 0.2s">
                <mat-icon *ngIf="activeTheme===t.key" style="font-size:16px;width:16px;height:16px;color:white">check</mat-icon>
              </div>
              <span style="font-size:10px;font-weight:600;color:var(--text-secondary);text-align:center;line-height:1.3">{{ t.label }}</span>
            </div>
          </div>
        </mat-menu>

        <!-- User Menu -->
        <div class="user-chip" [matMenuTriggerFor]="userMenu">
          <div class="user-avatar-sm">RA</div>
          <span class="user-name-sm">Rahul Admin</span>
          <mat-icon>expand_more</mat-icon>
        </div>
        <mat-menu #userMenu="matMenu">
          <button mat-menu-item>
            <mat-icon>person</mat-icon> My Profile
          </button>
          <button mat-menu-item routerLink="/users">
            <mat-icon>manage_accounts</mat-icon> Manage Users
          </button>
          <button mat-menu-item routerLink="/settings">
            <mat-icon>settings</mat-icon> Settings
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon> Logout
          </button>
        </mat-menu>
      </div>
    </header>
  `,
  styles: [`
    .header {
      height: var(--header-height);
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 24px;
      position: sticky; top: 0; z-index: 100;
      backdrop-filter: blur(20px);
    }
    .header-left, .header-right { display: flex; align-items: center; gap: 12px; }

    .icon-btn {
      width: 40px; height: 40px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
      background: transparent;
      color: var(--text-secondary);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);
      &:hover { background: rgba(108,99,255,0.1); color: var(--color-primary); border-color: var(--color-primary); }
    }

    .search-box {
      display: flex; align-items: center; gap: 10px;
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 0 14px;
      height: 40px;
      min-width: 300px;
      transition: all var(--transition-fast);
      &:focus-within { border-color: var(--color-primary); background: rgba(108,99,255,0.06); }
    }
    .search-icon { font-size: 18px !important; color: var(--text-muted); }
    .search-box input {
      background: none; border: none; outline: none;
      color: var(--text-primary); font-size: 14px; flex: 1;
      font-family: 'Inter', sans-serif;
      &::placeholder { color: var(--text-muted); }
    }
    .search-shortcut {
      font-size: 11px; color: var(--text-disabled);
      border: 1px solid var(--border); border-radius: 4px;
      padding: 1px 5px; font-family: 'JetBrains Mono', monospace;
    }

    .user-chip {
      display: flex; align-items: center; gap: 8px;
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border);
      border-radius: var(--radius-full);
      padding: 4px 12px 4px 4px;
      cursor: pointer;
      transition: all var(--transition-fast);
      &:hover { border-color: var(--color-primary); background: rgba(108,99,255,0.08); }
    }
    .user-avatar-sm {
      width: 30px; height: 30px;
      background: var(--gradient-primary);
      border-radius: var(--radius-full);
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: white;
    }
    .user-name-sm { font-size: 13px; font-weight: 500; color: var(--text-secondary); }

    .notif-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px; border-bottom: 1px solid var(--border);
      font-weight: 600; font-size: 14px;
    }
    .notif-list { max-height: 360px; overflow-y: auto; }
    .notif-item {
      display: flex; gap: 12px; padding: 12px 16px;
      border-bottom: 1px solid var(--border); cursor: pointer;
      transition: background var(--transition-fast);
      &:hover { background: rgba(108,99,255,0.08); }
      &.unread { background: rgba(108,99,255,0.04); }
    }
    .notif-dot {
      width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px;
      &.success { background: var(--color-success); }
      &.warning { background: var(--color-warning); }
      &.info    { background: var(--color-info); }
      &.error   { background: var(--color-danger); }
    }
    .notif-title { font-size: 13px; font-weight: 600; margin-bottom: 2px; }
    .notif-msg   { font-size: 12px; color: var(--text-muted); margin-bottom: 4px; }
    .notif-time  { font-size: 11px; color: var(--text-disabled); }
  `]
})
export class HeaderComponent implements OnInit {
  @Input() sidebarCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  searchQuery = '';
  notifications: Notification[] = [];
  unreadCount = 0;
  activeTheme = localStorage.getItem('crm-theme') || 'indigo';

  themes = [
    { key: 'blush',     label: 'Blush',     gradient: 'linear-gradient(135deg,#D4688A,#F4A0B8)', borderColor: '#D4688A' },
    { key: 'noir',      label: 'Noir',      gradient: 'linear-gradient(135deg,#1A1A2E,#3D3D5C)', borderColor: '#3D3D5C' },
    { key: 'cobalt',    label: 'Cobalt',    gradient: 'linear-gradient(135deg,#1B3FAA,#4169E1)', borderColor: '#1B3FAA' },
    { key: 'burgundy',  label: 'Burgundy',  gradient: 'linear-gradient(135deg,#6D1A36,#A0264A)', borderColor: '#A0264A' },
    { key: 'sage',      label: 'Sage',      gradient: 'linear-gradient(135deg,#5F7A61,#87A98A)', borderColor: '#5F7A61' },
    { key: 'champagne', label: 'Champagne', gradient: 'linear-gradient(135deg,#B8985A,#D4B896)', borderColor: '#B8985A' },
    { key: 'mauve',     label: 'Mauve',     gradient: 'linear-gradient(135deg,#9B6B8A,#C490B0)', borderColor: '#9B6B8A' },
    { key: 'ivory',     label: 'Ivory',     gradient: 'linear-gradient(135deg,#7A6E5A,#A09070)', borderColor: '#7A6E5A' },
    { key: 'electric',  label: 'Electric',  gradient: 'linear-gradient(135deg,#6200EA,#B040FF)', borderColor: '#6200EA' },
    { key: 'mocha',     label: 'Mocha',     gradient: 'linear-gradient(135deg,#5C3D2E,#8B5E52)', borderColor: '#8B5E52' },
    { key: 'indigo',    label: 'Indigo',    gradient: 'linear-gradient(135deg,#4F46E5,#7C3AED)', borderColor: '#4F46E5' },
    { key: 'rose',      label: 'Rose',      gradient: 'linear-gradient(135deg,#E11D48,#F43F5E)', borderColor: '#E11D48' },
  ];

  constructor(private data: MockDataService, private auth: AuthService) {}

  ngOnInit() {
    this.data.getNotifications().subscribe(n => this.notifications = n);
    this.data.getUnreadCount().subscribe(c => this.unreadCount = c);
    this.applyTheme(this.activeTheme, false);
  }

  applyTheme(key: string, save = true) {
    document.documentElement.setAttribute('data-theme', key === 'indigo' ? '' : key);
    this.activeTheme = key;
    if (save) localStorage.setItem('crm-theme', key);
  }

  onSearch() { console.log('Search:', this.searchQuery); }
  readNotif(n: Notification) { this.data.markNotificationRead(n.id); }
  markAllRead() { this.data.markAllRead(); }
  logout() { this.auth.logout(); }
}
