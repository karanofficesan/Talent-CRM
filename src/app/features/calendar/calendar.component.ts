import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MockDataService } from '../../core/services/mock-data.service';
import { Booking } from '../../core/models';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  template: `
<div class="page-container">
  <div class="page-header" style="display:flex;align-items:center;justify-content:space-between">
    <div><h1>Calendar</h1><p>Centralized shoot schedule & availability</p></div>
    <div style="display:flex;gap:8px">
      <div class="view-toggle">
        <button [class.active]="view==='month'" (click)="view='month'">Month</button>
        <button [class.active]="view==='week'" (click)="view='week'">Week</button>
        <button [class.active]="view==='day'" (click)="view='day'">Day</button>
      </div>
    </div>
  </div>

  <!-- Legend -->
  <div class="legend" style="display:flex;gap:16px;margin-bottom:20px;flex-wrap:wrap">
    <div *ngFor="let l of legend" class="leg-item">
      <div class="leg-dot" [ngStyle]="{'background':l.color}"></div>
      <span>{{ l.label }}</span>
    </div>
  </div>

  <!-- Calendar Header -->
  <div class="cal-card">
    <div class="cal-nav">
      <button class="nav-btn" (click)="prevMonth()"><mat-icon>chevron_left</mat-icon></button>
      <h2 class="cal-title">{{ monthName }} {{ year }}</h2>
      <button class="nav-btn" (click)="nextMonth()"><mat-icon>chevron_right</mat-icon></button>
      <button class="today-btn" (click)="goToday()">Today</button>
    </div>

    <!-- Day Labels -->
    <div class="day-labels">
      <div *ngFor="let d of dayNames" class="day-label">{{ d }}</div>
    </div>

    <!-- Calendar Grid -->
    <div class="cal-grid">
      <div *ngFor="let cell of calCells" class="cal-cell"
           [class.other-month]="!cell.isCurrentMonth"
           [class.today]="cell.isToday"
           (click)="selectDay(cell)">
        <div class="cell-date">{{ cell.date }}</div>
        <div class="cell-events">
          <div *ngFor="let ev of cell.events.slice(0,2)" class="cal-event" [ngStyle]="{'background':ev.color}">
            <div class="ev-client">{{ ev.client }}</div>
            <div class="ev-models">{{ ev.models }}</div>
          </div>
          <div *ngIf="cell.events.length>2" class="more-events">+{{ cell.events.length-2 }} more</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Upcoming Bookings -->
  <div style="margin-top:24px">
    <div class="section-title">Upcoming Shoots</div>
    <div class="booking-list">
      <div *ngFor="let b of upcomingBookings" class="booking-item">
        <div class="booking-date-badge">
          <div class="bdb-month">{{ getMonth(b.shootDate) }}</div>
          <div class="bdb-day">{{ getDay(b.shootDate) }}</div>
        </div>
        <div class="booking-info">
          <div style="font-weight:700;font-size:14px">{{ b.projectName }}</div>
          <div style="font-size:12px;color:var(--text-muted)">{{ b.clientName }} · {{ b.venue || 'Venue TBD' }}</div>
          <div style="font-size:12px;color:var(--color-info);margin-top:2px">{{ b.selectedModels.length }} model(s) booked</div>
        </div>
        <div class="booking-time">{{ b.shootTime || 'Time TBD' }}</div>
        <span class="badge badge-success">{{ b.status }}</span>
      </div>
      <div *ngIf="upcomingBookings.length===0" style="text-align:center;padding:30px;color:var(--text-muted)">No upcoming shoots</div>
    </div>
  </div>
</div>
  `,
  styles: [`
    .view-toggle { display:flex; background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-md); overflow:hidden;
      button { background:none; border:none; color:var(--text-secondary); padding:8px 16px; cursor:pointer; font-size:13px; font-weight:500; font-family:inherit; transition:all 0.2s;
        &.active { background:rgba(108,99,255,0.2); color:var(--color-primary); }
      }
    }
    .legend { }
    .leg-item { display:flex; align-items:center; gap:6px; font-size:13px; color:var(--text-secondary); }
    .leg-dot { width:10px; height:10px; border-radius:50%; }
    .cal-card { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-lg); overflow:hidden; }
    .cal-nav { display:flex; align-items:center; gap:12px; padding:16px 20px; border-bottom:1px solid var(--border); }
    .cal-title { font-size:18px; font-weight:700; flex:1; margin:0; }
    .nav-btn { background:none; border:1px solid var(--border); border-radius:var(--radius-sm); color:var(--text-secondary); cursor:pointer; padding:4px; display:flex; align-items:center; transition:all 0.2s; &:hover{border-color:var(--color-primary);color:var(--color-primary)} }
    .today-btn { background:rgba(108,99,255,0.15); border:1px solid rgba(108,99,255,0.3); border-radius:var(--radius-sm); color:var(--color-primary); cursor:pointer; padding:6px 14px; font-size:13px; font-weight:500; font-family:inherit; transition:all 0.2s; &:hover{background:var(--color-primary);color:white} }
    .day-labels { display:grid; grid-template-columns:repeat(7,1fr); background:rgba(108,99,255,0.06); }
    .day-label { padding:10px; text-align:center; font-size:12px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; }
    .cal-grid { display:grid; grid-template-columns:repeat(7,1fr); }
    .cal-cell { min-height:100px; padding:8px; border-right:1px solid var(--border); border-bottom:1px solid var(--border); cursor:pointer; transition:background 0.15s;
      &:hover { background:rgba(108,99,255,0.05); }
      &.other-month .cell-date { color:var(--text-disabled); }
      &.today .cell-date { background:var(--color-primary); color:white; width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; }
    }
    .cell-date { font-size:13px; font-weight:500; margin-bottom:4px; width:24px; height:24px; display:flex; align-items:center; justify-content:center; }
    .cal-event { padding:4px 6px; border-radius:4px; color:white; margin-bottom:4px; overflow:hidden; line-height:1.2; }
    .ev-client { font-size:11px; font-weight:700; white-space:nowrap; text-overflow:ellipsis; overflow:hidden; margin-bottom:2px; }
    .ev-models { font-size:10px; opacity:0.9; white-space:nowrap; text-overflow:ellipsis; overflow:hidden; }
    .more-events { font-size:10px; color:var(--text-muted); padding:1px 4px; }
    .booking-list { display:flex; flex-direction:column; gap:12px; }
    .booking-item { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-md); padding:16px; display:flex; align-items:center; gap:16px; transition:all 0.2s; &:hover{border-color:rgba(108,99,255,0.3)} }
    .booking-date-badge { background:rgba(108,99,255,0.15); border-radius:var(--radius-md); padding:8px 14px; text-align:center; min-width:56px; flex-shrink:0; }
    .bdb-month { font-size:10px; font-weight:600; text-transform:uppercase; color:var(--color-primary); letter-spacing:0.5px; }
    .bdb-day { font-size:22px; font-weight:800; color:var(--color-primary); }
    .booking-info { flex:1; }
    .booking-time { font-size:13px; font-weight:600; color:var(--text-muted); }
  `]
})
export class CalendarComponent implements OnInit {
  view: 'month'|'week'|'day' = 'month';
  today = new Date();
  currentDate = new Date();
  bookings: Booking[] = [];
  calCells: any[] = [];
  dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  upcomingBookings: Booking[] = [];

