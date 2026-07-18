import { Component, Inject, OnInit } from '@angular/core';

import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Model, MODEL_CATEGORIES, HAIR_COLORS, EYE_COLORS, SKIN_TONES, NATIONALITIES } from '../../core/models';

@Component({
    selector: 'app-model-form-dialog',
    imports: [
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatTabsModule,
    MatCheckboxModule,
    MatProgressBarModule
],
    template: `
<div class="dialog-wrapper">
  <div class="dialog-head">
    <div style="flex:1">
      <h2>{{ data?.viewOnly ? 'Model Profile' : (data?.id ? 'Edit Model' : 'Add New Model') }}</h2>
      <p style="color:var(--text-muted);font-size:13px;margin-top:4px;margin-bottom:12px">
        {{ data?.viewOnly ? 'Complete model profile details' : 'Fill in the details to '+(data?.id?'update':'create')+' a model profile' }}
      </p>

      <!-- Profile Completion Bar -->
      @if (!data?.viewOnly) {
        <div class="completion-container">
          <div class="completion-header">
            <span class="completion-text">Profile Completion</span>
            <span class="completion-pct">{{ completionPercentage }}%</span>
          </div>
          <mat-progress-bar mode="determinate" [value]="completionPercentage"
            [color]="completionPercentage === 100 ? 'primary' : 'accent'"
          class="completion-bar"></mat-progress-bar>
        </div>
      }
    </div>
    <button mat-icon-button mat-dialog-close style="margin-left:20px"><mat-icon>close</mat-icon></button>
  </div>

  <!-- View Mode -->
  @if (data?.viewOnly) {
    <div class="view-mode">
      <div class="model-profile-header">
        <img [src]="data.coverImage" class="profile-cover">
        <div class="profile-info">
          <h3>{{ data.fullName }}</h3>
          <div class="info-chips">
            @for (c of data.categories; track c) {
              <span class="badge badge-primary">{{ c }}</span>
            }
          </div>
          <div class="info-grid">
            <div class="info-item"><span class="lbl">Age</span><span>{{ data.age }} yrs</span></div>
            <div class="info-item"><span class="lbl">Height</span><span>{{ data.height }} cm</span></div>
            <div class="info-item"><span class="lbl">City</span><span>{{ data.city }}</span></div>
            <div class="info-item"><span class="lbl">Gender</span><span>{{ data.gender }}</span></div>
            <div class="info-item"><span class="lbl">Experience</span><span>{{ data.experience }} yrs</span></div>
            <div class="info-item"><span class="lbl">Nationality</span><span>{{ data.nationality }}</span></div>
          </div>
          <div class="physical-stats">
            <div class="ps-item"><div class="ps-val">{{ data.chest }}"</div><div class="ps-lbl">Chest</div></div>
            <div class="ps-item"><div class="ps-val">{{ data.waist }}"</div><div class="ps-lbl">Waist</div></div>
            <div class="ps-item"><div class="ps-val">{{ data.hips }}"</div><div class="ps-lbl">Hips</div></div>
            <div class="ps-item"><div class="ps-val">{{ data.weight }} kg</div><div class="ps-lbl">Weight</div></div>
            <div class="ps-item"><div class="ps-val">{{ data.hairColor }}</div><div class="ps-lbl">Hair</div></div>
            <div class="ps-item"><div class="ps-val">{{ data.skinTone }}</div><div class="ps-lbl">Skin</div></div>
          </div>
          <div class="rate-display">
            <mat-icon>payments</mat-icon>
            <span>₹{{ data.modelCharges?.toLocaleString() }} / day</span>
          </div>
          @if (data.instagramLink) {
            <a [href]="data.instagramLink" target="_blank" class="insta-link">
              <mat-icon>open_in_new</mat-icon> Instagram Profile
            </a>
          }
        </div>
      </div>
      @if (data.portfolioImages?.length) {
        <div class="portfolio-grid">
          <h4 class="section-heading">PORTFOLIO</h4>
          <div class="port-imgs">
            @for (img of data.portfolioImages; track img) {
              <img [src]="img" class="port-img">
            }
          </div>
        </div>
      }
    </div>
  }

  <!-- Edit/Create Form -->
  @if (!data?.viewOnly) {
    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-tab-group animationDuration="200ms" class="dialog-tabs" backgroundColor="primary">
        <!-- Personal -->
        <mat-tab label="Personal">
          <div class="tab-content">
            <div class="form-section-label"><mat-icon>person</mat-icon> Basic Information</div>
            <div class="form-grid">
              <mat-form-field appearance="outline" class="field-full">
                <mat-label>Full Name</mat-label>
                <input matInput formControlName="fullName" placeholder="Enter full name">
                <mat-icon matSuffix>badge</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Gender</mat-label>
                <mat-select formControlName="gender">
                  <mat-option value="Male">Male</mat-option>
                  <mat-option value="Female">Female</mat-option>
                  <mat-option value="Non-Binary">Non-Binary</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Date of Birth</mat-label>
                <input matInput type="date" formControlName="dateOfBirth">
                <mat-icon matSuffix>cake</mat-icon>
              </mat-form-field>
            </div>
            <div class="form-section-label" style="margin-top:8px"><mat-icon>contact_phone</mat-icon> Contact Details</div>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Mobile Number</mat-label>
                <input matInput formControlName="mobile" placeholder="9876543210">
                <mat-icon matSuffix>phone</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Email Address</mat-label>
                <input matInput formControlName="email" placeholder="email@example.com">
                <mat-icon matSuffix>email</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>City</mat-label>
                <input matInput formControlName="city" placeholder="Mumbai">
                <mat-icon matSuffix>location_city</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Nationality</mat-label>
                <mat-select formControlName="nationality">
                  @for (n of nationalities; track n) {
                    <mat-option [value]="n">{{ n }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
          </div>
        </mat-tab>
        <!-- Physical -->
        <mat-tab label="Physical">
          <div class="tab-content">
            <div class="form-section-label"><mat-icon>straighten</mat-icon> Body Measurements</div>
            <div class="measurements-grid">
              <div class="measure-card">
                <div class="measure-label">Height (cm)</div>
                <mat-form-field appearance="outline" class="measure-field">
                  <input matInput type="number" formControlName="height">
                  <mat-icon matSuffix style="font-size:16px">height</mat-icon>
                </mat-form-field>
              </div>
              <div class="measure-card">
                <div class="measure-label">Weight (kg)</div>
                <mat-form-field appearance="outline" class="measure-field">
                  <input matInput type="number" formControlName="weight">
                  <mat-icon matSuffix style="font-size:16px">monitor_weight</mat-icon>
                </mat-form-field>
              </div>
              <div class="measure-card">
                <div class="measure-label">Chest (in)</div>
                <mat-form-field appearance="outline" class="measure-field">
                  <input matInput type="number" formControlName="chest">
                </mat-form-field>
              </div>
              <div class="measure-card">
                <div class="measure-label">Waist (in)</div>
                <mat-form-field appearance="outline" class="measure-field">
                  <input matInput type="number" formControlName="waist">
                </mat-form-field>
              </div>
              <div class="measure-card">
                <div class="measure-label">Hips (in)</div>
                <mat-form-field appearance="outline" class="measure-field">
                  <input matInput type="number" formControlName="hips">
                </mat-form-field>
              </div>
              <div class="measure-card">
                <div class="measure-label">Shoe Size</div>
                <mat-form-field appearance="outline" class="measure-field">
                  <input matInput type="number" formControlName="shoeSize">
                </mat-form-field>
              </div>
            </div>
            <div class="form-section-label" style="margin-top:8px"><mat-icon>palette</mat-icon> Appearance</div>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Hair Color</mat-label>
                <mat-select formControlName="hairColor">
                  @for (h of hairColors; track h) {
                    <mat-option [value]="h">{{ h }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Eye Color</mat-label>
                <mat-select formControlName="eyeColor">
                  @for (e of eyeColors; track e) {
                    <mat-option [value]="e">{{ e }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Skin Tone</mat-label>
                <mat-select formControlName="skinTone">
                  @for (s of skinTones; track s) {
                    <mat-option [value]="s">{{ s }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
          </div>
        </mat-tab>
        <!-- Professional -->
        <mat-tab label="Professional">
          <div class="tab-content">
            <div class="form-section-label"><mat-icon>work</mat-icon> Professional Details</div>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Experience (years)</mat-label>
                <input matInput type="number" formControlName="experience">
                <mat-icon matSuffix>star</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Reference Source</mat-label>
                <input matInput formControlName="reference" placeholder="Agency, Instagram, etc.">
                <mat-icon matSuffix>how_to_reg</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline" class="field-full">
                <mat-label>Categories (Multi-select)</mat-label>
                <mat-select formControlName="categories" multiple>
                  @for (c of allCategories; track c) {
                    <mat-option [value]="c">{{ c }}</mat-option>
                  }
                </mat-select>
                <mat-icon matSuffix>category</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline" class="field-full">
                <mat-label>Instagram Profile Link</mat-label>
                <input matInput formControlName="instagramLink" placeholder="https://instagram.com/...">
                <mat-icon matPrefix>link</mat-icon>
              </mat-form-field>
            </div>
          </div>
        </mat-tab>
        <!-- Commercial -->
        <mat-tab label="Commercial">
          <div class="tab-content">
            <div class="form-section-label"><mat-icon>currency_rupee</mat-icon> Rates & Status</div>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Model Charges / Day (₹)</mat-label>
                <input matInput type="number" formControlName="modelCharges">
                <mat-icon matPrefix>currency_rupee</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Account Status</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="Active">Active</mat-option>
                  <mat-option value="Inactive">Inactive</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" class="field-full">
                <mat-label>Internal Notes (Not shown to client)</mat-label>
                <textarea matInput formControlName="internalNotes" rows="4" placeholder="Private notes about this model..."></textarea>
                <mat-icon matSuffix>lock</mat-icon>
              </mat-form-field>
            </div>
          </div>
        </mat-tab>
        <!-- Bank Details -->
        <mat-tab label="Bank Details">
          <div class="tab-content">
            <div class="form-section-label"><mat-icon>account_balance</mat-icon> Bank Account Information</div>
            <div class="bank-highlight">
              <mat-icon style="color:var(--color-warning);font-size:18px;flex-shrink:0">lock</mat-icon>
              <span style="font-size:12px;color:var(--text-muted)">This information is confidential and will never be shared with clients.</span>
            </div>
            <div class="form-grid">
              <mat-form-field appearance="outline" class="field-full">
                <mat-label>Bank Name</mat-label>
                <input matInput formControlName="bankName" placeholder="e.g. HDFC Bank">
                <mat-icon matPrefix>account_balance</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Account Holder Name</mat-label>
                <input matInput formControlName="accountName">
                <mat-icon matSuffix>person</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Account Number</mat-label>
                <input matInput formControlName="accountNumber">
                <mat-icon matSuffix>credit_card</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>IFSC Code</mat-label>
                <input matInput formControlName="ifscCode">
                <mat-icon matSuffix>code</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>PAN Number</mat-label>
                <input matInput formControlName="panNumber">
                <mat-icon matSuffix>receipt_long</mat-icon>
              </mat-form-field>
            </div>
          </div>
        </mat-tab>
        <!-- Portfolio -->
        <mat-tab label="Portfolio">
          <div class="upload-section">
            <div class="upload-box">
              <h4>Primary Profile Photo</h4>
              <p>Upload a clear headshot or cover image.</p>
              <div class="file-drop-area">
                <mat-icon>add_a_photo</mat-icon>
                <span>Drag & drop or click to upload cover</span>
                <input type="file" accept="image/*" class="file-input" (change)="onCoverUpload($event)">
              </div>
              @if (coverPreview) {
                <div class="preview-wrap">
                  <img [src]="coverPreview" alt="Cover Preview" class="img-preview-sm">
                  <button mat-icon-button color="warn" type="button" (click)="coverPreview=null"><mat-icon>close</mat-icon></button>
                </div>
              }
            </div>
            <div class="upload-box" style="margin-top:24px">
              <h4>Composite Card / Multiple Photos</h4>
              <p>Upload up to 10 photos for the model's portfolio.</p>
              <div class="file-drop-area">
                <mat-icon>collections</mat-icon>
                <span>Drag & drop multiple photos</span>
                <input type="file" accept="image/*" multiple class="file-input" (change)="onPortfolioUpload($event)">
              </div>
              @if (portfolioPreviews.length) {
                <div class="multi-preview-wrap">
                  @for (p of portfolioPreviews; track p; let i = $index) {
                    <div class="preview-item">
                      <img [src]="p" alt="Portfolio Image">
                      <button mat-icon-button color="warn" type="button" class="del-btn" (click)="removePortfolioImage(i)"><mat-icon>close</mat-icon></button>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </mat-tab>
        <!-- Documents -->
        <mat-tab label="Documents">
          <div class="upload-section">
            <div class="upload-box">
              <h4>Legal Documents</h4>
              <p>Upload ID proofs, Contracts, Visas, etc.</p>
              <div class="file-drop-area">
                <mat-icon>upload_file</mat-icon>
                <span>Drag & drop PDF or Image files</span>
                <input type="file" accept=".pdf,image/*" multiple class="file-input" (change)="onDocumentUpload($event)">
              </div>
              @if (documents.length) {
                <div class="doc-list">
                  @for (doc of documents; track doc; let i = $index) {
                    <div class="doc-item">
                      <mat-icon>description</mat-icon>
                      <div class="doc-info">
                        <span class="doc-name">{{ doc.name }}</span>
                        <span class="doc-size">{{ doc.size }}</span>
                      </div>
                      <button mat-icon-button color="warn" type="button" (click)="removeDocument(i)"><mat-icon>delete</mat-icon></button>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
      <div class="dialog-actions">
        <button mat-stroked-button type="button" mat-dialog-close>Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
          <mat-icon>save</mat-icon> {{ data?.id ? 'Update' : 'Save' }} Model
        </button>
      </div>
    </form>
  }

  @if (data?.viewOnly) {
    <div class="dialog-actions">
      <button mat-stroked-button mat-dialog-close>Close</button>
    </div>
  }
</div>
`,
    styles: [`
    .dialog-wrapper { min-width:860px; background: var(--bg-surface); }
    .dialog-head { display:flex; justify-content:space-between; align-items:flex-start; padding:24px 28px 0; h2{font-size:22px;font-weight:800;color:var(--text-primary);margin:0} }
    .dialog-tabs { margin:16px 0; }
    
    .completion-container { background:#F8FAFC; border:1px solid var(--border); border-radius:var(--radius-md); padding:12px 16px; margin-top:8px; }
    .completion-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
    .completion-text { font-size:12px; font-weight:600; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.5px; }
    .completion-pct { font-size:14px; font-weight:800; color:var(--color-primary); }
    .completion-bar { height:6px; border-radius:var(--radius-full); }

    .tab-content { padding:20px 28px 8px; }
    .form-section-label { display:flex; align-items:center; gap:8px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:var(--text-muted); border-bottom:1px solid var(--border); padding-bottom:10px; margin-bottom:16px; mat-icon{font-size:16px;width:16px;height:16px;color:var(--color-primary)} }
    .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .field-full { grid-column:1/-1; }
    .measurements-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:20px; }
    .measure-card { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-md); padding:12px 14px; }
    .measure-label { font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px; }
    .measure-field { width:100%; }
    .bank-highlight { display:flex; align-items:center; gap:8px; background:#FFFBEB; border:1px solid #FDE68A; border-radius:var(--radius-sm); padding:10px 14px; margin-bottom:16px; }
    .dialog-actions { display:flex; gap:12px; justify-content:flex-end; padding:16px 28px; border-top:1px solid var(--border); background:#F8FAFC; border-radius:0 0 var(--radius-xl) var(--radius-xl); }

    .upload-section { padding:24px 28px; }
    .upload-box { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-lg); padding:20px; box-shadow:var(--shadow-sm); h4{margin:0 0 4px;font-size:15px;font-weight:700} p{margin:0 0 16px;font-size:13px;color:var(--text-muted)} }
    .file-drop-area { border:2px dashed #CBD5E1; border-radius:var(--radius-md); padding:30px; text-align:center; position:relative; background:#F8FAFC; transition:all 0.2s; cursor:pointer; &:hover{border-color:var(--color-primary);background:#EEF2FF} mat-icon{font-size:32px;width:32px;height:32px;color:var(--text-muted);margin-bottom:12px} span{display:block;font-size:14px;font-weight:500;color:var(--text-secondary)} }
    .file-input { position:absolute; top:0; left:0; width:100%; height:100%; opacity:0; cursor:pointer; }
    
    .preview-wrap { display:flex; align-items:center; gap:12px; margin-top:16px; padding:12px; border:1px solid var(--border); border-radius:var(--radius-md); }
    .img-preview-sm { width:60px; height:60px; object-fit:cover; border-radius:var(--radius-sm); border:1px solid var(--border); }
    
    .multi-preview-wrap { display:flex; flex-wrap:wrap; gap:12px; margin-top:16px; }
    .preview-item { position:relative; width:80px; height:80px; img{width:100%;height:100%;object-fit:cover;border-radius:var(--radius-sm);border:1px solid var(--border)} .del-btn{position:absolute;top:-8px;right:-8px;background:white;box-shadow:var(--shadow-sm);transform:scale(0.8)} }
    
    .doc-list { display:flex; flex-direction:column; gap:10px; margin-top:16px; }
    .doc-item { display:flex; align-items:center; gap:12px; background:#F8FAFC; border:1px solid var(--border); border-radius:var(--radius-md); padding:10px 16px; mat-icon{color:var(--text-muted)} }
    .doc-info { flex:1; display:flex; flex-direction:column; }
    .doc-name { font-size:13px; font-weight:600; color:var(--text-primary); }
    .doc-size { font-size:11px; color:var(--text-muted); }

    .model-profile-header { display:flex; gap:24px; padding:24px 28px; }
    .profile-cover { width:200px; height:260px; object-fit:cover; border-radius:var(--radius-lg); flex-shrink:0; box-shadow:var(--shadow-md); }
    .profile-info { flex:1; }
    h3 { font-size:24px; font-weight:800; margin-bottom:12px; color:var(--text-primary); }
    .info-chips { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:16px; }
    .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px; }
    .info-item { display:flex; flex-direction:column; gap:2px; .lbl{font-size:11px;color:var(--text-muted);font-weight:700;text-transform:uppercase} span:last-child{font-size:14px;font-weight:600;color:var(--text-secondary)} }
    
    .physical-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; background:#F8FAFC; border:1px solid var(--border); border-radius:var(--radius-lg); padding:16px; margin-bottom:20px; }
    .ps-item { text-align:center; }
    .ps-val { font-size:15px; font-weight:800; color:var(--text-primary); }
    .ps-lbl { font-size:11px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; font-weight:600; }
    
    .rate-display { display:flex; align-items:center; gap:8px; font-size:18px; font-weight:800; color:var(--color-success); margin-bottom:12px; background:#ECFDF5; padding:10px 16px; border-radius:var(--radius-md); border:1px solid #A7F3D0; width:fit-content; mat-icon{font-size:20px;} }
    .insta-link { display:inline-flex; align-items:center; gap:6px; color:var(--color-primary); font-size:14px; font-weight:600; text-decoration:none; padding:8px 0; &:hover{text-decoration:underline} mat-icon{font-size:18px;} }
    
    .section-heading { margin:0 0 16px; font-size:14px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; }
    .portfolio-grid { padding:0 28px 24px; }
    .port-imgs { display:flex; gap:12px; flex-wrap:wrap; }
    .port-img { width:130px; height:170px; object-fit:cover; border-radius:var(--radius-md); border:1px solid var(--border); box-shadow:var(--shadow-sm); transition:transform 0.2s; &:hover{transform:scale(1.05)} }
  `]
})
export class ModelFormDialogComponent implements OnInit {
  form!: FormGroup;
  allCategories = MODEL_CATEGORIES;
  hairColors = HAIR_COLORS; eyeColors = EYE_COLORS;
  skinTones = SKIN_TONES; nationalities = NATIONALITIES;

