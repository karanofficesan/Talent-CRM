import { Component, OnInit } from '@angular/core';

import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MockDataService } from '../../core/services/mock-data.service';
import { Model, MODEL_CATEGORIES, HAIR_COLORS, EYE_COLORS, SKIN_TONES, NATIONALITIES } from '../../core/models';
import { ModelFormDialogComponent } from './model-form-dialog.component';

@Component({
    selector: 'app-models-mgmt',
    imports: [
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatChipsModule,
    MatMenuModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatTooltipModule,
    MatSnackBarModule
],
    template: `
<div class="page-container">
  <!-- Header -->
  <div class="page-header" style="display:flex;align-items:center;justify-content:space-between">
    <div>
      <h1>Model Management</h1>
      <p>{{ filtered.length }} models · {{ activeCount }} active</p>
    </div>
    <button mat-raised-button color="primary" (click)="openForm()">
      <mat-icon>person_add</mat-icon> Add Model
    </button>
  </div>

  <!-- Filters -->
  <div class="filter-bar">
    <div class="search-input">
      <mat-icon>search</mat-icon>
      <input placeholder="Search by name, city, category..." [(ngModel)]="search" (ngModelChange)="applyFilter()">
    </div>
    <select class="filter-select" [(ngModel)]="filterGender" (ngModelChange)="applyFilter()">
      <option value="">All Genders</option>
      <option>Male</option><option>Female</option><option>Non-Binary</option>
    </select>
    <select class="filter-select" [(ngModel)]="filterCategory" (ngModelChange)="applyFilter()">
      <option value="">All Categories</option>
      @for (c of categories; track c) {
        <option>{{ c }}</option>
      }
    </select>
    <select class="filter-select" [(ngModel)]="filterStatus" (ngModelChange)="applyFilter()">
      <option value="">All Status</option>
      <option>Active</option><option>Inactive</option>
    </select>
    <div class="view-toggle">
      <button [class.active]="view==='grid'" (click)="view='grid'"><mat-icon>grid_view</mat-icon></button>
      <button [class.active]="view==='list'" (click)="view='list'"><mat-icon>view_list</mat-icon></button>
    </div>
  </div>

  <!-- Grid View -->
  @if (view==='grid') {
    <div class="model-grid">
      @for (m of filtered; track m) {
        <div class="model-card">
          <div class="model-cover">
            <img [src]="m.coverImage" [alt]="m.fullName" loading="lazy">
            <span class="model-status-badge" [class.active]="m.status==='Active'">{{ m.status }}</span>
            <div class="model-actions-overlay">
              <button mat-icon-button (click)="openView(m)" matTooltip="View"><mat-icon>visibility</mat-icon></button>
              <button mat-icon-button (click)="openForm(m)" matTooltip="Edit"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button (click)="deleteModel(m)" matTooltip="Delete" color="warn"><mat-icon>delete</mat-icon></button>
            </div>
          </div>
          <div class="model-info">
            <div class="model-name">{{ m.fullName }}</div>
            <div class="model-meta">{{ m.city }} · {{ m.age }}y · {{ m.height }}cm</div>
            <div class="model-cats">
              @for (c of m.categories.slice(0,2); track c) {
                <span class="badge badge-primary">{{ c }}</span>
              }
              @if (m.categories.length>2) {
                <span class="badge badge-muted">+{{ m.categories.length-2 }}</span>
              }
            </div>
            <div class="model-rate">₹{{ m.modelCharges.toLocaleString() }}/day</div>
          </div>
        </div>
      }
    </div>
  }

  <!-- List View -->
  @if (view==='list') {
    <div class="data-table-wrapper">
      <table class="model-table">
        <thead>
          <tr>
            <th>Model</th><th>Gender</th><th>City</th>
            <th>Height</th><th>Categories</th>
            <th>Charges/Day</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (m of filtered; track m) {
            <tr>
              <td>
                <div style="display:flex;align-items:center;gap:10px">
                  <img [src]="m.coverImage" style="width:36px;height:36px;border-radius:50%;object-fit:cover">
                  <div>
                    <div style="font-weight:600;font-size:13px">{{ m.fullName }}</div>
                    <div style="font-size:11px;color:var(--text-muted)">{{ m.experience }}y exp</div>
                  </div>
                </div>
              </td>
              <td>{{ m.gender }}</td>
              <td>{{ m.city }}</td>
              <td>{{ m.height }} cm</td>
              <td>
                @for (c of m.categories.slice(0,2); track c) {
                  <span class="badge badge-primary" style="margin-right:4px">{{ c }}</span>
                }
              </td>
              <td style="font-weight:600;color:var(--color-success)">₹{{ m.modelCharges.toLocaleString() }}</td>
              <td><span class="badge" [class.badge-success]="m.status==='Active'" [class.badge-muted]="m.status==='Inactive'">{{ m.status }}</span></td>
              <td>
                <div style="display:flex;gap:4px">
                  <button mat-icon-button (click)="openView(m)"><mat-icon style="font-size:18px">visibility</mat-icon></button>
                  <button mat-icon-button (click)="openForm(m)"><mat-icon style="font-size:18px">edit</mat-icon></button>
                  <button mat-icon-button color="warn" (click)="deleteModel(m)"><mat-icon style="font-size:18px">delete</mat-icon></button>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  }

  @if (filtered.length===0) {
    <div class="empty-state">
      <mat-icon>people_outline</mat-icon>
      <p>No models found</p>
      <button mat-raised-button color="primary" (click)="openForm()">Add First Model</button>
    </div>
  }
</div>
`,
    styles: [`
    .filter-bar {
      display:flex; gap:12px; align-items:center; flex-wrap:wrap;
      margin-bottom:24px;
      background:var(--bg-card); border:1px solid var(--border);
      border-radius:var(--radius-md); padding:14px 16px;
    }
    .search-input {
      display:flex; align-items:center; gap:8px; flex:1; min-width:200px;
      mat-icon { color:var(--text-muted); font-size:18px; }
      input { background:none; border:none; outline:none; color:var(--text-primary); font-size:14px; width:100%; font-family:inherit; &::placeholder{color:var(--text-muted)} }
    }
    .filter-select {
      background:var(--bg-elevated); border:1px solid var(--border);
      color:var(--text-primary); border-radius:var(--radius-sm);
      padding:7px 12px; font-size:13px; outline:none; cursor:pointer;
      font-family:inherit;
      &:focus { border-color:var(--color-primary); }
    }
    .view-toggle {
      display:flex; border:1px solid var(--border); border-radius:var(--radius-sm); overflow:hidden;
      button {
        background:none; border:none; color:var(--text-muted); padding:6px 10px;
        cursor:pointer; display:flex; align-items:center; transition:all 0.2s;
        mat-icon { font-size:18px; }
        &.active { background:rgba(108,99,255,0.2); color:var(--color-primary); }
      }
    }
    .model-grid {
      display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:20px;
    }
    .model-card {
      background:var(--bg-card); border:1px solid var(--border);
      border-radius:var(--radius-lg); overflow:hidden;
      transition:all var(--transition-normal);
      &:hover { border-color:rgba(108,99,255,0.3); transform:translateY(-4px); box-shadow:var(--shadow-lg); }
    }
    .model-cover {
      position:relative; height:260px; overflow:hidden;
      img { width:100%; height:100%; object-fit:cover; transition:transform 0.4s; }
      &:hover img { transform:scale(1.05); }
    }
    .model-status-badge {
      position:absolute; top:12px; left:12px;
      background:rgba(255,83,112,0.9); color:white;
      padding:3px 10px; border-radius:var(--radius-full);
      font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;
      &.active { background:rgba(0,212,170,0.9); }
    }
    .model-actions-overlay {
      position:absolute; bottom:0; left:0; right:0;
      background:linear-gradient(transparent,rgba(0,0,0,0.9));
      display:flex; justify-content:center; gap:8px; padding:30px 0 12px;
      opacity:0; transition:opacity var(--transition-fast);
      .model-cover:hover & { opacity:1; }
      button { color: white !important; background: rgba(255,255,255,0.1); border-radius: 50%; }
      button:hover { background: rgba(255,255,255,0.3); }
    }
    .model-info { padding:14px 16px; }
    .model-name { font-size:15px; font-weight:700; margin-bottom:4px; }
    .model-meta { font-size:12px; color:var(--text-muted); margin-bottom:8px; }
    .model-cats { display:flex; gap:4px; flex-wrap:wrap; margin-bottom:10px; }
    .model-rate { font-size:14px; font-weight:700; color:var(--color-success); }
    .model-table { width:100%; border-collapse:collapse;
      th { padding:12px 16px; text-align:left; font-size:12px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; background:rgba(108,99,255,0.08); }
      td { padding:12px 16px; border-bottom:1px solid var(--border); font-size:13px; }
      tr:hover td { background:rgba(108,99,255,0.04); }
    }
    .empty-state { text-align:center; padding:60px; color:var(--text-muted);
      mat-icon { font-size:56px; width:56px; height:56px; margin-bottom:16px; opacity:0.3; }
      p { font-size:16px; margin-bottom:20px; }
    }
  `]
})
export class ModelsMgmtComponent implements OnInit {
  models: Model[] = [];
  filtered: Model[] = [];
  search = ''; filterGender = ''; filterCategory = ''; filterStatus = '';
  view: 'grid'|'list' = 'grid';
  categories = MODEL_CATEGORIES;

