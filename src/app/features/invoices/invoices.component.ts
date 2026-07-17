import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MockDataService } from '../../core/services/mock-data.service';
import { Invoice, Client, Booking } from '../../core/models';
import jsPDF from 'jspdf';

@Component({
    selector: 'app-invoices',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule, MatTooltipModule],
    template: `
<div class="page-container">
  <div class="page-header" style="display:flex;align-items:center;justify-content:space-between">
    <div><h1>Invoices</h1><p>{{ invoices.length }} total invoices</p></div>
    <button mat-raised-button color="primary" (click)="openForm()"><mat-icon>add</mat-icon> Create Invoice</button>
  </div>

  <div class="filter-bar" style="display:flex;gap:12px;margin-bottom:24px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:14px 16px">
    <div style="display:flex;align-items:center;gap:8px;flex:1;border:1px solid var(--border);border-radius:var(--radius-sm);padding:0 12px;height:38px;background:rgba(255,255,255,0.03)">
      <mat-icon style="color:var(--text-muted);font-size:18px">search</mat-icon>
      <input style="background:none;border:none;outline:none;color:var(--text-primary);font-size:14px;width:100%;font-family:inherit" placeholder="Search by Invoice # or Client..." [(ngModel)]="search" (ngModelChange)="applyFilter()">
    </div>
    <select class="filter-select" [(ngModel)]="filterStatus" (ngModelChange)="applyFilter()" style="background:var(--bg-elevated);border:1px solid var(--border);color:var(--text-primary);border-radius:var(--radius-sm);padding:7px 12px;font-size:13px;outline:none">
      <option value="All">All Status</option><option value="Pending">Pending</option><option value="Partially Paid">Partially Paid</option><option value="Paid">Paid</option><option value="Overdue">Overdue</option>
    </select>
  </div>

  <div class="data-table-wrapper">
    <table class="inv-table">
      <thead><tr>
        <th>Invoice #</th><th>Date / Due</th><th>Client</th><th>Booking Ref</th>
        <th>Total Amount</th><th>Balance Due</th><th>Status</th><th>Actions</th>
      </tr></thead>
      <tbody>
        <tr *ngFor="let i of filtered">
          <td><span style="font-weight:700;color:var(--color-primary)">{{ i.invoiceNumber }}</span></td>
          <td>
            <div style="font-weight:500;font-size:12px">{{ i.createdAt }}</div>
            <div style="font-size:11px;color:var(--text-muted)">Due: {{ i.dueDate }}</div>
          </td>
          <td><div style="font-weight:600;font-size:13px">{{ i.clientName }}</div></td>
          <td style="font-size:12px;color:var(--text-secondary)">{{ i.bookingNumber || '-' }}</td>
          <td style="font-weight:700">₹{{ i.totalAmount.toLocaleString() }}</td>
          <td style="font-weight:700;color:var(--color-danger)">₹{{ (i.totalAmount - i.paidAmount).toLocaleString() }}</td>
          <td>
            <span class="badge" 
              [ngClass]="i.status==='Paid'?'badge-success':(i.status==='Pending'?'badge-warning':(i.status==='Overdue'?'badge-danger':'badge-info'))">
              {{ i.status }}
            </span>
          </td>
          <td>
            <div style="display:flex;gap:4px;align-items:center">
              <button mat-icon-button (click)="openView(i)" matTooltip="View Invoice"><mat-icon style="font-size:18px">visibility</mat-icon></button>
              <button mat-icon-button (click)="downloadPDF(i)" matTooltip="Download PDF"
                style="background:rgba(220,38,38,0.1);color:#DC2626;border-radius:8px">
                <mat-icon style="font-size:20px;width:20px;height:20px">picture_as_pdf</mat-icon>
              </button>
              <button mat-icon-button (click)="openForm(i)" matTooltip="Edit Invoice"><mat-icon style="font-size:18px">edit</mat-icon></button>
              <button mat-icon-button color="warn" (click)="deleteInvoice(i)" matTooltip="Delete Invoice"><mat-icon style="font-size:18px">delete</mat-icon></button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div *ngIf="filtered.length===0" style="text-align:center;padding:40px;color:var(--text-muted)">
      <mat-icon style="font-size:48px;opacity:0.3">receipt_long</mat-icon>
      <p style="margin-top:12px">No invoices found</p>
    </div>
  </div>

  <!-- Form Dialog -->
  <div class="dialog-overlay" *ngIf="showForm" (click)="showForm=false">
    <div class="inline-dialog" (click)="$event.stopPropagation()">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid var(--border)">
        <h3 style="font-size:18px;font-weight:700;margin:0">{{ editing?.id ? 'Edit Invoice' : 'Create Invoice' }}</h3>
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

          <mat-form-field appearance="outline">
            <mat-label>Link Booking (Optional)</mat-label>
            <mat-select formControlName="bookingId" (selectionChange)="onBookingChange($event.value)">
              <mat-option value="">-- None --</mat-option>
              <mat-option *ngFor="let b of clientBookings" [value]="b.id">{{ b.bookingNumber }} - {{ b.projectName }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Project Name</mat-label>
            <input matInput formControlName="projectName">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Due Date</mat-label>
            <input matInput type="date" formControlName="dueDate">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Base Amount (₹)</mat-label>
            <input matInput type="number" formControlName="amount" (input)="calcTotal()">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>GST %</mat-label>
            <input matInput type="number" formControlName="gstPercent" (input)="calcTotal()">
          </mat-form-field>

          <div style="grid-column:1/-1; background:#F8FAFC; border:1px solid var(--border); border-radius:var(--radius-md); padding:16px; display:flex; justify-content:space-between; align-items:center">
            <div>
              <div style="font-size:12px;color:var(--text-muted)">GST Amount</div>
              <div style="font-size:14px;font-weight:600">₹{{ calculatedGst.toLocaleString() }}</div>
            </div>
            <div style="text-align:right">
              <div style="font-size:12px;color:var(--text-muted)">Total Invoice Value</div>
              <div style="font-size:20px;font-weight:800;color:var(--color-primary)">₹{{ calculatedTotal.toLocaleString() }}</div>
            </div>
          </div>

          <mat-form-field appearance="outline" style="grid-column:1/-1; margin-top:8px">
            <mat-label>Notes</mat-label>
            <textarea matInput formControlName="notes" rows="2"></textarea>
          </mat-form-field>

        </div>
        <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:8px">
          <button mat-stroked-button type="button" (click)="showForm=false">Cancel</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Save Invoice</button>
        </div>
      </form>
    </div>
  </div>

  <!-- View Invoice Dialog -->
  <div class="dialog-overlay" *ngIf="viewingInv" (click)="viewingInv=null">
    <div class="inline-dialog" (click)="$event.stopPropagation()" style="width:700px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:24px;border-bottom:1px solid var(--border);background:#F8FAFC">
        <div>
          <h2 style="margin:0 0 4px;font-size:24px;font-weight:800;color:var(--color-primary)">INVOICE</h2>
          <div style="font-size:13px;font-weight:600">{{ viewingInv.invoiceNumber }}</div>
          <div style="font-size:12px;color:var(--text-muted)">Date: {{ viewingInv.createdAt }}</div>
        </div>
        <div style="text-align:right">
          <h3 style="margin:0 0 4px;font-size:16px;font-weight:700">{{ viewingInv.clientName }}</h3>
          <div style="font-size:12px;color:var(--text-muted)">Project: {{ viewingInv.projectName }}</div>
          <div style="font-size:12px;color:var(--text-muted)">Due: {{ viewingInv.dueDate }}</div>
        </div>
      </div>
      
      <div style="padding:24px">
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <tr style="border-bottom:2px solid var(--border)">
            <th style="text-align:left;padding:8px 0;font-size:12px;color:var(--text-muted);text-transform:uppercase">Description</th>
            <th style="text-align:right;padding:8px 0;font-size:12px;color:var(--text-muted);text-transform:uppercase">Amount</th>
          </tr>
          <tr style="border-bottom:1px solid var(--border)">
            <td style="padding:12px 0;font-size:14px;font-weight:500">Shoot & Model Charges - {{ viewingInv.projectName }}</td>
            <td style="text-align:right;padding:12px 0;font-size:14px">₹{{ viewingInv.amount.toLocaleString() }}</td>
          </tr>
        </table>

        <div style="display:flex;justify-content:flex-end">
          <div style="width:250px">
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px">
              <span style="color:var(--text-muted)">Subtotal:</span><span>₹{{ viewingInv.amount.toLocaleString() }}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;border-bottom:1px solid var(--border)">
              <span style="color:var(--text-muted)">GST ({{ viewingInv.gstPercent }}%):</span><span>₹{{ viewingInv.gstAmount.toLocaleString() }}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:12px 0;font-size:16px;font-weight:800;color:var(--color-primary)">
              <span>Total:</span><span>₹{{ viewingInv.totalAmount.toLocaleString() }}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px">
              <span style="color:var(--text-muted)">Amount Paid:</span><span style="color:var(--color-success)">₹{{ viewingInv.paidAmount.toLocaleString() }}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:14px;font-weight:700">
              <span style="color:var(--color-danger)">Balance Due:</span><span style="color:var(--color-danger)">₹{{ (viewingInv.totalAmount - viewingInv.paidAmount).toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <div *ngIf="viewingInv.notes" style="margin-top:24px;padding:12px;background:rgba(255,255,255,0.03);border-radius:var(--radius-sm);font-size:12px;color:var(--text-muted)">
          <strong>Notes:</strong><br>{{ viewingInv.notes }}
        </div>

        <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:32px;padding-top:16px;border-top:1px solid var(--border)">
          <button mat-stroked-button (click)="viewingInv=null">Close</button>
          <button mat-stroked-button color="primary" (click)="downloadPDF(viewingInv!)">
            <mat-icon>picture_as_pdf</mat-icon> Download PDF
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Dialog -->
  <div class="dialog-overlay" *ngIf="deletingInv" (click)="deletingInv=null">
    <div class="inline-dialog" (click)="$event.stopPropagation()" style="width:400px;text-align:center;padding:32px 24px">
      <div style="width:64px;height:64px;background:rgba(255,83,112,0.1);color:var(--color-danger);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">
        <mat-icon style="font-size:32px;width:32px;height:32px">warning</mat-icon>
      </div>
      <h3 style="font-size:20px;font-weight:700;margin:0 0 8px">Delete Invoice?</h3>
      <p style="color:var(--text-muted);font-size:14px;margin:0 0 24px">
        Are you sure you want to permanently delete <strong>{{ deletingInv.invoiceNumber }}</strong>?<br>
        This action cannot be undone.
      </p>
      <div style="display:flex;gap:12px;justify-content:center">
        <button mat-stroked-button (click)="deletingInv=null">Cancel</button>
        <button mat-raised-button color="warn" (click)="confirmDelete()">Delete Invoice</button>
      </div>
    </div>
  </div>

</div>
  `,
    styles: [`
    .inv-table { width:100%; border-collapse:collapse;
      th { padding:14px 16px; text-align:left; font-size:11px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; background:rgba(108,99,255,0.04); }
      td { padding:14px 16px; border-bottom:1px solid var(--border); font-size:13px; color:var(--text-secondary); }
      tr:hover td { background:rgba(108,99,255,0.02); }
    }
    .form-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .dialog-overlay { position:fixed; inset:0; background:rgba(15,23,42,0.8); z-index:1000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); }
    .inline-dialog { background:var(--bg-elevated); border:1px solid var(--border); border-radius:var(--radius-xl); width:640px; max-height:90vh; overflow-y:auto; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); }
  `]
})
export class InvoicesComponent implements OnInit {
  invoices: Invoice[] = []; filtered: Invoice[] = [];
  clients: Client[] = []; bookings: Booking[] = []; clientBookings: Booking[] = [];
  
