import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MockDataService } from '../../core/services/mock-data.service';
import { Requirement, Client, MODEL_CATEGORIES } from '../../core/models';

const STATUS_COLORS: Record<string, string> = {
  'New': 'badge-info', 'Shortlisting': 'badge-warning', 'Quotation Sent': 'badge-primary',
  'Confirmed': 'badge-success', 'Cancelled': 'badge-danger'
};

@Component({
    selector: 'app-requirements',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule],
    template: `
<div class="page-container">
  <div class="page-header" style="display:flex;align-items:center;justify-content:space-between">
    <div><h1>Client Requirements</h1><p>{{ requirements.length }} requirements · {{ activeCount }} active</p></div>
    <button mat-raised-button color="primary" (click)="openForm()"><mat-icon>add</mat-icon> New Requirement</button>
  </div>

  <!-- Status Tabs -->
  <div class="status-tabs">
    <button *ngFor="let s of statuses" class="tab-btn" [class.active]="filterStatus===s" (click)="filterStatus=s;applyFilter()">
      {{ s }} <span class="tab-count">{{ countByStatus(s) }}</span>
    </button>
  </div>

  <div class="req-grid">
    <div class="req-card" *ngFor="let r of filtered">
      <div class="req-head">
        <div>
          <div class="req-project">{{ r.projectName }}</div>
          <div class="req-client">{{ r.clientName }}</div>
        </div>
        <span class="badge" [ngClass]="statusColor(r.status)">{{ r.status }}</span>
      </div>
      
      <div class="req-body">
        <div class="req-info"><mat-icon>calendar_today</mat-icon> {{ r.shootDate }}</div>
        <div class="req-info"><mat-icon>location_on</mat-icon> {{ r.shootLocation }}</div>
        <div class="req-info"><mat-icon>people</mat-icon> {{ r.modelsRequired }} models · {{ r.gender }}</div>
        <div class="req-info"><mat-icon>straighten</mat-icon> Age {{ r.ageMin }}-{{ r.ageMax }}y · Height {{ r.heightMin }}-{{ r.heightMax }}cm</div>
        <div class="req-info"><mat-icon>category</mat-icon> {{ r.category }}</div>
        <div class="req-info"><mat-icon>currency_rupee</mat-icon> Budget ₹{{ r.budget.toLocaleString() }}</div>
        <div *ngIf="r.additionalRequirements" class="req-notes">{{ r.additionalRequirements }}</div>
      </div>

      <div class="req-footer">
        <div style="display:flex;gap:6px">
          <button mat-stroked-button (click)="changeStatus(r,'Shortlisting')" *ngIf="r.status==='New'">Shortlist</button>
          <button mat-stroked-button (click)="changeStatus(r,'Quotation Sent')" *ngIf="r.status==='Shortlisting'">Send Quotation</button>
          <button mat-stroked-button (click)="changeStatus(r,'Confirmed')" *ngIf="r.status==='Quotation Sent'">Confirm</button>
        </div>
        
        <div style="display:flex;gap:4px">
          <button mat-icon-button (click)="openForm(r)"><mat-icon>edit</mat-icon></button>
          <button mat-icon-button color="warn" (click)="changeStatus(r,'Cancelled')"><mat-icon>cancel</mat-icon></button>
        </div>
      </div>
    </div>
  </div>

  <!-- Form Overlay -->
  <div class="dialog-overlay" *ngIf="showForm" (click)="showForm=false">
    <div class="inline-dialog" (click)="$event.stopPropagation()">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid var(--border)">
        <h3 style="margin:0;font-size:18px;font-weight:700">{{ editing?.id ? 'Edit Requirement' : 'New Requirement' }}</h3>
        <button mat-icon-button (click)="showForm=false"><mat-icon>close</mat-icon></button>
      </div>
      <form [formGroup]="form" (ngSubmit)="save()" style="padding:20px 24px">
        <div class="form-grid2">
          <mat-form-field appearance="outline">
            <mat-label>Client</mat-label>
            <mat-select formControlName="clientId" (selectionChange)="onClientChange($event.value)">
              <mat-option *ngFor="let c of clients" [value]="c.id">{{ c.companyName }}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Project Name</mat-label><input matInput formControlName="projectName"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Shoot Date</mat-label><input matInput type="date" formControlName="shootDate"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Shoot Location</mat-label><input matInput formControlName="shootLocation"></mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Gender</mat-label>
            <mat-select formControlName="gender"><mat-option value="Male">Male</mat-option><mat-option value="Female">Female</mat-option><mat-option value="Any">Any</mat-option></mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Category</mat-label>
            <mat-select formControlName="category">
              <mat-option *ngFor="let c of categories" [value]="c">{{ c }}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Min Age</mat-label><input matInput type="number" formControlName="ageMin"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Max Age</mat-label><input matInput type="number" formControlName="ageMax"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Min Height (cm)</mat-label><input matInput type="number" formControlName="heightMin"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Max Height (cm)</mat-label><input matInput type="number" formControlName="heightMax"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>No. of Models Required</mat-label><input matInput type="number" formControlName="modelsRequired"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Budget (₹)</mat-label><input matInput type="number" formControlName="budget"></mat-form-field>
          <mat-form-field appearance="outline" style="grid-column:1/-1"><mat-label>Additional Requirements</mat-label><textarea matInput formControlName="additionalRequirements" rows="2"></textarea></mat-form-field>
        </div>
        <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:8px">
          <button mat-stroked-button type="button" (click)="showForm=false">Cancel</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Save Requirement</button>
        </div>
      </form>
    </div>
  </div>
</div>
  `,
    styles: [`
    .status-tabs { display:flex; gap:8px; margin-bottom:24px; flex-wrap:wrap; }
    .tab-btn { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-full); padding:8px 16px; color:var(--text-secondary); font-size:13px; font-weight:500; cursor:pointer; display:flex; align-items:center; gap:6px; transition:all 0.2s; font-family:inherit;
      &.active { background:rgba(108,99,255,0.2); border-color:var(--color-primary); color:var(--color-primary); }
    }
    .tab-count { background:rgba(255,255,255,0.1); border-radius:var(--radius-full); padding:1px 7px; font-size:11px; font-weight:700; }
    .req-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(340px,1fr)); gap:20px; }
    .req-card { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-lg); overflow:hidden; transition:all var(--transition-normal); &:hover{border-color:rgba(108,99,255,0.3);transform:translateY(-2px);box-shadow:var(--shadow-lg)} }
    .req-head { display:flex; justify-content:space-between; align-items:flex-start; padding:16px 18px; border-bottom:1px solid var(--border); }
    .req-project { font-size:15px; font-weight:700; margin-bottom:4px; }
    .req-client { font-size:12px; color:var(--color-primary); font-weight:500; }
    .req-body { padding:14px 18px; display:flex; flex-direction:column; gap:8px; }
    .req-info { display:flex; align-items:center; gap:8px; font-size:12px; color:var(--text-secondary); mat-icon{font-size:14px;color:var(--text-muted);flex-shrink:0} }
    .req-notes { font-size:12px; color:var(--text-muted); background:rgba(255,255,255,0.03); border-radius:var(--radius-sm); padding:8px; margin-top:4px; border-left:2px solid var(--color-primary); }
    .req-footer { display:flex; justify-content:space-between; align-items:center; padding:12px 18px; border-top:1px solid var(--border); }
    .form-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
    .dialog-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:1000; display:flex; align-items:center; justify-content:center; }
    .inline-dialog { background:var(--bg-elevated); border:1px solid var(--border); border-radius:var(--radius-xl); width:680px; max-height:90vh; overflow-y:auto; }
  `]
})
export class RequirementsComponent implements OnInit {
  requirements: Requirement[] = []; filtered: Requirement[] = [];
  clients: Client[] = []; categories = MODEL_CATEGORIES;
  filterStatus = 'All'; showForm = false; editing: Requirement | null = null;
  form!: FormGroup;
  statuses = ['All', 'New', 'Shortlisting', 'Quotation Sent', 'Confirmed', 'Cancelled'];

