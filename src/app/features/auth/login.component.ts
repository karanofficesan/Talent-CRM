import { Component, ChangeDetectionStrategy } from '@angular/core';

import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-login',
    imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule],
    template: `
<div class="login-wrapper">
  <div class="login-card">
    <div class="login-header">
      <div class="logo">
        <mat-icon>diamond</mat-icon>
        <span>TalentCRM</span>
      </div>
      <h2>Welcome Back</h2>
      <p>Please sign in to your account</p>
    </div>

    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Email Address</mat-label>
        <input matInput formControlName="email" type="email" placeholder="admin@talentcrm.com">
        <mat-icon matPrefix>email</mat-icon>
        @if (loginForm.get('email')?.hasError('required')) {
          <mat-error>Email is required</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Password</mat-label>
        <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" placeholder="password123">
        <mat-icon matPrefix>lock</mat-icon>
        <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword" [attr.aria-label]="'Hide password'" [attr.aria-pressed]="hidePassword">
          <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
        </button>
        @if (loginForm.get('password')?.hasError('required')) {
          <mat-error>Password is required</mat-error>
        }
      </mat-form-field>

      <button mat-raised-button color="primary" class="login-btn" type="submit" [disabled]="loginForm.invalid">
        Sign In
      </button>
    </form>

    <div class="login-footer">
      <p><strong>Demo Credentials:</strong><br>Email: <span>admin&#64;talentcrm.com</span><br>Pass: <span>password123</span></p>
    </div>
  </div>
</div>
`,
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: [`
    .login-wrapper {
      display: flex; justify-content: center; align-items: center;
      min-height: 100vh;
      background: url('/assets/login-bg.png') no-repeat center center;
      background-size: cover;
      position: relative;
    }
    .login-wrapper::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.4); /* Dark elegant overlay */
    }
    .login-card {
      background: var(--bg-surface); width: 100%; max-width: 420px;
      padding: 40px; border-radius: var(--radius-xl);
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); border: 1px solid var(--border);
      position: relative;
      z-index: 1;
    }
    .login-header {
      text-align: center; margin-bottom: 30px;
      .logo {
        display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 20px;
        mat-icon { color: var(--color-primary); font-size: 32px; width: 32px; height: 32px; }
        span { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: var(--text-primary); }
      }
      h2 { font-size: 24px; font-weight: 800; margin: 0 0 8px; color: var(--text-primary); }
      p { font-size: 14px; color: var(--text-muted); margin: 0; }
    }
    .full-width { width: 100%; margin-bottom: 8px; }
    .login-btn {
      width: 100%; padding: 24px 0; font-size: 16px; margin-top: 10px; border-radius: var(--radius-md) !important;
    }
    .login-footer {
      margin-top: 24px; text-align: center; padding-top: 20px; border-top: 1px solid var(--border);
      p { font-size: 12px; color: var(--text-muted); line-height: 1.8; margin: 0; }
      span { font-family: monospace; background: rgba(0,0,0,0.05); padding: 2px 6px; border-radius: 4px; font-weight: 600; color: var(--text-primary); }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private snack: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['admin@talentcrm.com', [Validators.required, Validators.email]],
      password: ['password123', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      if (this.auth.login(email, password)) {
        this.snack.open('Login Successful!', 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      } else {
        this.snack.open('Invalid Email or Password', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
      }
    }
  }
}