  search = ''; filterStatus = 'All'; 
  showForm = false; editing: Invoice | null = null; viewingInv: Invoice | null = null; deletingInv: Invoice | null = null;
  form!: FormGroup;

  calculatedGst = 0; calculatedTotal = 0;

  constructor(private data: MockDataService, private fb: FormBuilder, private snack: MatSnackBar) {}

  ngOnInit() {
    this.data.getInvoices().subscribe(i => { this.invoices = i; this.applyFilter(); });
    this.data.getClients().subscribe(c => this.clients = c);
    this.data.getBookings().subscribe(b => this.bookings = b);
  }

  applyFilter() {
    this.filtered = this.invoices.filter(i => 
      (this.filterStatus === 'All' || i.status === this.filterStatus) &&
      (!this.search || i.clientName.toLowerCase().includes(this.search.toLowerCase()) || i.invoiceNumber.toLowerCase().includes(this.search.toLowerCase()))
    );
  }

  openForm(invoice?: Invoice) {
    this.editing = invoice || null;
    const d = invoice || {} as any;
    
    this.form = this.fb.group({
      clientId:    [d.clientId || '', Validators.required],
      bookingId:   [d.bookingId || ''],
      projectName: [d.projectName || '', Validators.required],
      dueDate:     [d.dueDate || new Date(Date.now() + 15*86400000).toISOString().split('T')[0], Validators.required],
      amount:      [d.amount || 0, [Validators.required, Validators.min(1)]],
      gstPercent:  [d.gstPercent || 18, Validators.required],
      notes:       [d.notes || '']
    });

    if (d.clientId) this.onClientChange(d.clientId);
    this.calcTotal();
    this.showForm = true;
  }

