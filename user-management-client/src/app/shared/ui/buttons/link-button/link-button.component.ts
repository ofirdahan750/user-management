import { Component, ViewEncapsulation, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-link-button',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './link-button.component.html',
  styleUrl: './link-button.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkButtonComponent {
  @Input() route: string | string[] = '';
  @Input() label: string = '';
  @Input() icon: string = '';
  @Input() tooltip: string = '';
  @Input() variant: 'raised' | 'flat' | 'stroked' = 'flat';
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() showIcon: boolean = true;
}
