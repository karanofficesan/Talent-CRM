import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-reports',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<div class="page-container"><div class="page-header"><h1>Reports</h1><p>Reports and Analytics coming soon.</p></div></div>`
})
export class ReportsComponent {}
