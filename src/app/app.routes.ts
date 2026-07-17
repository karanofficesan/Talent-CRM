import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard',    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'models',       loadComponent: () => import('./features/models-mgmt/models-mgmt.component').then(m => m.ModelsMgmtComponent) },
      { path: 'clients',      loadComponent: () => import('./features/clients/clients.component').then(m => m.ClientsComponent) },
      { path: 'requirements', loadComponent: () => import('./features/requirements/requirements.component').then(m => m.RequirementsComponent) },
      { path: 'quotations',   loadComponent: () => import('./features/quotations/quotations.component').then(m => m.QuotationsComponent) },
      { path: 'bookings',     loadComponent: () => import('./features/bookings/bookings.component').then(m => m.BookingsComponent) },
      { path: 'calendar',     loadComponent: () => import('./features/calendar/calendar.component').then(m => m.CalendarComponent) },
      { path: 'invoices',     loadComponent: () => import('./features/invoices/invoices.component').then(m => m.InvoicesComponent) },
      { path: 'payments',     loadComponent: () => import('./features/payments/payments.component').then(m => m.PaymentsComponent) },
      { path: 'reports',      loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent) },
      { path: 'users',        loadComponent: () => import('./features/users/users.component').then(m => m.UsersComponent) },
      { path: 'settings',     loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent) },
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