  openView(invoice: Invoice) { this.viewingInv = invoice; }

  onClientChange(clientId: string) {
    this.clientBookings = this.bookings.filter(b => b.clientId === clientId);
  }

  onBookingChange(bookingId: string) {
    const b = this.clientBookings.find(x => x.id === bookingId);
    if (b) {
      this.form.patchValue({ projectName: b.projectName, amount: b.sellingPrice });
      this.calcTotal();
    }
  }

  calcTotal() {
    if(!this.form) return;
    const amt = this.form.get('amount')?.value || 0;
    const gst = this.form.get('gstPercent')?.value || 0;
    this.calculatedGst = Math.round(amt * (gst / 100));
    this.calculatedTotal = amt + this.calculatedGst;
  }

  save() {
    if (this.form.valid) {
      const v = this.form.value;
      const client = this.clients.find(c => c.id === v.clientId);
      const booking = this.clientBookings.find(b => b.id === v.bookingId);
      
      const payload: Invoice = {
        ...this.editing,
        ...v,
        clientName: client?.companyName || this.editing?.clientName,
        bookingNumber: booking?.bookingNumber || this.editing?.bookingNumber || '',
        gstAmount: this.calculatedGst,
        totalAmount: this.calculatedTotal,
        status: this.editing?.status || 'Pending',
        paidAmount: this.editing?.paidAmount || 0,
        createdAt: this.editing?.createdAt || new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };

      if (!this.editing?.id) {
        payload.id = this.data.generateId('i');
        payload.invoiceNumber = this.data.generateInvoiceNumber();
        this.data.addInvoice(payload);
        this.snack.open(`Invoice ${payload.invoiceNumber} created!`, 'Close', { duration: 3000 });
      } else {
        this.data.updateInvoice(payload);
        this.snack.open('Invoice updated!', 'Close', { duration: 3000 });
      }
      this.showForm = false;
    }
  }

