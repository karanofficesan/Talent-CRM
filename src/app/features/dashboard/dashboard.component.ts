import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MockDataService } from '../../core/services/mock-data.service';
import { DashboardStats } from '../../core/models';

@Component({
    selector: 'app-dashboard',
    imports: [CommonModule, CurrencyPipe, RouterLink, MatIconModule, MatButtonModule, MatProgressBarModule, MatTooltipModule],
    template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>Good Morning, Rahul 👋</h1>
          <p>Here's what's happening with your agency today.</p>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid" *ngIf="stats">
        <div class="stat-card purple" routerLink="/models">
          <div class="stat-icon"><mat-icon>people</mat-icon></div>
          <div class="stat-value">{{ stats.totalModels }}</div>
          <div class="stat-label">Total Models</div>
          <span class="stat-change positive">+2 this month</span>
        </div>
        <div class="stat-card green" routerLink="/models">
          <div class="stat-icon"><mat-icon>check_circle</mat-icon></div>
          <div class="stat-value">{{ stats.activeModels }}</div>
          <div class="stat-label">Active Models</div>
        </div>
        <div class="stat-card blue" routerLink="/models">
          <div class="stat-icon"><mat-icon>event_available</mat-icon></div>
          <div class="stat-value">{{ stats.availableModels }}</div>
          <div class="stat-label">Available Today</div>
        </div>
        <div class="stat-card pink" routerLink="/bookings">
          <div class="stat-icon"><mat-icon>camera</mat-icon></div>
          <div class="stat-value">{{ stats.bookedModels }}</div>
          <div class="stat-label">Booked Models</div>
        </div>
        <div class="stat-card orange" routerLink="/bookings">
          <div class="stat-icon"><mat-icon>upcoming</mat-icon></div>
          <div class="stat-value">{{ stats.upcomingShoots }}</div>
          <div class="stat-label">Upcoming Shoots</div>
        </div>
        <div class="stat-card blue" routerLink="/quotations">
          <div class="stat-icon"><mat-icon>pending_actions</mat-icon></div>
          <div class="stat-value">{{ stats.pendingQuotations }}</div>
          <div class="stat-label">Pending Quotations</div>
          <span class="stat-change negative">Action needed</span>
        </div>
        <div class="stat-card green" routerLink="/quotations">
          <div class="stat-icon"><mat-icon>task_alt</mat-icon></div>
          <div class="stat-value">{{ stats.approvedQuotations }}</div>
          <div class="stat-label">Approved Quotations</div>
        </div>
        <div class="stat-card red" routerLink="/invoices">
          <div class="stat-icon"><mat-icon>receipt_long</mat-icon></div>
          <div class="stat-value">{{ stats.pendingInvoices }}</div>
          <div class="stat-label">Pending Invoices</div>
        </div>
        <div class="stat-card orange" routerLink="/payments">
          <div class="stat-icon"><mat-icon>payments</mat-icon></div>
          <div class="stat-value">₹{{ (stats.pendingPayments/1000).toFixed(0) }}K</div>
          <div class="stat-label">Pending Payments</div>
        </div>
        <div class="stat-card purple revenue-card" routerLink="/reports">
          <div class="stat-icon"><mat-icon>trending_up</mat-icon></div>
          <div class="stat-value">₹{{ (stats.monthlyRevenue/1000).toFixed(0) }}K</div>
          <div class="stat-label">Monthly Revenue</div>
          <span class="stat-change positive">+{{ stats.monthlyRevenueChange }}%</span>
        </div>
      </div>

      <!-- Bottom Row -->
      <div class="bottom-grid">
        <!-- Recent Activities -->
        <div class="activity-panel">
          <div class="panel-header">
            <h3>Recent Activities</h3>
            <button mat-button color="primary" routerLink="/reports">View All</button>
          </div>
          <div class="activity-list">
            <div *ngFor="let act of stats?.recentActivities" class="activity-item">
              <div class="activity-icon" [ngClass]="act.color">
                <mat-icon>{{ act.icon }}</mat-icon>
              </div>
              <div class="activity-body">
                <div class="activity-action">{{ act.action }}</div>
                <div class="activity-details">{{ act.details }}</div>
                <div class="activity-meta">
                  <span>{{ act.userName }}</span>
                  <span class="dot">·</span>
                  <span>{{ act.timestamp }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Upcoming Shoots -->
        <div class="shoots-panel">
          <div class="panel-header">
            <h3><mat-icon style="font-size:18px;vertical-align:middle;margin-right:6px;color:var(--color-warning)">camera_alt</mat-icon>Shoots</h3>
            <div style="display:flex;align-items:center;gap:12px">
              <!-- Segmented Filter -->
              <div class="shoot-seg">
                <button class="seg-btn" [class.active]="shootFilter==='previous'" (click)="shootFilter='previous'">Previous</button>
                <button class="seg-btn" [class.active]="shootFilter==='today'"    (click)="shootFilter='today'">Today</button>
                <button class="seg-btn" [class.active]="shootFilter==='upcoming'" (click)="shootFilter='upcoming'">Upcoming</button>
              </div>
              <a routerLink="/bookings" style="font-size:12px;font-weight:600;color:var(--color-primary);text-decoration:none;white-space:nowrap">View All →</a>
            </div>
          </div>
          <div class="shoots-list">
            <div *ngFor="let shoot of filteredShoots" class="shoot-item">
              <div class="shoot-date-badge" [ngClass]="shoot.urgency">
                <div class="shoot-day">{{ shoot.day }}</div>
                <div class="shoot-month">{{ shoot.month }}</div>
              </div>
              <div class="shoot-info">
                <div class="shoot-title">{{ shoot.title }}</div>
                <div class="shoot-meta">
                  <mat-icon style="font-size:13px;width:13px;height:13px">location_on</mat-icon>
                  {{ shoot.location }}
                  <span class="dot">·</span>
                  <mat-icon style="font-size:13px;width:13px;height:13px">schedule</mat-icon>
                  {{ shoot.time }}
                </div>
                <div class="shoot-models">
                  <span *ngFor="let m of shoot.models" class="model-chip">{{ m }}</span>
                </div>
              </div>
              <div class="shoot-status" [ngClass]="shoot.urgency">{{ shoot.status }}</div>
            </div>
            <div *ngIf="filteredShoots.length === 0" class="shoots-empty">
              <mat-icon>event_busy</mat-icon>
              <p>No shoots found</p>
            </div>
          </div>

          <!-- Pipeline -->
          <div style="border-top:1px solid var(--border);margin-top:4px">
            <div class="panel-header"><h3>Workflow Pipeline</h3></div>
            <div class="pipeline">
              <div class="pipeline-item" *ngFor="let step of pipeline">
                <div class="pipeline-icon" [ngClass]="step.color">
                  <mat-icon>{{ step.icon }}</mat-icon>
                </div>
                <div class="pipeline-info">
                  <div class="pipeline-label">{{ step.label }}</div>
                  <div class="pipeline-count">{{ step.count }}</div>
                </div>
                <mat-progress-bar mode="determinate" [value]="step.pct" [color]="step.matColor" class="pipeline-bar"></mat-progress-bar>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Floating Quick Action Button ─────────────────────────── -->
    <div class="fab-container" [class.open]="fabOpen">
      <!-- Action Items (shown when open) -->
      <div class="fab-actions">
        <a class="fab-action" routerLink="/models" (click)="fabOpen=false" matTooltip="Add Model" matTooltipPosition="left">
          <div class="fab-action-icon purple"><mat-icon>person_add</mat-icon></div>
          <span class="fab-action-label">Add Model</span>
        </a>
        <a class="fab-action" routerLink="/clients" (click)="fabOpen=false" matTooltip="Add Client" matTooltipPosition="left">
          <div class="fab-action-icon blue"><mat-icon>business</mat-icon></div>
          <span class="fab-action-label">Add Client</span>
        </a>
        <a class="fab-action" routerLink="/requirements" (click)="fabOpen=false" matTooltip="New Requirement" matTooltipPosition="left">
          <div class="fab-action-icon green"><mat-icon>list_alt</mat-icon></div>
          <span class="fab-action-label">New Requirement</span>
        </a>
        <a class="fab-action" routerLink="/quotations" (click)="fabOpen=false" matTooltip="Create Quotation" matTooltipPosition="left">
          <div class="fab-action-icon pink"><mat-icon>request_quote</mat-icon></div>
          <span class="fab-action-label">Quotation</span>
        </a>
        <a class="fab-action" routerLink="/bookings" (click)="fabOpen=false" matTooltip="New Booking" matTooltipPosition="left">
          <div class="fab-action-icon orange"><mat-icon>event_available</mat-icon></div>
          <span class="fab-action-label">New Booking</span>
        </a>
        <a class="fab-action" routerLink="/invoices" (click)="fabOpen=false" matTooltip="Generate Invoice" matTooltipPosition="left">
          <div class="fab-action-icon red"><mat-icon>receipt_long</mat-icon></div>
          <span class="fab-action-label">Invoice</span>
        </a>
      </div>

      <!-- Main FAB -->
      <button class="fab-main" (click)="fabOpen=!fabOpen" matTooltip="Quick Actions" matTooltipPosition="left">
        <mat-icon class="fab-icon-add">add</mat-icon>
        <mat-icon class="fab-icon-close">close</mat-icon>
      </button>
    </div>

    <!-- Backdrop -->
    <div class="fab-backdrop" *ngIf="fabOpen" (click)="fabOpen=false"></div>
  `,
    styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .bottom-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .activity-panel, .shoots-panel {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .panel-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
      h3 { font-size: 15px; font-weight: 600; margin: 0; display:flex;align-items:center; }
    }

    /* ── Activities ── */
    .activity-list { padding: 8px 0; }
    .activity-item {
      display: flex; gap: 14px;
      padding: 12px 20px;
      border-bottom: 1px solid var(--border);
      transition: background var(--transition-fast);
      &:last-child { border-bottom: none; }
      &:hover { background: rgba(108,99,255,0.04); }
    }
    .activity-icon {
      width: 36px; height: 36px; border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { font-size: 18px !important; width: 18px !important; height: 18px !important; }
      &.purple { background: rgba(108,99,255,0.15); color: var(--color-primary); }
      &.green  { background: rgba(0,212,170,0.15);  color: var(--color-success); }
      &.blue   { background: rgba(0,180,216,0.15);  color: var(--color-info); }
      &.pink   { background: rgba(255,107,157,0.15);color: var(--color-accent); }
      &.orange { background: rgba(255,181,71,0.15);  color: var(--color-warning); }
    }
    .activity-action  { font-size: 13px; font-weight: 600; margin-bottom: 2px; }
    .activity-details { font-size: 12px; color: var(--text-muted); margin-bottom: 4px; }
    .activity-meta    { font-size: 11px; color: var(--text-disabled); display: flex; gap: 6px; align-items: center; }
    .dot { opacity: 0.5; }

    /* ── Upcoming Shoots ── */
    .shoots-list { padding: 8px 0; max-height: 320px; overflow-y: auto; }
    .shoot-item {
      display: flex; align-items: flex-start; gap: 14px;
      padding: 12px 20px;
      border-bottom: 1px solid var(--border);
      transition: background var(--transition-fast);
      &:last-child { border-bottom: none; }
      &:hover { background: rgba(108,99,255,0.03); }
    }
    .shoot-date-badge {
      min-width: 44px; text-align: center; border-radius: 10px;
      padding: 6px 8px; flex-shrink: 0;
      &.today    { background: #FFF3E0; }
      &.tomorrow { background: #E3F2FD; }
      &.upcoming { background: #F3E5F5; }
      .shoot-day   { font-size: 18px; font-weight: 800; line-height: 1; }
      .shoot-month { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 1px; }
    }
    .shoot-date-badge.today    .shoot-day   { color: #E65100; }
    .shoot-date-badge.today    .shoot-month { color: #FF6D00; }
    .shoot-date-badge.tomorrow .shoot-day   { color: #0277BD; }
    .shoot-date-badge.tomorrow .shoot-month { color: #0288D1; }
    .shoot-date-badge.upcoming .shoot-day   { color: #6A1B9A; }
    .shoot-date-badge.upcoming .shoot-month { color: #8E24AA; }

    .shoot-info { flex: 1; min-width: 0; }
    .shoot-title { font-size: 13px; font-weight: 600; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .shoot-meta  { font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 4px; margin-bottom: 6px; }
    .shoot-models { display: flex; flex-wrap: wrap; gap: 4px; }
    .model-chip {
      font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 20px;
      background: rgba(108,99,255,0.1); color: var(--color-primary); border: 1px solid rgba(108,99,255,0.2);
    }
    .shoot-status {
      font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 20px;
      white-space: nowrap; flex-shrink: 0; align-self: flex-start; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px;
      &.today    { background: #FFF3E0; color: #E65100; border: 1px solid #FFCCBC; }
      &.tomorrow { background: #E3F2FD; color: #0277BD; border: 1px solid #B3E5FC; }
      &.upcoming { background: #F3E5F5; color: #6A1B9A; border: 1px solid #CE93D8; }
    }
    .shoots-empty {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 40px 20px; color: var(--text-disabled); gap: 8px;
      mat-icon { font-size: 36px; width: 36px; height: 36px; }
      p { font-size: 13px; margin: 0; }
    }

    /* ── Pipeline ── */
    .pipeline { display: flex; flex-direction: column; gap: 10px; padding: 12px 20px 16px; }
    .pipeline-item { display: flex; align-items: center; gap: 12px; }
    .pipeline-icon {
      width: 32px; height: 32px; border-radius: var(--radius-sm);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { font-size: 16px !important; }
      &.purple { background: rgba(108,99,255,0.15); color: var(--color-primary); }
      &.blue   { background: rgba(0,180,216,0.15);  color: var(--color-info); }
      &.green  { background: rgba(0,212,170,0.15);  color: var(--color-success); }
      &.orange { background: rgba(255,181,71,0.15);  color: var(--color-warning); }
    }
    .pipeline-info { min-width: 120px; }
    .pipeline-label { font-size: 12px; color: var(--text-muted); }
    .pipeline-count { font-size: 14px; font-weight: 700; }
    .pipeline-bar   { flex: 1; border-radius: var(--radius-full); height: 6px; }

    /* ── Floating Action Button ── */
    .fab-container {
      position: fixed;
      bottom: 32px;
      right: 32px;
      z-index: 200;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 12px;
    }

    .fab-main {
      width: 56px; height: 56px;
      border-radius: 50%;
      background: var(--gradient-primary);
      border: none;
      color: white;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 6px 20px rgba(79,70,229,0.45);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
      &:hover { transform: scale(1.08); box-shadow: 0 8px 28px rgba(79,70,229,0.55); }
      mat-icon { font-size: 26px; width: 26px; height: 26px; position: absolute; transition: all 0.3s ease; }
    }
    .fab-icon-add   { opacity: 1; transform: rotate(0deg); }
    .fab-icon-close { opacity: 0; transform: rotate(-90deg); }

    .fab-container.open .fab-main {
      background: linear-gradient(135deg,#374151,#1F2937);
      box-shadow: 0 6px 20px rgba(0,0,0,0.35);
    }
    .fab-container.open .fab-icon-add   { opacity: 0; transform: rotate(90deg); }
    .fab-container.open .fab-icon-close { opacity: 1; transform: rotate(0deg); }

    .fab-actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
      overflow: hidden;
      max-height: 0;
      opacity: 0;
      transition: max-height 0.35s ease, opacity 0.25s ease;
      pointer-events: none;
    }
    .fab-container.open .fab-actions {
      max-height: 400px;
      opacity: 1;
      pointer-events: all;
    }

    .fab-action {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      cursor: pointer;
      animation: fabItemIn 0.2s ease forwards;
    }
    .fab-action-label {
      font-size: 12px; font-weight: 600;
      background: var(--bg-card);
      color: var(--text-primary);
      padding: 5px 12px;
      border-radius: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.12);
      border: 1px solid var(--border);
      white-space: nowrap;
    }
    .fab-action-icon {
      width: 40px; height: 40px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 3px 10px rgba(0,0,0,0.2);
      flex-shrink: 0;
      transition: transform 0.2s ease;
      mat-icon { font-size: 18px !important; width: 18px !important; height: 18px !important; }
      &:hover { transform: scale(1.12); }
      &.purple { background: linear-gradient(135deg,#4F46E5,#7C3AED); color: white; }
      &.blue   { background: linear-gradient(135deg,#0284C7,#0EA5E9); color: white; }
      &.green  { background: linear-gradient(135deg,#059669,#10B981); color: white; }
      &.pink   { background: linear-gradient(135deg,#E11D48,#F43F5E); color: white; }
      &.orange { background: linear-gradient(135deg,#D97706,#F59E0B); color: white; }
      &.red    { background: linear-gradient(135deg,#DC2626,#EF4444); color: white; }
    }

    .fab-backdrop {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.15);
      backdrop-filter: blur(2px);
      z-index: 199;
    }

    @keyframes fabItemIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .shoot-seg {
      display: flex;
      align-items: center;
      background: var(--bg-base);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 3px;
      gap: 2px;
    }
    .seg-btn {
      padding: 4px 12px;
      border-radius: 16px;
      border: none;
      background: transparent;
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      letter-spacing: 0.2px;
      white-space: nowrap;
      &:hover:not(.active) { color: var(--text-secondary); background: rgba(0,0,0,0.04); }
      &.active {
        background: var(--gradient-primary);
        color: white;
        box-shadow: 0 2px 8px rgba(79,70,229,0.3);
      }
    }

    @media(max-width:1200px) { .bottom-grid { grid-template-columns: 1fr; } }
    @media(max-width:900px)  { .stats-grid  { grid-template-columns: repeat(2, 1fr); } }
    @media(max-width:600px)  { .fab-container { bottom: 20px; right: 20px; } }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  fabOpen = false;
  shootFilter: 'previous' | 'today' | 'upcoming' = 'today';

  get filteredShoots() {
    return this.allShoots.filter(s => s.urgency === this.shootFilter);
  }

  allShoots = [
    // ── Previous ────────────────────────────────────────────
    {
      day: '10', month: 'Jul', title: 'Fabindia Festive Lookbook', location: 'Studio C, Versova',
      time: '9:00 AM', models: ['Nisha T.', 'Pooja A.'], urgency: 'previous', status: 'Completed'
    },
    {
      day: '12', month: 'Jul', title: 'Raymond Corporate Shoot', location: 'Lower Parel Office',
      time: '11:00 AM', models: ['Rahul K.', 'Dev S.'], urgency: 'previous', status: 'Completed'
    },
    {
      day: '14', month: 'Jul', title: 'Tanishq Jewellery Campaign', location: 'Studio A, Andheri',
      time: '7:30 AM', models: ['Divya P.', 'Ananya K.'], urgency: 'previous', status: 'Completed'
    },
    // ── Today ───────────────────────────────────────────────
    {
      day: '16', month: 'Jul', title: 'Zara Summer Collection', location: 'Studio A, Andheri',
      time: '10:00 AM', models: ['Priya S.', 'Ananya K.', 'Ritu M.'], urgency: 'today', status: 'Today'
    },
    {
      day: '16', month: 'Jul', title: 'Mango Editorial Shoot', location: 'Bandra Bandstand',
      time: '3:00 PM', models: ['Meera R.', 'Kavya N.'], urgency: 'today', status: 'Today'
    },
    // ── Upcoming ────────────────────────────────────────────
    {
      day: '17', month: 'Jul', title: 'H&M Ethnic Wear Lookbook', location: 'Outdoor – Bandra',
      time: '8:30 AM', models: ['Meera R.', 'Sonal D.'], urgency: 'upcoming', status: 'Upcoming'
    },
    {
      day: '19', month: 'Jul', title: 'Vogue India Editorial', location: 'Studio B, Powai',
      time: '2:00 PM', models: ['Kavya N.', 'Divya P.', 'Nisha T.'], urgency: 'upcoming', status: 'Upcoming'
    },
    {
      day: '21', month: 'Jul', title: 'Myntra Campaign – Denim', location: 'Film City, Goregaon',
      time: '9:00 AM', models: ['Pooja A.', 'Shreya B.'], urgency: 'upcoming', status: 'Upcoming'
    },
    {
      day: '24', month: 'Jul', title: "Levi's Brand Shoot", location: 'Juhu Beach',
      time: '6:00 AM', models: ['Ritu M.', 'Ananya K.'], urgency: 'upcoming', status: 'Upcoming'
    },
  ];

  pipeline = [
    { icon: 'list_alt',        label: 'Requirements', count: 4,  pct: 100, color: 'purple', matColor: 'primary' as const },
    { icon: 'request_quote',   label: 'Quotations',   count: 3,  pct: 75,  color: 'blue',   matColor: 'accent' as const  },
    { icon: 'event_available', label: 'Bookings',     count: 2,  pct: 50,  color: 'green',  matColor: 'primary' as const },
    { icon: 'receipt_long',    label: 'Invoices',     count: 3,  pct: 75,  color: 'orange', matColor: 'warn' as const    },
  ];

  constructor(private data: MockDataService) {}
  ngOnInit() { this.data.getDashboardStats().subscribe(s => this.stats = s); }

  @HostListener('document:keydown.escape')
  closeFab() { this.fabOpen = false; }
}
