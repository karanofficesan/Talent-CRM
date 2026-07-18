import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MockDataService } from '../../core/services/mock-data.service';
import { User } from '../../core/models';

@Component({
    selector: 'app-users',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule],
    template: `
<div class="page-container">
  <div class="page-header" style="display:flex;align-items:center;justify-content:space-between">
    <div><h1>User Management</h1><p>{{ users.length }} team members registered</p></div>
    <button mat-raised-button color="primary" (click)="openForm()"><mat-icon>person_add</mat-icon> Add User</button>
  </div>

  <div class="filter-bar" style="display:flex;gap:12px;margin-bottom:24px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:14px 16px">
    <div style="display:flex;align-items:center;gap:8px;flex:1;border:1px solid var(--border);border-radius:var(--radius-sm);padding:0 12px;height:38px;background:rgba(255,255,255,0.03)">
      <mat-icon style="color:var(--text-muted);font-size:18px">search</mat-icon>
      <input style="background:none;border:none;outline:none;color:var(--text-primary);font-size:14px;width:100%;font-family:inherit" placeholder="Search by Name or Email..." [(ngModel)]="search" (ngModelChange)="applyFilter()">
    </div>
    <select class="filter-select" [(ngModel)]="filterRole" (ngModelChange)="applyFilter()" style="background:var(--bg-elevated);border:1px solid var(--border);color:var(--text-primary);border-radius:var(--radius-sm);padding:7px 12px;font-size:13px;outline:none">
      <option value="All">All Roles</option>
      <option value="Super Admin">Super Admin</option>
      <option value="Admin">Admin</option>
      <option value="Talent Manager">Talent Manager</option>
      <option value="Finance">Finance</option>
      <option value="Viewer">Viewer</option>
    </select>
  </div>

  <div class="data-table-wrapper">
    <table class="u-table">
      <thead><tr>
        <th>User Details</th><th>Contact Info</th><th>Role</th>
        <th>Status</th><th>Last Login</th><th>Actions</th>
      </tr></thead>
      <tbody>
        @for (u of filtered; track u) {
          <tr>
            <td>
              <div style="display:flex;align-items:center;gap:12px">
                <div class="u-avatar">{{ u.avatar }}</div>
                <div>
                  <div style="font-weight:600;font-size:14px;color:var(--text-primary)">{{ u.name }}</div>
                  <div style="font-size:12px;color:var(--text-muted)">Joined: {{ u.createdAt }}</div>
                </div>
              </div>
            </td>
            <td>
              <div style="font-size:13px;font-weight:500">{{ u.email }}</div>
              <div style="font-size:12px;color:var(--text-muted)">{{ u.mobile }}</div>
            </td>
            <td>
              <span class="role-badge" [ngClass]="getRoleClass(u.role)">{{ u.role }}</span>
            </td>
            <td>
              <span class="badge" [ngClass]="u.status==='Active'?'badge-success':'badge-danger'">{{ u.status }}</span>
            </td>
            <td style="font-size:13px;color:var(--text-muted)">{{ u.lastLogin || 'Never' }}</td>
            <td>
              <div style="display:flex;gap:4px">
                <button mat-icon-button (click)="openForm(u)" matTooltip="Edit User"><mat-icon style="font-size:18px">edit</mat-icon></button>
                <button mat-icon-button color="warn" (click)="deleteUser(u)" matTooltip="Delete User"><mat-icon style="font-size:18px">delete</mat-icon></button>
              </div>
            </td>
          </tr>
        }
      </tbody>
    </table>
    @if (filtered.length===0) {
      <div style="text-align:center;padding:40px;color:var(--text-muted)">
        <mat-icon style="font-size:48px;opacity:0.3">group_off</mat-icon>
        <p style="margin-top:12px">No users found</p>
      </div>
    }
  </div>

  <!-- Form Dialog -->
  @if (showForm) {
    <div class="dialog-overlay" (click)="showForm=false">
      <div class="inline-dialog" (click)="$event.stopPropagation()" style="width:500px">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid var(--border)">
          <h3 style="font-size:18px;font-weight:700;margin:0">{{ editing?.id ? 'Edit User' : 'Add New User' }}</h3>
          <button mat-icon-button (click)="showForm=false"><mat-icon>close</mat-icon></button>
        </div>
        <form [formGroup]="form" (ngSubmit)="save()" style="padding:20px 24px">
          <div style="display:flex;flex-direction:column;gap:16px">
            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="name">
              @if (form.get('name')?.hasError('required')) {
                <mat-error>Name is required</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Email Address</mat-label>
              <input matInput type="email" formControlName="email">
              @if (form.get('email')?.hasError('required')) {
                <mat-error>Email is required</mat-error>
              }
              @if (form.get('email')?.hasError('email')) {
                <mat-error>Invalid email format</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Mobile Number</mat-label>
              <input matInput formControlName="mobile">
              @if (form.get('mobile')?.hasError('required')) {
                <mat-error>Mobile number is required</mat-error>
              }
            </mat-form-field>
            <div style="display:flex;gap:16px">
              <mat-form-field appearance="outline" style="flex:1">
                <mat-label>Role</mat-label>
                <mat-select formControlName="role">
                  <mat-option value="Super Admin">Super Admin</mat-option>
                  <mat-option value="Admin">Admin</mat-option>
                  <mat-option value="Talent Manager">Talent Manager</mat-option>
                  <mat-option value="Finance">Finance</mat-option>
                  <mat-option value="Viewer">Viewer</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" style="flex:1">
                <mat-label>Status</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="Active">Active</mat-option>
                  <mat-option value="Inactive">Inactive</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </div>
          <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:16px">
            <button mat-stroked-button type="button" (click)="showForm=false">Cancel</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Save User</button>
          </div>
        </form>
      </div>
    </div>
  }

  <!-- Delete Confirmation Dialog -->
  @if (deletingUser) {
    <div class="dialog-overlay" (click)="deletingUser=null">
      <div class="inline-dialog" (click)="$event.stopPropagation()" style="width:400px;text-align:center;padding:32px 24px">
        <div style="width:64px;height:64px;background:rgba(255,83,112,0.1);color:var(--color-danger);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">
          <mat-icon style="font-size:32px;width:32px;height:32px">person_remove</mat-icon>
        </div>
        <h3 style="font-size:20px;font-weight:700;margin:0 0 8px">Remove User?</h3>
        <p style="color:var(--text-muted);font-size:14px;margin:0 0 24px">
          Are you sure you want to permanently remove <strong>{{ deletingUser.name }}</strong>?<br>
          They will lose all access to the CRM.
        </p>
        <div style="display:flex;gap:12px;justify-content:center">
          <button mat-stroked-button (click)="deletingUser=null">Cancel</button>
          <button mat-raised-button color="warn" (click)="confirmDelete()">Remove User</button>
        </div>
      </div>
    </div>
  }

</div>
`,
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: [`
    .u-table { width:100%; border-collapse:collapse;
      th { padding:14px 16px; text-align:left; font-size:11px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; background:rgba(108,99,255,0.04); }
      td { padding:14px 16px; border-bottom:1px solid var(--border); font-size:13px; color:var(--text-secondary); }
      tr:hover td { background:rgba(108,99,255,0.02); }
    }
    .u-avatar { width:36px; height:36px; border-radius:50%; background:var(--gradient-primary); display:flex; align-items:center; justify-content:center; color:white; font-size:13px; font-weight:700; }
    .role-badge { padding:4px 10px; border-radius:4px; font-size:11px; font-weight:600; border:1px solid transparent; }
    .role-super { background:rgba(108,99,255,0.1); color:var(--color-primary); border-color:rgba(108,99,255,0.2); }
    .role-admin { background:rgba(0,180,216,0.1); color:var(--color-info); border-color:rgba(0,180,216,0.2); }
    .role-manager { background:rgba(0,212,170,0.1); color:var(--color-success); border-color:rgba(0,212,170,0.2); }
    .role-finance { background:rgba(255,181,71,0.1); color:var(--color-warning); border-color:rgba(255,181,71,0.2); }
    .role-viewer { background:rgba(255,255,255,0.05); color:var(--text-secondary); border-color:var(--border); }
    
    .dialog-overlay { position:fixed; inset:0; background:rgba(15,23,42,0.8); z-index:1000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); }
    .inline-dialog { background:var(--bg-elevated); border:1px solid var(--border); border-radius:var(--radius-xl); box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); }
  `]
})
export class UsersComponent implements OnInit {
  users: User[] = []; filtered: User[] = [];
  search = ''; filterRole = 'All'; 
  showForm = false; editing: User | null = null; deletingUser: User | null = null;
  form!: FormGroup;