  get activeCount() { return this.requirements.filter(r => !['Confirmed', 'Cancelled'].includes(r.status)).length; }
  countByStatus(s: string) { return s === 'All' ? this.requirements.length : this.requirements.filter(r => r.status === s).length; }
  statusColor(s: string) { return STATUS_COLORS[s] || 'badge-muted'; }

  constructor(private data: MockDataService, private fb: FormBuilder, private snack: MatSnackBar) { }

  ngOnInit() {
    this.data.getRequirements().subscribe(r => { this.requirements = r; this.applyFilter(); });
    this.data.getClients().subscribe(c => this.clients = c);
  }

  applyFilter() {
    this.filtered = this.filterStatus === 'All' ? [...this.requirements] : this.requirements.filter(r => r.status === this.filterStatus);
  }

  onClientChange(id: string) {
    const c = this.clients.find(x => x.id === id);
    if (c) this.form.patchValue({ clientName: c.companyName });
  }

  openForm(r?: Requirement) {
    this.editing = r || null;
    const d = r || {} as any;
    this.form = this.fb.group({
      clientId: [d.clientId || '', Validators.required],
      clientName: [d.clientName || ''],
      projectName: [d.projectName || '', Validators.required],
      shootDate: [d.shootDate || ''],
      shootLocation: [d.shootLocation || ''],
      gender: [d.gender || 'Any'],
      ageMin: [d.ageMin || 18],
      ageMax: [d.ageMax || 35],
      heightMin: [d.heightMin || 160],
      heightMax: [d.heightMax || 185],
      category: [d.category || 'Fashion'],
      modelsRequired: [d.modelsRequired || 1],
      budget: [d.budget || 10000],
      additionalRequirements: [d.additionalRequirements || ''],
    });
    this.showForm = true;
  }



  save() {
    if (this.form.valid) {
      const val = { ...this.form.value, status: this.editing?.status || 'New', createdAt: this.editing?.createdAt || new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString().split('T')[0] };
      if (this.editing?.id) { this.data.updateRequirement({ ...this.editing, ...val }); this.snack.open('Updated!', 'Close', { duration: 2000 }); }
      else { this.data.addRequirement({ ...val, id: this.data.generateId('r') }); this.snack.open('Requirement added!', 'Close', { duration: 2000 }); }
      this.showForm = false;
    }
  }


  changeStatus(r: Requirement, status: string) {
    this.data.updateRequirement({ ...r, status: status as any });
    this.snack.open(`Status changed to ${status}`, 'Close', { duration: 2000 });
  }
}