  coverPreview: string | null = null;
  portfolioPreviews: string[] = [];
  documents: {name: string, size: string}[] = [];
  completionPercentage = 0;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ModelFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    const d = this.data || {};
    this.coverPreview = d.coverImage || null;
    this.portfolioPreviews = d.portfolioImages ? [...d.portfolioImages] : [];
    
    this.form = this.fb.group({
      fullName:     [d.fullName     || '', Validators.required],
      gender:       [d.gender       || 'Female', Validators.required],
      dateOfBirth:  [d.dateOfBirth  || ''],
      mobile:       [d.mobile       || '', Validators.required],
      email:        [d.email        || '', [Validators.email]],
      city:         [d.city         || '', Validators.required],
      nationality:  [d.nationality  || 'Indian'],
      height:       [d.height       || 165],
      weight:       [d.weight       || 55],
      chest:        [d.chest        || 34],
      waist:        [d.waist        || 26],
      hips:         [d.hips         || 36],
      shoeSize:     [d.shoeSize     || 7],
      hairColor:    [d.hairColor    || 'Black'],
      eyeColor:     [d.eyeColor     || 'Brown'],
      skinTone:     [d.skinTone     || 'Fair'],
      experience:   [d.experience   || 1],
      categories:   [d.categories   || []],
      reference:    [d.reference    || ''],
      instagramLink:[d.instagramLink|| ''],
      modelCharges: [d.modelCharges || 10000],
      internalNotes:[d.internalNotes|| ''],
      status:       [d.status       || 'Active'],
      
      // New fields for Bank
      bankName:      [d.bankName || ''],
      accountName:   [d.accountName || ''],
      accountNumber: [d.accountNumber || ''],
      ifscCode:      [d.ifscCode || ''],
      panNumber:     [d.panNumber || '']
    });

