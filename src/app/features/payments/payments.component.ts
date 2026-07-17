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
import { Payment, Invoice } from '../../core/models';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule],
  template: `
<div class="page-container">
  <div class="page-header" style="display:flex;align-items:center;justify-content:space-between">
    <div><h1>Payments</h1><p>{{ payments.length }} transactions recorded</p></div>
    <button mat-raised-button color="primary" (click)="openForm()"><mat-icon>add</mat-icon> Record Payment</button>
  </div>

  <div class="filter-bar" style="display:flex;gap:12px;margin-bottom:24px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:14px 16px">
    <div style="display:flex;align-items:center;gap:8px;flex:1;border:1px solid var(--border);border-radius:var(--radius-sm);padding:0 12px;height:38px;background:rgba(255,255,255,0.03)">
      <mat-icon style="color:var(--text-muted);font-size:18px">search</mat-icon>
      <input style="background:none;border:none;outline:none;color:var(--text-primary);font-size:14px;width:100%;font-family:inherit" placeholder="Search by Client or Invoice..." [(ngModel)]="search" (ngModelChange)="applyFilter()">
    </div>
  </div>

  <div class="data-table-wrapper">
    <table class="p-table">
      <thead><tr>
        <th>Date</th><th>Client</th><th>Invoice Ref</th>
        <th>Amount</th><th>Method</th><th>Transaction ID</th>
        <th>Status</th><th>Actions</th>
      </tr></thead>
      <tbody>
        <tr *ngFor="let p of filtered">
          <td style="font-weight:500">{{ p.paymentDate }}</td>
          <td><div style="font-weight:600;font-size:13px">{{ p.clientName }}</div></td>
          <td><span style="font-size:12px;color:var(--color-primary);font-weight:600">{{ p.invoiceNumber }}</span></td>
          <td style="font-weight:700;color:var(--color-success)">₹{{ p.amount.toLocaleString() }}</td>
          <td>
            <div style="display:flex;align-items:center;gap:6px">
              <mat-icon style="font-size:16px;color:var(--text-muted)">
                {{ p.paymentMethod==='Bank Transfer' ? 'account_balance' : (p.paymentMethod==='Cash' ? 'payments' : 'credit_card') }}
              </mat-icon>
              {{ p.paymentMethod }}
            </div>
          </td>
          <td style="font-size:12px;color:var(--text-muted)">{{ p.transactionId || '-' }}</td>
          <td>
            <span class="badge" [ngClass]="p.status==='Received'?'badge-success':(p.status==='Failed'?'badge-danger':'badge-warning')">
              {{ p.status }}
            </span>
          </td>
          <td>
            <button mat-icon-button (click)="openForm(p)"><mat-icon style="font-size:18px">edit</mat-icon></button>
          </td>
        </tr>
      </tbody>
    </table>
    <div *ngIf="filtered.length===0" style="text-align:center;padding:40px;color:var(--text-muted)">
      <mat-icon style="font-size:48px;opacity:0.3">account_balance_wallet</mat-icon>
      <p style="margin-top:12px">No payments found</p>
    </div>
  </div>

  <!-- Inline Dialog -->
  <div class="dialog-overlay" *ngIf="showForm" (click)="showForm=false">
    <div class="inline-dialog" (click)="$event.stopPropagation()">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid var(--border)">
        <h3 style="font-size:18px;font-weight:700;margin:0">{{ editing?.id ? 'Edit Payment' : 'Record Payment' }}</h3>
        <button mat-icon-button (click)="showForm=false"><mat-icon>close</mat-icon></button>
      </div>
      <form [formGroup]="form" (ngSubmit)="save()" style="padding:20px 24px">
        <div class="form-grid2">
          
          <mat-form-field appearance="outline" style="grid-column:1/-1">
            <mat-label>Select Pending Invoice</mat-label>
            <mat-select formControlName="invoiceId" (selectionChange)="onInvoiceChange($event.value)">
              <mat-option *ngFor="let inv of pendingInvoices" [value]="inv.id">
                {{ inv.invoiceNumber }} - {{ inv.clientName }} (Due: ₹{{ (inv.totalAmount - inv.paidAmount).toLocaleString() }})
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Amount Received (₹)</mat-label>
            <input matInput type="number" formControlName="amount">
          </mat-form-field>
          
          <mat-form-field appearance="outline">
            <mat-label>Payment Date</mat-label>
            <input matInput type="date" formControlName="paymentDate">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Payment Method</mat-label>
            <mat-select formControlName="paymentMethod" (selectionChange)="onMethodChange($event.value)">
              <mat-option value="Razorpay">Razorpay</mat-option>
              <mat-option value="Stripe">Stripe</mat-option>
              <mat-option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</mat-option>
              <mat-option value="UPI">UPI</mat-option>
              <mat-option value="Cheque">Cheque</mat-option>
              <mat-option value="Cash">Cash</mat-option>
              <mat-option value="Other">Other (Specify)</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" *ngIf="showCustomMethod">
            <mat-label>Specify Payment Method</mat-label>
            <input matInput formControlName="customMethod" placeholder="e.g. PayPal">
          </mat-form-field>

          <mat-form-field appearance="outline" [style.grid-column]="showCustomMethod ? '1/-1' : 'auto'">
            <mat-label>Transaction / Reference ID</mat-label>
            <input matInput formControlName="transactionId">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option value="Received">Received</mat-option>
              <mat-option value="Pending">Pending</mat-option>
              <mat-option value="Failed">Failed</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" style="grid-column:1/-1">
            <mat-label>Notes</mat-label>
            <textarea matInput formControlName="notes" rows="2"></textarea>
          </mat-form-field>

        </div>
        <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:8px">
          <button mat-stroked-button type="button" (click)="showForm=false">Cancel</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Save Payment</button>
        </div>
      </form>
    </div>
  </div>
</div>
  `,
  styles: [`
    .p-table { width:100%; border-collapse:collapse;
      th { padding:14px 16px; text-align:left; font-size:11px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; background:rgba(108,99,255,0.04); }
      td { padding:14px 16px; border-bottom:1px solid var(--border); font-size:13px; color:var(--text-secondary); }
      tr:hover td { background:rgba(108,99,255,0.02); }
    }
    .form-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .dialog-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:1000; display:flex; align-items:center; justify-content:center; }
    .inline-dialog { background:var(--bg-elevated); border:1px solid var(--border); border-radius:var(--radius-xl); width:640px; max-height:90vh; overflow-y:auto; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); }
  `]
})
export class PaymentsComponent implements OnInit {
  payments: Payment[] = []; filtered: Payment[] = [];
  invoices: Invoice[] = []; pendingInvoices: Invoice[] = [];
  search = ''; showForm = false; editing: Payment | null = null;
  form!: FormGroup; showCustomMethod = false;

