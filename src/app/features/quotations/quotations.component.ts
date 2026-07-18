import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MockDataService } from '../../core/services/mock-data.service';
import { Quotation, Booking, Client, Model } from '../../core/models';

const Q_STATUS_COLOR: Record<string,string> = { 'Draft':'badge-muted','Sent':'badge-info','Approved':'badge-success','Not Approved':'badge-danger','Closed':'badge-primary' };

@Component({
    selector: 'app-quotations',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatButtonModule, MatSnackBarModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule, MatMenuModule, MatDividerModule],
    template: `
<div class="page-container">
  <div class="page-header" style="display:flex;align-items:center;justify-content:space-between">
    <div><h1>Quotation Management</h1><p>{{ quotations.length }} quotations total</p></div>
    <button mat-raised-button color="primary" (click)="createNew()"><mat-icon>add</mat-icon> New Quotation</button>
  </div>

  <div class="status-tabs" style="display:flex;gap:8px;margin-bottom:24px;flex-wrap:wrap">
    @for (s of statuses; track s) {
      <button class="tab-btn" [class.active]="filterStatus===s" (click)="filterStatus=s;applyFilter()" style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-full);padding:8px 16px;color:var(--text-secondary);font-size:13px;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:6px;transition:all 0.2s;font-family:inherit">
        {{ s }} <span style="background:rgba(255,255,255,0.1);border-radius:var(--radius-full);padding:1px 7px;font-size:11px">{{ countByStatus(s) }}</span>
      </button>
    }
  </div>

  <div class="data-table-wrapper">
    <table class="q-table">
      <thead><tr>
        <th style="width:50px;text-align:center;white-space:nowrap">Sr No</th>
        <th>Quotation Info</th><th>Client</th><th>Models Selected</th>
        <th>Financials</th><th>Status</th><th>Actions</th>
      </tr></thead>
      <tbody>
        @for (q of filtered; track q; let i = $index) {
          <tr>
            <td style="text-align:center;font-weight:600;color:var(--text-muted)">{{ i + 1 }}</td>
            <td>
              <div style="font-weight:700;font-size:14px;color:var(--color-primary)">{{ q.quotationNumber }}</div>
              <div style="font-weight:600;font-size:13px">{{ q.projectName }}</div>
              <div style="font-size:11px;color:var(--text-muted)">Valid until {{ q.validUntil }}</div>
            </td>
            <td>
              <div style="font-weight:500;font-size:13px"><mat-icon style="font-size:13px;vertical-align:middle;color:var(--text-muted)">business</mat-icon> {{ q.clientName }}</div>
            </td>
            <td>
              <div class="model-avatars">
                @for (m of q.models.slice(0,3); track m) {
                  <img [src]="m.coverImage" class="model-thumb" [title]="m.modelName">
                }
                @if (q.models.length>3) {
                  <span class="model-more">+{{ q.models.length-3 }}</span>
                }
              </div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:4px">{{ q.models.length }} model(s)</div>
            </td>
            <td>
              <div style="font-size:13px"><span style="color:var(--text-muted)">Price:</span> <span style="font-weight:700">₹{{ q.totalSellingPrice.toLocaleString() }}</span></div>
              <div style="font-size:13px"><span style="color:var(--text-muted)">Profit:</span> <span style="font-weight:700;color:var(--color-success)">₹{{ q.grossProfit.toLocaleString() }}</span></div>
            </td>
            <td>
              <div style="display:flex;flex-direction:column;align-items:flex-start;gap:6px">
                <span class="badge" [ngClass]="statusColor(q.status)">{{ q.status }}</span>
                @if (q.modelAgreementSigned) {
                  <span class="badge badge-success" style="font-size:10px;padding:2px 6px;display:flex;align-items:center;gap:2px"><mat-icon style="font-size:10px;width:10px;height:10px">check</mat-icon> Agreement</span>
                }
              </div>
            </td>
            <td>
              <div style="display:flex;gap:4px;flex-wrap:wrap">
                <button mat-icon-button (click)="viewQuotation(q)" matTooltip="View Details"><mat-icon style="font-size:18px">visibility</mat-icon></button>
                <button mat-icon-button [matMenuTriggerFor]="actionMenu" matTooltip="More Actions"><mat-icon style="font-size:18px">more_vert</mat-icon></button>
                <mat-menu #actionMenu="matMenu">
                  @if (q.status==='Draft') {
                    <button mat-menu-item (click)="changeStatus(q,'Sent')"><mat-icon>send</mat-icon> Send Quotation</button>
                  }
                  @if (q.status==='Sent') {
                    <button mat-menu-item (click)="changeStatus(q,'Approved')"><mat-icon color="primary">thumb_up</mat-icon> Approve</button>
                  }
                  @if (q.status==='Sent') {
                    <button mat-menu-item (click)="changeStatus(q,'Not Approved')"><mat-icon color="warn">thumb_down</mat-icon> Reject</button>
                  }
                  @if (q.status==='Approved') {
                    <button mat-menu-item (click)="convertToBooking(q)"><mat-icon>event_available</mat-icon> Convert to Booking</button>
                  }
                  <mat-divider></mat-divider>
                  <button mat-menu-item (click)="deleteQuotation(q)"><mat-icon color="warn">delete</mat-icon> Delete</button>
                </mat-menu>
              </div>
            </td>
          </tr>
        }
      </tbody>
    </table>

    @if (filtered.length===0) {
      <div style="text-align:center;padding:60px;color:var(--text-muted)">
        <mat-icon style="font-size:56px;width:56px;height:56px;opacity:0.3;margin-bottom:12px">request_quote</mat-icon>
        <p>No quotations found</p>
      </div>
    }
  </div>

  <!-- View Modal -->
  @if (viewingQ) {
    <div class="dialog-overlay" (click)="viewingQ=null">
      <div class="inline-dialog" (click)="$event.stopPropagation()" style="width:700px;max-height:90vh;overflow-y:auto">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid var(--border)">
          <div>
            <h3 style="margin:0;font-weight:700">{{ viewingQ.quotationNumber }}</h3>
            <div style="font-size:12px;color:var(--text-muted)">{{ viewingQ.projectName }} · {{ viewingQ.clientName }}</div>
          </div>
          <button mat-icon-button (click)="viewingQ=null"><mat-icon>close</mat-icon></button>
        </div>
        <div style="padding:20px 24px">
          <h4 style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px">Selected Models (Client View)</h4>
          <div class="qmodel-list">
            @for (m of viewingQ.models; track m) {
              <div class="qmodel-item">
                <img [src]="m.coverImage" class="qmodel-img">
                <div class="qmodel-info">
                  <div style="font-weight:700;font-size:14px">{{ m.modelName }}</div>
                  <div style="font-size:12px;color:var(--text-muted)">{{ m.height }}cm · {{ m.age }}y · {{ m.experience }}y exp</div>
                  <div style="font-size:12px;margin-top:4px">
                    @for (c of m.categories; track c) {
                      <span class="badge badge-primary">{{ c }}</span>
                    }
                  </div>
                </div>
                <div style="text-align:right">
                  <div style="font-weight:700;font-size:15px;color:var(--color-success)">₹{{ m.sellingPrice.toLocaleString() }}</div>
                  <div style="font-size:10px;color:var(--text-muted)">Selling Price</div>
                </div>
              </div>
            }
          </div>
          <div class="q-summary">
            <div class="sum-row"><span>Total Amount</span><span style="font-weight:800;font-size:18px;color:var(--color-primary)">₹{{ viewingQ.totalSellingPrice.toLocaleString() }}</span></div>
            <div class="sum-row" style="margin-top:8px"><span>Terms & Conditions</span></div>
            <div style="font-size:13px;color:var(--text-muted);margin-top:6px;padding:10px;background:rgba(255,255,255,0.03);border-radius:var(--radius-sm)">{{ viewingQ.termsAndConditions }}</div>
          </div>
        </div>
      </div>
    </div>
  }

  <!-- Delete Confirmation Dialog -->
  @if (deletingQ) {
    <div class="dialog-overlay" (click)="deletingQ=null">
      <div class="inline-dialog" (click)="$event.stopPropagation()" style="width:400px;text-align:center;padding:32px 24px">
        <div style="width:64px;height:64px;background:rgba(255,83,112,0.1);color:var(--color-danger);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">
          <mat-icon style="font-size:32px;width:32px;height:32px">request_quote</mat-icon>
        </div>
        <h3 style="font-size:20px;font-weight:700;margin:0 0 8px">Delete Quotation?</h3>
        <p style="color:var(--text-muted);font-size:14px;margin:0 0 24px">
          Are you sure you want to permanently delete quotation <strong>{{ deletingQ.quotationNumber }}</strong>?<br>
          This action cannot be undone.
        </p>
        <div style="display:flex;gap:12px;justify-content:center">
          <button mat-stroked-button (click)="deletingQ=null">Cancel</button>
          <button mat-raised-button color="warn" (click)="confirmDelete()">Delete</button>
        </div>
      </div>
    </div>
  }
</div>

<!-- Create Quotation Form Dialog -->
@if (showForm) {
  <div class="dialog-overlay" (click)="showForm=false">
    <div class="inline-dialog" (click)="$event.stopPropagation()" style="width:700px;max-height:90vh;overflow-y:auto">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid var(--border)">
        <div>
          <h3 style="font-size:18px;font-weight:700;margin:0">New Quotation</h3>
          <p style="font-size:12px;color:var(--text-muted);margin:4px 0 0">Fill details to create a draft quotation</p>
        </div>
        <button mat-icon-button (click)="showForm=false"><mat-icon>close</mat-icon></button>
      </div>
      <form [formGroup]="form" (ngSubmit)="saveQuotation()" style="padding:20px 24px">
        <!-- Section: Client Info -->
        <div class="form-section-title">Client & Project Details</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:4px">
          <!-- Client: Dropdown or Custom -->
          <div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
              <label class="field-label">Client *</label>
              <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-muted);cursor:pointer">
                <input type="checkbox" [(ngModel)]="isCustomClient" [ngModelOptions]="{standalone:true}" (change)="onCustomClientToggle()" style="accent-color:var(--color-primary)">
                Not in list? Enter manually
              </label>
            </div>
            <!-- Dropdown -->
            @if (!isCustomClient) {
              <mat-form-field appearance="outline" style="width:100%">
                <mat-select formControlName="clientId" (selectionChange)="onClientChange($event.value)">
                  <mat-option value="">-- Select Client --</mat-option>
                  @for (c of clients; track c) {
                    <mat-option [value]="c.id">{{ c.companyName }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            }
            <!-- Manual input -->
            @if (isCustomClient) {
              <mat-form-field appearance="outline" style="width:100%">
                <mat-label>Client Name</mat-label>
                <input matInput formControlName="customClientName" placeholder="e.g. XYZ Fashion Pvt Ltd">
                <mat-icon matSuffix>business</mat-icon>
              </mat-form-field>
            }
          </div>
          <div>
            <label class="field-label">Project Name *</label>
            <mat-form-field appearance="outline" style="width:100%">
              <input matInput formControlName="projectName" placeholder="e.g. Summer Campaign 2026">
              <mat-icon matSuffix>movie</mat-icon>
            </mat-form-field>
          </div>
          <div>
            <label class="field-label">Valid Until *</label>
            <mat-form-field appearance="outline" style="width:100%">
              <input matInput type="date" formControlName="validUntil">
              <mat-icon matSuffix>event</mat-icon>
            </mat-form-field>
          </div>
          <div>
            <label class="field-label">Shoot Location</label>
            <mat-form-field appearance="outline" style="width:100%">
              <input matInput formControlName="venue" placeholder="e.g. Mumbai Studio">
              <mat-icon matSuffix>location_on</mat-icon>
            </mat-form-field>
          </div>
        </div>
        <!-- Section: Models -->
        <div class="form-section-title" style="margin-top:8px">
          Select Models
          <span style="font-size:11px;font-weight:400;color:var(--text-muted);margin-left:8px">{{ selectedModelIds.length }} selected</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;max-height:200px;overflow-y:auto;padding:4px 2px;margin-bottom:16px">
          @for (m of models; track m) {
            <div
              (click)="toggleModel(m)"
              [class.model-sel-active]="isSelected(m.id)"
              class="model-sel-card">
              <img [src]="m.coverImage || 'https://ui-avatars.com/api/?name='+m.fullName+'&background=6c63ff&color=fff&size=80'" class="model-sel-img">
              <div style="font-size:11px;font-weight:600;margin-top:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ m.fullName }}</div>
              <div style="font-size:10px;color:var(--text-muted)">₹{{ (m.modelCharges || 0).toLocaleString() }}/day</div>
              @if (isSelected(m.id)) {
                <mat-icon class="sel-check">check_circle</mat-icon>
              }
            </div>
          }
          @if (models.length===0) {
            <div style="grid-column:1/-1;text-align:center;padding:20px;color:var(--text-muted);font-size:13px">
              <mat-icon>person_off</mat-icon><p>No active models found</p>
            </div>
          }
        </div>
        <!-- Financial Summary Bar -->
        <div style="background:linear-gradient(135deg,rgba(108,99,255,0.08),rgba(0,212,170,0.05));border:1px solid rgba(108,99,255,0.2);border-radius:var(--radius-md);padding:14px 20px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
          <div style="text-align:center">
            <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Models</div>
            <div style="font-size:18px;font-weight:800">{{ selectedModelIds.length }}</div>
          </div>
          <div style="text-align:center">
            <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Total Selling Price</div>
            <div style="font-size:20px;font-weight:800;color:var(--color-primary)">₹{{ totalSelling.toLocaleString() }}</div>
          </div>
          <div style="text-align:center">
            <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Model Cost</div>
            <div style="font-size:16px;font-weight:700;color:var(--color-danger)">₹{{ totalCost.toLocaleString() }}</div>
          </div>
          <div style="text-align:center">
            <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Gross Profit</div>
            <div style="font-size:16px;font-weight:700;color:var(--color-success)">₹{{ (totalSelling - totalCost).toLocaleString() }}</div>
          </div>
        </div>
        <!-- Terms & Notes -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div>
            <label class="field-label">Terms & Conditions</label>
            <mat-form-field appearance="outline" style="width:100%">
              <textarea matInput formControlName="termsAndConditions" rows="3"></textarea>
            </mat-form-field>
          </div>
          <div>
            <label class="field-label">Internal Notes</label>
            <mat-form-field appearance="outline" style="width:100%">
              <textarea matInput formControlName="notes" rows="3" placeholder="For internal use only..."></textarea>
            </mat-form-field>
          </div>
        </div>
        <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:4px;padding-top:16px;border-top:1px solid var(--border)">
          <button mat-stroked-button type="button" (click)="showForm=false">Cancel</button>
          <button mat-raised-button color="primary" type="submit"
            [disabled]="(isCustomClient ? !form.get('customClientName')?.value : !form.get('clientId')?.value) || !form.get('projectName')?.value || selectedModelIds.length===0">
            <mat-icon>save</mat-icon> Create Quotation
          </button>
        </div>
      </form>
    </div>
  </div>
}
`,
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: [`
    .tab-btn.active { background:rgba(108,99,255,0.2)!important; border-color:var(--color-primary)!important; color:var(--color-primary)!important; }
    .q-table { width:100%; border-collapse:collapse;
      th { padding:14px 16px; text-align:left; font-size:11px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; background:rgba(108,99,255,0.04); }
      td { padding:14px 16px; border-bottom:1px solid var(--border); font-size:13px; color:var(--text-secondary); vertical-align:top; }
      tr:hover td { background:rgba(108,99,255,0.02); }
    }
    .model-avatars { display:flex; align-items:center; }
    .model-thumb { width:32px; height:32px; border-radius:50%; object-fit:cover; border:2px solid var(--bg-card); margin-left:-8px; &:first-child{margin-left:0} }
    .model-more { width:32px; height:32px; border-radius:50%; background:rgba(108,99,255,0.2); display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; color:var(--color-primary); margin-left:-8px; border:2px solid var(--bg-card); }
    .qmodel-list { display:flex; flex-direction:column; gap:12px; margin-bottom:20px; }
    .qmodel-item { display:flex; gap:14px; align-items:center; padding:12px; background:rgba(255,255,255,0.03); border-radius:var(--radius-md); border:1px solid var(--border); }
    .qmodel-img { width:56px; height:72px; object-fit:cover; border-radius:var(--radius-sm); flex-shrink:0; }
    .qmodel-info { flex:1; }
    .q-summary { background:rgba(108,99,255,0.06); border:1px solid rgba(108,99,255,0.2); border-radius:var(--radius-md); padding:16px; }
    .sum-row { display:flex; justify-content:space-between; align-items:center; }
    .dialog-overlay { position:fixed; inset:0; background:rgba(15,23,42,0.8); z-index:1000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); }
    .inline-dialog { background:var(--bg-elevated); border:1px solid var(--border); border-radius:var(--radius-xl); }
    .model-sel-card { border:2px solid var(--border); border-radius:var(--radius-md); padding:10px; cursor:pointer; position:relative; text-align:center; transition:all 0.2s; background:var(--bg-card); &:hover{border-color:var(--color-primary);} }
    .model-sel-active { border-color:var(--color-primary)!important; background:rgba(108,99,255,0.08)!important; }
    .model-sel-img { width:60px; height:70px; object-fit:cover; border-radius:var(--radius-sm); }
    .sel-check { position:absolute; top:6px; right:6px; color:var(--color-primary); font-size:18px!important; width:18px!important; height:18px!important; }
    .form-section-title { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:var(--text-muted); border-bottom:1px solid var(--border); padding-bottom:8px; margin-bottom:14px; display:flex; align-items:center; gap:8px; }
    .field-label { font-size:12px; font-weight:600; color:var(--text-secondary); display:block; margin-bottom:4px; }
  `]
})
export class QuotationsComponent implements OnInit {
  quotations: Quotation[] = []; filtered: Quotation[] = [];
  filterStatus = 'All'; viewingQ: Quotation | null = null; deletingQ: Quotation | null = null;
  statuses = ['All', 'Draft', 'Sent', 'Approved', 'Not Approved', 'Closed'];
  clients: Client[] = []; models: Model[] = [];
  showForm = false; form!: FormGroup;
  selectedModelIds: string[] = [];
  selectedModels: any[] = [];
  totalSelling = 0; totalCost = 0;
  isCustomClient = false;