  legend = [
    { label: 'Booked', color: '#6C63FF' },
    { label: 'Tentative', color: '#FFB547' },
    { label: 'Blocked', color: '#FF5370' },
    { label: 'Available', color: '#00D4AA' },
  ];

  get monthName() { return this.currentDate.toLocaleString('default',{month:'long'}); }
  get year() { return this.currentDate.getFullYear(); }

  getMonth(d: string) { return d ? new Date(d).toLocaleString('default',{month:'short'}).toUpperCase() : 'TBD'; }
  getDay(d: string) { return d ? new Date(d).getDate() : '--'; }

  constructor(private data: MockDataService) {}

  ngOnInit() {
    this.data.getBookings().subscribe(b => {
      this.bookings = b;
      this.upcomingBookings = b.filter(x => x.status === 'Confirmed');
      this.buildCalendar();
    });
  }

  buildCalendar() {
    const year = this.currentDate.getFullYear(), month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();
    const cells: any[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ date: daysInPrev - i, isCurrentMonth: false, isToday: false, events: [] });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const isToday = d === this.today.getDate() && month === this.today.getMonth() && year === this.today.getFullYear();
      const events = this.bookings.filter(b => b.shootDate === dateStr).map(b => {
        const modelNames = b.selectedModels.map(m => m.modelName).join(', ');
        return { 
          client: b.clientName,
          title: b.projectName,
          models: modelNames,
          color: b.status === 'Confirmed' ? '#4F46E5' : (b.status === 'In Progress' ? '#0284C7' : '#D97706')
        };
      });
      cells.push({ date: d, isCurrentMonth: true, isToday, events });
    }
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      cells.push({ date: d, isCurrentMonth: false, isToday: false, events: [] });
    }
    this.calCells = cells;
  }

  prevMonth() { this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1); this.buildCalendar(); }
  nextMonth() { this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1); this.buildCalendar(); }
  goToday() { this.currentDate = new Date(); this.buildCalendar(); }
  selectDay(cell: any) { if (cell.isCurrentMonth) console.log('Selected:', cell); }
}