  constructor(private data: MockDataService, private fb: FormBuilder, private snack: MatSnackBar) {}

  ngOnInit() {
    this.data.getPayments().subscribe(p => { this.payments = p; this.applyFilter(); });
    this.data.getInvoices().subscribe(i => {
      this.invoices = i;
      this.pendingInvoices = i.filter(inv => inv.status === 'Pending' || inv.status === 'Partially Paid');
    });
  }

  applyFilter() {
    this.filtered = this.payments.filter(p =>
      !this.search || p.clientName.toLowerCase().includes(this.search.toLowerCase()) || p.invoiceNumber.toLowerCase().includes(this.search.toLowerCase())
    );
  }

  openForm(payment?: Payment) {
    this.editing = payment || null;
    const d = payment || {} as any;
    
    let methodValue = d.paymentMethod || 'Razorpay';
    this.showCustomMethod = false;
    if (payment && !['Razorpay','Stripe','Bank Transfer','UPI','Cheque','Cash'].includes(d.paymentMethod)) {
      methodValue = 'Other';
      this.showCustomMethod = true;
    }

    this.form = this.fb.group({
      invoiceId:     [d.invoiceId || '', Validators.required],
      amount:        [d.amount || 0, [Validators.required, Validators.min(1)]],
      paymentDate:   [d.paymentDate || new Date().toISOString().split('T')[0], Validators.required],
      paymentMethod: [methodValue, Validators.required],
      customMethod:  [methodValue === 'Other' ? d.paymentMethod : ''],
      transactionId: [d.transactionId || ''],
      status:        [d.status || 'Received'],
      notes:         [d.notes || '']
    });
    this.showForm = true;
  }

  onInvoiceChange(invId: string) {
    const inv = this.invoices.find(x => x.id === invId);
    if (inv && !this.editing) {
      this.form.patchValue({ amount: inv.totalAmount - inv.paidAmount });
    }
  }

  onMethodChange(val: string) {
    this.showCustomMethod = val === 'Other';
    if (!this.showCustomMethod) this.form.patchValue({ customMethod: '' });
  }

  save() {
    if (this.form.valid) {
      const v = this.form.value;
      const inv = this.invoices.find(x => x.id === v.invoiceId);
      
      const methodToSave = this.showCustomMethod ? v.customMethod : v.paymentMethod;

      const payload: Payment = {
        ...this.editing,
        ...v,
        paymentMethod: methodToSave,
        invoiceNumber: inv?.invoiceNumber || this.editing?.invoiceNumber,
        clientId: inv?.clientId || this.editing?.clientId,
        clientName: inv?.clientName || this.editing?.clientName,
        paymentLink: this.editing?.paymentLink || '',
        createdAt: this.editing?.createdAt || new Date().toISOString().split('T')[0]
      };

      if (this.editing?.id) {
        this.data.updatePayment(payload);
        this.snack.open('Payment updated!', 'Close', { duration: 3000 });
      } else {
        payload.id = this.data.generateId('p');
        this.data.addPayment(payload);
        
        // Update Invoice status if payment is received
        if (payload.status === 'Received' && inv) {
          const newPaid = inv.paidAmount + payload.amount;
          const newStatus = newPaid >= inv.totalAmount ? 'Paid' : 'Partially Paid';
          this.data.updateInvoice({ ...inv, paidAmount: newPaid, status: newStatus as any });
        }
        this.snack.open('Payment recorded successfully!', 'Close', { duration: 3000 });
      }
      this.showForm = false;
    }
  }
}
