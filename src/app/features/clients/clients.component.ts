import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MockDataService } from '../../core/services/mock-data.service';
import { Client } from '../../core/models';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule],
  template: `
<div class="page-container">
  <div class="page-header" style="display:flex;align-items:center;justify-content:space-between">
    <div><h1>Client Management</h1><p>{{ clients.length }} clients registered</p></div>
    <button mat-raised-button color="primary" (click)="openForm()"><mat-icon>business</mat-icon> Add Client</button>
  </div>

  <div class="filter-bar" style="display:flex;gap:12px;margin-bottom:24px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:14px 16px">
    <div style="display:flex;align-items:center;gap:8px;flex:1;border:1px solid var(--border);border-radius:var(--radius-sm);padding:0 12px;height:38px;background:rgba(255,255,255,0.03)">
      <mat-icon style="color:var(--text-muted);font-size:18px">search</mat-icon>
      <input style="background:none;border:none;outline:none;color:var(--text-primary);font-size:14px;width:100%;font-family:inherit" placeholder="Search clients..." [(ngModel)]="search" (ngModelChange)="applyFilter()">
    </div>
    <select class="filter-select" [(ngModel)]="filterStatus" (ngModelChange)="applyFilter()" style="background:var(--bg-elevated);border:1px solid var(--border);color:var(--text-primary);border-radius:var(--radius-sm);padding:7px 12px;font-size:13px;outline:none">
      <option value="">All Status</option><option>Active</option><option>Inactive</option>
    </select>
  </div>

  <div class="data-table-wrapper">
    <table class="c-table">
      <thead><tr>
        <th>Company Name</th><th>Contact Person</th><th>Email / Mobile</th>
        <th>Payment Terms</th><th>Status</th><th>Actions</th>
      </tr></thead>
      <tbody>
        <tr *ngFor="let c of filtered">
          <td>
            <div style="display:flex;align-items:center;gap:12px">
              <div class="c-avatar">{{ c.companyName.charAt(0) }}</div>
              <div>
                <div style="font-weight:700;font-size:14px;color:var(--text-primary)">{{ c.companyName }}</div>
                <div style="font-size:11px;color:var(--text-muted)" *ngIf="c.gstNumber">GST: {{ c.gstNumber }}</div>
              </div>
            </div>
          </td>
          <td>
            <div style="font-weight:600;font-size:13px">{{ c.contactPerson }}</div>
            <div style="font-size:12px;color:var(--text-muted)"><mat-icon style="font-size:14px;vertical-align:middle">location_on</mat-icon> {{ c.billingAddress | slice:0:30 }}{{c.billingAddress.length>30?'...':''}}</div>
          </td>
          <td>
            <div style="font-size:13px">{{ c.email }}</div>
            <div style="font-size:12px;color:var(--text-muted)">{{ c.mobile }}</div>
          </td>
          <td>
            <div style="font-size:13px;font-weight:500">{{ c.paymentTerms }}</div>
            <div style="font-size:12px;color:var(--text-muted)">{{ c.creditDays }} days credit</div>
          </td>
          <td>
            <span class="badge" [class.badge-success]="c.status==='Active'" [class.badge-danger]="c.status!=='Active'">{{ c.status }}</span>
          </td>
          <td>
            <div style="display:flex;gap:4px">
              <button mat-icon-button (click)="openForm(c)" matTooltip="Edit Client"><mat-icon style="font-size:18px">edit</mat-icon></button>
              <button mat-icon-button color="warn" (click)="deleteClient(c)" matTooltip="Delete Client"><mat-icon style="font-size:18px">delete</mat-icon></button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div *ngIf="filtered.length===0" style="text-align:center;padding:60px;color:var(--text-muted)">
      <mat-icon style="font-size:56px;width:56px;height:56px;opacity:0.3;margin-bottom:12px">business</mat-icon>
      <p>No clients found</p>
    </div>
  </div>

  <!-- Inline Dialog -->
  <div class="dialog-overlay" *ngIf="showForm" (click)="showForm=false">
    <div class="inline-dialog" (click)="$event.stopPropagation()">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid var(--border)">
        <h3 style="font-size:18px;font-weight:700;margin:0">{{ editing?.id ? 'Edit Client' : 'Add Client' }}</h3>
        <button mat-icon-button (click)="showForm=false"><mat-icon>close</mat-icon></button>
      </div>
      <form [formGroup]="form" (ngSubmit)="save()" style="padding:20px 24px">
        <div class="form-grid2">
          <mat-form-field appearance="outline"><mat-label>Company Name</mat-label><input matInput formControlName="companyName"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Contact Person</mat-label><input matInput formControlName="contactPerson"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Mobile</mat-label><input matInput formControlName="mobile"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Email</mat-label><input matInput formControlName="email"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>GST Number</mat-label><input matInput formControlName="gstNumber"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Payment Terms</mat-label><input matInput formControlName="paymentTerms" placeholder="Net 30"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Credit Days</mat-label><input matInput type="number" formControlName="creditDays"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Status</mat-label>
            <mat-select formControlName="status"><mat-option value="Active">Active</mat-option><mat-option value="Inactive">Inactive</mat-option></mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" style="grid-column:1/-1"><mat-label>Billing Address</mat-label><textarea matInput formControlName="billingAddress" rows="2"></textarea></mat-form-field>
          <mat-form-field appearance="outline" style="grid-column:1/-1"><mat-label>Remarks</mat-label><textarea matInput formControlName="remarks" rows="2"></textarea></mat-form-field>
        </div>
        <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:8px">
          <button mat-stroked-button type="button" (click)="showForm=false">Cancel</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Save Client</button>
        </div>
      </form>
    </div>
  <!-- Delete Confirmation Dialog -->
  <div class="dialog-overlay" *ngIf="deletingClient" (click)="deletingClient=null">
    <div class="inline-dialog" (click)="$event.stopPropagation()" style="width:400px;text-align:center;padding:32px 24px">
      <div style="width:64px;height:64px;background:rgba(255,83,112,0.1);color:var(--color-danger);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">
        <mat-icon style="font-size:32px;width:32px;height:32px">business</mat-icon>
      </div>
      <h3 style="font-size:20px;font-weight:700;margin:0 0 8px">Delete Client?</h3>
      <p style="color:var(--text-muted);font-size:14px;margin:0 0 24px">
        Are you sure you want to permanently delete <strong>{{ deletingClient.companyName }}</strong>?<br>
        All related requirements may be affected.
      </p>
      <div style="display:flex;gap:12px;justify-content:center">
        <button mat-stroked-button (click)="deletingClient=null">Cancel</button>
        <button mat-raised-button color="warn" (click)="confirmDelete()">Delete Client</button>
      </div>
    </div>
  </div>
</div>
  `,
  styles: [`
    .c-table { width:100%; border-collapse:collapse;
      th { padding:14px 16px; text-align:left; font-size:11px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; background:rgba(108,99,255,0.04); }
      td { padding:14px 16px; border-bottom:1px solid var(--border); font-size:13px; color:var(--text-secondary); }
      tr:hover td { background:rgba(108,99,255,0.02); }
    }
    .c-avatar { width:36px; height:36px; background:var(--gradient-primary); border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:16px; color:white; flex-shrink:0; }
    .form-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
    .dialog-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:1000; display:flex; align-items:center; justify-content:center; }
    .inline-dialog { background:var(--bg-elevated); border:1px solid var(--border); border-radius:var(--radius-xl); width:640px; max-height:90vh; overflow-y:auto; }
  `]
})
export class ClientsComponent implements OnInit {
  clients: Client[] = []; filtered: Client[] = [];
  search = ''; filterStatus = '';
  showForm = false; editing: Client | null = null; deletingClient: Client | null = null;
  form!: FormGroup;

