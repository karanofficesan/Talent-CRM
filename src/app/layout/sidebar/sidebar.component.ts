import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';

interface NavItem {
  icon: string; label: string; route: string; badge?: number;
}

@Component({
    selector: 'app-sidebar',
    imports: [RouterLink, RouterLinkActive, MatIconModule, MatTooltipModule, MatRippleModule],
    template: `
    <aside class="sidebar" [class.collapsed]="collapsed">
      <!-- Brand -->
      <div class="brand">
        <div class="brand-logo">
          <span class="logo-icon">T</span>
        </div>
        @if (!collapsed) {
          <div class="brand-text">
            <span class="brand-name">TalentCRM</span>
            <span class="brand-sub">Agency Platform</span>
          </div>
        }
      </div>
    
      <!-- Nav -->
      <nav class="nav-list">
        @for (section of navSections; track section) {
          <div class="nav-section">
            @if (!collapsed) {
              <span class="nav-section-label">{{ section.title }}</span>
            }
            @for (item of section.items; track item) {
              <a
                [routerLink]="item.route"
                routerLinkActive="active"
                class="nav-item"
                matRipple
                [matTooltip]="collapsed ? item.label : ''"
                matTooltipPosition="right">
                <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
                @if (!collapsed) {
                  <span class="nav-label">{{ item.label }}</span>
                }
                @if (item.badge && !collapsed) {
                  <span class="nav-badge">{{ item.badge }}</span>
                }
              </a>
            }
          </div>
        }
      </nav>
    
      <!-- Footer -->
      @if (!collapsed) {
        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">RA</div>
            <div class="user-details">
              <span class="user-name">Rahul Admin</span>
              <span class="user-role">Super Admin</span>
            </div>
          </div>
        </div>
      }
    </aside>
    `,
    styles: [`
    .sidebar {
      width: var(--sidebar-width);
      height: 100vh;
      background: var(--gradient-sidebar);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      transition: width var(--transition-normal);
      overflow: hidden;
      flex-shrink: 0;
      position: sticky;
      top: 0;
    }
    .sidebar.collapsed { width: var(--sidebar-collapsed-width); }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 16px;
      border-bottom: 1px solid var(--border);
      min-height: var(--header-height);
    }
    .brand-logo {
      width: 40px; height: 40px;
      background: var(--gradient-primary);
      border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 15px rgba(108,99,255,0.4);
    }
    .logo-icon { color: white; font-weight: 900; font-size: 18px; font-family: 'Playfair Display', serif; }
    .brand-name { display: block; font-weight: 800; font-size: 16px; color: var(--text-primary); letter-spacing: -0.3px; }
    .brand-sub  { display: block; font-size: 11px; color: var(--text-muted); font-weight: 400; }

    .nav-list { flex: 1; overflow-y: auto; padding: 12px 8px; display: flex; flex-direction: column; gap: 2px; }
    .nav-list::-webkit-scrollbar { width: 0; }

    .nav-section { margin-bottom: 8px; }
    .nav-section-label {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1.2px; color: var(--text-disabled);
      padding: 8px 12px 4px;
      display: block;
    }

    .nav-item {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 12px;
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 14px; font-weight: 500;
      transition: all var(--transition-fast);
      position: relative;
      cursor: pointer;
    }
    .nav-item:hover { background: rgba(108,99,255,0.1); color: var(--text-primary); }
    .nav-item.active {
      background: rgba(108,99,255,0.18);
      color: var(--color-primary);
    }
    .nav-item.active::before {
      content: '';
      position: absolute; left: 0; top: 50%;
      transform: translateY(-50%);
      width: 3px; height: 20px;
      background: var(--color-primary);
      border-radius: 0 3px 3px 0;
    }
    .nav-icon { font-size: 20px !important; width: 20px !important; height: 20px !important; flex-shrink: 0; }
    .nav-label { flex: 1; white-space: nowrap; }
    .nav-badge {
      background: var(--color-accent);
      color: white; font-size: 10px; font-weight: 700;
      padding: 2px 6px; border-radius: var(--radius-full);
    }

    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid var(--border);
    }
    .user-info { display: flex; align-items: center; gap: 10px; }
    .user-avatar {
      width: 36px; height: 36px;
      background: var(--gradient-primary);
      border-radius: var(--radius-full);
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 12px; color: white;
      flex-shrink: 0;
    }
    .user-name { display: block; font-size: 13px; font-weight: 600; }
    .user-role { display: block; font-size: 11px; color: var(--text-muted); }
  `]
})
export class SidebarComponent {
  @Input() collapsed = false;

  navSections = [
    {
      title: 'Overview',
      items: [
        { icon: 'dashboard', label: 'Dashboard', route: '/dashboard' },
        { icon: 'calendar_month', label: 'Calendar', route: '/calendar' },
      ]
    },
    {
      title: 'Talent',
      items: [
        { icon: 'people', label: 'Models', route: '/models' },
        { icon: 'business', label: 'Clients', route: '/clients' },
        { icon: 'list_alt', label: 'Requirements', route: '/requirements' },
      ]
    },
    {
      title: 'Operations',
      items: [
        { icon: 'request_quote', label: 'Quotations', route: '/quotations', badge: 2 },
        { icon: 'event_available', label: 'Bookings', route: '/bookings' },
      ]
    },
    {
      title: 'Finance',
      items: [
        { icon: 'receipt_long', label: 'Invoices', route: '/invoices', badge: 3 },
        { icon: 'payments', label: 'Payments', route: '/payments' },
        { icon: 'bar_chart', label: 'Reports', route: '/reports' },
      ]
    },
    {
      title: 'Admin',
      items: [
        { icon: 'manage_accounts', label: 'Users', route: '/users' },
        { icon: 'settings', label: 'Settings', route: '/settings' },
      ]
    }
  ];
}
