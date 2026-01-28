import { Component, ViewEncapsulation, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ICONS } from '@core/constants/icons.constants';
import { LABELS } from '@core/constants/labels.constants';

@Component({
  selector: 'app-back-link',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './back-link.component.html',
  styleUrl: './back-link.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BackLinkComponent {
  @Input() route: string = '';
  @Input() label: string = '';
  @Input() tooltip: string = '';

  readonly icons = ICONS;
  readonly labels = LABELS;
}