  constructor(private data: MockDataService, private fb: FormBuilder, private snack: MatSnackBar) {}
  ngOnInit() { this.data.getClients().subscribe(c => { this.clients = c; this.applyFilter(); }); }

  applyFilter() {
    this.filtered = this.clients.filter(c =>
      (!this.search || c.companyName.toLowerCase().includes(this.search.toLowerCase()) || c.contactPerson.toLowerCase().includes(this.search.toLowerCase()))
      && (!this.filterStatus || c.status === this.filterStatus)
    );
  }

  openForm(client?: Client) {
    this.editing = client || null;
    const d = client || {};
    this.form = this.fb.group({
      companyName:    [(d as any).companyName    || '', Validators.required],
      contactPerson:  [(d as any).contactPerson  || '', Validators.required],
      mobile:         [(d as any).mobile         || '', Validators.required],
      email:          [(d as any).email          || ''],
      gstNumber:      [(d as any).gstNumber      || ''],
      billingAddress: [(d as any).billingAddress || ''],
      paymentTerms:   [(d as any).paymentTerms   || 'Net 30'],
      creditDays:     [(d as any).creditDays     || 30],
      remarks:        [(d as any).remarks        || ''],
      status:         [(d as any).status         || 'Active'],
    });
    this.showForm = true;
  }

  save() {
    if (this.form.valid) {
      const val = { ...this.form.value, createdAt: (this.editing as any)?.createdAt || new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString().split('T')[0] };
      if (this.editing?.id) { this.data.updateClient({ ...this.editing, ...val }); this.snack.open('Client updated!', 'Close', { duration: 3000 }); }
      else { this.data.addClient({ ...val, id: this.data.generateId('c') }); this.snack.open('Client added!', 'Close', { duration: 3000 }); }
      this.showForm = false;
    }
  }
  deleteClient(c: Client) { this.deletingClient = c; }
  
  confirmDelete() {
    if (this.deletingClient) {
      this.data.deleteClient(this.deletingClient.id);
      this.snack.open('Client deleted successfully', 'Close', { duration: 3000 });
      this.deletingClient = null;
    }
  }
}