  get activeCount() { return this.models.filter(m => m.status === 'Active').length; }

  constructor(private data: MockDataService, private dialog: MatDialog, private snack: MatSnackBar) {}

  ngOnInit() { this.data.getModels().subscribe(m => { this.models = m; this.applyFilter(); }); }

  applyFilter() {
    this.filtered = this.models.filter(m => {
      const s = this.search.toLowerCase();
      return (!s || m.fullName.toLowerCase().includes(s) || m.city.toLowerCase().includes(s) || m.categories.some(c => c.toLowerCase().includes(s)))
        && (!this.filterGender   || m.gender === this.filterGender)
        && (!this.filterCategory || m.categories.includes(this.filterCategory as any))
        && (!this.filterStatus   || m.status === this.filterStatus);
    });
  }

  openForm(model?: Model) {
    const ref = this.dialog.open(ModelFormDialogComponent, { data: model, width: '1000px', maxWidth: '100vw', maxHeight: '95vh' });
    ref.afterClosed().subscribe(result => {
      if (result) {
        if (result.id) { this.data.updateModel(result); this.snack.open('Model updated!', 'Close', { duration: 3000 }); }
        else { result.id = this.data.generateId('m'); this.data.addModel(result); this.snack.open('Model added!', 'Close', { duration: 3000 }); }
      }
    });
  }

  openView(model: Model) {
    this.dialog.open(ModelFormDialogComponent, { data: { ...model, viewOnly: true }, width: '1000px', maxWidth: '100vw', maxHeight: '95vh' });
  }

  deleteModel(m: Model) {
    if (confirm(`Delete ${m.fullName}?`)) {
      this.data.deleteModel(m.id);
      this.snack.open('Model deleted', 'Undo', { duration: 4000 });
    }
  }
}