  constructor(private data: MockDataService, private fb: FormBuilder, private snack: MatSnackBar) {}

  ngOnInit() {
    this.data.getUsers().subscribe(u => { this.users = u; this.applyFilter(); });
  }

  getRoleClass(role: string): string {
    if (role === 'Super Admin') return 'role-super';
    if (role === 'Admin') return 'role-admin';
    if (role === 'Talent Manager') return 'role-manager';
    if (role === 'Finance') return 'role-finance';
    return 'role-viewer';
  }

  applyFilter() {
    this.filtered = this.users.filter(u => 
      (this.filterRole === 'All' || u.role === this.filterRole) &&
      (!this.search || u.name.toLowerCase().includes(this.search.toLowerCase()) || u.email.toLowerCase().includes(this.search.toLowerCase()))
    );
  }

  openForm(user?: User) {
    this.editing = user || null;
    const d = user || {} as any;
    
    this.form = this.fb.group({
      name:   [d.name || '', Validators.required],
      email:  [d.email || '', [Validators.required, Validators.email]],
      mobile: [d.mobile || '', Validators.required],
      role:   [d.role || 'Viewer', Validators.required],
      status: [d.status || 'Active', Validators.required]
    });
    this.showForm = true;
  }

  save() {
    if (this.form.valid) {
      const v = this.form.value;
      const initials = v.name.split(' ').map((n:string)=>n[0]).join('').substring(0,2).toUpperCase();
      
      const payload: User = {
        ...this.editing,
        ...v,
        avatar: initials,
        lastLogin: this.editing?.lastLogin || '',
        createdAt: this.editing?.createdAt || new Date().toISOString().split('T')[0]
      };

      if (!this.editing?.id) {
        payload.id = this.data.generateId('u');
        this.data.addUser(payload);
        this.snack.open('User created successfully!', 'Close', { duration: 3000 });
      } else {
        this.data.updateUser(payload);
        this.snack.open('User updated!', 'Close', { duration: 3000 });
      }
      this.showForm = false;
    }
  }

  deleteUser(user: User) {
    this.deletingUser = user;
  }

  confirmDelete() {
    if (this.deletingUser) {
      this.data.deleteUser(this.deletingUser.id);
      this.snack.open('User removed successfully', 'Close', { duration: 3000 });
      this.deletingUser = null;
    }
  }
}
