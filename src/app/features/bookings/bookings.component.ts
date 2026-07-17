import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MockDataService } from '../../core/services/mock-data.service';
import { Booking, Invoice } from '../../core/models';

const B_STATUS_COLOR: Record<string,string> = { 'Confirmed':'badge-success','In Progress':'badge-info','Completed':'badge-primary','Cancelled':'badge-danger' };

@Component({
    selector: 'app-bookings',
    imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatSnackBarModule],
    template: `
<div class="page-container">
  <div class="page-header" style="display:flex;align-items:center;justify-content:space-between">
    <div><h1>Booking Management</h1><p>{{ bookings.length }} bookings · {{ upcoming }} upcoming</p></div>
  </div>

  <div class="status-tabs" style="display:flex;gap:8px;margin-bottom:24px;flex-wrap:wrap">
    <button *ngFor="let s of statuses" class="tab-btn" [class.active]="filterStatus===s" (click)="filterStatus=s;applyFilter()" style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-full);padding:8px 16px;color:var(--text-secondary);font-size:13px;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:inherit;font-weight:500;transition:all 0.2s">
      {{ s }}
    </button>
  </div>

  <div class="data-table-wrapper">
    <div class="table-header">
      <h3>Bookings</h3>
      <div style="display:flex;gap:8px;align-items:center">
        <div style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:var(--radius-sm);padding:0 12px;height:36px">
          <mat-icon style="font-size:16px;color:var(--text-muted)">search</mat-icon>
          <input style="background:none;border:none;outline:none;font-size:13px;color:var(--text-primary);font-family:inherit;width:180px" placeholder="Search bookings..." [(ngModel)]="search" (ngModelChange)="applyFilter()">
        </div>
      </div>
    </div>
    <table class="b-table">
      <thead><tr>
        <th>Booking #</th><th>Client</th><th>Project</th>
        <th>Shoot Date</th><th>Venue</th><th>Models</th>
        <th>Amount</th><th>Status</th><th>Actions</th>
      </tr></thead>
      <tbody>
        <tr *ngFor="let b of filtered">
          <td><span style="font-weight:700;color:var(--color-primary)">{{ b.bookingNumber }}</span></td>
          <td><div style="font-weight:600;font-size:13px">{{ b.clientName }}</div></td>
          <td>{{ b.projectName }}</td>
          <td>
            <div style="font-size:13px;font-weight:500">{{ b.shootDate || 'TBD' }}</div>
            <div style="font-size:11px;color:var(--text-muted)">{{ b.shootTime }}</div>
          </td>
          <td style="font-size:12px;color:var(--text-secondary)">{{ b.venue || 'TBD' }}</td>
          <td>
            <div style="display:flex;align-items:center">
              <img *ngFor="let m of b.selectedModels.slice(0,3)" [src]="m.coverImage" style="width:30px;height:30px;border-radius:50%;object-fit:cover;border:2px solid var(--bg-card);margin-left:-6px;first-child:margin-left:0">
              <span *ngIf="b.selectedModels.length>3" style="font-size:11px;color:var(--text-muted);margin-left:4px">+{{ b.selectedModels.length-3 }}</span>
            </div>
          </td>
          <td style="font-weight:700;color:var(--color-success)">₹{{ b.sellingPrice.toLocaleString() }}</td>
          <td><span class="badge" [ngClass]="statusColor(b.status)">{{ b.status }}</span></td>
          <td>
            <div style="display:flex;gap:4px;align-items:center">
              <button mat-icon-button (click)="viewBooking(b)" title="View"><mat-icon style="font-size:16px">visibility</mat-icon></button>
              <button mat-stroked-button (click)="generateInvoice(b)" *ngIf="b.status!=='Cancelled'" style="font-size:11px;padding:3px 8px"><mat-icon style="font-size:14px">receipt</mat-icon> Invoice</button>
              <button mat-icon-button color="warn" (click)="cancel(b)" *ngIf="b.status==='Confirmed'"><mat-icon style="font-size:16px">cancel</mat-icon></button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div *ngIf="filtered.length===0" style="text-align:center;padding:40px;color:var(--text-muted)">
      <mat-icon style="font-size:48px;opacity:0.3">event_available</mat-icon>
      <p style="margin-top:12px">No bookings found</p>
    </div>
  </div>

  <!-- Detail Modal -->
  <div class="dialog-overlay" *ngIf="viewingB" (click)="viewingB=null">
    <div class="inline-dialog" (click)="$event.stopPropagation()" style="width:660px;max-height:90vh;overflow-y:auto">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid var(--border)">
        <div><h3 style="margin:0;font-weight:700">{{ viewingB.bookingNumber }}</h3><div style="font-size:12px;color:var(--text-muted)">{{ viewingB.clientName }} · {{ viewingB.projectName }}</div></div>
        <button mat-icon-button (click)="viewingB=null"><mat-icon>close</mat-icon></button>
      </div>
      <div style="padding:20px 24px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
          <div class="detail-field"><div class="df-lbl">Shoot Date</div><div class="df-val">{{ viewingB.shootDate || 'TBD' }}</div></div>
          <div class="detail-field"><div class="df-lbl">Shoot Time</div><div class="df-val">{{ viewingB.shootTime }}</div></div>
          <div class="detail-field"><div class="df-lbl">Venue</div><div class="df-val">{{ viewingB.venue || 'TBD' }}</div></div>
          <div class="detail-field"><div class="df-lbl">Coordinator</div><div class="df-val">{{ viewingB.coordinator || '-' }}</div></div>
          <div class="detail-field"><div class="df-lbl">Selling Price</div><div class="df-val" style="color:var(--color-success);font-weight:700">₹{{ viewingB.sellingPrice.toLocaleString() }}</div></div>
          <div class="detail-field"><div class="df-lbl">Status</div><div class="df-val"><span class="badge" [ngClass]="statusColor(viewingB.status)">{{ viewingB.status }}</span></div></div>
        </div>
        <h4 style="font-size:13px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px">Models</h4>
        <div style="display:flex;flex-direction:column;gap:10px">
          <div *ngFor="let m of viewingB.selectedModels" style="display:flex;align-items:center;gap:12px;padding:10px;background:rgba(255,255,255,0.03);border-radius:var(--radius-md);border:1px solid var(--border)">
            <img [src]="m.coverImage" style="width:44px;height:56px;object-fit:cover;border-radius:var(--radius-sm)">
            <div style="flex:1"><div style="font-weight:600;font-size:13px">{{ m.modelName }}</div><div style="font-size:12px;color:var(--text-muted)">{{ m.height }}cm · {{ m.age }}y</div></div>
            <div style="text-align:right"><div style="font-weight:700;color:var(--color-success)">₹{{ m.sellingPrice.toLocaleString() }}</div></div>
          </div>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px">
          <button mat-stroked-button (click)="viewingB=null">Close</button>
          <button mat-raised-button color="primary" (click)="generateInvoice(viewingB!);viewingB=null"><mat-icon>receipt</mat-icon> Generate Invoice</button>
        </div>
      </div>
    </div>
  </div>
</div>
  `,
    styles: [`
    .tab-btn.active { background:rgba(108,99,255,0.2)!important; border-color:var(--color-primary)!important; color:var(--color-primary)!important; }
    .b-table { width:100%; border-collapse:collapse;
      th { padding:12px 16px; text-align:left; font-size:11px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; background:rgba(108,99,255,0.08); }
      td { padding:12px 16px; border-bottom:1px solid var(--border); font-size:13px; }
      tr:hover td { background:rgba(108,99,255,0.04); }
    }
    .detail-field { background:rgba(255,255,255,0.03); border-radius:var(--radius-sm); padding:10px 14px; border:1px solid var(--border); }
    .df-lbl { font-size:10px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px; }
    .df-val { font-size:14px; font-weight:500; }
    .dialog-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:1000; display:flex; align-items:center; justify-content:center; }
    .inline-dialog { background:var(--bg-elevated); border:1px solid var(--border); border-radius:var(--radius-xl); }
  `]
})
export class BookingsComponent implements OnInit {
  bookings: Booking[] = []; filtered: Booking[] = [];
  search = ''; filterStatus = 'All'; viewingB: Booking | null = null;
  statuses = ['All', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];