    this.calculateCompletion();
    this.form.valueChanges.subscribe(() => this.calculateCompletion());
  }

  calculateCompletion() {
    let totalFields = 20;
    let filledFields = 0;
    
    const val = this.form.value;
    const fieldsToCheck = [
      'fullName', 'gender', 'mobile', 'email', 'city', 'nationality',
      'height', 'weight', 'chest', 'waist', 'hips', 'hairColor', 'eyeColor',
      'categories', 'modelCharges', 'bankName', 'accountNumber', 'panNumber'
    ];
    
    fieldsToCheck.forEach(f => {
      if (val[f] && val[f].toString().trim() !== '' && (!Array.isArray(val[f]) || val[f].length > 0)) {
        filledFields++;
      }
    });

    if (this.coverPreview) filledFields++;
    if (this.portfolioPreviews.length > 0) filledFields++;

    this.completionPercentage = Math.round((filledFields / totalFields) * 100);
    if (this.completionPercentage > 100) this.completionPercentage = 100;
  }

  onCoverUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.coverPreview = e.target.result;
        this.calculateCompletion();
      };
      reader.readAsDataURL(file);
    }
  }

  onPortfolioUpload(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.portfolioPreviews.push(e.target.result);
          this.calculateCompletion();
        };
        reader.readAsDataURL(files[i]);
      }
    }
  }

  removePortfolioImage(index: number) {
    this.portfolioPreviews.splice(index, 1);
    this.calculateCompletion();
  }

  onDocumentUpload(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const sizeStr = (file.size / 1024 / 1024).toFixed(2) + ' MB';
        this.documents.push({ name: file.name, size: sizeStr });
      }
    }
  }

  removeDocument(index: number) {
    this.documents.splice(index, 1);
  }

  save() {
    if (this.form.valid) {
      const val = this.form.value;
      const dob = val.dateOfBirth ? new Date(val.dateOfBirth) : new Date();
      const age = Math.floor((Date.now() - dob.getTime()) / 31557600000);
      this.dialogRef.close({
        ...this.data,
        ...val,
        age: isNaN(age) ? 0 : age,
        coverImage: this.coverPreview || `https://i.pravatar.cc/300?img=${Math.floor(Math.random()*70)}`,
        portfolioImages: this.portfolioPreviews,
        portfolioVideos: [],
        createdAt: this.data?.createdAt || new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      });
    }
  }
}