  countByStatus(s: string) { return s === 'All' ? this.quotations.length : this.quotations.filter(q => q.status === s).length; }
  statusColor(s: string) { return Q_STATUS_COLOR[s] || 'badge-muted'; }

  constructor(private data: MockDataService, private fb: FormBuilder, private snack: MatSnackBar) {}

  ngOnInit() {
    this.data.getQuotations().subscribe(q => { this.quotations = q; this.applyFilter(); });
    this.data.getClients().subscribe(c => this.clients = c);
    this.data.getModels().subscribe(m => this.models = m);
  }

  applyFilter() {
    this.filtered = this.filterStatus === 'All' ? [...this.quotations] : this.quotations.filter(q => q.status === this.filterStatus);
  }

  changeStatus(q: Quotation, status: string) {
    this.data.updateQuotation({ ...q, status: status as any });
    this.snack.open(`Quotation ${status}`, 'Close', { duration: 2000 });
  }

  viewQuotation(q: Quotation) { this.viewingQ = q; }

  createNew() {
    this.selectedModelIds = [];
    this.selectedModels = [];
    this.totalSelling = 0;
    this.totalCost = 0;
    this.form = this.fb.group({
      clientId:          [''],
      customClientName:  [''],
      projectName:       ['', Validators.required],
      validUntil:        [new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], Validators.required],
      venue:             [''],
      termsAndConditions:['50% advance required. Balance on delivery.'],
      notes:             ['']
    });
    this.isCustomClient = false;
    this.showForm = true;
  }

  onClientChange(clientId: string) {
    const c = this.clients.find(x => x.id === clientId);
    if (c) this.form.patchValue({ termsAndConditions: c.paymentTerms ? `Payment Terms: ${c.paymentTerms}. Credit Days: ${c.creditDays}.` : '50% advance required.' });
  }

  onCustomClientToggle() {
    if (this.isCustomClient) {
      this.form.patchValue({ clientId: '' });
    } else {
      this.form.patchValue({ customClientName: '' });
    }
  }

  isSelected(id: string) { return this.selectedModelIds.includes(id); }

  toggleModel(m: Model) {
    if (this.isSelected(m.id)) {
      this.selectedModelIds = this.selectedModelIds.filter(x => x !== m.id);
      this.selectedModels   = this.selectedModels.filter(x => x.id !== m.id);
    } else {
      this.selectedModelIds.push(m.id);
      this.selectedModels.push(m);
    }
    this.totalSelling = this.selectedModels.reduce((s, x) => s + (x.modelCharges || 0), 0);
    this.totalCost    = this.selectedModels.reduce((s, x) => s + (x.modelCharges || 0), 0);
  }

  saveQuotation() {
    if (this.selectedModelIds.length === 0) return;
    const v = this.form.value;
    // Resolve client name
    let clientId = v.clientId || '';
    let clientName = '';
    if (this.isCustomClient) {
      clientName = v.customClientName || 'Unknown Client';
      clientId = '';
    } else {
      const client = this.clients.find(c => c.id === clientId);
      clientName = client?.companyName || '';
    }
    const qModels: any[] = this.selectedModels.map(m => ({
      modelId: m.id, modelName: m.fullName,
      coverImage: m.coverImage || `https://ui-avatars.com/api/?name=${m.fullName}&background=6c63ff&color=fff&size=80`,
      height: m.height || 0, age: m.age || 0, experience: m.experience || 0,
      categories: m.categories || [],
      instagramLink: m.instagramLink || '',
      sellingPrice: m.modelCharges || 0,
      modelCharges: m.modelCharges || 0
    }));
    const newQ: Quotation = {
      id: this.data.generateId('q'), quotationNumber: this.data.generateQuotationNumber(),
      clientId: clientId, clientName: clientName,
      requirementId: '', projectName: v.projectName,
      models: qModels,
      termsAndConditions: v.termsAndConditions, notes: v.notes,
      totalSellingPrice: this.totalSelling,
      totalModelCharges: this.totalCost,
      grossProfit: this.totalSelling - this.totalCost,
      status: 'Draft', modelAgreementSigned: false,
      validUntil: v.validUntil,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    this.data.addQuotation(newQ);
    this.snack.open(`Quotation ${newQ.quotationNumber} created!`, 'Close', { duration: 3000 });
    this.showForm = false;
  }

  convertToBooking(q: Quotation) {
    const booking: Booking = {
      id: this.data.generateId('b'), bookingNumber: this.data.generateBookingNumber(),
      clientId: q.clientId, clientName: q.clientName,
      quotationId: q.id, projectName: q.projectName,
      selectedModels: q.models, shootDate: '', shootTime: '09:00',
      venue: '', coordinator: '', sellingPrice: q.totalSellingPrice,
      notes: '', status: 'Confirmed',
      createdAt: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString().split('T')[0]
    };
    this.data.addBooking(booking);
    this.data.updateQuotation({ ...q, status: 'Closed' });
    this.snack.open('Booking created! Quotation closed.', 'Close', { duration: 4000 });
  }

  deleteQuotation(q: Quotation) { this.deletingQ = q; }

  confirmDelete() {
    if (this.deletingQ) {
      this.data.deleteQuotation(this.deletingQ.id);
      this.snack.open('Quotation deleted successfully', 'Close', { duration: 3000 });
      this.deletingQ = null;
    }
  }
}
