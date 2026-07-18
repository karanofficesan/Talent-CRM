import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<div class="page-container"><div class="page-header"><h1>Settings</h1><p>System settings coming soon.</p></div></div>`
})
export class SettingsComponent {}