  get upcoming() { return this.bookings.filter(b => b.status === 'Confirmed').length; }
  statusColor(s: string) { return B_STATUS_COLOR[s] || 'badge-muted'; }

  constructor(private data: MockDataService, private snack: MatSnackBar) {}

  ngOnInit() { this.data.getBookings().subscribe(b => { this.bookings = b; this.applyFilter(); }); }

  applyFilter() {
    this.filtered = this.bookings.filter(b =>
      (this.filterStatus === 'All' || b.status === this.filterStatus)
      && (!this.search || b.clientName.toLowerCase().includes(this.search.toLowerCase()) || b.projectName.toLowerCase().includes(this.search.toLowerCase()))
    );
  }

  viewBooking(b: Booking) { this.viewingB = b; }

  generateInvoice(b: Booking) {
    const gst = 18;
    const gstAmt = Math.round(b.sellingPrice * gst / 100);
    const inv: Invoice = {
      id: this.data.generateId('i'), invoiceNumber: this.data.generateInvoiceNumber(),
      clientId: b.clientId, clientName: b.clientName,
      bookingId: b.id, bookingNumber: b.bookingNumber,
      projectName: b.projectName, amount: b.sellingPrice,
      gstPercent: gst, gstAmount: gstAmt, totalAmount: b.sellingPrice + gstAmt,
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'Pending', paidAmount: 0, notes: '',
      createdAt: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString().split('T')[0]
    };
    this.data.addInvoice(inv);
    this.snack.open(`Invoice ${inv.invoiceNumber} generated!`, 'View', { duration: 4000 });
  }

  cancel(b: Booking) {
    if (confirm(`Cancel booking ${b.bookingNumber}?`)) {
      this.data.updateBooking({ ...b, status: 'Cancelled' });
      this.snack.open('Booking cancelled', 'Close', { duration: 3000 });
    }
  }
}