  deleteInvoice(invoice: Invoice) {
    this.deletingInv = invoice;
  }

  confirmDelete() {
    if (this.deletingInv) {
      this.data.deleteInvoice(this.deletingInv.id);
      this.snack.open('Invoice deleted successfully', 'Close', { duration: 3000 });
      this.deletingInv = null;
    }
  }

  downloadPDF(inv: Invoice) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210, margin = 20;

    // ── Header gradient bar ──────────────────────────────────
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, W, 36, 'F');

    // Agency name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('TalentCRM Agency', margin, 18);

    // "INVOICE" label right side
    doc.setFontSize(11);
    doc.setTextColor(200, 200, 255);
    doc.text('INVOICE', W - margin, 13, { align: 'right' });
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(inv.invoiceNumber, W - margin, 22, { align: 'right' });

    // ── Invoice meta block ───────────────────────────────────
    let y = 50;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);

    // Left column - Bill To
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.text('BILL TO', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 60);
    doc.text(inv.clientName, margin, y + 7);
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Project: ${inv.projectName}`, margin, y + 13);
    if (inv.bookingNumber) doc.text(`Booking Ref: ${inv.bookingNumber}`, margin, y + 19);

    // Right column - Invoice dates
    const rightX = W - margin;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('INVOICE DATE', rightX - 50, y, { align: 'left' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(inv.createdAt || '', rightX, y, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('DUE DATE', rightX - 50, y + 8, { align: 'left' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(220, 38, 38);
    doc.text(inv.dueDate || '', rightX, y + 8, { align: 'right' });

    // Status badge
    const statusColor: Record<string, [number,number,number]> = {
      'Paid':           [5, 150, 105],
      'Pending':        [217, 119, 6],
      'Overdue':        [220, 38, 38],
      'Partially Paid': [2, 132, 199],
    };
    const [sr, sg, sb] = statusColor[inv.status] || [100, 116, 139];
    doc.setFillColor(sr, sg, sb);
    doc.roundedRect(rightX - 28, y + 14, 28, 8, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(inv.status.toUpperCase(), rightX - 14, y + 19.5, { align: 'center' });

    // ── Divider ──────────────────────────────────────────────
    y += 34;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, y, W - margin, y);

    // ── Items Table Header ───────────────────────────────────
    y += 8;
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, W - 2 * margin, 9, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('DESCRIPTION', margin + 3, y + 6);
    doc.text('AMOUNT', W - margin - 3, y + 6, { align: 'right' });

    // ── Item Row ─────────────────────────────────────────────
    y += 13;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`Shoot & Model Charges — ${inv.projectName}`, margin + 3, y);
    doc.text(`\u20B9${inv.amount.toLocaleString('en-IN')}`, W - margin - 3, y, { align: 'right' });

    // Row divider
    y += 5;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, W - margin, y);

    // ── Totals Block ─────────────────────────────────────────
    y += 10;
    const totX = W - margin;
    const labelX = totX - 55;

    const drawRow = (label: string, value: string, bold = false, color?: [number,number,number]) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(bold ? 11 : 10);
      doc.setTextColor(...(color || [100, 116, 139] as [number,number,number]));
      doc.text(label, labelX, y);
      doc.setTextColor(...(color || [15, 23, 42] as [number,number,number]));
      doc.text(value, totX, y, { align: 'right' });
      y += 8;
    };

    drawRow('Subtotal:', `\u20B9${inv.amount.toLocaleString('en-IN')}`);
    drawRow(`GST (${inv.gstPercent}%):`, `\u20B9${inv.gstAmount.toLocaleString('en-IN')}`);
    // Total line
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.6);
    doc.line(labelX, y - 2, totX, y - 2);
    drawRow('TOTAL:', `\u20B9${inv.totalAmount.toLocaleString('en-IN')}`, true, [79, 70, 229]);
    drawRow('Amount Paid:', `\u20B9${inv.paidAmount.toLocaleString('en-IN')}`, false, [5, 150, 105]);

    const balance = inv.totalAmount - inv.paidAmount;
    if (balance > 0) {
      doc.setDrawColor(220, 38, 38);
      doc.setLineWidth(0.4);
      doc.line(labelX, y - 2, totX, y - 2);
      drawRow('Balance Due:', `\u20B9${balance.toLocaleString('en-IN')}`, true, [220, 38, 38]);
    }

    // ── Notes ────────────────────────────────────────────────
    if (inv.notes) {
      y += 6;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, y, W - 2 * margin, 20, 3, 3, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('NOTES', margin + 4, y + 6);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(inv.notes, margin + 4, y + 13, { maxWidth: W - 2 * margin - 8 });
      y += 26;
    }

    // ── Footer ───────────────────────────────────────────────
    const footerY = 280;
    doc.setFillColor(248, 250, 252);
    doc.rect(0, footerY, W, 17, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Thank you for your business!', W / 2, footerY + 6, { align: 'center' });
    doc.text('TalentCRM Agency  •  talent@crmagency.in  •  +91 98765 43210', W / 2, footerY + 12, { align: 'center' });

    doc.save(`${inv.invoiceNumber}.pdf`);
    this.snack.open(`PDF downloaded: ${inv.invoiceNumber}.pdf`, 'Close', { duration: 3000 });
  }
}

